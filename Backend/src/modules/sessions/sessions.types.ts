import { z } from "zod";

export const CreateSessionSchema = z.object({
  formationId: z.string().uuid("Invalid formation ID"),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format: 2025/2026"),
  label: z.string().min(2),
  availableSlots: z.number().int().positive(),
  examDate: z.string().datetime(),
  examRoom: z.string().optional(),
});

export const updateSessionSchema = z.object({
  coordinatorId: z.string().uuid().optional(),
  academicYear: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  availableSlots: z.number().int().positive().optional(),
  examDate: z.coerce.date().optional(),
  examRoom: z.string().optional(),
  attendanceDeadline: z.coerce.date().optional(),
  correctionDeadline: z.coerce.date().optional(),
  // status is NOT here — status transitions need dedicated endpoints later
});

export const createSubjectSchema = z.object({
  name: z.string().min(1),
  coefficient: z.number().positive(),
  maxGrade: z.number().positive().optional(), // defaults to 20 at DB level
  minimumGrade: z.number().nonnegative().optional(), // defaults to 10 at DB level
  description: z.string().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const setGradingConfigSchema = z.object({
  discrepancyThreshold: z.number().positive(),
});


export type UpdateSessionDto = z.infer<typeof updateSessionSchema>;
export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;
export type SetGradingConfigDto = z.infer<typeof setGradingConfigSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
