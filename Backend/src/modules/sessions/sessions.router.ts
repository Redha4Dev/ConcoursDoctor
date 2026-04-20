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



export default router;
