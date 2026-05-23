import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { generateAnonymityCode } from "../../utils/crypto.js";
import { createExamCopiesInCorrectionDb } from "../correction/correction.service.js";
import type { AnonymizationPayload } from "./anonymization.types.js";

type AnonymatMappingRow = {
  sessionId: string;
  subjectId: string;
  candidateId: string;
  qrCode: string;
  anonymousCode: string;
};

const MAX_CODE_GENERATION_ATTEMPTS = 20;

const createUniqueAnonymousCode = (
  academicYear: string,
  reservedCodes: Set<string>,
) => {
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const code = generateAnonymityCode(academicYear);
    if (!reservedCodes.has(code)) {
      reservedCodes.add(code);
      return code;
    }
  }

  throw new AppError("Unable to generate a unique anonymous code", 500);
};

const rollbackIdentityAnonymization = async (sessionId: string) => {
  await identityDb.$transaction([
    identityDb.anonymatMapping.deleteMany({ where: { sessionId } }),
    identityDb.competitionSession.updateMany({
      where: { id: sessionId, status: "ANONYMIZED" },
      data: { status: "ATTENDANCE_LOCKED" },
    }),
  ]);
};

export const anonymizeSession = async (sessionId: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      academicYear: true,
      status: true,
    },
  });

  if (!session) throw new AppError("Session not found", 404);
  if (session.status !== "ATTENDANCE_LOCKED") {
    throw new AppError(
      `Cannot anonymize session: status is ${session.status}, expected ATTENDANCE_LOCKED`,
      400,
    );
  }

  const attendanceRecords = await identityDb.attendanceRecord.findMany({
    where: {
      sessionId,
      status: "PRESENT",
      anonymityCode: { not: null },
    },
    select: {
      sessionId: true,
      subjectId: true,
      candidateId: true,
      anonymityCode: true,
    },
    orderBy: [{ subjectId: "asc" }, { candidateId: "asc" }],
  });

  if (attendanceRecords.length === 0) {
    throw new AppError(
      "No present attendance records with QR codes found for this session",
      400,
    );
  }

  const codePrefix = `DOCT-${session.academicYear}-`;
  const existingCodes = await identityDb.anonymatMapping.findMany({
    where: { anonymousCode: { startsWith: codePrefix } },
    select: { anonymousCode: true },
  });
  const reservedCodes = new Set(
    existingCodes.map((mapping) => mapping.anonymousCode),
  );

  const mappings: AnonymatMappingRow[] = [];
  const payload: AnonymizationPayload = [];

  for (const record of attendanceRecords) {
    if (!record.anonymityCode) continue;

    const anonymousCode = createUniqueAnonymousCode(
      session.academicYear,
      reservedCodes,
    );

    mappings.push({
      sessionId: record.sessionId,
      subjectId: record.subjectId,
      candidateId: record.candidateId,
      qrCode: record.anonymityCode,
      anonymousCode,
    });

    payload.push({
      sessionId: record.sessionId,
      subjectId: record.subjectId,
      qrCode: record.anonymityCode,
      anonymousCode,
    });
  }

  await identityDb.$transaction(async (tx) => {
    await tx.anonymatMapping.createMany({ data: mappings });

    const updatedSession = await tx.competitionSession.updateMany({
      where: { id: sessionId, status: "ATTENDANCE_LOCKED" },
      data: { status: "ANONYMIZED" },
    });

    if (updatedSession.count !== 1) {
      throw new AppError(
        "Cannot anonymize session: status changed during anonymization",
        409,
      );
    }
  });

  try {
    const result = await createExamCopiesInCorrectionDb(payload);
    return {
      anonymizedCount: result.count,
    };
  } catch {
    await rollbackIdentityAnonymization(sessionId);
    throw new AppError(
      "Cross-database sync failed during anonymization; identity changes were rolled back",
      500,
    );
  }
};
