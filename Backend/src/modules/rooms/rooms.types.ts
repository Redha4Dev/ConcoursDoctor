import { z } from "zod";

// ─── GLOBAL ROOM ──────────────────────────────────────────────────────────────
export const createRoomSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  building: z.string().optional(),
  floor: z.string().optional(),
});

export const updateRoomSchema = createRoomSchema.partial();

// ─── SESSION ROOM ─────────────────────────────────────────────────────────────
export const addRoomToSessionSchema = z.object({
  roomId: z.string().uuid(),
});

export const updateSessionRoomSchema = z.object({
  usedCapacity: z.number().int().nonnegative(),
});

// ─── SURVEILLANT ──────────────────────────────────────────────────────────────
export const assignSurveillantSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
export type UpdateRoomDto = z.infer<typeof updateRoomSchema>;
export type AddRoomToSessionDto = z.infer<typeof addRoomToSessionSchema>;
export type UpdateSessionRoomDto = z.infer<typeof updateSessionRoomSchema>;
export type AssignSurveillantDto = z.infer<typeof assignSurveillantSchema>;
