import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import * as candidatesService from "./candidates.service.js";

export const importCandidates = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) throw new AppError("No file uploaded", 400);
    const sessionId = req.params.sessionId as string;

    const result = await candidatesService.importCandidates(
      req.file,
      sessionId,
      req.user!.id,
    );

    res.status(200).json({
      success: true,
      message: result.summary,
      data: result,
    });
  },
);

export const getCandidates = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const result = await candidatesService.getCandidates(sessionId, {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const getCandidateById = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const id = req.params.id as string;
    const candidate = await candidatesService.getCandidateById(sessionId, id);
    res.status(200).json({ success: true, data: candidate });
  },
);

export const getImportBatches = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const batches = await candidatesService.getImportBatches(sessionId);
    res.status(200).json({ success: true, data: batches });
  },
);

export const deleteCandidate = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const id = req.params.id as string;
    const result = await candidatesService.deleteCandidate(sessionId, id);
    res.status(200).json({ success: true, data: result });
  },
);

export const getCandidateStats = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const stats = await candidatesService.getSessionCandidateStats(sessionId);
    res.status(200).json({ success: true, data: stats });
  },
);
