import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { CreateUserSchema, UpdateUserSchema } from "./users.types.js";
import * as usersController from "./users.controller.js";

const router = Router();

// all users routes require authentication + ADMIN role
router.use(protect, restrictTo("ADMIN"));

router.post("/", validate(CreateUserSchema), usersController.createUser);

router.get("/", usersController.getUsers);
router.get("/:id", usersController.getUserById);

router.patch("/:id", validate(UpdateUserSchema), usersController.updateUser);

router.delete("/:id", usersController.deactivateUser);
router.patch("/:id/reactivate", usersController.reactivateUser);
router.post("/:id/resend-email", usersController.resendWelcomeEmail);

export default router;
