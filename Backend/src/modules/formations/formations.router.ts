import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { Role } from "../../generated/identity/client.js"; // Import your Prisma Role enum

import { CreateFormationSchema } from "./formations.types.js";
import * as formationsController from "./formations.controller.js";

const router = Router();

// All routes below this line require the user to be logged in
router.use(protect);

// 1. Create Formation - Only ADMINs allowed
router.post(
  "/",
  restrictTo(Role.ADMIN),
  validate(CreateFormationSchema),
  formationsController.createFormation,
);

// 2. Get All Formations - Any authenticated user (Admin, Coordinator, etc.)
router.get("/", formationsController.getFormations);

// 3. Get Single Formation - Any authenticated user
router.get("/:id", formationsController.getFormationById);

export default router;
