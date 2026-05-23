import "multer";
import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { parseImportFile } from "./candidates.import.js";
import { CandidateStatus } from "../../generated/identity/client.js";
import type { CandidateRow, RowError } from "./candidates.types.js";

type SessionSpecializationWithFormation = {
  id: string;
  formationSpecialization: {
    name: string;
    code: string;
  };
};

const normalizeSpecialityText = (value?: string | null) => {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\u2019/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getSpecialityMatchKeys = (value?: string | null) => {
  const keys = new Set<string>();
  const text = (value ?? "").trim();
  if (!text) return keys;

  const full = normalizeSpecialityText(text);
  if (full) keys.add(full);

  const withoutParentheticalSuffix = text.replace(/\s*\([^)]*\)\s*$/g, "");
  const base = normalizeSpecialityText(withoutParentheticalSuffix);
  if (base) keys.add(base);

  for (const match of text.matchAll(/\(([^)]+)\)/g)) {
    const parenthetical = normalizeSpecialityText(match[1]);
    if (parenthetical) keys.add(parenthetical);
  }

  return keys;
};

const findMatchingSpecialization = (
  row: CandidateRow,
  sessionSpecs: SessionSpecializationWithFormation[],
) => {
  const rowKeys = getSpecialityMatchKeys(row.requestedSpeciality);
  if (rowKeys.size === 0) return undefined;

  return sessionSpecs.find((spec) => {
    const specKeys = new Set([
      ...getSpecialityMatchKeys(spec.formationSpecialization.name),
      ...getSpecialityMatchKeys(spec.formationSpecialization.code),
    ]);

    return [...rowKeys].some((key) => specKeys.has(key));
  });
};

const createSpecialityError = (
  row: CandidateRow,
  message: string,
): RowError => {
  return {
    row: row.sourceRow ?? 0,
    field: "requestedSpeciality",
    value: row.requestedSpeciality ?? null,
    message: row.sourceSheet ? `${row.sourceSheet}: ${message}` : message,
  };
};

// ─── IMPORT ───────────────────────────────────────────────────────────────────

export const importCandidates = async (
  file: Express.Multer.File,
  sessionId: string,
  importedBy: string,
) => {
  // 1. verify session exists and is in correct state
  const session = await identityDb.competitionSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new AppError("Session not found", 404);

  if (!["DRAFT", "OPEN"].includes(session.status)) {
    throw new AppError(
      `Cannot import candidates — session is ${session.status}`,
      400,
    );
  }

  // 2. parse the file
  const { valid, errors } = parseImportFile(file.buffer);
  const importErrors: RowError[] = [...errors];

  // 3. detect source from mimetype
  const source = file.mimetype === "text/csv" ? "CSV" : "EXCEL";

  // 4. fetch session specializations for matching
  const sessionSpecs = await identityDb.sessionSpecialization.findMany({
    where: { sessionId },
    include: { formationSpecialization: true },
  });
  if (sessionSpecs.length === 0) {
    throw new AppError(
      "Cannot import candidates: no specializations configured for this session",
      400,
    );
  }

  const availableSpecialities = sessionSpecs
    .map(
      (spec) =>
        `${spec.formationSpecialization.name} (${spec.formationSpecialization.code})`,
    )
    .join(", ");

  // 5. create import batch record before inserting candidates
  const batch = await identityDb.importBatch.create({
    data: {
      sessionId,
      importedBy,
      source,
      fileName: file.originalname,
      totalRecords: valid.length + errors.length,
      validRecords: 0,
      invalidRecords: importErrors.length,
      validationErrors:
        importErrors.length > 0
          ? JSON.parse(JSON.stringify(importErrors))
          : undefined,
    },
  });

  // 6. insert valid candidates — map data and match specialization
  const candidatesToInsert = valid.flatMap((row) => {
    if (!row.requestedSpeciality?.trim()) {
      importErrors.push(
        createSpecialityError(
          row,
          "Requested speciality is required to assign the candidate to a session specialization",
        ),
      );
      return [];
    }

    const matchedSpec = findMatchingSpecialization(row, sessionSpecs);
    if (!matchedSpec) {
      importErrors.push(
        createSpecialityError(
          row,
          `Requested speciality did not match this session. Available specialities: ${availableSpecialities}`,
        ),
      );
      return [];
    }

    return [
      {
        sessionId,
        importBatchId: batch.id,
        status: "REGISTERED" as const,
        registrationNumber: row.registrationNumber,
        firstName: row.firstName,
        lastName: row.lastName,
        firstNameAr: row.firstNameAr || null,
        lastNameAr: row.lastNameAr || null,
        email: row.email || null,
        phoneNumber: row.phoneNumber || null,
        address: row.address || null,
        dateOfBirth: row.dateOfBirth || null,
        birthPlace: row.birthPlace || null,
        nationalId: row.nationalId || null,
        degreeInstitution: row.degreeInstitution || null,
        degreeSpeciality: row.degreeSpeciality || null,
        fieldOfStudy: row.fieldOfStudy || null,
        cursusType: row.cursusType || null,
        graduationYear: row.graduationYear ?? null,
        masterClassCategory: row.masterClassCategory || null,
        masterAverage: row.masterAverage ?? null,
        bachelorAverage: row.bachelorAverage ?? null,
        requestedSpeciality: row.requestedSpeciality || null,

        specializationId: matchedSpec.id,
      },
    ];
  });
  // FIX: Added clarifying comment regarding `skipDuplicates` limitation (Issue 3)
  // NOTE: `createMany` with `skipDuplicates: true` conflates skipped-duplicates with
  // insert-failures (e.g., constraint violations). It's a known Prisma limitation.
  const result =
    candidatesToInsert.length > 0
      ? await identityDb.candidate.createMany({
          data: candidatesToInsert,
          skipDuplicates: true,
        })
      : { count: 0 };

  const imported = result.count;
  const skipped = candidatesToInsert.length - imported;
  const duplicates: string[] = [];

  await identityDb.importBatch.update({
    where: { id: batch.id },
    data: {
      validRecords: imported,
      invalidRecords: importErrors.length,
      validationErrors:
        importErrors.length > 0
          ? JSON.parse(JSON.stringify(importErrors))
          : undefined,
    },
  });

  return {
    batchId: batch.id,
    fileName: file.originalname,
    source,
    imported,
    skipped,
    invalid: importErrors.length,
    duplicates: duplicates.slice(0, 20),
    errors: importErrors.slice(0, 50),
    summary: `${imported} imported, ${skipped} skipped (duplicates), ${importErrors.length} invalid`,
  };
};
// ─── READ ─────────────────────────────────────────────────────────────────────

export const getCandidates = async (
  sessionId: string,
  filters: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {},
) => {
  const { search, status, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    sessionId,
    ...(status ? { status: status as CandidateStatus } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            {
              registrationNumber: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [candidates, total] = await Promise.all([
    identityDb.candidate.findMany({
      where,
      orderBy: [{ importedAt: "desc" }, { id: "asc" }],
      skip,
      take: limit,
    }),
    identityDb.candidate.count({ where }),
  ]);

  return {
    candidates,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

export const getCandidateById = async (
  sessionId: string,
  candidateId: string,
) => {
  const candidate = await identityDb.candidate.findFirst({
    where: { id: candidateId, sessionId },
  });
  if (!candidate) throw new AppError("Candidate not found", 404);
  return candidate;
};

export const getImportBatches = async (sessionId: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new AppError("Session not found", 404);

  return identityDb.importBatch.findMany({
    where: { sessionId },
    include: {
      importedByUser: {
        select: { firstName: true, lastName: true, email: true },
      },
      _count: { select: { candidates: true } },
    },
    orderBy: { importedAt: "desc" },
  });
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteCandidate = async (
  sessionId: string,
  candidateId: string,
) => {
  const candidate = await identityDb.candidate.findFirst({
    where: { id: candidateId, sessionId },
    include: { session: true },
  });

  if (!candidate) throw new AppError("Candidate not found", 404);

  if (!["DRAFT", "OPEN"].includes(candidate.session.status)) {
    throw new AppError("Cannot delete candidates after session is locked", 400);
  }

  await identityDb.candidate.delete({ where: { id: candidateId } });

  // FIX: Returning `registrationNumber` directly so the controller does not need a pre-fetch (Issue 1 & 2)
  return {
    message: "Candidate removed successfully",
    registrationNumber: candidate.registrationNumber,
  };
};

// ─── STATS ────────────────────────────────────────────────────────────────────

export const getSessionCandidateStats = async (sessionId: string) => {
  const [total, valid, invalid] = await Promise.all([
    identityDb.candidate.count({ where: { sessionId } }),
    identityDb.candidate.count({
      where: { sessionId, status: CandidateStatus.VALID },
    }),
    identityDb.candidate.count({
      where: { sessionId, status: CandidateStatus.INVALID },
    }),
  ]);

  return {
    total,
    registered: total - valid - invalid,
    valid,
    invalid,
  };
};
