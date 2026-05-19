// src/modules/formations/formations.router.ts
import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  CreateFormationSchema,
  UpdateFormationSchema,
  CreateSpecializationSchema,
  UpdateSpecializationSchema,
} from "./formations.types.js";
import * as ctrl from "./formations.controller.js";

const router = Router();
router.use(protect);

// ── formations ────────────────────────────────────────────────────────────────
router.post(
  "/",
  restrictTo("ADMIN"),
  validate(CreateFormationSchema),
  ctrl.createFormation,
);
router.get("/", ctrl.getFormations);
router.get("/:id", ctrl.getFormationById);
router.patch(
  "/:id",
  restrictTo("ADMIN"),
  validate(UpdateFormationSchema),
  ctrl.updateFormation,
);
router.delete("/:id", restrictTo("ADMIN"), ctrl.deleteFormation);

// ── specializations ───────────────────────────────────────────────────────────
router.get("/:id/specializations", ctrl.getSpecializations);
router.get("/:id/specializations/:specId", ctrl.getSpecializationById);
router.post(
  "/:id/specializations",
  restrictTo("ADMIN"),
  validate(CreateSpecializationSchema),
  ctrl.addSpecialization,
);
router.patch(
  "/:id/specializations/:specId",
  restrictTo("ADMIN"),
  validate(UpdateSpecializationSchema),
  ctrl.updateSpecialization,
);
router.delete(
  "/:id/specializations/:specId",
  restrictTo("ADMIN"),
  ctrl.deleteSpecialization,
);

export default router;
