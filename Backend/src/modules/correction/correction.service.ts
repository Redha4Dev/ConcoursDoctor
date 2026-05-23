import { correctionDb } from "../../config/db.js";
import type { AnonymizationPayload } from "../anonymization/anonymization.types.js";

export const createExamCopiesInCorrectionDb = async (
  payload: AnonymizationPayload,
) => {
  const data = payload.map(({ sessionId, subjectId, qrCode, anonymousCode }) => ({
    sessionId,
    subjectId,
    qrCode,
    anonymousCode,
  }));

  return correctionDb.examCopy.createMany({ data });
};
