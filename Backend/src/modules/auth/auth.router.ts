import { Router } from "express";
import rateLimit from "express-rate-limit";
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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many attempts, please try again later" },
});

router.post("/login", authLimiter, validate(LoginSchema), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post(
  "/change-password",
  protect,
  validate(ChangePasswordSchema),
  changePassword,
);
router.post(
  "/forgot-password",
  authLimiter,
  validate(ForgotPasswordSchema),
  forgotPassword,
);

router.post("/reset-password", validate(ResetPasswordSchema), resetPassword);

export default router;
