// src/modules/users/users.types.ts
import { z } from "zod";

export const CreateUserSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  institution: z.string().optional(),
  academicGrade: z.string().optional(),
  specialization: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  institution: z.string().optional(),
  academicGrade: z.string().optional(),
  specialization: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
