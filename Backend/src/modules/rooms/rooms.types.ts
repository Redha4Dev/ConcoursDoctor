// src/modules/rooms/rooms.types.ts
import { z } from "zod";

// ─── GLOBAL ROOM ──────────────────────────────────────────────────────────────

export const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  capacity: z.number().int().positive("Capacity must be positive"),
  building: z.string().optional(),
  floor: z.string().optional(),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
});

// ─── SESSION ROOM ─────────────────────────────────────────────────────────────
// When adding a room to a session, coordinator specifies which specialization
// this room is dedicated to

export const addRoomToSessionSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  specializationId: z.string().uuid("Invalid specialization ID"),
  // optional override of room capacity for this session
  usedCapacity: z.number().int().positive().optional(),
});

export const updateSessionRoomSchema = z.object({
  usedCapacity: z.number().int().positive().optional(),
});

// ─── SURVEILLANT ──────────────────────────────────────────────────────────────

export const assignSurveillantSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
export type UpdateRoomDto = z.infer<typeof updateRoomSchema>;
export type AddRoomToSessionDto = z.infer<typeof addRoomToSessionSchema>;
export type UpdateSessionRoomDto = z.infer<typeof updateSessionRoomSchema>;
export type AssignSurveillantDto = z.infer<typeof assignSurveillantSchema>;
