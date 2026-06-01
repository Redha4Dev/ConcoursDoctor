// src/modules/correction/correction.controller.ts
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as correctionService from "./correction.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// COORDINATOR / ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/correction/:sessionId/open
 * Opens the correction phase: assigns correctors per copy using sequential batching.
 */
export const openCorrection = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const userId = req.user!.id;

    const result = await correctionService.openCorrectionPhase(
      sessionId,
      userId,
      req.ip,
      req.headers["user-agent"] as string | undefined,
    );

    res.status(200).json({
      success: true,
      message: "Correction phase opened successfully",
      data: result,
    });
  },
);

/**
 * GET /api/v1/correction/:sessionId/progress
 * Returns per-subject correction progress for a session.
 */
export const getCorrectionProgress = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;

    const result = await correctionService.getCorrectionProgress(sessionId);

    res.status(200).json({
      success: true,
      message: "Correction progress retrieved",
      data: result,
    });
  },
);

/**
 * GET /api/v1/correction/:sessionId/discrepancies
 * Returns all copies with DISCREPANCY status for this session.
 * Includes grade1, grade2, gap. Never exposes candidateId.
 */
export const getDiscrepancies = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;

    const result = await correctionService.getDiscrepancies(sessionId);

    res.status(200).json({
      success: true,
      message: "Discrepancies retrieved",
      data: result,
    });
  },
);

/**
 * POST /api/v1/correction/:sessionId/copies/:copyId/assign-third
 * Assigns a third corrector to a copy in DISCREPANCY status.
 */
export const assignThirdCorrector = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const copyId = req.params.copyId as string;
    const { correctorId } = req.body as { correctorId: string };
    const userId = req.user!.id;

    const result = await correctionService.assignThirdCorrector(
      sessionId,
      copyId,
      correctorId,
      userId,
      req.ip,
      req.headers["user-agent"] as string | undefined,
    );

    res.status(200).json({
      success: true,
      message: "Third corrector assigned successfully",
      data: result,
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// CORRECTOR CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/correction/my-assignments
 * Returns all sessions where this user is a CORRECTOR, with per-subject progress.
 */
export const getMyAssignments = asyncHandler(
  async (req: Request, res: Response) => {
    const correctorId = req.user!.id;

    const result = await correctionService.getMyAssignments(correctorId);

    res.status(200).json({
      success: true,
      message: "Assignments retrieved",
      data: result,
    });
  },
);

/**
 * GET /api/v1/correction/subjects/:subjectId/papers?sessionId=uuid
 * Returns all copies assigned to this corrector for a subject in a session.
 */
export const getPapersForSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const subjectId = req.params.subjectId as string;
    const sessionId = req.query.sessionId as string | undefined;
    const correctorId = req.user!.id;

    if (!sessionId) {
      res
        .status(400)
        .json({ success: false, message: "sessionId query param is required" });
      return;
    }

    const result = await correctionService.getPapersForSubject(
      correctorId,
      subjectId,
      sessionId,
    );

    res.status(200).json({
      success: true,
      message: "Papers retrieved",
      data: result,
    });
  },
);

/**
 * PUT /api/v1/correction/drafts
 * Auto-saves a draft grade (upsert). Body: { copyId, grade, sessionId }.
 */
export const saveDraft = asyncHandler(async (req: Request, res: Response) => {
  const { copyId, grade, sessionId } = req.body as {
    copyId: string;
    grade: number;
    sessionId: string;
  };
  const correctorId = req.user!.id;

  const result = await correctionService.saveDraft(
    correctorId,
    copyId,
    grade,
    sessionId,
    req.ip,
    req.headers["user-agent"] as string | undefined,
  );

  res.status(200).json({
    success: true,
    message: "Draft saved",
    data: result,
  });
});

/**
 * POST /api/v1/correction/subjects/:subjectId/submit
 * Locks ALL drafts for this corrector for this subject in this session.
 * Body: { sessionId }
 */
export const submitGrades = asyncHandler(
  async (req: Request, res: Response) => {
    const subjectId = req.params.subjectId as string;
    const { sessionId } = req.body as { sessionId: string };
    const correctorId = req.user!.id;

    const result = await correctionService.submitGrades(
      correctorId,
      subjectId,
      sessionId,
      req.ip,
      req.headers["user-agent"] as string | undefined,
    );

    res.status(200).json({
      success: true,
      message: "Grades submitted successfully",
      data: result,
    });
  },
);

/**
 * GET /api/v1/correction/copies/:copyId
 * Returns copy detail. Corrector must be assigned. Hides other grades until VALIDATED.
 */
export const getCopyDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const copyId = req.params.copyId as string;
    const correctorId = req.user!.id;

    const result = await correctionService.getCopyDetail(correctorId, copyId);

    res.status(200).json({
      success: true,
      message: "Copy detail retrieved",
      data: result,
    });
  },
);

export const getEligibleThirdCorrectors = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const copyId = req.params.copyId as string;
    const result = await correctionService.getEligibleThirdCorrectors(
      sessionId,
      copyId,
    );
    res.status(200).json({ success: true, data: result });
  },
);
