import "multer";
import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { parseImportFile } from "./candidates.import.js";

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
      // Fixes Error 2: Cast the JSON object to 'any' to satisfy Prisma's strict JSON types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validationErrors: errors.length > 0 ? (errors as any) : undefined,
    },
  });

  // 5. insert valid candidates — skip duplicates gracefully
  let imported = 0;
  let skipped = 0;
  const duplicates: string[] = [];

  for (const row of valid) {
    try {
      await identityDb.candidate.create({
        data: {
          ...row,
          email: row.email || null,
          phoneNumber: row.phoneNumber || null,
          nationalId: row.nationalId || null,
          sessionId,
          importBatchId: batch.id,
          status: "REGISTERED", // Ensure this matches your Prisma Enum exactly
        },
      });
      imported++;
    } catch (err: unknown) {
      // unique constraint = duplicate registration number in this session
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        skipped++;
        duplicates.push(row.registrationNumber);
      } else {
        throw err;
      }
    }
  }

  // 6. update batch with final counts
  await identityDb.importBatch.update({
    where: { id: batch.id },
    data: {
      validRecords: imported,
    },
  });

  return {
    batchId: batch.id,
    fileName: file.originalname,
    source,
    imported,
    skipped,
    invalid: errors.length,
    duplicates: duplicates.slice(0, 20), // show first 20 duplicates
    errors: errors.slice(0, 50), // show first 50 errors
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
    // Fixes Error 3: Cast status to 'any' so Prisma accepts it, instead of candidate ID type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(status ? { status: status as any } : {}),
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
      orderBy: { importedAt: "desc" },
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
  return { message: "Candidate removed successfully" };
};

// ─── STATS ────────────────────────────────────────────────────────────────────

export const getSessionCandidateStats = async (sessionId: string) => {
  const [total, valid, invalid] = await Promise.all([
    identityDb.candidate.count({ where: { sessionId } }),
    // Fix: cast the strings to 'any' to satisfy Prisma enums
    identityDb.candidate.count({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { sessionId, status: "VALID" as any },
    }),
    identityDb.candidate.count({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { sessionId, status: "INVALID" as any },
    }),
  ]);

  return {
    total,
    registered: total - valid - invalid,
    valid,
    invalid,
  };
};
