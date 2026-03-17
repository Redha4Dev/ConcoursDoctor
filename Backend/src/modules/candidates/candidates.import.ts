import * as xlsx from "xlsx";
import { CandidateRowSchema, type ParseResult } from "./candidates.types.js";

// normalize column names — handles variations like
// "First Name", "firstname", "FIRST_NAME" → "firstName"
const normalizeKey = (key: string): string => {
  const map: Record<string, string> = {
    // registration number variations
    registration_number: "registrationNumber",
    registrationnumber: "registrationNumber",
    "registration number": "registrationNumber",
    reg_number: "registrationNumber",
    regnumber: "registrationNumber",
    matricule: "registrationNumber",

    // name variations
    first_name: "firstName",
    firstname: "firstName",
    "first name": "firstName",
    prenom: "firstName",
    prénom: "firstName",

    last_name: "lastName",
    lastname: "lastName",
    "last name": "lastName",
    nom: "lastName",

    // contact
    phone: "phoneNumber",
    phone_number: "phoneNumber",
    "phone number": "phoneNumber",
    telephone: "phoneNumber",
    téléphone: "phoneNumber",

    // national id
    national_id: "nationalId",
    nationalid: "nationalId",
    "national id": "nationalId",
    nin: "nationalId",

    // degree
    degree_title: "degreeTitle",
    degreetitle: "degreeTitle",
    "degree title": "degreeTitle",
    diplome: "degreeTitle",
    diplôme: "degreeTitle",

    degree_institution: "degreeInstitution",
    degreeinstitution: "degreeInstitution",
    "degree institution": "degreeInstitution",
    institution: "degreeInstitution",
    etablissement: "degreeInstitution",
    établissement: "degreeInstitution",

    graduation_year: "graduationYear",
    graduationyear: "graduationYear",
    "graduation year": "graduationYear",
    annee: "graduationYear",
    année: "graduationYear",
  };

  const normalized = key.toLowerCase().trim();
  return map[normalized] ?? normalized;
};

const normalizeRow = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    const normalizedKey = normalizeKey(key);
    normalized[normalizedKey] = raw[key];
  }
  return normalized;
};

export const parseImportFile = (buffer: Buffer): ParseResult => {
  // read workbook — supports .xlsx, .xls, .csv
  const workbook = xlsx.read(buffer, {
    type: "buffer",
    cellDates: true, // parse dates properly
    cellText: false,
  });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      valid: [],
      errors: [
        {
          row: 0,
          field: "file",
          value: null,
          message: "File is empty or has no sheets",
        },
      ],
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "", // empty cells become empty string, not undefined
    raw: false, // convert numbers to strings for consistency
  });

  if (rows.length === 0) {
    return {
      valid: [],
      errors: [
        {
          row: 0,
          field: "file",
          value: null,
          message: "File has no data rows",
        },
      ],
    };
  }

  const valid: ParseResult["valid"] = [];
  const errors: ParseResult["errors"] = [];

  rows.forEach((rawRow, index) => {
    const rowNumber = index + 2; // +2 because row 1 is header

    const normalized = normalizeRow(rawRow);

    // clean empty strings to undefined for optional fields
    const cleaned = Object.fromEntries(
      Object.entries(normalized).map(([k, v]) => [k, v === "" ? undefined : v]),
    );

    const result = CandidateRowSchema.safeParse(cleaned);

    if (result.success) {
      valid.push(result.data);
    } else {
      result.error.issues.forEach((issue) => {
        errors.push({
          row: rowNumber,
          field: issue.path.join(".") || "unknown",
          value: cleaned[issue.path[0] as string],
          message: issue.message,
        });
      });
    }
  });

  return { valid, errors };
};
