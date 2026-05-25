// src/utils/gradeCalculator.ts
import type { ResolutionRule } from "../generated/correction/enums.js";

/**
 * Computes the final grade for an exam copy according to the official
 * ESI-SBA formula (ministerial regulation Note n°573).
 *
 * Two correctors, no discrepancy:
 *   finalGrade = (g1 + g2) / 2  → MEAN_TWO
 *
 * Three correctors (discrepancy case):
 *   diff1 = |g3 - g1|, diff2 = |g3 - g2|
 *   if diff1 <= diff2 → finalGrade = (g3 + g1) / 2
 *   else              → finalGrade = (g3 + g2) / 2
 *   → MEAN_CLOSEST
 *
 * All results are rounded to 2 decimal places to avoid IEEE-754 drift.
 */
export const calculateFinalGrade = (
  grade1: number,
  grade2: number,
  grade3: number | null,
): { finalGrade: number; appliedRule: ResolutionRule } => {
  if (!grade3) {
    return {
      finalGrade: parseFloat(((grade1 + grade2) / 2).toFixed(2)),
      appliedRule: "MEAN_TWO",
    };
  }

  const diff1 = Math.abs(grade3 - grade1);
  const diff2 = Math.abs(grade3 - grade2);

  return {
    finalGrade: parseFloat(
      (diff1 <= diff2
        ? (grade3 + grade1) / 2
        : (grade3 + grade2) / 2
      ).toFixed(2),
    ),
    appliedRule: "MEAN_CLOSEST",
  };
};
