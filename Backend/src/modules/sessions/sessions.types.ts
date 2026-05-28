// src/modules/sessions/sessions.types.ts
import { z } from "zod";

export const CreateSessionSchema = z.object({
  formationId: z.string().uuid("Invalid formation ID"),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format: 2025/2026"),
  label: z.string().min(2),
  examDate: z.string().datetime(),
  attendanceDeadline: z.string().datetime().optional(),
  correctionDeadline: z.string().datetime().optional(),
});

export const UpdateSessionSchema = z.object({
  label: z.string().min(2).optional(),
  examDate: z.string().datetime().optional(),
  attendanceDeadline: z.string().datetime().optional(),
  correctionDeadline: z.string().datetime().optional(),
});

// Session specialization — links a formation spec to a session with its own slots
export const AddSessionSpecializationSchema = z.object({
  formationSpecializationId: z.string().uuid("Invalid specialization ID"),
  availableSlots: z.number().int().positive(),
  waitingListSlots: z.number().int().min(0),
});

export const UpdateSessionSpecializationSchema = z.object({
  availableSlots: z.number().int().positive().optional(),
  waitingListSlots: z.number().int().min(0),
});

// Session staff
export const AssignStaffSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID"),
    function: z.enum([
      "CORRECTOR",
      "JURY_MEMBER",
      "SURVEILLANT",
      "AUDITOR",
      "ANONYMAT_COMITE",
    ]),
    subjectId: z.string().uuid("Invalid subject ID").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.function === "CORRECTOR" && !data.subjectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectId"],
        message: "subjectId is required when function is CORRECTOR",
      });
    }
    if (data.function !== "CORRECTOR" && data.subjectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectId"],
        message: "subjectId must not be provided for non-CORRECTOR functions",
      });
    }
  });

export const CreateSubjectSchema = z.object({
  name: z.string().min(2),
  coefficient: z.number().positive(),
  maxGrade: z.number().positive().default(20),
  minimumGrade: z.number().positive().default(10),
  description: z.string().optional(),
});

export const UpdateSubjectSchema = z.object({
  name: z.string().min(2).optional(),
  coefficient: z.number().positive().optional(),
  maxGrade: z.number().positive().optional(),
  minimumGrade: z.number().positive().optional(),
  description: z.string().optional(),
});

export const GradingConfigSchema = z.object({
  discrepancyThreshold: z.number().min(0).max(20).default(3),
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
export type AddSessionSpecializationDto = z.infer<
  typeof AddSessionSpecializationSchema
>;
export type UpdateSessionSpecializationDto = z.infer<
  typeof UpdateSessionSpecializationSchema
>;
export type AssignStaffDto = z.infer<typeof AssignStaffSchema>;
export type CreateSubjectDto = z.infer<typeof CreateSubjectSchema>;
export type UpdateSubjectDto = z.infer<typeof UpdateSubjectSchema>;
export type GradingConfigDto = z.infer<typeof GradingConfigSchema>;
