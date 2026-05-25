// src/modules/correction/correction.types.ts
import { z } from "zod";

// ─── COORDINATOR / ADMIN SCHEMAS ─────────────────────────────────────────────

/**
 * POST /api/v1/correction/:sessionId/assign-third
 * Body: correctorId to assign as round-3 corrector on a specific copy
 */
export const AssignThirdCorrectorSchema = z.object({
  correctorId: z.string().uuid("correctorId must be a valid UUID"),
});

// ─── CORRECTOR SCHEMAS ────────────────────────────────────────────────────────

/**
 * PUT /api/v1/correction/drafts
 * Auto-save a grade draft while working — upserted per (copyId, correctorId).
 */
export const SaveDraftSchema = z.object({
  copyId: z.string().uuid("copyId must be a valid UUID"),
  grade: z
    .number()
    .min(0, "Grade cannot be negative")
    .max(100, "Grade cannot exceed 100"), // upper bound validated against maxGrade in service
  sessionId: z.string().uuid("sessionId must be a valid UUID"),
});

/**
 * POST /api/v1/correction/subjects/:subjectId/submit
 * Locks all drafts for a corrector, for a subject, in a session.
 */
export const SubmitGradesSchema = z.object({
  sessionId: z.string().uuid("sessionId must be a valid UUID"),
});

// ─── INFERRED TYPES ───────────────────────────────────────────────────────────

export type AssignThirdCorrectorDto = z.infer<typeof AssignThirdCorrectorSchema>;
export type SaveDraftDto = z.infer<typeof SaveDraftSchema>;
export type SubmitGradesDto = z.infer<typeof SubmitGradesSchema>;
