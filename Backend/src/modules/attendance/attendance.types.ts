import { z } from "zod";

// ─── Single scan item: one QR code handed to one candidate ──────────────────
export const ScanItemSchema = z.object({
  candidateId: z.string().uuid("candidateId must be a valid UUID"),
  qrCode: z.string().min(1, "qrCode cannot be empty"),
});

// ─── Body for POST /validate ─────────────────────────────────────────────────
// scans = candidates the surveillant physically handed a paper to.
// Everyone in the room who is NOT in scans → marked ABSENT.
export const ValidateAttendanceBodySchema = z.object({
  sessionRoomId: z.string().uuid("sessionRoomId must be a valid UUID"),
  subjectId: z.string().uuid("subjectId must be a valid UUID"),
  scans: z.array(ScanItemSchema),
  // scans can be empty (everyone absent), so no .min(1)
});

// ─── Body for POST /lock ─────────────────────────────────────────────────────
// Requires an explicit { confirm: true } to prevent accidental locks.
// Using z.literal(true) means any other truthy value is rejected.
export const LockAttendanceBodySchema = z.object({
  confirm: z.literal(true, {
    error: "confirm must be exactly true",
  }),
});

// ─── Query params for GET /:sessionId/room/:sessionRoomId/candidates ─────────
export const CandidatesQuerySchema = z.object({
  // Optional filter: only return attendance data for this one subject
  subjectId: z.string().uuid("subjectId must be a valid UUID").optional(),
});

// ─── Inferred TypeScript types ────────────────────────────────────────────────
export type ScanItem = z.infer<typeof ScanItemSchema>;
export type ValidateAttendanceBody = z.infer<
  typeof ValidateAttendanceBodySchema
>;
export type LockAttendanceBody = z.infer<typeof LockAttendanceBodySchema>;
export type CandidatesQuery = z.infer<typeof CandidatesQuerySchema>;
