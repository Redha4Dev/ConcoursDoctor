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
  });
  if (!session) throw new AppError("Session not found", 404);
  return session;
};

// Rooms can be managed in DRAFT or OPEN — only lock/auto-assign require OPEN
const assertDraftOrOpen = (status: string) => {
  if (status !== "DRAFT" && status !== "OPEN") {
    throw new AppError("Session must be DRAFT or OPEN to manage rooms", 403);
  }
};

// Auto-assign and lock only make sense when session is OPEN
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
    include: { room: true },
  });
  if (!sessionRoom) throw new AppError("Session room not found", 404);
  return sessionRoom;
};

// Returns usedCapacity if set by coordinator, otherwise falls back to room's default capacity
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

// Only active rooms by default — pass showInactive=true to see all
export const listRooms = async (showInactive = false) => {
  return identityDb.room.findMany({
    where: showInactive ? {} : { isActive: true },
    orderBy: { name: "asc" },
  });
};

export const updateRoom = async (id: string, dto: UpdateRoomDto) => {
  const room = await identityDb.room.findUnique({ where: { id } });
  if (!room) throw new AppError("Room not found", 404);

  return identityDb.room.update({
    where: { id },
    data: dto,
  });
};

export const deactivateRoom = async (id: string) => {
  const room = await identityDb.room.findUnique({ where: { id } });
  if (!room) throw new AppError("Room not found", 404);
  if (!room.isActive) throw new AppError("Room is already inactive", 400);

  return identityDb.room.update({
    where: { id },
    data: { isActive: false },
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION ROOM MANAGEMENT (COORDINATOR)
// ═══════════════════════════════════════════════════════════════════════════════

export const addRoomToSession = async (
  sessionId: string,
  dto: AddRoomToSessionDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  // FIX: allow DRAFT too — coordinator should plan rooms before opening session
  assertDraftOrOpen(session.status);

  const room = await identityDb.room.findUnique({ where: { id: dto.roomId } });
  if (!room) throw new AppError("Room not found", 404);
  if (!room.isActive) throw new AppError("Room is inactive", 400);

  const existing = await identityDb.sessionRoom.findUnique({
    where: { sessionId_roomId: { sessionId, roomId: dto.roomId } },
  });
  if (existing) throw new AppError("Room already added to this session", 409);

  return identityDb.sessionRoom.create({
    data: { sessionId, roomId: dto.roomId },
    include: { room: true },
  });
};

export const getSessionRooms = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);

  return identityDb.sessionRoom.findMany({
    where: { sessionId },
    include: {
      room: true,
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
  // FIX: allow DRAFT too
  assertDraftOrOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  // FIX: block updates on locked rooms
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
  });
};

export const removeRoomFromSession = async (
  sessionId: string,
  sessionRoomId: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  // FIX: allow DRAFT too
  assertDraftOrOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  // FIX: cannot remove a locked room
  if (sessionRoom.lockedAt) {
    throw new AppError(
      "Cannot remove a locked room — unlock it first or contact admin",
      400,
    );
  }

  // onDelete: Cascade handles candidate and surveillant assignments
  await identityDb.sessionRoom.delete({ where: { id: sessionRoomId } });
};

// ─── AUTO ASSIGN ──────────────────────────────────────────────────────────────
export const autoAssign = async (sessionId: string) => {
  const session = await getSessionOrThrow(sessionId);
  // auto-assign only makes sense when session is OPEN
  assertOpen(session.status);

  const sessionRooms = await identityDb.sessionRoom.findMany({
    where: { sessionId },
    include: { room: true },
    orderBy: { room: { name: "asc" } },
  });

  if (sessionRooms.length === 0) {
    throw new AppError("No rooms added to this session", 400);
  }

  const candidates = await identityDb.candidate.findMany({
    where: { sessionId, status: "REGISTERED" },
    orderBy: { registrationNumber: "asc" },
  });

  if (candidates.length === 0) {
    throw new AppError("No registered candidates in this session", 400);
  }

  // FIX: use effective capacity (usedCapacity if set, else room.capacity)
  const totalCapacity = sessionRooms.reduce(
    (sum, sr) => sum + getEffectiveCapacity(sr),
    0,
  );

  if (totalCapacity < candidates.length) {
    throw new AppError(
      `Not enough capacity: ${candidates.length} candidates but only ${totalCapacity} slots available. Gap: ${candidates.length - totalCapacity}`,
      400,
    );
  }

  // Clear existing candidate assignments before re-assigning
  await identityDb.roomCandidateAssignment.deleteMany({ where: { sessionId } });

  const assignments: {
    sessionRoomId: string;
    candidateId: string;
    sessionId: string;
  }[] = [];

  const summary: {
    roomName: string;
    capacity: number;
    effectiveCapacity: number;
    assigned: number;
  }[] = [];

  let cursor = 0;
  for (const sr of sessionRooms) {
    // FIX: fill using effective capacity not raw room.capacity
    const effective = getEffectiveCapacity(sr);
    const chunk = candidates.slice(cursor, cursor + effective);

    for (const candidate of chunk) {
      assignments.push({
        sessionRoomId: sr.id,
        candidateId: candidate.id,
        sessionId,
      });
    }

    summary.push({
      roomName: sr.room.name,
      capacity: sr.room.capacity,
      effectiveCapacity: effective,
      assigned: chunk.length,
    });

    cursor += chunk.length;
  }

  await identityDb.roomCandidateAssignment.createMany({ data: assignments });

  // Update usedCapacity on each sessionRoom to reflect actual assignments
  for (const sr of sessionRooms) {
    const assigned = assignments.filter(
      (a) => a.sessionRoomId === sr.id,
    ).length;
    await identityDb.sessionRoom.update({
      where: { id: sr.id },
      data: { usedCapacity: assigned },
    });
  }

  return {
    assigned: assignments.length,
    rooms: summary,
  };
};

// ─── ASSIGN SURVEILLANT ───────────────────────────────────────────────────────
export const assignSurveillant = async (
  sessionId: string,
  sessionRoomId: string,
  dto: AssignSurveillantDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  // FIX: allow DRAFT too — coordinator plans surveillants before opening
  assertDraftOrOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  // FIX: cannot assign to locked room
  if (sessionRoom.lockedAt) {
    throw new AppError("Cannot assign surveillant to a locked room", 400);
  }

  const user = await identityDb.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw new AppError("User not found", 404);
  if (!user.isActive) throw new AppError("User is inactive", 400);

  // Must be registered as SURVEILLANT in this session's formation
  const staffRecord = await identityDb.formationStaff.findFirst({
    where: {
      formationId: session.formationId,
      userId: dto.userId,
      role: "SURVEILLANT",
    },
  });
  if (!staffRecord) {
    throw new AppError(
      "User is not a registered surveillant for this formation",
      403,
    );
  }

  // Check duplicate
  const existing = await identityDb.roomSurveillantAssignment.findUnique({
    where: { sessionRoomId_userId: { sessionRoomId, userId: dto.userId } },
  });
  if (existing) {
    throw new AppError("Surveillant already assigned to this room", 409);
  }

  const assignment = await identityDb.roomSurveillantAssignment.create({
    data: { sessionRoomId, userId: dto.userId, sessionId },
  });

  // Count surveillants after assignment to warn if below minimum
  const surveillantCount = await identityDb.roomSurveillantAssignment.count({
    where: { sessionRoomId },
  });

  const warning =
    surveillantCount < 2
      ? `Room currently has ${surveillantCount} surveillant(s). Minimum required is 2.`
      : undefined;

  // Send assignment email — fire and forget
  try {
    const candidateCount = await identityDb.roomCandidateAssignment.count({
      where: { sessionRoomId },
    });
    const { subject, html } = surveillantRoomAssignmentTemplate(
      `${user.firstName} ${user.lastName}`,
      sessionRoom.room.name,
      sessionRoom.room.building ?? "Bâtiment principal",
      sessionRoom.room.floor ?? "Rez-de-chaussée",
      session.label,
      session.examDate.toLocaleDateString("fr-DZ", { dateStyle: "full" }),
      candidateCount,
    );
    await sendEmail({ emailto: user.email, subject, html });
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
  userId: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraftOrOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  // FIX: cannot remove surveillant from locked room
  if (sessionRoom.lockedAt) {
    throw new AppError("Cannot remove surveillant from a locked room", 400);
  }

  const assignment = await identityDb.roomSurveillantAssignment.findUnique({
    where: { sessionRoomId_userId: { sessionRoomId, userId } },
  });
  if (!assignment) throw new AppError("Surveillant assignment not found", 404);

  await identityDb.roomSurveillantAssignment.delete({
    where: { sessionRoomId_userId: { sessionRoomId, userId } },
  });
};

// ─── LOCK ROOM ────────────────────────────────────────────────────────────────
export const lockRoom = async (
  sessionId: string,
  sessionRoomId: string,
  lockedBy: string,
) => {
  const session = await getSessionOrThrow(sessionId);
  // lock only makes sense when session is OPEN
  assertOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  // Cannot lock already locked room
  if (sessionRoom.lockedAt) {
    throw new AppError("Room is already locked", 400);
  }

  // FIX: enforce minimum 2 surveillants before allowing lock
  const surveillantCount = await identityDb.roomSurveillantAssignment.count({
    where: { sessionRoomId },
  });
  if (surveillantCount < 2) {
    throw new AppError(
      `Cannot lock room — only ${surveillantCount} surveillant(s) assigned. Minimum required is 2.`,
      400,
    );
  }

  // Cannot lock a room with no candidates assigned
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
    include: { room: true },
  });
};
