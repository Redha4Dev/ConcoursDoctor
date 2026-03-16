import { Router } from "express";
import { login, logout, changePassword, getMe } from "./auth.controller.js";
import { protect } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { LoginSchema, ChangePasswordSchema } from "./auth.types.js";

const router = Router();

router.post("/login", validate(LoginSchema), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post(
  "/change-password",
  protect,
  validate(ChangePasswordSchema),
  changePassword,
);

export default router;
