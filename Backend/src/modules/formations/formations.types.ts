// src/modules/formations/formations.types.ts
import { z } from "zod";

export const CreateFormationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2).max(20),
  department: z.string().min(2),
  description: z.string().optional(),
  coordinatorId: z.string().uuid("Invalid coordinator user ID"),
});

export const UpdateFormationSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  coordinatorId: z.string().uuid().optional(),
});

export const CreateSpecializationSchema = z.object({
  name: z.string().min(2, "Specialization name is required"),
  code: z.string().min(1).max(20, "Code max 20 chars"),
});

export const UpdateSpecializationSchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export type CreateFormationDto = z.infer<typeof CreateFormationSchema>;
export type UpdateFormationDto = z.infer<typeof UpdateFormationSchema>;
export type CreateSpecializationDto = z.infer<
  typeof CreateSpecializationSchema
>;
export type UpdateSpecializationDto = z.infer<
  typeof UpdateSpecializationSchema
>;
