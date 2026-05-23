// src/modules/rooms/rooms.service.ts
import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { surveillantRoomAssignmentTemplate } from "../../utils/emailTemplates.js";
import { sendEmail } from "../../utils/mailer.js";

import type {
  CreateRoomDto,
  UpdateRoomDto,
  AddRoomToSessionDto,
  UpdateSessionRoomDto,
  AssignSurveillantDto,
} from "./rooms.types.js";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const getSessionOrThrow = async (id: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id },
    include: {
      formation: {
        select: { coordinatorId: true, name: true },
      },
    },
  });
  if (!session) throw new AppError("Session not found", 404);
  return session;
};

const assertDraftOrOpen = (status: string) => {
  if (status !== "DRAFT" && status !== "OPEN") {
    throw new AppError("Session must be DRAFT or OPEN to manage rooms", 403);
  }
};

const assertOpen = (status: string) => {
  if (status !== "OPEN") {
    throw new AppError("Session must be OPEN to perform this action", 403);
  }
};

const getSessionRoomOrThrow = async (
  sessionRoomId: string,
  sessionId: string,
) => {
  const sessionRoom = await identityDb.sessionRoom.findFirst({
    where: { id: sessionRoomId, sessionId },
    include: {
      room: true,
      specialization: { include: { formationSpecialization: true } },
    },
  });
  if (!sessionRoom) throw new AppError("Session room not found", 404);
  return sessionRoom;
};

const getEffectiveCapacity = (sr: {
  usedCapacity: number | null;
  room: { capacity: number };
}): number => sr.usedCapacity ?? sr.room.capacity;

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL ROOM MANAGEMENT (ADMIN)
// ═══════════════════════════════════════════════════════════════════════════════

export const createRoom = async (dto: CreateRoomDto, createdBy: string) => {
  return identityDb.room.create({
    data: { ...dto, createdBy },
  });
};

export const listRooms = async (showInactive = false) => {
  return identityDb.room.findMany({
    where: showInactive ? {} : { isActive: true },
    orderBy: { name: "asc" },
  });
};

export const updateRoom = async (id: string, dto: UpdateRoomDto) => {
  const room = await identityDb.room.findUnique({ where: { id } });
  if (!room) throw new AppError("Room not found", 404);
  return identityDb.room.update({ where: { id }, data: dto });
};

export const deleteRoom = async (id: string) => {
  return identityDb.$transaction(async (tx) => {
    const room = await tx.room.findUnique({
      where: { id },
      include: { _count: { select: { sessionRooms: true } } },
    });
    if (!room) throw new AppError("Room not found", 404);

    if (room._count.sessionRooms > 0) {
      if (!room.isActive) throw new AppError("Room is already inactive", 400);
      await tx.room.update({ where: { id }, data: { isActive: false } });
      return { id, permanent: false };
    }

    await tx.room.delete({ where: { id } });
    return { id, permanent: true };
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION ROOM MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const addRoomToSession = async (
  sessionId: string,
  dto: AddRoomToSessionDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraftOrOpen(session.status);

  // validate room
  const room = await identityDb.room.findUnique({ where: { id: dto.roomId } });
  if (!room) throw new AppError("Room not found", 404);
  if (!room.isActive) throw new AppError("Room is inactive", 400);

  // validate specialization belongs to this session
  const spec = await identityDb.sessionSpecialization.findFirst({
    where: { id: dto.specializationId, sessionId },
  });
  if (!spec) {
    throw new AppError(
      "Specialization not found in this session — add it first via POST /sessions/:id/specializations",
      404,
    );
  }

  // room can only be added once per session regardless of specialization
  const existing = await identityDb.sessionRoom.findFirst({
    where: { sessionId, roomId: dto.roomId },
  });
  if (existing) throw new AppError("Room already added to this session", 409);

  return identityDb.sessionRoom.create({
    data: {
      sessionId,
      roomId: dto.roomId,
      specializationId: dto.specializationId,
      usedCapacity: dto.usedCapacity,
    },
    include: {
      room: true,
      specialization: { include: { formationSpecialization: true } },
    },
  });
};

export const getSessionRooms = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);

  return identityDb.sessionRoom.findMany({
    where: { sessionId },
    include: {
      room: true,
      specialization: {
        include: { formationSpecialization: true },
      },
      candidateAssignments: {
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              registrationNumber: true,
            },
          },
        },
      },
      surveillantAssignments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          candidateAssignments: true,
          surveillantAssignments: true,
        },
      },
    },
    orderBy: { room: { name: "asc" } },
  });
};

export const updateSessionRoom = async (
  sessionId: string,
  sessionRoomId: string,
  dto: UpdateSessionRoomDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraftOrOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  if (sessionRoom.lockedAt) {
    throw new AppError("Cannot update a locked room", 400);
  }

  if (
    dto.usedCapacity !== undefined &&
    dto.usedCapacity > sessionRoom.room.capacity
  ) {
    throw new AppError(
      `usedCapacity (${dto.usedCapacity}) cannot exceed room capacity (${sessionRoom.room.capacity})`,
      400,
    );
  }

  return identityDb.sessionRoom.update({
    where: { id: sessionRoomId },
    data: dto,
    include: {
      room: true,
      specialization: { include: { formationSpecialization: true } },
    },
  });
};

export const removeRoomFromSession = async (
  sessionId: string,
  sessionRoomId: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraftOrOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  if (sessionRoom.lockedAt) {
    throw new AppError("Cannot remove a locked room", 400);
  }

  await identityDb.sessionRoom.delete({ where: { id: sessionRoomId } });
};

// ─── AUTO ASSIGN ──────────────────────────────────────────────────────────────
// Assigns candidates to rooms per specialization:
//   - IA candidates → IA rooms only
//   - Cyber candidates → Cyber rooms only
//   - Each specialization is independent

export const autoAssign = async (sessionId: string) => {
  const session = await getSessionOrThrow(sessionId);
  assertOpen(session.status);

  // 1. Get all session rooms grouped by specialization
  const sessionRooms = await identityDb.sessionRoom.findMany({
    where: { sessionId },
    include: {
      room: true,
      specialization: { include: { formationSpecialization: true } },
    },
    orderBy: { room: { name: "asc" } },
  });

  if (sessionRooms.length === 0) {
    throw new AppError("No rooms added to this session", 400);
  }

  // 2. Get all registered candidates with their specialization
  const candidates = await identityDb.candidate.findMany({
    where: { sessionId, status: "REGISTERED" },
    include: { specialization: { include: { formationSpecialization: true } } },
    orderBy: { registrationNumber: "asc" },
  });

  if (candidates.length === 0) {
    throw new AppError("No registered candidates in this session", 400);
  }

  // 3. Group rooms by specializationId
  const roomsBySpec = new Map<string, typeof sessionRooms>();
  for (const sr of sessionRooms) {
    const specId = sr.specializationId;
    if (!roomsBySpec.has(specId)) roomsBySpec.set(specId, []);
    roomsBySpec.get(specId)!.push(sr);
  }

  // 4. Group candidates by specializationId
  const candidatesBySpec = new Map<string, typeof candidates>();
  const unassignedCandidates: typeof candidates = [];

  for (const candidate of candidates) {
    if (!candidate.specializationId) {
      unassignedCandidates.push(candidate);
      continue;
    }
    const specId = candidate.specializationId;
    if (!candidatesBySpec.has(specId)) candidatesBySpec.set(specId, []);
    candidatesBySpec.get(specId)!.push(candidate);
  }

  // 5. Validate capacity per specialization before modifying the DB
  const capacityErrors: string[] = [];
  for (const [specId, specCandidates] of candidatesBySpec.entries()) {
    const rooms = roomsBySpec.get(specId) ?? [];
    const totalCapacity = rooms.reduce(
      (sum, sr) => sum + getEffectiveCapacity(sr),
      0,
    );
    if (totalCapacity < specCandidates.length) {
      const specName =
        specCandidates[0]?.specialization?.formationSpecialization?.name ??
        specId;
      capacityErrors.push(
        `${specName}: ${specCandidates.length} candidates but only ${totalCapacity} slots. Gap: ${specCandidates.length - totalCapacity}`,
      );
    }
  }

  if (unassignedCandidates.length > 0) {
    capacityErrors.push(
      `${unassignedCandidates.length} candidate(s) have no specialization assigned — cannot auto-assign them`,
    );
  }

  if (capacityErrors.length > 0) {
    throw new AppError(
      `Auto-assign blocked:\n${capacityErrors.join("\n")}`,
      400,
    );
  }

  const allAssignments: {
    sessionRoomId: string;
    candidateId: string;
    sessionId: string;
  }[] = [];

  const summary: {
    specializationName: string;
    roomName: string;
    capacity: number;
    effectiveCapacity: number;
    assigned: number;
  }[] = [];

  // 6. Compute allocations per specialization chunk
  for (const [specId, specCandidates] of candidatesBySpec.entries()) {
    const rooms = roomsBySpec.get(specId) ?? [];
    let cursor = 0;

    for (const sr of rooms) {
      const effective = getEffectiveCapacity(sr);
      const chunk = specCandidates.slice(cursor, cursor + effective);

      for (const candidate of chunk) {
        allAssignments.push({
          sessionRoomId: sr.id,
          candidateId: candidate.id,
          sessionId,
        });
      }

      summary.push({
        specializationName: sr.specialization.formationSpecialization.name,
        roomName: sr.room.name,
        capacity: sr.room.capacity,
        effectiveCapacity: effective,
        assigned: chunk.length,
      });

      cursor += chunk.length;
      if (cursor >= specCandidates.length) break;
    }
  }

  // 7. Execute all mutations atomically inside a safe transaction block
  return identityDb.$transaction(async (tx) => {
    // Clear existing assignments safely
    await tx.roomCandidateAssignment.deleteMany({
      where: { sessionId: sessionId },
    });

    // Bulk insert new room assignments
    await tx.roomCandidateAssignment.createMany({ data: allAssignments });

    // Update usedCapacity on every single room (re-setting to 0 if empty to clear stale values)
    for (const sr of sessionRooms) {
      const assignedCount = allAssignments.filter(
        (a) => a.sessionRoomId === sr.id,
      ).length;

      await tx.sessionRoom.update({
        where: { id: sr.id },
        data: { usedCapacity: assignedCount }, // Always updates, ensuring clean resets
      });
    }

    return {
      totalAssigned: allAssignments.length,
      unassigned: unassignedCandidates.length,
      rooms: summary,
    };
  });
};

// ─── ASSIGN SURVEILLANT ───────────────────────────────────────────────────────
// Surveillant must be assigned to the session as SURVEILLANT via SessionStaff
// No longer checks formationStaff (removed in redesign)

export const assignSurveillant = async (
  sessionId: string,
  sessionRoomId: string,
  subjectId: string, // 👈 Make sure your controller passes this!
  dto: AssignSurveillantDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraftOrOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  if (sessionRoom.lockedAt) {
    throw new AppError("Cannot assign surveillant to a locked room", 400);
  }

  // 1️⃣ NEW: Verify the subject exists in this session
  const examSubject = await identityDb.subject.findFirst({
    where: { id: subjectId, sessionId },
  });
  if (!examSubject) {
    throw new AppError("Subject not found in this session", 404);
  }

  const user = await identityDb.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw new AppError("User not found", 404);
  if (!user.isActive) throw new AppError("User is inactive", 400);

  const staffRecord = await identityDb.sessionStaff.findFirst({
    where: {
      sessionId,
      userId: dto.userId,
      function: "SURVEILLANT",
    },
  });
  if (!staffRecord) {
    throw new AppError(
      "User is not assigned as SURVEILLANT in this session — assign them via POST /sessions/:id/staff first",
      403,
    );
  }

  // 2️⃣ FIXED: Check for existing assignment using the new unique constraint
  const existing = await identityDb.roomSurveillantAssignment.findUnique({
    where: {
      sessionRoomId_userId_subjectId: {
        sessionRoomId,
        userId: dto.userId,
        subjectId,
      },
    },
  });
  if (existing)
    throw new AppError(
      "Surveillant already assigned to this room for this subject",
      409,
    );

  // 3️⃣ FIXED: Inject the subjectId into the database creation
  const assignment = await identityDb.roomSurveillantAssignment.create({
    data: {
      sessionRoomId,
      userId: dto.userId,
      sessionId,
      subjectId, // 👈 Saves the subject mapping
    },
  });

  // 4️⃣ FIXED: Count surveillants based on the ROOM + SUBJECT combination
  const surveillantCount = await identityDb.roomSurveillantAssignment.count({
    where: { sessionRoomId, subjectId },
  });
  const warning =
    surveillantCount < 2
      ? `Room has ${surveillantCount} surveillant(s) for the subject ${examSubject.name}. Minimum required is 2.`
      : undefined;

  // send assignment email — fire and forget
  try {
    const candidateCount = await identityDb.roomCandidateAssignment.count({
      where: { sessionRoomId },
    });

    // Optional: You could update your template to accept examSubject.name
    // so the email tells them exactly what exam they are watching!
    const { subject: emailSubject, html } = surveillantRoomAssignmentTemplate(
      `${user.firstName} ${user.lastName}`,
      sessionRoom.room.name,
      sessionRoom.room.building ?? "Bâtiment principal",
      sessionRoom.room.floor ?? "Rez-de-chaussée",
      session.label,
      session.examDate.toLocaleDateString("fr-DZ", { dateStyle: "full" }),
      candidateCount,
    );
    await sendEmail({ emailto: user.email, subject: emailSubject, html });
  } catch (err: unknown) {
    console.error(
      `[Email] Failed to send room assignment email to ${user.email}:`,
      err instanceof Error ? err.message : err,
    );
  }

  return { assignment, warning };
};
// ─── REMOVE SURVEILLANT ───────────────────────────────────────────────────────

export const removeSurveillant = async (
  sessionId: string,
  sessionRoomId: string,
  subjectId: string, // 👈 ADDED: We need to know which exam to remove them from
  userId: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraftOrOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  if (sessionRoom.lockedAt) {
    throw new AppError("Cannot remove surveillant from a locked room", 400);
  }

  // 1️⃣ FIXED: Use the new compound unique key to find the assignment
  const assignment = await identityDb.roomSurveillantAssignment.findUnique({
    where: {
      sessionRoomId_userId_subjectId: {
        sessionRoomId,
        userId,
        subjectId,
      },
    },
  });

  if (!assignment) throw new AppError("Surveillant assignment not found", 404);

  // 2️⃣ FIXED: Use the new compound unique key to delete the assignment
  await identityDb.roomSurveillantAssignment.delete({
    where: {
      sessionRoomId_userId_subjectId: {
        sessionRoomId,
        userId,
        subjectId,
      },
    },
  });
};

// ─── LOCK ROOM ────────────────────────────────────────────────────────────────

export const lockRoom = async (
  sessionId: string,
  sessionRoomId: string,
  lockedBy: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  if (sessionRoom.lockedAt) {
    throw new AppError("Room is already locked", 400);
  }

  const surveillantCount = await identityDb.roomSurveillantAssignment.count({
    where: { sessionRoomId },
  });
  if (surveillantCount < 2) {
    throw new AppError(
      `Cannot lock room — only ${surveillantCount} surveillant(s) assigned. Minimum required is 2.`,
      400,
    );
  }

  const candidateCount = await identityDb.roomCandidateAssignment.count({
    where: { sessionRoomId },
  });
  if (candidateCount === 0) {
    throw new AppError(
      "Cannot lock an empty room — assign candidates first",
      400,
    );
  }

  return identityDb.sessionRoom.update({
    where: { id: sessionRoomId },
    data: { lockedAt: new Date(), lockedBy },
    include: {
      room: true,
      specialization: { include: { formationSpecialization: true } },
    },
  });
};
