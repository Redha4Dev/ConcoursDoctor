import { Router } from "express";
import multer from "multer";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import * as candidatesController from "./candidates.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/csv",
      "application/excel",
      "application/octet-stream", // ← Thunder Client sends this
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV and Excel files are allowed"));
    }
  },
});

const router = Router();

router.use(protect);

// import
router.post(
  "/:sessionId/import",
  restrictTo("ADMIN", "COORDINATOR"),
  upload.single("file"),
  candidatesController.importCandidates,
);

// stats
router.get("/:sessionId/stats", candidatesController.getCandidateStats);

// import history
router.get("/:sessionId/batches", candidatesController.getImportBatches);

// list + search
router.get("/:sessionId", candidatesController.getCandidates);

// single candidate
router.get("/:sessionId/:id", candidatesController.getCandidateById);

// delete
router.delete(
  "/:sessionId/:id",
  restrictTo("ADMIN", "COORDINATOR"),
  candidatesController.deleteCandidate,
);

export default router;
