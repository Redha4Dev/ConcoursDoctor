import { z } from "zod";
import { Role } from "../../generated/identity/enums.js";

export const CreateFormationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2).max(20),
  department: z.string().min(2),
  description: z.string().optional(),
});


// --- UPDATE ---
export const updateFormationSchema = z.object({
  name:        z.string().min(1).optional(),
  department:  z.string().min(1).optional(),
  description: z.string().optional(),
  isActive:    z.boolean().optional(),
})
// NOTE: code is intentionally excluded — codes are identifiers, they don't change

// --- ASSIGN STAFF ---
export const assignStaffSchema = z.object({
  userId: z.string().uuid(),
  role:   z.nativeEnum(Role),
})

export type UpdateFormationDto = z.infer<typeof updateFormationSchema>
export type AssignStaffDto     = z.infer<typeof assignStaffSchema>
export type CreateFormationDto = z.infer<typeof CreateFormationSchema>;
