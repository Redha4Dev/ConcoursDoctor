import { z } from "zod";

export const CandidateRowSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  nationalId: z.string().optional().or(z.literal("")),
  degreeTitle: z.string().optional().or(z.literal("")),
  degreeInstitution: z.string().optional().or(z.literal("")),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear())
    .optional(),
});

export type CandidateRow = z.infer<typeof CandidateRowSchema>;

export interface ParseResult {
  valid: CandidateRow[];
  errors: RowError[];
}

export interface RowError {
  row: number;
  field: string;
  value: unknown;
  message: string;
}
