import { z } from "zod";

// ─── ROW SCHEMA — matches PROGRES Excel file structure ────────────────────────
// Columns: Matricule Candidat, Nom FR, Prénom Fr, Nom Ar, Prénom Ar,
//          Date de Naissance, Lieu Naissance, Téléphone, Mail,
//          Adresse de Résidence, Etablissement (diplômé), Année de diplôme,
//          Type Cursus (LMD/CLASS), Filière, Spécialité diplôme,
//          catégorie de classement Master, moyenne de classement Master

export const CandidateRowSchema = z.object({
  // ── required fields ──────────────────────────────────────────────────────
  registrationNumber: z.string().min(1, "Matricule Candidat is required"),

  firstName: z.string().min(1, "Prénom Fr is required"),

  lastName: z.string().min(1, "Nom FR is required"),

  // ── Arabic name fields (optional) ─────────────────────────────────────────
  firstNameAr: z.string().optional().or(z.literal("")),
  lastNameAr: z.string().optional().or(z.literal("")),

  // ── contact ───────────────────────────────────────────────────────────────
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),

  // ── identity ──────────────────────────────────────────────────────────────
  dateOfBirth: z
    .union([z.string(), z.date()])
    .transform((val) =>
      val instanceof Date ? val.toISOString().split("T")[0] : val,
    )
    .optional()
    .or(z.literal("")),
  birthPlace: z.string().optional().or(z.literal("")),
  nationalId: z.string().optional().or(z.literal("")),

  // ── degree info ───────────────────────────────────────────────────────────
  degreeInstitution: z.string().optional().or(z.literal("")),
  degreeSpeciality: z.string().optional().or(z.literal("")), // replaces degreeTitle
  fieldOfStudy: z.string().optional().or(z.literal("")), // Filière
  cursusType: z.string().optional().or(z.literal("")), // LMD / CLASSIQUE BAC+5

  graduationYear: z.coerce
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1)
    .optional(),

  // ── tie-breaker fields (critical for ranking — from ministerial regulation) ─
  masterClassCategory: z.string().optional().or(z.literal("")),
  masterAverage: z.coerce.number().min(0).max(20).optional(),
  bachelorAverage: z.coerce.number().min(0).max(20).optional(),
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
