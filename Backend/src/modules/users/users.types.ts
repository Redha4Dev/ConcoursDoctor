import { z } from "zod";

export const CreateUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  role: z.enum([
    "COORDINATOR",
    "SURVEILLANT",
    "CORRECTOR",
    "JURY_MEMBER",
    "AUDITOR",
  ]),

  // COORDINATOR
  department: z.string().optional(),
  phoneNumber: z.string().optional(),

  // CORRECTOR
  specialization: z.string().optional(),
  academicGrade: z.string().optional(),
  institution: z.string().optional(),

  // JURY_MEMBER
  academicRank: z.string().optional(),

  // AUDITOR
  scope: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),

  // profiles
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  specialization: z.string().optional(),
  academicGrade: z.string().optional(),
  institution: z.string().optional(),
  academicRank: z.string().optional(),
  scope: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
