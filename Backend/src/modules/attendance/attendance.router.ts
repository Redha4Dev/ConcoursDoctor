import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { restrictToSessionFunction } from "../../middleware/rbacSession.js";
import {
  getMyAssignmentsController,
  getRoomCandidatesController,
  validateAttendanceController,
  getSessionSummaryController,
  lockAttendanceController,
} from "./attendance.controller.js";

const router = Router();

// All attendance routes require a valid JWT session
router.use(protect);

// ─── Surveillant routes ───────────────────────────────────────────────────────

/**
 * GET /api/v1/attendance/my-assignments
 * Returns the surveillant's assigned sessions grouped by time bucket.
 * Must be declared BEFORE /:sessionId routes to avoid "my-assignments"
 * being parsed as a sessionId path param.
 */
router.get(
  "/my-assignments",
  restrictTo("STAFF", "ADMIN", "COORDINATOR"),
  getMyAssignmentsController,
);

/**
 * GET /api/v1/attendance/:sessionId/room/:sessionRoomId/candidates
 * Candidate list with per-subject attendance state for the surveillant's room.
 * Optional ?subjectId=uuid query param to filter to a single subject.
 */
router.get(
  "/:sessionId/room/:sessionRoomId/candidates",
  restrictToSessionFunction("SURVEILLANT"),
  getRoomCandidatesController,
);

/**
 * POST /api/v1/attendance/:sessionId/validate
 * Submit QR scans for a subject. Creates AttendanceRecords for all candidates.
 * Body: { sessionRoomId, subjectId, scans: [{ candidateId, qrCode }] }
 */
router.post(
  "/:sessionId/validate",
  restrictToSessionFunction("SURVEILLANT"),
  validateAttendanceController,
);

// ─── Coordinator / Admin routes ───────────────────────────────────────────────

/**
 * GET /api/v1/attendance/:sessionId/summary
 * Per-room × per-subject overview. Includes readyToLock flag.
 */
router.get(
  "/:sessionId/summary",
  restrictTo("COORDINATOR", "ADMIN"),
  getSessionSummaryController,
);

/**
 * POST /api/v1/attendance/:sessionId/lock
 * Irreversibly locks attendance. Body must include { confirm: true }.
 */
router.post(
  "/:sessionId/lock",
  restrictTo("COORDINATOR", "ADMIN"),
  lockAttendanceController,
);

export { router as attendanceRouter };
