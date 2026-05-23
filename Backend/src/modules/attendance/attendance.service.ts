import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type { Role } from "../../generated/identity/client.js";
import type { ValidateAttendanceBody } from "./attendance.types.js";

type PrismaUniqueConstraintError = {
  code: "P2002";
  meta?: { target?: string[] | string };
};

const isPrismaUniqueConstraintError = (
  error: unknown,
): error is PrismaUniqueConstraintError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
};

const uniqueTargetIncludes = (
  error: PrismaUniqueConstraintError,
  field: string,
) => {
  const target = error.meta?.target;
  return Array.isArray(target)
    ? target.includes(field)
    : typeof target === "string" && target.includes(field);
};

const canBypassRoomAssignment = (role: Role) =>
  role === "ADMIN" || role === "COORDINATOR";

const formatCandidateLabel = (candidate: {
  id: string;
  registrationNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) => {
  const fullName = [candidate.firstName, candidate.lastName]
    .filter(Boolean)
    .join(" ");
  const display = [candidate.registrationNumber, fullName]
    .filter(Boolean)
    .join(" - ");

  return display ? `${display} (${candidate.id})` : candidate.id;
};

export async function getMyAssignments(userId: string) {
  const assignments = await identityDb.roomSurveillantAssignment.findMany({
    where: { userId },
    include: {
      sessionRoom: {
        include: {
          session: {
            select: {
              id: true,
              label: true,
              examDate: true,
              status: true,
            },
          },
          room: {
            select: { name: true, floor: true, building: true },
          },
          candidateAssignments: { select: { id: true } },
        },
      },
      // 1️⃣ NEW: Include the subject details in the query
      subject: {
        select: { id: true, name: true },
      },
    },
    orderBy: { sessionRoom: { session: { examDate: "asc" } } },
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);

  // 2️⃣ FIXED: Update the type to include the subject
  type AssignmentItem = {
    assignmentId: string;
    sessionId: string;
    sessionLabel: string;
    examDate: Date;
    sessionStatus: string;
    sessionRoomId: string;
    room: { name: string; floor: string | null; building: string | null };
    candidateCount: number;
    subject: { id: string; name: string }; // 👈 ADDED
  };

  const grouped: Record<"upcoming" | "active" | "past", AssignmentItem[]> = {
    upcoming: [],
    active: [],
    past: [],
  };

  for (const a of assignments) {
    const { session, room, candidateAssignments } = a.sessionRoom;

    // 3️⃣ FIXED: Map the subject data into the returned item
    const item: AssignmentItem = {
      assignmentId: a.id,
      sessionId: session.id,
      sessionLabel: session.label,
      examDate: session.examDate,
      sessionStatus: session.status,
      sessionRoomId: a.sessionRoomId,
      room: {
        name: room.name,
        floor: room.floor ?? null,
        building: room.building ?? null,
      },
      candidateCount: candidateAssignments.length,
      subject: {
        id: a.subject.id,
        name: a.subject.name,
      }, // 👈 ADDED
    };

    const examDate = new Date(session.examDate);
    if (examDate >= todayEnd) grouped.upcoming.push(item);
    else if (examDate >= todayStart) grouped.active.push(item);
    else grouped.past.push(item);
  }

  return grouped;
}

export async function getRoomCandidates(
  userId: string,
  userRole: Role,
  sessionId: string,
  sessionRoomId: string,
  subjectId?: string,
) {
  if (!canBypassRoomAssignment(userRole)) {
    const assignment = await identityDb.roomSurveillantAssignment.findFirst({
      where: { userId, sessionRoomId, sessionId },
      select: { id: true },
    });
    if (!assignment) {
      throw new AppError("You are not assigned to this room", 403);
    }
  }

  const [roomCandidates, subjects, records] = await Promise.all([
    identityDb.roomCandidateAssignment.findMany({
      where: { sessionRoomId, sessionId },
      include: {
        candidate: {
          include: {
            specialization: {
              select: {
                formationSpecialization: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { candidate: { registrationNumber: "asc" } },
    }),

    identityDb.subject.findMany({
      where: { sessionId, ...(subjectId ? { id: subjectId } : {}) },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

    identityDb.attendanceRecord.findMany({
      where: { sessionId, sessionRoomId, ...(subjectId ? { subjectId } : {}) },
      select: {
        candidateId: true,
        subjectId: true,
        status: true,
        anonymityCode: true,
      },
    }),
  ]);

  if (subjectId && subjects.length === 0) {
    throw new AppError("Subject not found in this session", 404);
  }

  type RecordSlice = { status: string; anonymityCode: string | null };
  const recordMap = new Map<string, Map<string, RecordSlice>>();
  for (const record of records) {
    if (!recordMap.has(record.candidateId)) {
      recordMap.set(record.candidateId, new Map());
    }
    recordMap.get(record.candidateId)!.set(record.subjectId, {
      status: record.status,
      anonymityCode: record.anonymityCode,
    });
  }

  return roomCandidates.map(({ candidate }) => ({
    candidateId: candidate.id,
    registrationNumber: candidate.registrationNumber,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    specializationName:
      candidate.specialization?.formationSpecialization.name ?? null,
    subjects: subjects.map((subject) => {
      const record = recordMap.get(candidate.id)?.get(subject.id);
      return {
        subjectId: subject.id,
        name: subject.name,
        attended: record ? record.status === "PRESENT" : null,
        anonymityCode: record?.anonymityCode ?? null,
      };
    }),
  }));
}

export async function validateAttendance(
  userId: string,
  userRole: Role,
  sessionId: string,
  body: ValidateAttendanceBody,
) {
  const { sessionRoomId, subjectId, scans } = body;

  const scannedCandidateIds = scans.map((scan) => scan.candidateId);
  if (new Set(scannedCandidateIds).size !== scannedCandidateIds.length) {
    throw new AppError("Duplicate candidate IDs in the request body", 400);
  }

  const qrCodes = scans.map((scan) => scan.qrCode);
  if (new Set(qrCodes).size !== qrCodes.length) {
    throw new AppError("Duplicate QR codes in the request body", 400);
  }

  return identityDb.$transaction(async (tx) => {
    const session = await tx.competitionSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true },
    });
    if (!session) throw new AppError("Session not found", 404);
    if (session.status !== "OPEN") {
      throw new AppError(
        `Cannot record attendance: session is ${session.status}, expected OPEN`,
        400,
      );
    }

    if (!canBypassRoomAssignment(userRole)) {
      const assignment = await tx.roomSurveillantAssignment.findFirst({
        where: { userId, sessionRoomId, sessionId },
        select: { id: true },
      });
      if (!assignment) {
        throw new AppError("You are not assigned to this room", 403);
      }
    }

    const subject = await tx.subject.findFirst({
      where: { id: subjectId, sessionId },
      select: { id: true, name: true },
    });
    if (!subject) throw new AppError("Subject not found in this session", 404);

    await tx.attendanceRecord.deleteMany({
      where: { sessionRoomId, subjectId },
    });

    if (qrCodes.length > 0) {
      const conflicting = await tx.attendanceRecord.findMany({
        where: { anonymityCode: { in: qrCodes } },
        select: { anonymityCode: true },
      });
      if (conflicting.length > 0) {
        const codes = conflicting
          .map((record) => record.anonymityCode)
          .join(", ");
        throw new AppError(`QR code(s) already in use: ${codes}`, 409);
      }
    }

    const roomCandidateRows = await tx.roomCandidateAssignment.findMany({
      where: { sessionRoomId, sessionId },
      select: {
        candidateId: true,
        candidate: {
          select: {
            id: true,
            registrationNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    if (roomCandidateRows.length === 0) {
      throw new AppError("Cannot validate attendance for an empty room", 400);
    }

    const roomCandidateIdSet = new Set(
      roomCandidateRows.map((row) => row.candidateId),
    );
    for (const scan of scans) {
      if (!roomCandidateIdSet.has(scan.candidateId)) {
        const candidate = await tx.candidate.findUnique({
          where: { id: scan.candidateId },
          select: {
            id: true,
            registrationNumber: true,
            firstName: true,
            lastName: true,
          },
        });
        throw new AppError(
          `Candidate ${
            candidate ? formatCandidateLabel(candidate) : scan.candidateId
          } is not assigned to this room`,
          400,
        );
      }
    }

    const scanMap = new Map(
      scans.map((scan) => [scan.candidateId, scan.qrCode]),
    );
    const recordsToCreate = roomCandidateRows.map(({ candidateId }) => {
      const qrCode = scanMap.get(candidateId);
      return {
        sessionId,
        candidateId,
        sessionRoomId,
        subjectId,
        anonymityCode: qrCode ?? null,
        recordedBy: userId,
        status: (qrCode ? "PRESENT" : "ABSENT") as "PRESENT" | "ABSENT",
        method: "QR_SCAN" as const,
      };
    });

    try {
      await tx.attendanceRecord.createMany({ data: recordsToCreate });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        if (uniqueTargetIncludes(error, "anonymityCode")) {
          throw new AppError(
            "One or more QR codes were used by another validation request",
            409,
          );
        }

        throw new AppError(
          "Attendance for this subject has already been validated in this room",
          409,
        );
      }
      throw error;
    }

    const present = recordsToCreate.filter(
      (record) => record.status === "PRESENT",
    ).length;
    const absent = recordsToCreate.length - present;

    return {
      validated: recordsToCreate.length,
      present,
      absent,
      subjectName: subject.name,
    };
  });
}

export async function getSessionSummary(sessionId: string) {
  const session = await identityDb.competitionSession.findUnique({
    where: { id: sessionId },
    select: { id: true, label: true, status: true },
  });
  if (!session) throw new AppError("Session not found", 404);

  const [rooms, subjects, records, registeredCandidates] = await Promise.all([
    identityDb.sessionRoom.findMany({
      where: { sessionId },
      include: {
        room: { select: { name: true } },
        candidateAssignments: { select: { candidateId: true } },
      },
      orderBy: { room: { name: "asc" } },
    }),

    identityDb.subject.findMany({
      where: { sessionId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

    identityDb.attendanceRecord.groupBy({
      by: ["sessionRoomId", "subjectId", "status"],
      where: { sessionId },
      _count: { id: true },
    }),

    identityDb.candidate.findMany({
      where: { sessionId, status: "REGISTERED" },
      select: { id: true },
    }),
  ]);

  const countMap = new Map<string, number>();
  for (const row of records) {
    countMap.set(
      `${row.sessionRoomId}::${row.subjectId}::${row.status}`,
      row._count.id,
    );
  }

  const totalExpected = rooms.length * subjects.length;
  let totalValidated = 0;

  const roomSummaries = rooms.map((room) => {
    const expectedCandidates = room.candidateAssignments.length;
    const subjectSummaries = subjects.map((subject) => {
      const key = `${room.id}::${subject.id}`;
      const present = countMap.get(`${key}::PRESENT`) ?? 0;
      const absent = countMap.get(`${key}::ABSENT`) ?? 0;
      const total = present + absent;
      const validated = expectedCandidates > 0 && total === expectedCandidates;
      if (validated) totalValidated++;

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        validated,
        present,
        absent,
        total,
      };
    });

    const validatedSubjects = subjectSummaries.filter(
      (subject) => subject.validated,
    ).length;

    return {
      sessionRoomId: room.id,
      roomName: room.room.name,
      totalCandidates: expectedCandidates,
      validatedSubjects,
      pendingSubjects: subjects.length - validatedSubjects,
      subjects: subjectSummaries,
    };
  });

  const allRoomsHaveCandidates = rooms.every(
    (room) => room.candidateAssignments.length > 0,
  );
  const assignedCandidateIds = new Set(
    rooms.flatMap((room) =>
      room.candidateAssignments.map((assignment) => assignment.candidateId),
    ),
  );
  const allRegisteredCandidatesAssigned = registeredCandidates.every(
    (candidate) => assignedCandidateIds.has(candidate.id),
  );

  return {
    sessionId: session.id,
    sessionLabel: session.label,
    sessionStatus: session.status,
    readyToLock:
      totalExpected > 0 &&
      allRoomsHaveCandidates &&
      allRegisteredCandidatesAssigned &&
      totalValidated === totalExpected,
    totalRooms: rooms.length,
    totalSubjects: subjects.length,
    rooms: roomSummaries,
  };
}

export async function lockAttendance(sessionId: string) {
  return identityDb.$transaction(async (tx) => {
    const session = await tx.competitionSession.findUnique({
      where: { id: sessionId },
      include: {
        sessionRooms: {
          select: {
            id: true,
            room: { select: { name: true } },
            candidateAssignments: { select: { candidateId: true } },
          },
        },
        subjects: { select: { id: true, name: true } },
        candidates: {
          where: { status: "REGISTERED" },
          select: {
            id: true,
            registrationNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    if (!session) throw new AppError("Session not found", 404);
    if (session.status !== "OPEN") {
      throw new AppError(
        `Cannot lock: session is ${session.status}, expected OPEN`,
        400,
      );
    }

    const roomIds = session.sessionRooms.map((room) => room.id);
    const subjectIds = session.subjects.map((subject) => subject.id);

    if (roomIds.length === 0 || subjectIds.length === 0) {
      throw new AppError(
        "Cannot lock: session has no rooms or no subjects configured",
        400,
      );
    }

    const emptyRoom = session.sessionRooms.find(
      (room) => room.candidateAssignments.length === 0,
    );
    if (emptyRoom) {
      throw new AppError(
        `Cannot lock: room ${emptyRoom.room.name} has no candidates assigned`,
        400,
      );
    }

    const subjectIdSet = new Set(subjectIds);
    const candidateRoomMap = new Map<string, string>();
    const assignedCandidateIds = new Set<string>();

    for (const room of session.sessionRooms) {
      for (const assignment of room.candidateAssignments) {
        candidateRoomMap.set(assignment.candidateId, room.id);
        assignedCandidateIds.add(assignment.candidateId);
      }
    }

    const unassignedCandidate = session.candidates.find(
      (candidate) => !candidateRoomMap.has(candidate.id),
    );
    if (unassignedCandidate) {
      throw new AppError(
        `Cannot lock: candidate ${formatCandidateLabel(
          unassignedCandidate,
        )} is not assigned to any room`,
        400,
      );
    }

    const records = await tx.attendanceRecord.findMany({
      where: {
        sessionId,
        sessionRoomId: { in: roomIds },
        subjectId: { in: subjectIds },
      },
      select: {
        candidateId: true,
        sessionRoomId: true,
        subjectId: true,
        status: true,
      },
    });

    const seenRecordKeys = new Set<string>();
    for (const record of records) {
      const assignedRoomId = candidateRoomMap.get(record.candidateId);
      if (
        !assignedRoomId ||
        assignedRoomId !== record.sessionRoomId ||
        !subjectIdSet.has(record.subjectId)
      ) {
        throw new AppError(
          "Cannot lock: attendance records do not match the room assignments",
          400,
        );
      }

      const key = `${record.candidateId}::${record.subjectId}`;
      if (seenRecordKeys.has(key)) {
        throw new AppError(
          "Cannot lock: duplicate attendance record detected",
          400,
        );
      }
      seenRecordKeys.add(key);
    }

    for (const room of session.sessionRooms) {
      for (const subject of session.subjects) {
        for (const assignment of room.candidateAssignments) {
          const key = `${assignment.candidateId}::${subject.id}`;
          if (!seenRecordKeys.has(key)) {
            throw new AppError(
              `Cannot lock: attendance is not yet fully validated for ${room.room.name} / ${subject.name}`,
              400,
            );
          }
        }
      }
    }

    const absentCandidateIds = new Set(
      records
        .filter((record) => record.status === "ABSENT")
        .map((record) => record.candidateId),
    );

    const invalidCandidateIds = [...assignedCandidateIds].filter(
      (candidateId) => absentCandidateIds.has(candidateId),
    );
    const validCandidateIds = [...assignedCandidateIds].filter(
      (candidateId) => !absentCandidateIds.has(candidateId),
    );

    if (invalidCandidateIds.length > 0) {
      await tx.candidate.updateMany({
        where: { sessionId, id: { in: invalidCandidateIds } },
        data: { status: "INVALID" },
      });
    }

    if (validCandidateIds.length > 0) {
      await tx.candidate.updateMany({
        where: { sessionId, id: { in: validCandidateIds } },
        data: { status: "VALID" },
      });
    }

    const locked = await tx.competitionSession.updateMany({
      where: { id: sessionId, status: "OPEN" },
      data: { status: "ATTENDANCE_LOCKED" },
    });
    if (locked.count !== 1) {
      throw new AppError("Cannot lock: session is no longer OPEN", 409);
    }

    return {
      locked: true,
      present: validCandidateIds.length,
      absent: invalidCandidateIds.length,
      total: assignedCandidateIds.size,
    };
  });
}
