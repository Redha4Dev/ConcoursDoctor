import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictToSessionFunction } from "../../middleware/rbacSession.js";
import {
  anonymizeSessionController,
  getAnonymizationCodesController,
  lookupCodeController,
  getAnonymizationStatsController,
} from "./anonymization.controller.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";

const router = Router();

// All anonymization routes require a valid JWT
router.use(protect);

/**
 * POST /api/v1/anonymization/:sessionId
 * Trigger anonymization — Admin / Coordinator only (handled by the sessions router
 * but kept here for future migration; currently wired via sessions.router.ts).
 */
router.post("/:sessionId", anonymizeSessionController);

// ─── Label-printing read-only routes (ANONYMAT_COMITE | ADMIN | COORDINATOR) ──
//
// restrictToSessionFunction already short-circuits for ADMIN and COORDINATOR,
// so we only need to specify the session-level function here.

/**
 * GET /api/v1/anonymization/:sessionId/codes
 * Full list of (qrCode, anonymousCode, subjectName) ordered by anonymousCode ASC.
 */
router.get(
  "/:sessionId/codes",
  restrictTo("ADMIN", "COORDINATOR"),
  getAnonymizationCodesController,
);

/**
 * GET /api/v1/anonymization/:sessionId/lookup?qrCode=...
 * GET /api/v1/anonymization/:sessionId/lookup?anonymousCode=...
 * Resolves a single mapping — exactly one query param must be supplied.
 */
router.get(
  "/:sessionId/lookup",
  restrictToSessionFunction("ANONYMAT_COMITE"),
  lookupCodeController,
);

/**
 * GET /api/v1/anonymization/:sessionId/stats
 * Total count + per-subject breakdown.
 */
router.get(
  "/:sessionId/stats",
  restrictTo("ADMIN", "COORDINATOR"),
  getAnonymizationStatsController,
);

export default router;
