// src/modules/sessions/sessions.router.ts
import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  CreateSessionSchema,
  UpdateSessionSchema,
  AddSessionSpecializationSchema,
  UpdateSessionSpecializationSchema,
  AssignStaffSchema,
  CreateSubjectSchema,
  UpdateSubjectSchema,
  GradingConfigSchema,
} from "./sessions.types.js";
import * as sessionsCtrl from "./sessions.controller.js";
import { anonymizeSessionController } from "../anonymization/anonymization.controller.js";

// room controller + schemas live in the rooms module
import * as roomsCtrl from "../rooms/rooms.controller.js";
import {
  addRoomToSessionSchema,
  updateSessionRoomSchema,
  assignSurveillantSchema,
} from "../rooms/rooms.types.js";

const router = Router();

router.use(protect);

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
router.post(
  "/",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(CreateSessionSchema),
  sessionsCtrl.createSession,
);
router.get("/", sessionsCtrl.getSessions);
router.get("/:id", sessionsCtrl.getSessionById);
router.patch(
  "/:id",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(UpdateSessionSchema),
  sessionsCtrl.updateSession,
);
router.delete(
  "/:id",
  restrictTo("ADMIN", "COORDINATOR"),
  sessionsCtrl.deleteSession,
);
router.post(
  "/:sessionId/anonymize",
  restrictTo("ADMIN", "COORDINATOR"),
  anonymizeSessionController,
);

// ─── SESSION SPECIALIZATIONS ──────────────────────────────────────────────────
// Coordinator picks which formation specializations are active for this session
// and sets available slots per specialization

router.get("/:id/specializations", sessionsCtrl.getSessionSpecializations);

router.post(
  "/:id/specializations",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(AddSessionSpecializationSchema),
  sessionsCtrl.addSessionSpecialization,
);

router.patch(
  "/:id/specializations/:specId",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(UpdateSessionSpecializationSchema),
  sessionsCtrl.updateSessionSpecialization,
);

router.delete(
  "/:id/specializations/:specId",
  restrictTo("ADMIN", "COORDINATOR"),
  sessionsCtrl.removeSessionSpecialization,
);

// ─── SESSION STAFF ────────────────────────────────────────────────────────────
// Assign users to session with a function (CORRECTOR, JURY_MEMBER, SURVEILLANT...)
// Does not mutate the user's global role.

router.get("/:id/staff", sessionsCtrl.getSessionStaff);

router.post(
  "/:id/staff",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(AssignStaffSchema),
  sessionsCtrl.assignStaff,
);

router.delete(
  "/:id/staff/:userId/:function",
  restrictTo("ADMIN", "COORDINATOR"),
  sessionsCtrl.removeStaff,
);

router.get(
  "/:sessionId/surveillants",
  protect, // Ensure user is logged in
  restrictTo("ADMIN", "COORDINATOR"), // Restrict to managers
  sessionsCtrl.getSessionSurveillants,
);

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────
router.get("/:id/subjects", sessionsCtrl.getSubjects);
router.post(
  "/:id/subjects",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(CreateSubjectSchema),
  sessionsCtrl.addSubject,
);
router.patch(
  "/:id/subjects/:subjectId",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(UpdateSubjectSchema),
  sessionsCtrl.updateSubject,
);
router.delete(
  "/:id/subjects/:subjectId",
  restrictTo("ADMIN", "COORDINATOR"),
  sessionsCtrl.deleteSubject,
);

// ─── GRADING CONFIG ───────────────────────────────────────────────────────────
router.get("/:id/grading-config", sessionsCtrl.getGradingConfig);
router.patch(
  "/:id/grading-config",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(GradingConfigSchema),
  sessionsCtrl.setGradingConfig,
);

// ─── SESSION ROOMS ────────────────────────────────────────────────────────────
// IMPORTANT: "auto-assign" must be declared BEFORE "/:sessionRoomId" routes
// otherwise Express matches "auto-assign" as a sessionRoomId param value

router.get("/:id/rooms", roomsCtrl.getSessionRooms);

router.post(
  "/:id/rooms",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(addRoomToSessionSchema),
  roomsCtrl.addRoomToSession,
);

// auto-assign BEFORE /:sessionRoomId
router.post(
  "/:id/rooms/auto-assign",
  restrictTo("ADMIN", "COORDINATOR"),
  roomsCtrl.autoAssign,
);

router.patch(
  "/:id/rooms/:sessionRoomId",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(updateSessionRoomSchema),
  roomsCtrl.updateSessionRoom,
);

router.delete(
  "/:id/rooms/:sessionRoomId",
  restrictTo("ADMIN", "COORDINATOR"),
  roomsCtrl.removeRoomFromSession,
);

router.post(
  "/:id/rooms/:sessionRoomId/surveillants",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(assignSurveillantSchema),
  roomsCtrl.assignSurveillant,
);

router.delete(
  "/:id/rooms/:sessionRoomId/surveillants/:userId",
  restrictTo("ADMIN", "COORDINATOR"),
  roomsCtrl.removeSurveillant,
);

router.post(
  "/:id/rooms/:sessionRoomId/lock",
  restrictTo("ADMIN", "COORDINATOR"),
  roomsCtrl.lockRoom,
);

router.patch(
  "/:id/status",
  restrictTo("ADMIN", "COORDINATOR"),
  sessionsCtrl.openSession,
);

export default router;
