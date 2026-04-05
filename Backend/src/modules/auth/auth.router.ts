import { Router } from "express";
import {
  login,
  logout,
  changePassword,
  getMe,
  forgotPassword,
  resetPassword,
} from "./auth.controller.js";
import { protect } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  LoginSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "./auth.types.js";

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
router.post("/forgot-password", validate(ForgotPasswordSchema), forgotPassword);

router.post("/reset-password", validate(ResetPasswordSchema), resetPassword);

export default router;
