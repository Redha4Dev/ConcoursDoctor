import { Router } from "express";
import { login, logout, changePassword } from "./auth.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.post("/change-password", protect, changePassword);

export default router;
