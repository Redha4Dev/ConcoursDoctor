import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { CreateSessionSchema } from "./sessions.types.js";
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

export default router;
