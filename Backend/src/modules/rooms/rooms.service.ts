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

const assertOpen = (status: string) => {
  if (status !== "OPEN")
    throw new AppError("Session must be OPEN to manage rooms", 403);
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

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL ROOM MANAGEMENT (ADMIN)
// ═══════════════════════════════════════════════════════════════════════════════

export const createRoom = async (dto: CreateRoomDto, createdBy: string) => {
  return identityDb.room.create({
    data: { ...dto, createdBy },
  });
};

export const listRooms = async () => {
  return identityDb.room.findMany({
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
  assertOpen(session.status);

  // Room must exist and be active
  const room = await identityDb.room.findUnique({ where: { id: dto.roomId } });
  if (!room) throw new AppError("Room not found", 404);
  if (!room.isActive) throw new AppError("Room is inactive", 400);

  // Room can only be added once per session
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
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
      _count: {
        select: { candidateAssignments: true, surveillantAssignments: true },
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
  assertOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  if (dto.usedCapacity > sessionRoom.room.capacity) {
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
  assertOpen(session.status);
  await getSessionRoomOrThrow(sessionRoomId, sessionId);

  // onDelete: Cascade handles candidate and surveillant assignments
  await identityDb.sessionRoom.delete({ where: { id: sessionRoomId } });
};

// ─── AUTO ASSIGN ──────────────────────────────────────────────────────────────
export const autoAssign = async (sessionId: string) => {
  const session = await getSessionOrThrow(sessionId);
  assertOpen(session.status);

  const sessionRooms = await identityDb.sessionRoom.findMany({
    where: { sessionId },
    include: { room: true },
    orderBy: { room: { name: "asc" } },
  });

  if (sessionRooms.length === 0)
    throw new AppError("No rooms added to this session", 400);

  const candidates = await identityDb.candidate.findMany({
    where: { sessionId, status: "REGISTERED" },
    orderBy: { registrationNumber: "asc" },
  });

  const totalCapacity = sessionRooms.reduce(
    (sum, sr) => sum + sr.room.capacity,
    0,
  );
  const candidateCount = candidates.length;

  if (candidateCount === 0)
    throw new AppError("No registered candidates in this session", 400);

  if (totalCapacity < candidateCount) {
    throw new AppError(
      `Not enough capacity: ${candidateCount} candidates but only ${totalCapacity} slots. Gap: ${candidateCount - totalCapacity}`,
      400,
    );
  }

  // Clear existing candidate assignments for this session
  await identityDb.roomCandidateAssignment.deleteMany({ where: { sessionId } });

  // Fill rooms in order
  const assignments: {
    sessionRoomId: string;
    candidateId: string;
    sessionId: string;
  }[] = [];
  const summary: { roomName: string; capacity: number; assigned: number }[] =
    [];

  let cursor = 0;
  for (const sr of sessionRooms) {
    const chunk = candidates.slice(cursor, cursor + sr.room.capacity);
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
      assigned: chunk.length,
    });
    cursor += chunk.length;
  }

  await identityDb.roomCandidateAssignment.createMany({ data: assignments });

  // Update usedCapacity on each sessionRoom
  for (const sr of sessionRooms) {
    const assigned = assignments.filter(
      (a) => a.sessionRoomId === sr.id,
    ).length;
    await identityDb.sessionRoom.update({
      where: { id: sr.id },
      data: { usedCapacity: assigned },
    });
  }

  return { assigned: assignments.length, rooms: summary };
};

// ─── ASSIGN SURVEILLANT ───────────────────────────────────────────────────────
export const assignSurveillant = async (
  sessionId: string,
  sessionRoomId: string,
  dto: AssignSurveillantDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertOpen(session.status);
  const sessionRoom = await getSessionRoomOrThrow(sessionRoomId, sessionId);

  // User must exist and be active
  const user = await identityDb.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw new AppError("User not found", 404);
  if (!user.isActive) throw new AppError("User is inactive", 400);

  // Must be a SURVEILLANT in this session's formation
  const staffRecord = await identityDb.formationStaff.findFirst({
    where: {
      formationId: session.formationId,
      userId: dto.userId,
      role: "SURVEILLANT",
    },
  });
  if (!staffRecord)
    throw new AppError(
      "User is not a registered surveillant for this formation",
      403,
    );

  // Check duplicate
  const existing = await identityDb.roomSurveillantAssignment.findUnique({
    where: { sessionRoomId_userId: { sessionRoomId, userId: dto.userId } },
  });
  if (existing)
    throw new AppError("Surveillant already assigned to this room", 409);

  const assignment = await identityDb.roomSurveillantAssignment.create({
    data: { sessionRoomId, userId: dto.userId, sessionId },
  });

  // Warn if below 2 surveillants
  const surveillantCount = await identityDb.roomSurveillantAssignment.count({
    where: { sessionRoomId },
  });
  const warning =
    surveillantCount < 2
      ? `Room currently has ${surveillantCount} surveillant(s). Minimum recommended is 2.`
      : undefined;

  // Send email notification
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
  await getSessionOrThrow(sessionId);
  await getSessionRoomOrThrow(sessionRoomId, sessionId);

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
  assertOpen(session.status);
  await getSessionRoomOrThrow(sessionRoomId, sessionId);

  return identityDb.sessionRoom.update({
    where: { id: sessionRoomId },
    data: { lockedAt: new Date(), lockedBy },
  });
};
