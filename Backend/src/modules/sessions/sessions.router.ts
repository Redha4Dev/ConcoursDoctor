import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  CreateSessionSchema,
  updateSessionSchema,
  createSubjectSchema,
  updateSubjectSchema,
  setGradingConfigSchema,
} from "./sessions.types.js";
import * as sessionsController from "./sessions.controller.js";
import {
  addRoomToSessionSchema,
  updateSessionRoomSchema,
  assignSurveillantSchema,
} from "../rooms/rooms.types.js";
import * as roomsController from "../rooms/rooms.controller.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(CreateSessionSchema),
  sessionsController.createSession,
);

router.get("/", sessionsController.getSessions);
router.get("/:id", sessionsController.getSessionById);

router.patch(
  "/:id",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(updateSessionSchema),
  sessionsController.updateSession,
);

router.get("/:id/staff", sessionsController.getSessionStaff);

router.get("/:id/subjects", sessionsController.getSubjects);
router.post(
  "/:id/subjects",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(createSubjectSchema),
  sessionsController.addSubject,
);
router.patch(
  "/:id/subjects/:subjectId",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(updateSubjectSchema),
  sessionsController.updateSubject,
);
router.delete(
  "/:id/subjects/:subjectId",
  restrictTo("ADMIN", "COORDINATOR"),
  sessionsController.deleteSubject,
);

router.get("/:id/grading-config", sessionsController.getGradingConfig);
router.patch(
  "/:id/grading-config",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(setGradingConfigSchema),
  sessionsController.setGradingConfig,
);

router.patch(
  "/:id/status",
  restrictTo("ADMIN", "COORDINATOR"),
  sessionsController.openSession,
);

router.post(
  "/:id/rooms",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(addRoomToSessionSchema),
  roomsController.addRoomToSession,
);

router.get("/:id/rooms", roomsController.getSessionRooms);

router.patch(
  "/:id/rooms/:sessionRoomId",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(updateSessionRoomSchema),
  roomsController.updateSessionRoom,
);

router.delete(
  "/:id/rooms/:sessionRoomId",
  restrictTo("ADMIN", "COORDINATOR"),
  roomsController.removeRoomFromSession,
);
router.post(
  "/:id/rooms/auto-assign",
  restrictTo("ADMIN", "COORDINATOR"),
  roomsController.autoAssign,
);

router.post(
  "/:id/rooms/:sessionRoomId/surveillants",
  restrictTo("ADMIN", "COORDINATOR"),
  validate(assignSurveillantSchema),
  roomsController.assignSurveillant,
);

router.delete(
  "/:id/rooms/:sessionRoomId/surveillants/:userId",
  restrictTo("ADMIN", "COORDINATOR"),
  roomsController.removeSurveillant,
);

router.post(
  "/:id/rooms/:sessionRoomId/lock",
  restrictTo("ADMIN", "COORDINATOR"),
  roomsController.lockRoom,
);

export default router;
