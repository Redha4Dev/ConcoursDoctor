import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { Role } from "../../generated/identity/client.js";

import { CreateFormationSchema } from "./formations.types.js";
import * as formationsController from "./formations.controller.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  restrictTo(Role.ADMIN),
  validate(CreateFormationSchema),
  formationsController.createFormation,
);

router.get("/", formationsController.getFormations);

router.get("/:id", formationsController.getFormationById);

export default router;
