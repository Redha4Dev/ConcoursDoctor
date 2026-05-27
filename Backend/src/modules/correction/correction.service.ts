/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/correction/correction.service.ts
import { identityDb, correctionDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { calculateFinalGrade } from "../../utils/gradeCalculator.js";
import { audit } from "../../utils/auditLogger.js";

// ─── RE-EXPORT so anonymization module can still call createExamCopiesInCorrectionDb ──
export type AnonymizationPayload = Array<{
  sessionId: string;
  subjectId: string;
  qrCode: string;
  anonymousCode: string;
}>;

export const createExamCopiesInCorrectionDb = async (
  payload: AnonymizationPayload,
) => {
  const data = payload.map(
    ({ sessionId, subjectId, qrCode, anonymousCode }) => ({
      sessionId,
      subjectId,
      qrCode,
      anonymousCode,
    }),
  );
  return correctionDb.examCopy.createMany({ data });
};

// ─── HELPER: fetch discrepancy threshold for a session ────────────────────────
const getDiscrepancyThreshold = async (sessionId: string): Promise<number> => {
  const config = await identityDb.gradingConfig.findUnique({
    where: { sessionId },
    select: { discrepancyThreshold: true },
  });
  // Default per ministerial regulation Note n°573
  return config?.discrepancyThreshold ?? 3;
};

// ─── HELPER: compute + persist final grade for a copy ─────────────────────────
const computeAndPersistFinalGrade = async (
  copyId: string,
  sessionId: string,
  subjectId: string,
  grade1: number,
  grade2: number,
  grade3: number | null,
) => {
  const { finalGrade, appliedRule } = calculateFinalGrade(
    grade1,
    grade2,
    grade3,
  );

  await correctionDb.finalGrade.upsert({
    where: { copyId },
    create: { copyId, sessionId, subjectId, finalGrade, appliedRule },
    update: { finalGrade, appliedRule },
  });

  // Mark copy as VALIDATED
  await correctionDb.examCopy.update({
    where: { id: copyId },
    data: { status: "VALIDATED" },
  });
};

// ─── HELPER: check if ALL copies in a session are VALIDATED ───────────────────
// If so, advance session status to DELIBERATION in identity DB.
const checkAndTriggerDeliberation = async (
  sessionId: string,
  userId: string,
) => {
  const [totalCopies, validatedCopies] = await Promise.all([
    correctionDb.examCopy.count({ where: { sessionId } }),
    correctionDb.examCopy.count({ where: { sessionId, status: "VALIDATED" } }),
  ]);

  if (totalCopies > 0 && totalCopies === validatedCopies) {
    await identityDb.competitionSession.update({
      where: { id: sessionId },
      data: { status: "DELIBERATION" },
    });

    audit({
      userId,
      action: "SESSION_MOVED_TO_DELIBERATION",
      entity: "CompetitionSession",
      entityId: sessionId,
      payload: { sessionId },
    }).catch(() => {});
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COORDINATOR / ADMIN SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Opens the correction phase for a session:
 * 1. Validates preconditions (status, correctors ≥ 4 per subject, copies)
 * 2. Chunks copies into C equal groups (C = corrector count per subject)
 * 3. Assigns 2 correctors per copy using a 4-group rotation matrix:
 *      Round 1 → correctorIds[ chunkIdx % C ]
 *      Round 2 → correctorIds[ (chunkIdx + 1) % C ]   ← +1 shift guarantees no repeats
 * 4. Transitions session status → CORRECTION_OPEN
 */
export const openCorrectionPhase = async (
  sessionId: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  // ── 1. Fetch session and validate status ────────────────────────────────────
  const session = await identityDb.competitionSession.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true },
  });

  if (!session) throw new AppError("Session not found", 404);
  if (session.status !== "ANONYMIZED") {
    throw new AppError(
      `Session must be in ANONYMIZED status to open correction (current: ${session.status})`,
      400,
    );
  }

  // ── 2. Fetch all subjects for this session ──────────────────────────────────
  const subjects = await identityDb.subject.findMany({
    where: { sessionId },
    select: { id: true, name: true },
  });

  if (subjects.length === 0) {
    throw new AppError("No subjects found for this session", 400);
  }

  // ── 3. For each subject: validate correctors and build assignment data ──────
  let totalCopies = 0;
  const assignmentData: Array<{
    copyId: string;
    correctorId: string;
    sessionId: string;
    subjectId: string;
    round: number;
  }> = [];

  // Track per-subject corrector counts for the audit payload
  const correctorCountBySubject: Record<string, number> = {};

  for (const subject of subjects) {
    // Fetch correctors assigned specifically to THIS subject, ordered
    // deterministically by userId ASC to guarantee a stable rotation matrix.
    const subjectStaff = await identityDb.sessionStaff.findMany({
      where: { sessionId, function: "CORRECTOR", subjectId: subject.id },
      select: { userId: true },
      orderBy: { userId: "asc" }, // deterministic ordering ensures reproducible chunk→corrector mapping
    });

    // ── Strict per-subject guard: the 4-corrector rotation matrix requires
    //    at least 4 correctors so that every copy is reviewed by 2 distinct
    //    people AND 2 unused correctors remain available for round-3 arbitration.
    const subjectCorrectorIds = subjectStaff.map((s) => s.userId);
    if (subjectCorrectorIds.length < 4) {
      throw new AppError(
        `Cannot open correction: Subject "${subject.name}" requires a minimum of 4 assigned correctors. Found: ${subjectCorrectorIds.length}`,
        400,
      );
    }

    correctorCountBySubject[subject.id] = subjectCorrectorIds.length;

    // Total correctors for this subject — drives the rotation modulus
    const C = subjectCorrectorIds.length; // e.g. 4 → 4-group matrix

    // Fetch all copies for this subject, sorted deterministically so the
    // chunk→corrector mapping is stable across re-runs.
    const copies = await correctionDb.examCopy.findMany({
      where: { sessionId, subjectId: subject.id },
      select: { id: true, anonymousCode: true },
      orderBy: { anonymousCode: "asc" },
    });

    if (copies.length === 0) continue;

    totalCopies += copies.length;

    // ── Chunk copies into C equal groups.
    //    batchSize = ⌈n / C⌉ so that every corrector gets at most one chunk.
    //    Example: 10 copies, C=4 → batchSize=3 → chunks [3,3,3,1].
    const batchSize = Math.ceil(copies.length / C);

    const chunks: (typeof copies)[] = [];
    for (let i = 0; i < copies.length; i += batchSize) {
      chunks.push(copies.slice(i, i + batchSize));
    }

    // ── 4-group rotation matrix assignment:
    //    Round 1: chunk[chunkIdx] → correctorIds[ chunkIdx % C ]
    //    Round 2: chunk[chunkIdx] → correctorIds[ (chunkIdx + 1) % C ]
    //
    //    The +1 shift ensures the Round-1 and Round-2 correctors are ALWAYS
    //    different — a corrector can never grade the same paper twice.
    for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
      // Round 1 corrector: maps directly to this chunk's index in the pool
      const r1Corrector = subjectCorrectorIds[chunkIdx % C];
      // Round 2 corrector: shifted by 1 — wraps around via modulo
      const r2Corrector = subjectCorrectorIds[(chunkIdx + 1) % C];

      for (const copy of chunks[chunkIdx]) {
        assignmentData.push({
          copyId: copy.id,
          correctorId: r1Corrector,
          sessionId,
          subjectId: subject.id,
          round: 1,
        });
        assignmentData.push({
          copyId: copy.id,
          correctorId: r2Corrector,
          sessionId,
          subjectId: subject.id,
          round: 2,
        });
      }
    }
  }

  if (assignmentData.length === 0) {
    throw new AppError("No exam copies found for this session", 400);
  }

  // ── 4. Persist assignments + mark copies as ASSIGNED ───────────────────────
  await correctionDb.$transaction(async (tx) => {
    await tx.correctorAssignment.createMany({
      data: assignmentData,
      skipDuplicates: true,
    });
    // Bulk-update all copies for this session to ASSIGNED
    await tx.examCopy.updateMany({
      where: { sessionId },
      data: { status: "ASSIGNED" },
    });
  });

  const totalAssignments = assignmentData.length;

  // ── 5. Advance session status ─────────────────────────────────────────────
  await identityDb.competitionSession.update({
    where: { id: sessionId },
    data: { status: "CORRECTION_OPEN" },
  });

  // ── 6. Audit ──────────────────────────────────────────────────────────────
  audit({
    userId,
    action: "CORRECTION_OPENED",
    entity: "CompetitionSession",
    entityId: sessionId,
    ipAddress,
    userAgent,
    payload: {
      sessionId,
      copies: totalCopies,
      correctorsBySubject: correctorCountBySubject,
      assignmentsCreated: totalAssignments,
    },
  }).catch(() => {});

  return {
    copies: totalCopies,
    correctorsBySubject: correctorCountBySubject,
    assignmentsCreated: totalAssignments,
  };
};

/**
 * Returns per-subject correction progress for a session.
 */
export const getCorrectionProgress = async (sessionId: string) => {
  // Fetch session status from identity DB
  const session = await identityDb.competitionSession.findUnique({
    where: { id: sessionId },
    select: { status: true },
  });
  if (!session) throw new AppError("Session not found", 404);

  // Fetch all subjects for this session
  const subjects = await identityDb.subject.findMany({
    where: { sessionId },
    select: { id: true, name: true, coefficient: true },
  });

  const subjectBreakdowns = await Promise.all(
    subjects.map(async (subject) => {
      // Count copies per status for this subject
      const [
        total,
        pending,
        assigned,
        firstDone,
        secondDone,
        discrepancy,
        thirdDone,
        validated,
      ] = await Promise.all([
        correctionDb.examCopy.count({
          where: { sessionId, subjectId: subject.id },
        }),
        correctionDb.examCopy.count({
          where: { sessionId, subjectId: subject.id, status: "PENDING" },
        }),
        correctionDb.examCopy.count({
          where: { sessionId, subjectId: subject.id, status: "ASSIGNED" },
        }),
        correctionDb.examCopy.count({
          where: { sessionId, subjectId: subject.id, status: "FIRST_DONE" },
        }),
        correctionDb.examCopy.count({
          where: { sessionId, subjectId: subject.id, status: "SECOND_DONE" },
        }),
        correctionDb.examCopy.count({
          where: { sessionId, subjectId: subject.id, status: "DISCREPANCY" },
        }),
        correctionDb.examCopy.count({
          where: { sessionId, subjectId: subject.id, status: "THIRD_DONE" },
        }),
        correctionDb.examCopy.count({
          where: { sessionId, subjectId: subject.id, status: "VALIDATED" },
        }),
      ]);

      const percentComplete =
        total > 0 ? Math.round((validated / total) * 100) : 0;

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        coefficient: subject.coefficient,
        totalCopies: total,
        pending: pending + assigned, // show un-graded copies as "pending" to consumer
        firstDone,
        secondDone,
        discrepancy,
        validated,
        percentComplete,
      };
    }),
  );

  // Overall discrepancy count across all subjects
  const discrepancyCount = await correctionDb.examCopy.count({
    where: { sessionId, status: "DISCREPANCY" },
  });

  // All validated = every copy in the session is VALIDATED
  const totalCopies = await correctionDb.examCopy.count({
    where: { sessionId },
  });
  const totalValidated = await correctionDb.examCopy.count({
    where: { sessionId, status: "VALIDATED" },
  });
  const allValidated = totalCopies > 0 && totalCopies === totalValidated;

  return {
    subjects: subjectBreakdowns,
    sessionStatus: session.status,
    allValidated,
    discrepancyCount,
  };
};

/**
 * Returns all copies in DISCREPANCY status for a session.
 * Includes grade1, grade2, gap. Never exposes candidateId.
 */
export const getDiscrepancies = async (sessionId: string) => {
  const copies = await correctionDb.examCopy.findMany({
    where: { sessionId, status: "DISCREPANCY" },
    include: {
      grades: {
        select: { round: true, grade: true, correctorId: true },
      },
    },
  });

  if (copies.length === 0) return { discrepancies: [] };

  // Fetch subject names for all subjectIds referenced by these copies
  const subjectIds = [...new Set(copies.map((c) => c.subjectId))];
  const subjects = await identityDb.subject.findMany({
    where: { id: { in: subjectIds } },
    select: { id: true, name: true },
  });
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const discrepancies = copies.map((copy) => {
    const round1Grade = copy.grades.find((g) => g.round === 1);
    const round2Grade = copy.grades.find((g) => g.round === 2);
    const g1 = round1Grade?.grade ?? 0;
    const g2 = round2Grade?.grade ?? 0;

    return {
      copyId: copy.id,
      anonymousCode: copy.anonymousCode,
      subjectId: copy.subjectId,
      subjectName: subjectMap.get(copy.subjectId) ?? "Unknown",
      grade1: g1,
      grade2: g2,
      gap: parseFloat(Math.abs(g1 - g2).toFixed(2)),
    };
  });

  return { discrepancies };
};

/**
 * Assigns a third corrector to a copy in DISCREPANCY status.
 * Only ADMIN or COORDINATOR can call this.
 *
 * Eligibility rule (4-corrector rotation matrix contract):
 *   The chosen corrector MUST be from the same subject pool AND must NOT
 *   be either the Round-1 or Round-2 corrector for this specific copy.
 *   With ≥ 4 correctors per subject this always leaves at least 2 eligible
 *   choices, giving the coordinator meaningful selection freedom.
 */
export const assignThirdCorrector = async (
  sessionId: string,
  copyId: string,
  correctorId: string, // the proposed third corrector (thirdCorrectorId in the spec)
  userId: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  // ── 1. Fetch the target ExamCopy and verify it is in DISCREPANCY status ───
  //    We include the existing CorrectorAssignment rows so we can identify
  //    which correctors own Round 1 and Round 2 for this specific copy.
  const copy = await correctionDb.examCopy.findUnique({
    where: { id: copyId },
    include: {
      // assignments carries round + correctorId for every round on this copy
      assignments: { select: { correctorId: true, round: true } },
    },
  });

  if (!copy) throw new AppError("Copy not found", 404);
  if (copy.sessionId !== sessionId) {
    throw new AppError("Copy does not belong to this session", 400);
  }
  // Status guard — only DISCREPANCY copies may receive a third corrector
  if (copy.status !== "DISCREPANCY") {
    throw new AppError(
      `Copy must be in DISCREPANCY status (current: ${copy.status})`,
      400,
    );
  }

  // ── 2. Identify the Round-1 and Round-2 correctors for this copy ──────────
  //    We resolve from CorrectorAssignment records (set during openCorrectionPhase)
  //    rather than CorrectionGrade so the check works even if one corrector
  //    has not yet submitted their grade.
  const round1Assignment = copy.assignments.find((a) => a.round === 1);
  const round2Assignment = copy.assignments.find((a) => a.round === 2);

  // Defensive: both rounds must exist for a copy to be in DISCREPANCY
  const round1CorrectorId = round1Assignment?.correctorId ?? null;
  const round2CorrectorId = round2Assignment?.correctorId ?? null;

  // ── 3. Validate proposed third corrector against the subject pool ──────────
  //    They must hold a SessionStaff record with function=CORRECTOR for the
  //    same subjectId as this copy — i.e. they are in the subject's pool.
  const staffRecord = await identityDb.sessionStaff.findFirst({
    where: {
      sessionId,
      userId: correctorId,
      function: "CORRECTOR",
      subjectId: copy.subjectId, // must match the subject of the discrepancy copy
    },
  });

  if (!staffRecord) {
    // Proposed corrector is not in the correct subject pool at all
    throw new AppError(
      "Third corrector must be an unassigned corrector from the same subject pool",
      400,
    );
  }

  // ── 4. Enforce the "unused corrector" constraint ──────────────────────────
  //    The third corrector MUST NOT be the same person who graded Round 1
  //    or Round 2, regardless of whether they are in the subject pool.
  if (correctorId === round1CorrectorId || correctorId === round2CorrectorId) {
    // The requested corrector already touched this paper in a previous round
    throw new AppError(
      "Third corrector must be an unassigned corrector from the same subject pool",
      400,
    );
  }

  // ── 5. Create round-3 assignment ──────────────────────────────────────────
  await correctionDb.correctorAssignment.create({
    data: {
      copyId,
      correctorId,
      sessionId,
      subjectId: copy.subjectId,
      round: 3,
    },
  });

  // ── 6. Audit ──────────────────────────────────────────────────────────────
  audit({
    userId,
    action: "THIRD_CORRECTOR_ASSIGNED",
    entity: "ExamCopy",
    entityId: copyId,
    ipAddress,
    userAgent,
    payload: { copyId, correctorId, sessionId },
  }).catch(() => {});

  return {
    copyId,
    anonymousCode: copy.anonymousCode,
    correctorId,
    round: 3,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CORRECTOR SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all sessions where this user is assigned as CORRECTOR,
 * grouped by session with per-subject progress.
 */
export const getMyAssignments = async (userId: string) => {
  // All sessions where this user is a corrector
  const staffRecords = await identityDb.sessionStaff.findMany({
    where: { userId, function: "CORRECTOR" },
    select: {
      sessionId: true,
      session: { select: { id: true, label: true } },
    },
  });

  if (staffRecords.length === 0) return { sessions: [] };

  const sessions = await Promise.all(
    staffRecords.map(async (sr) => {
      const sessionId = sr.sessionId;

      // All distinct subjects where this corrector has assignments in this session
      const assignments = await correctionDb.correctorAssignment.findMany({
        where: { sessionId, correctorId: userId },
        select: { subjectId: true, copyId: true },
      });

      // Group by subjectId
      const subjectCopyMap = new Map<string, string[]>();
      for (const a of assignments) {
        const list = subjectCopyMap.get(a.subjectId) ?? [];
        list.push(a.copyId);
        subjectCopyMap.set(a.subjectId, list);
      }

      const subjectIds = [...subjectCopyMap.keys()];
      const subjects = await identityDb.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, name: true },
      });

      const subjectProgress = await Promise.all(
        subjects.map(async (subject) => {
          const copyIds = subjectCopyMap.get(subject.id) ?? [];

          // Count submitted grades for these copies
          const gradedCount = await correctionDb.correctionGrade.count({
            where: { copyId: { in: copyIds }, correctorId: userId },
          });

          // Check if this corrector has any locked grades (i.e., already submitted for this subject)
          const hasLocked = await correctionDb.correctionGrade.findFirst({
            where: {
              copyId: { in: copyIds },
              correctorId: userId,
              isLocked: true,
            },
          });

          return {
            subjectId: subject.id,
            subjectName: subject.name,
            totalAssigned: copyIds.length,
            graded: gradedCount,
            pending: copyIds.length - gradedCount,
            locked: hasLocked !== null,
          };
        }),
      );

      return {
        sessionId,
        sessionLabel: sr.session.label,
        subjects: subjectProgress,
      };
    }),
  );

  return { sessions };
};

/**
 * Returns all copies assigned to this corrector for a specific subject + session.
 * Includes their draft grade and locked submission status.
 */
export const getPapersForSubject = async (
  correctorId: string,
  subjectId: string,
  sessionId: string,
) => {
  // Verify corrector is assigned to this subject in this session
  const assignments = await correctionDb.correctorAssignment.findMany({
    where: { correctorId, subjectId, sessionId },
    select: { copyId: true },
  });

  if (assignments.length === 0) {
    throw new AppError(
      "You are not assigned to this subject in this session",
      403,
    );
  }

  const copyIds = assignments.map((a) => a.copyId);

  // Fetch copies
  const copies = await correctionDb.examCopy.findMany({
    where: { id: { in: copyIds } },
    select: { id: true, anonymousCode: true, status: true },
  });

  // Fetch drafts for this corrector
  const drafts = await correctionDb.gradeDraft.findMany({
    where: { copyId: { in: copyIds }, correctorId },
    select: { copyId: true, grade: true },
  });
  const draftMap = new Map(drafts.map((d) => [d.copyId, d.grade]));

  // Fetch submitted grades for this corrector
  const submitted = await correctionDb.correctionGrade.findMany({
    where: { copyId: { in: copyIds }, correctorId },
    select: { copyId: true, grade: true, isLocked: true },
  });
  const submittedMap = new Map(submitted.map((g) => [g.copyId, g]));

  // Fetch subject info from identity DB
  const subject = await identityDb.subject.findUnique({
    where: { id: subjectId },
    select: { name: true, maxGrade: true, minimumGrade: true },
  });
  if (!subject) throw new AppError("Subject not found", 404);

  const papers = copies.map((copy) => {
    const sub = submittedMap.get(copy.id);
    return {
      copyId: copy.id,
      anonymousCode: copy.anonymousCode,
      status: copy.status,
      draftGrade: draftMap.get(copy.id) ?? null,
      isLocked: sub?.isLocked ?? false,
      submittedGrade: sub?.grade ?? null,
    };
  });

  return {
    papers,
    subjectName: subject.name,
    maxGrade: subject.maxGrade,
    minimumGrade: subject.minimumGrade,
  };
};

/**
 * Auto-saves a grade draft (upsert). Does not change CopyStatus.
 */
export const saveDraft = async (
  correctorId: string,
  copyId: string,
  grade: number,
  sessionId: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  // ── 1. Verify corrector is assigned to this copy ───────────────────────────
  const assignment = await correctionDb.correctorAssignment.findFirst({
    where: { copyId, correctorId },
    select: { subjectId: true },
  });

  if (!assignment) {
    throw new AppError("You are not assigned to this copy", 403);
  }

  // ── 2. Verify copy is not VALIDATED and grade not already locked ───────────
  const copy = await correctionDb.examCopy.findUnique({
    where: { id: copyId },
    select: { status: true, anonymousCode: true },
  });

  if (!copy) throw new AppError("Copy not found", 404);
  if (copy.status === "VALIDATED") {
    throw new AppError("Copy is already validated — cannot save draft", 400);
  }

  // Check if this corrector has already locked a grade for this copy
  const locked = await correctionDb.correctionGrade.findFirst({
    where: { copyId, correctorId, isLocked: true },
  });
  if (locked) {
    throw new AppError("Grade already submitted and locked for this copy", 400);
  }

  // ── 3. Validate grade against subject maxGrade ────────────────────────────
  const subject = await identityDb.subject.findUnique({
    where: { id: assignment.subjectId },
    select: { maxGrade: true },
  });
  if (!subject) throw new AppError("Subject not found", 404);

  if (grade < 0 || grade > subject.maxGrade) {
    throw new AppError(`Grade must be between 0 and ${subject.maxGrade}`, 400);
  }

  // ── 4. Upsert draft ───────────────────────────────────────────────────────
  const draft = await correctionDb.gradeDraft.upsert({
    where: { copyId_correctorId: { copyId, correctorId } },
    create: {
      copyId,
      correctorId,
      sessionId,
      subjectId: assignment.subjectId,
      grade,
    },
    update: { grade },
  });

  // ── 5. Audit (fire-and-forget) ────────────────────────────────────────────
  audit({
    userId: correctorId,
    action: "GRADE_DRAFT_SAVED",
    entity: "ExamCopy",
    entityId: copyId,
    ipAddress,
    userAgent,
    payload: { copyId, sessionId },
  }).catch(() => {});

  return {
    copyId,
    anonymousCode: copy.anonymousCode,
    draftGrade: draft.grade,
    savedAt: draft.savedAt,
  };
};

/**
 * Locks ALL drafts for a corrector for a subject in a session:
 * - Converts GradeDraft → CorrectionGrade (isLocked = true)
 * - Updates CopyStatus per round logic
 * - Checks discrepancy threshold on copies where round 2 completes
 * - Triggers final grade computation where applicable
 * - Triggers DELIBERATION transition if all copies VALIDATED
 * - Deletes GradeDraft records after conversion
 */
export const submitGrades = async (
  correctorId: string,
  subjectId: string,
  sessionId: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  // ── 1. Fetch all drafts for this corrector / subject / session ─────────────
  const drafts = await correctionDb.gradeDraft.findMany({
    where: { correctorId, subjectId, sessionId },
    include: {
      copy: {
        select: { id: true, status: true, anonymousCode: true },
        include: {
          assignments: { select: { correctorId: true, round: true } },
          grades: { select: { round: true, grade: true, correctorId: true } },
        },
      },
    },
  });

  if (drafts.length === 0) {
    throw new AppError(
      "No draft grades found for this subject in this session",
      400,
    );
  }

  // ── 2. Fetch discrepancy threshold for this session ────────────────────────
  const threshold = await getDiscrepancyThreshold(sessionId);

  let submittedCount = 0;
  let discrepancyCount = 0;
  let validatedCount = 0;

  // ── 3. Process each draft ─────────────────────────────────────────────────
  for (const draft of drafts) {
    const copy = draft.copy;

    // Determine round for this corrector on this copy
    const myAssignment = copy.assignments.find(
      (a) => a.correctorId === correctorId,
    );
    if (!myAssignment) continue; // defensive — should never happen

    const round = myAssignment.round;

    // Skip copies that are already validated or locked for this corrector
    if (copy.status === "VALIDATED") continue;
    const alreadyLocked = copy.grades.some(
      (g) => g.correctorId === correctorId && g.round === round,
    );
    if (alreadyLocked) continue;

    // ── 3a. Create CorrectionGrade (locked) ───────────────────────────────
    await correctionDb.correctionGrade.create({
      data: {
        copyId: copy.id,
        correctorId,
        sessionId,
        subjectId,
        grade: draft.grade,
        round,
        isLocked: true,
      },
    });

    submittedCount++;

    // ── 3b. Determine new CopyStatus and run discrepancy logic ────────────
    if (round === 1) {
      // Only round 1 done so far
      await correctionDb.examCopy.update({
        where: { id: copy.id },
        data: { status: "FIRST_DONE" },
      });
    } else if (round === 2) {
      // Round 2 submitted — check if round 1 also exists
      const existingGrades = [
        ...copy.grades,
        { round, grade: draft.grade, correctorId },
      ];
      const g1Record = existingGrades.find((g) => g.round === 1);

      if (g1Record) {
        // Both rounds done — run discrepancy check
        const g1 = g1Record.grade;
        const g2 = draft.grade;
        const gap = Math.abs(g1 - g2);

        if (gap <= threshold) {
          // No discrepancy — compute final grade immediately
          await correctionDb.examCopy.update({
            where: { id: copy.id },
            data: { status: "SECOND_DONE" },
          });
          await computeAndPersistFinalGrade(
            copy.id,
            sessionId,
            subjectId,
            g1,
            g2,
            null,
          );
          validatedCount++;
        } else {
          // Discrepancy — needs third corrector
          await correctionDb.examCopy.update({
            where: { id: copy.id },
            data: { status: "DISCREPANCY" },
          });
          discrepancyCount++;
        }
      } else {
        // Round 1 not yet submitted — just mark SECOND_DONE
        await correctionDb.examCopy.update({
          where: { id: copy.id },
          data: { status: "SECOND_DONE" },
        });
      }
    } else if (round === 3) {
      // Third corrector submission
      await correctionDb.examCopy.update({
        where: { id: copy.id },
        data: { status: "THIRD_DONE" },
      });

      // Fetch g1 and g2 from existing grades
      const g1Record = copy.grades.find((g) => g.round === 1);
      const g2Record = copy.grades.find((g) => g.round === 2);

      if (g1Record && g2Record) {
        await computeAndPersistFinalGrade(
          copy.id,
          sessionId,
          subjectId,
          g1Record.grade,
          g2Record.grade,
          draft.grade,
        );
        validatedCount++;
      }
    }
  }

  // ── 4. Delete all draft records after successful conversion ────────────────
  await correctionDb.gradeDraft.deleteMany({
    where: { correctorId, subjectId, sessionId },
  });

  // ── 5. Check if all copies in the session are now VALIDATED ────────────────
  await checkAndTriggerDeliberation(sessionId, correctorId);

  // ── 6. Audit ──────────────────────────────────────────────────────────────
  audit({
    userId: correctorId,
    action: "GRADES_SUBMITTED",
    entity: "CompetitionSession",
    entityId: sessionId,
    ipAddress,
    userAgent,
    payload: {
      sessionId,
      subjectId,
      submitted: submittedCount,
      discrepancies: discrepancyCount,
      validated: validatedCount,
    },
  }).catch(() => {});

  return {
    submitted: submittedCount,
    discrepancies: discrepancyCount,
    validated: validatedCount,
  };
};

/**
 * Returns detail for a single copy:
 * - Corrector must be assigned to this copy.
 * - Hides other correctors' grades until copy is VALIDATED.
 * - If VALIDATED: shows all grades + finalGrade + appliedRule.
 */
export const getCopyDetail = async (correctorId: string, copyId: string) => {
  // ── 1. Verify corrector is assigned to this copy ───────────────────────────
  const assignment = await correctionDb.correctorAssignment.findFirst({
    where: { copyId, correctorId },
    select: { round: true, subjectId: true },
  });

  if (!assignment) {
    throw new AppError("You are not assigned to this copy", 403);
  }

  const copy = await correctionDb.examCopy.findUnique({
    where: { id: copyId },
    include: {
      grades: {
        select: { round: true, grade: true, correctorId: true, isLocked: true },
      },
      drafts: { where: { correctorId }, select: { grade: true } },
      finalGrade: { select: { finalGrade: true, appliedRule: true } },
    },
  });

  if (!copy) throw new AppError("Copy not found", 404);

  // ── 2. Fetch subject info from identity DB ─────────────────────────────────
  const subject = await identityDb.subject.findUnique({
    where: { id: assignment.subjectId },
    select: { name: true, maxGrade: true, minimumGrade: true },
  });
  if (!subject) throw new AppError("Subject not found", 404);

  const myGrade = copy.grades.find((g) => g.correctorId === correctorId);
  const myDraft = copy.drafts[0] ?? null;

  // ── 3. Build response — hide other grades unless VALIDATED ────────────────
  const isValidated = copy.status === "VALIDATED";

  const response: Record<string, unknown> = {
    copyId: copy.id,
    anonymousCode: copy.anonymousCode,
    subjectName: subject.name,
    maxGrade: subject.maxGrade,
    minimumGrade: subject.minimumGrade,
    status: copy.status,
    myDraftGrade: myDraft?.grade ?? null,
    mySubmittedGrade: myGrade?.grade ?? null,
    isLocked: myGrade?.isLocked ?? false,
  };

  if (isValidated) {
    // Reveal all grades and final result only when copy is fully validated
    response.allGrades = copy.grades.map((g) => ({
      round: g.round,
      grade: g.grade,
    }));
    response.finalGrade = copy.finalGrade?.finalGrade ?? null;
    response.appliedRule = copy.finalGrade?.appliedRule ?? null;
  }

  return response;
};
