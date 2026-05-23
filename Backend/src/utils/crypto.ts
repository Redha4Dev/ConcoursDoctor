import crypto from "crypto";

export const generateAnonymityCode = (academicYear: string) => {
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `DOCT-${academicYear}-${suffix}`;
};
