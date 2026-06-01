// src/modules/correction/correction.router.ts
import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  AssignThirdCorrectorSchema,
  SaveDraftSchema,
  SubmitGradesSchema,
} from "./correction.types.js";
import * as correctionCtrl from "./correction.controller.js";
import { restrictToSessionFunction } from "../../middleware/rbacSession.js";

const router = Router();

// All correction routes require authentication
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// CORRECTOR ROUTES (no sessionId in path — corrector acts on their own data)
// IMPORTANT: these fixed-path routes MUST be declared before any :sessionId
// routes to prevent Express from matching "my-assignments" as a sessionId.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/correction/my-assignments
 * Returns sessions + subjects this corrector is assigned to.
 */
router.get(
  "/my-assignments",
  restrictToSessionFunction("CORRECTOR"),
  correctionCtrl.getMyAssignments,
);

/**
 * GET /api/v1/correction/subjects/:subjectId/papers?sessionId=uuid
 * Lists all copies assigned to the corrector for a subject.
 */
router.get(
  "/subjects/:subjectId/papers",
  restrictToSessionFunction("CORRECTOR"),
  correctionCtrl.getPapersForSubject,
);

/**
 * PUT /api/v1/correction/drafts
 * Auto-saves a draft grade (upsert). Body: { copyId, grade, sessionId }.
 */
router.put(
  "/drafts",
  validate(SaveDraftSchema),
  restrictToSessionFunction("CORRECTOR"),
  correctionCtrl.saveDraft,
);

/**
 * POST /api/v1/correction/subjects/:subjectId/submit
 * Locks all drafts for a corrector/subject/session → converts to CorrectionGrade.
 */
router.post(
  "/subjects/:subjectId/submit",
  validate(SubmitGradesSchema),
  restrictToSessionFunction("CORRECTOR"),
  correctionCtrl.submitGrades,
);

// GET eligible third correctors for a discrepancy copy
router.get(
  "/:sessionId/copies/:copyId/eligible-correctors",
  restrictTo("ADMIN", "COORDINATOR"),
  correctionCtrl.getEligibleThirdCorrectors,
);

/**
 * GET /api/v1/correction/copies/:copyId
 * Returns copy detail for an assigned corrector.
 */
router.get(
  "/copies/:copyId",
  restrictToSessionFunction("CORRECTOR"),
  correctionCtrl.getCopyDetail,
);

// ─────────────────────────────────────────────────────────────────────────────
// COORDINATOR / ADMIN ROUTES (session-scoped)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/correction/:sessionId/open
 * Opens correction phase: assigns correctors per copy, transitions session status.
 */
router.post(
  "/:sessionId/open",
  restrictTo("ADMIN", "COORDINATOR"),
  correctionCtrl.openCorrection,
);

/**
 * GET /api/v1/correction/:sessionId/progress
 * Per-subject correction progress breakdown.
 */
router.get(
  "/:sessionId/progress",
  restrictTo("ADMIN", "COORDINATOR"),
  correctionCtrl.getCorrectionProgress,
);

/**
 * GET /api/v1/correction/:sessionId/discrepancies
 * All copies in DISCREPANCY status. Includes grade1, grade2, gap. No candidateId.
 */
router.get(
  "/:sessionId/discrepancies",
  restrictTo("ADMIN", "COORDINATOR"),
  correctionCtrl.getDiscrepancies,
);

/**
 * POST /api/v1/correction/:sessionId/copies/:copyId/assign-third
 * Assigns a third corrector to a DISCREPANCY copy.
 */
router.post(
  "/:sessionId/copies/:copyId/assign-third",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(AssignThirdCorrectorSchema),
  correctionCtrl.assignThirdCorrector,
);

export default router;
