import * as xlsx from "xlsx";
import { CandidateRowSchema, type ParseResult } from "./candidates.types.js";

// ─── COLUMN NAME NORMALIZER ───────────────────────────────────────────────────
const normalizeKey = (key: string): string => {
  const map: Record<string, string> = {
    "matricule candidat": "registrationNumber",
    matricule_candidat: "registrationNumber",
    matriculecandidat: "registrationNumber",
    registration_number: "registrationNumber",
    registrationnumber: "registrationNumber",
    "registration number": "registrationNumber",
    reg_number: "registrationNumber",
    matricule: "registrationNumber",

    "nom fr": "lastName",
    nom_fr: "lastName",
    nom: "lastName",
    last_name: "lastName",
    lastname: "lastName",
    "last name": "lastName",

    "prénom fr": "firstName",
    "prenom fr": "firstName",
    prénom_fr: "firstName",
    prenom_fr: "firstName",
    prénom: "firstName",
    prenom: "firstName",
    first_name: "firstName",
    firstname: "firstName",
    "first name": "firstName",

    "nom ar": "lastNameAr",
    nom_ar: "lastNameAr",
    "prénom ar": "firstNameAr",
    "prenom ar": "firstNameAr",
    prénom_ar: "firstNameAr",
    prenom_ar: "firstNameAr",

    mail: "email",
    email: "email",
    "e-mail": "email",

    téléphone: "phoneNumber",
    telephone: "phoneNumber",
    phone: "phoneNumber",
    phone_number: "phoneNumber",
    "phone number": "phoneNumber",

    "adresse de résidence": "address",
    "adresse de residence": "address",
    adresse: "address",
    address: "address",

    "date de naissance": "dateOfBirth",
    date_de_naissance: "dateOfBirth",
    datenaissance: "dateOfBirth",
    "date of birth": "dateOfBirth",
    dob: "dateOfBirth",

    "lieu naissance": "birthPlace",
    "lieu de naissance": "birthPlace",
    lieu_naissance: "birthPlace",
    "birth place": "birthPlace",
    birthplace: "birthPlace",

    national_id: "nationalId",
    nationalid: "nationalId",
    "national id": "nationalId",
    nin: "nationalId",

    "etablissement (diplômé)": "degreeInstitution",
    "etablissement (diplome)": "degreeInstitution",
    etablissement: "degreeInstitution",
    institution: "degreeInstitution",
    degree_institution: "degreeInstitution",
    degreeinstitution: "degreeInstitution",

    "spécialité diplôme (si lmd)": "degreeSpeciality",
    "specialite diplome (si lmd)": "degreeSpeciality",
    "spécialité diplôme": "degreeSpeciality",
    "specialite diplome": "degreeSpeciality",
    degree_title: "degreeSpeciality",
    degreetitle: "degreeSpeciality",
    diplôme: "degreeSpeciality",
    diplome: "degreeSpeciality",

    filière: "fieldOfStudy",
    filiere: "fieldOfStudy",
    "field of study": "fieldOfStudy",

    "type cursus (lmd/class)": "cursusType",
    "type cursus": "cursusType",
    cursus: "cursusType",

    "année de diplôme": "graduationYear",
    "annee de diplome": "graduationYear",
    "année diplôme": "graduationYear",
    graduation_year: "graduationYear",
    graduationyear: "graduationYear",
    "graduation year": "graduationYear",

    "catégorie de classement master": "masterClassCategory",
    "categorie de classement master": "masterClassCategory",

    "moyenne de classement master": "masterAverage",
    "moyenne classement master": "masterAverage",
    "note de master": "masterAverage",
    "master average": "masterAverage",

    "moyenne générale de l'avant dernière année de la formation graduée":
      "bachelorAverage",
    "bachelor average": "bachelorAverage",
  };

  const normalized = key
    .toLowerCase()
    .replace(/\xa0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return map[normalized] ?? normalized;
};

const normalizeRow = (
  raw: Record<string, unknown>,
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    normalized[normalizeKey(key)] = raw[key];
  }
  return normalized;
};

// ─── DATE NORMALIZER ──────────────────────────────────────────────────────────
const normalizeDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;

  if (value instanceof Date) return value;

  if (typeof value === "number") {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
};

// ─── DETECT HEADER ROW ────────────────────────────────────────────────────────
const findHeaderRowIndex = (rows: unknown[][]): number => {
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    const row = rows[i];
    if (!row) continue;

    const rowStr = row.map((c) => String(c).toLowerCase().trim()).join(" ");

    if (
      rowStr.includes("matricule candidat") ||
      rowStr.includes("registration") ||
      rowStr.includes("matricule")
    ) {
      return i;
    }
  }
  return -1;
};

// ─── PARSE SINGLE SHEET ───────────────────────────────────────────────────────
const parseSheet = (sheet: xlsx.WorkSheet, sheetName: string): ParseResult => {
  const rawRows = xlsx.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  const headerIndex = findHeaderRowIndex(rawRows as unknown[][]);

  if (headerIndex === -1) {
    return {
      valid: [],
      errors: [
        {
          row: 0,
          field: "file",
          value: sheetName,
          message: `Sheet "${sheetName}": could not find header row`,
        },
      ],
    };
  }

  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    range: headerIndex,
    defval: "",
    raw: true,
  });

  const valid: ParseResult["valid"] = [];
  const errors: ParseResult["errors"] = [];

  rows.forEach((rawRow, index) => {
    const rowNumber = headerIndex + index + 2;

    const normalized = normalizeRow(rawRow);

    if (
      !normalized.registrationNumber &&
      !normalized.lastName &&
      !normalized.firstName
    ) {
      return;
    }

    if (
      normalized.registrationNumber &&
      String(normalized.registrationNumber).startsWith("http")
    ) {
      return;
    }

    const cleaned = Object.fromEntries(
      Object.entries(normalized).map(([k, v]) => [
        k,
        v === "" || v === null ? undefined : v,
      ]),
    );

    // normalize dates
    cleaned.dateOfBirth = normalizeDate(cleaned.dateOfBirth);

    const result = CandidateRowSchema.safeParse(cleaned);

    if (result.success) {
      valid.push(result.data);
    } else {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string | undefined;

        errors.push({
          row: rowNumber,
          field: field ?? "unknown",
          value: field ? cleaned[field] : undefined,
          message: issue.message,
        });
      });
    }
  });

  return { valid, errors };
};

// ─── MAIN PARSE FUNCTION ──────────────────────────────────────────────────────
export const parseImportFile = (buffer: Buffer): ParseResult => {
  const workbook = xlsx.read(buffer, {
    type: "buffer",
    cellDates: true,
    cellText: false,
  });

  if (workbook.SheetNames.length === 0) {
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

  const allValid: ParseResult["valid"] = [];
  const allErrors: ParseResult["errors"] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet["!ref"]) continue;

    if (
      sheetName.toLowerCase() === "feuil1" &&
      workbook.SheetNames.length > 1
    ) {
      continue;
    }

    const { valid, errors } = parseSheet(sheet, sheetName);
    allValid.push(...valid);
    allErrors.push(...errors);
  }

  const seen = new Set<string>();
  const deduped = allValid.filter((row) => {
    if (seen.has(row.registrationNumber)) return false;
    seen.add(row.registrationNumber);
    return true;
  });

  return { valid: deduped, errors: allErrors };
};
