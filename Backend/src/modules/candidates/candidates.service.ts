import "multer";
import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { parseImportFile } from "./candidates.import.js";
import { CandidateStatus } from "../../generated/identity/client.js";

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

  // 3. detect source from mimetype
  const source = file.mimetype === "text/csv" ? "CSV" : "EXCEL";

  // 4. create import batch record first
  const batch = await identityDb.importBatch.create({
    data: {
      sessionId,
      importedBy,
      source,
      fileName: file.originalname,
      totalRecords: valid.length + errors.length,
      validRecords: valid.length,
      invalidRecords: errors.length,
      // FIX: Used safe JSON stringification to prevent runtime errors and removed unsafe `as any` (Issue 4)
      validationErrors:
        errors.length > 0 ? JSON.parse(JSON.stringify(errors)) : undefined,
    },
  });

  // 5. insert valid candidates — skip duplicates gracefully
  const candidatesToInsert = valid.map((row) => ({
    ...row,
    email: row.email || null,
    phoneNumber: row.phoneNumber || null,
    nationalId: row.nationalId || null,
    sessionId,
    importBatchId: batch.id,
    status: "REGISTERED" as const,
  }));

  // FIX: Added clarifying comment regarding `skipDuplicates` limitation (Issue 3)
  // NOTE: `createMany` with `skipDuplicates: true` conflates skipped-duplicates with
  // insert-failures (e.g., constraint violations). It's a known Prisma limitation.
  const result = await identityDb.candidate.createMany({
    data: candidatesToInsert,
    skipDuplicates: true,
  });

  const imported = result.count;
  const skipped = valid.length - imported;
  const duplicates: string[] = [];

  await identityDb.importBatch.update({
    where: { id: batch.id },
    data: { validRecords: imported },
  });

  return {
    batchId: batch.id,
    fileName: file.originalname,
    source,
    imported,
    skipped,
    invalid: errors.length,
    duplicates: duplicates.slice(0, 20),
    errors: errors.slice(0, 50),
    summary: `${imported} imported, ${skipped} skipped (duplicates), ${errors.length} invalid`,
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
