import { z } from "zod";

export const CreateSessionSchema = z.object({
  formationId: z.string().uuid("Invalid formation ID"),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format: 2025/2026"),
  label: z.string().min(2),
  availableSlots: z.number().int().positive(),
  examDate: z.string().datetime(),
  examRoom: z.string().optional(),
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
