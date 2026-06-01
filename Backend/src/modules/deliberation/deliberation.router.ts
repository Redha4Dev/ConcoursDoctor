import { Router } from "express";
import {
  computeDeliberation,
  getRanking,
  getRankingBySpecialization,
  closeDeliberation,
  servePvAnonymat,
  servePvNominatif,
} from "./deliberation.controller.js";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

// POST /deliberation/:sessionId/compute  — ADMIN, COORDINATOR
router.post(
  "/:sessionId/compute",
  restrictTo("ADMIN", "COORDINATOR"),
  computeDeliberation,
);

// GET /deliberation/:sessionId/ranking  — ADMIN, COORDINATOR, STAFF
router.get(
  "/:sessionId/ranking",
  restrictTo("ADMIN", "COORDINATOR", "STAFF"),
  getRanking,
);

// GET /deliberation/:sessionId/ranking/:specializationId  — ADMIN, COORDINATOR, STAFF
router.get(
  "/:sessionId/ranking/:specializationId",
  restrictTo("ADMIN", "COORDINATOR", "STAFF"),
  getRankingBySpecialization,
);

// POST /deliberation/:sessionId/close  — ADMIN, COORDINATOR
router.post(
  "/:sessionId/close",
  restrictTo("ADMIN", "COORDINATOR"),
  closeDeliberation,
);

// GET /deliberation/:sessionId/pv/anonymat  — ADMIN, COORDINATOR
router.get(
  "/:sessionId/pv/anonymat",
  restrictTo("ADMIN", "COORDINATOR"),
  servePvAnonymat,
);

// GET /deliberation/:sessionId/pv/nominatif  — ADMIN, COORDINATOR
router.get(
  "/:sessionId/pv/nominatif",
  restrictTo("ADMIN", "COORDINATOR"),
  servePvNominatif,
);

export default router;
