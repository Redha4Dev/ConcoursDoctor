import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as sessionsService from "./sessions.service.js";

export const createSession = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await sessionsService.createSession(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: session,
    });
  },
);

export const getSessions = asyncHandler(
  async (_req: Request, res: Response) => {
    const sessions = await sessionsService.getSessions();
    res.status(200).json({ success: true, data: sessions });
  },
);

export const getSessionById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const session = await sessionsService.getSessionById(id);
    res.status(200).json({ success: true, data: session });
  },
);
