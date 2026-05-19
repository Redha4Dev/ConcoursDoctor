// src/modules/sessions/sessions.service.ts
import { identityDb } from "../../config/db.js";
import type { Role } from "../../generated/identity/enums.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateSessionDto,
  UpdateSessionDto,
  AddSessionSpecializationDto,
  UpdateSessionSpecializationDto,
  AssignStaffDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  GradingConfigDto,
} from "./sessions.types.js";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const getSessionOrThrow = async (id: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id },
    include: {
      formation: { select: { coordinatorId: true, name: true, code: true } },
    },
  });
  if (!session) throw new AppError("Session not found", 404);
  return session;
};

const assertDraft = (status: string) => {
  if (status !== "DRAFT")
    throw new AppError(
      "Session can only be modified while in DRAFT status",
      400,
    );
};

// ─── SESSIONS ─────────────────────────────────────────────────────────────────

export const createSession = async (
  dto: CreateSessionDto,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createdBy: string,
) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id: dto.formationId },
    include: { coordinator: true },
  });
  if (!formation) throw new AppError("Formation not found", 404);
  if (!formation.isActive) throw new AppError("Formation is inactive", 400);

  const examDate = new Date(dto.examDate);
  // resultsDeadline = examDate + 5 days (ministerial regulation Note n°573)
  const resultsDeadline = new Date(
    examDate.getTime() + 5 * 24 * 60 * 60 * 1000,
  );

  return identityDb.competitionSession.create({
    data: {
      formationId: dto.formationId,
      academicYear: dto.academicYear,
      label: dto.label,
      examDate,
      resultsDeadline,
      attendanceDeadline: dto.attendanceDeadline
        ? new Date(dto.attendanceDeadline)
        : null,
      correctionDeadline: dto.correctionDeadline
        ? new Date(dto.correctionDeadline)
        : null,
      status: "DRAFT",
    },
    include: {
      formation: {
        select: {
          name: true,
          code: true,
          coordinator: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      specializations: { include: { formationSpecialization: true } },
      _count: { select: { candidates: true, subjects: true } },
    },
  });
};

export const getSessions = async () => {
  return identityDb.competitionSession.findMany({
    include: {
      formation: {
        select: {
          name: true,
          code: true,
          coordinator: { select: { firstName: true, lastName: true } },
        },
      },
      specializations: {
        include: { formationSpecialization: true },
      },
      _count: { select: { candidates: true, subjects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getSessionById = async (id: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id },
    include: {
      formation: {
        select: {
          name: true,
          code: true,
          department: true,
          coordinator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
      specializations: {
        include: {
          formationSpecialization: true,
          _count: { select: { candidates: true } },
        },
      },
      sessionStaff: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
      subjects: { orderBy: { coefficient: "desc" } },
      gradingConfig: true,
      _count: { select: { candidates: true } },
    },
  });
  if (!session) throw new AppError("Session not found", 404);
  return session;
};

export const updateSession = async (id: string, dto: UpdateSessionDto) => {
  const session = await getSessionOrThrow(id);
  assertDraft(session.status);

  const data: Record<string, unknown> = {};
  if (dto.label !== undefined) data.label = dto.label;
  if (dto.attendanceDeadline !== undefined)
    data.attendanceDeadline = new Date(dto.attendanceDeadline);
  if (dto.correctionDeadline !== undefined)
    data.correctionDeadline = new Date(dto.correctionDeadline);

  if (dto.examDate !== undefined) {
    const examDate = new Date(dto.examDate);
    data.examDate = examDate;
    data.resultsDeadline = new Date(
      examDate.getTime() + 5 * 24 * 60 * 60 * 1000,
    );
  }

  return identityDb.competitionSession.update({
    where: { id },
    data,
    include: {
      formation: { select: { name: true, code: true } },
    },
  });
};

export const deleteSession = async (id: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id },
    include: { _count: { select: { candidates: true, subjects: true } } },
  });
  if (!session) throw new AppError("Session not found", 404);

  if (session.status !== "DRAFT") {
    throw new AppError(
      `Cannot delete session — status is ${session.status}. Only DRAFT sessions can be deleted.`,
      400,
    );
  }

  const totalRefs = session._count.candidates + session._count.subjects;
  if (totalRefs > 0) {
    throw new AppError(
      `Cannot delete session — it has ${session._count.candidates} candidate(s) and ${session._count.subjects} subject(s). Remove them first.`,
      400,
    );
  }

  await identityDb.competitionSession.delete({ where: { id } });
  return { id, permanent: true };
};

// ─── SESSION SPECIALIZATIONS ──────────────────────────────────────────────────

export const addSessionSpecialization = async (
  sessionId: string,
  dto: AddSessionSpecializationDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  // verify the formation specialization belongs to this session's formation
  const formationSpec = await identityDb.formationSpecialization.findFirst({
    where: {
      id: dto.formationSpecializationId,
      formationId: session.formationId,
      isActive: true,
    },
  });
  if (!formationSpec) {
    throw new AppError(
      "Specialization not found in this formation or is inactive",
      404,
    );
  }

  const existing = await identityDb.sessionSpecialization.findUnique({
    where: {
      sessionId_formationSpecializationId: {
        sessionId,
        formationSpecializationId: dto.formationSpecializationId,
      },
    },
  });
  if (existing) {
    throw new AppError("Specialization already added to this session", 409);
  }

  return identityDb.sessionSpecialization.create({
    data: {
      sessionId,
      formationSpecializationId: dto.formationSpecializationId,
      availableSlots: dto.availableSlots,
    },
    include: { formationSpecialization: true },
  });
};

export const getSessionSpecializations = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);

  return identityDb.sessionSpecialization.findMany({
    where: { sessionId },
    include: {
      formationSpecialization: true,
      _count: { select: { candidates: true } },
    },
    orderBy: { formationSpecialization: { name: "asc" } },
  });
};

export const updateSessionSpecialization = async (
  sessionId: string,
  specializationId: string,
  dto: UpdateSessionSpecializationDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  const spec = await identityDb.sessionSpecialization.findFirst({
    where: { id: specializationId, sessionId },
  });
  if (!spec) throw new AppError("Session specialization not found", 404);

  return identityDb.sessionSpecialization.update({
    where: { id: specializationId },
    data: dto,
    include: { formationSpecialization: true },
  });
};

export const removeSessionSpecialization = async (
  sessionId: string,
  specializationId: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  const spec = await identityDb.sessionSpecialization.findFirst({
    where: { id: specializationId, sessionId },
    include: { _count: { select: { candidates: true } } },
  });
  if (!spec) throw new AppError("Session specialization not found", 404);

  if (spec._count.candidates > 0) {
    throw new AppError(
      `Cannot remove — ${spec._count.candidates} candidate(s) are linked to this specialization`,
      400,
    );
  }

  await identityDb.sessionSpecialization.delete({
    where: { id: specializationId },
  });
  return { id: specializationId, permanent: true };
};

// ─── SESSION STAFF ────────────────────────────────────────────────────────────

export const getSessionStaff = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);

  return identityDb.sessionStaff.findMany({
    where: { sessionId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
          academicGrade: true,
          specialization: true,
        },
      },
    },
    orderBy: { assignedAt: "asc" },
  });
};

export const assignStaff = async (
  sessionId: string,
  dto: AssignStaffDto, // { userId, function: "CORRECTOR" | "JURY_MEMBER" | ... }
  assignedBy: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  const user = await identityDb.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw new AppError("User not found", 404);
  if (!user.isActive) throw new AppError("Cannot assign inactive user", 400);

  const existing = await identityDb.sessionStaff.findUnique({
    where: {
      sessionId_userId_function: {
        sessionId,
        userId: dto.userId,
        function: dto.function,
      },
    },
  });
  if (existing)
    throw new AppError("User already assigned with this function", 409);

  return identityDb.$transaction(async (tx) => {
    const staff = await tx.sessionStaff.create({
      data: {
        sessionId,
        userId: dto.userId,
        function: dto.function,
        assignedBy,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // flip role if user was NOT_ASSIGNED
    if (user.role === "NOT_ASSIGNED") {
      await tx.user.update({
        where: { id: dto.userId },
        data: { role: dto.function as Role },
      });
    }

    return staff;
  });
};

export const removeStaff = async (
  sessionId: string,
  userId: string,
  func: string,
) => {
  const record = await identityDb.sessionStaff.findUnique({
    where: {
      sessionId_userId_function: {
        sessionId,
        userId,
        function: func as Role,
      },
    },
  });
  if (!record) throw new AppError("Staff assignment not found", 404);

  await identityDb.sessionStaff.delete({ where: { id: record.id } });
};

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────

export const getSubjects = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);
  return identityDb.subject.findMany({
    where: { sessionId },
    orderBy: { coefficient: "desc" },
  });
};

export const addSubject = async (sessionId: string, dto: CreateSubjectDto) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);
  return identityDb.subject.create({ data: { ...dto, sessionId } });
};

export const updateSubject = async (
  sessionId: string,
  subjectId: string,
  dto: UpdateSubjectDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  const subject = await identityDb.subject.findFirst({
    where: { id: subjectId, sessionId },
  });
  if (!subject) throw new AppError("Subject not found", 404);

  return identityDb.subject.update({ where: { id: subjectId }, data: dto });
};

export const deleteSubject = async (sessionId: string, subjectId: string) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  const subject = await identityDb.subject.findFirst({
    where: { id: subjectId, sessionId },
  });
  if (!subject) throw new AppError("Subject not found", 404);

  await identityDb.subject.delete({ where: { id: subjectId } });
};

// ─── GRADING CONFIG ───────────────────────────────────────────────────────────

export const getGradingConfig = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);

  const config = await identityDb.gradingConfig.findUnique({
    where: { sessionId },
  });

  return (
    config ?? {
      sessionId,
      discrepancyThreshold: 3,
      configuredAt: null,
      configuredBy: null,
      isDefault: true,
    }
  );
};

export const setGradingConfig = async (
  sessionId: string,
  dto: GradingConfigDto,
  configuredBy: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  return identityDb.gradingConfig.upsert({
    where: { sessionId },
    create: { sessionId, configuredBy, ...dto },
    update: { ...dto, configuredAt: new Date() },
  });
};

export const openSession = async (id: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id },
    include: {
      subjects: true,
      gradingConfig: true,
      _count: { select: { candidates: true } },
    },
  });
  if (!session) throw new AppError("Session not found", 404);
  if (session.status !== "DRAFT")
    throw new AppError("Only DRAFT sessions can be opened", 403);

  if (session.subjects.length === 0)
    throw new AppError("Cannot open session: no subjects defined", 400);

  if (!session.gradingConfig)
    throw new AppError("Cannot open session: grading config not set", 400);

  if (session._count.candidates === 0)
    throw new AppError("Cannot open session: no candidates imported", 400);

  return identityDb.competitionSession.update({
    where: { id },
    data: { status: "OPEN" },
  });
};
