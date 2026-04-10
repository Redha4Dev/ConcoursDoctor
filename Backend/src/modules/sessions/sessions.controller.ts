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

    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }
    const session = await sessionsService.getSessionById(id);
    res.status(200).json({ success: true, data: session });
  },
);

export const listSessions = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await sessionsService.listSessions();
    res
      .status(200)
      .json({ success: true, message: "Sessions retrieved", data: result });
  },
);

export const updateSession = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }
    const result = await sessionsService.updateSession(id, req.body);
    res
      .status(200)
      .json({ success: true, message: "Session updated", data: result });
  },
);

export const getSessionStaff = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }
    const result = await sessionsService.getSessionStaff(id);
    res
      .status(200)
      .json({ success: true, message: "Staff retrieved", data: result });
  },
);
export const getSubjects = asyncHandler(async (req: Request, res: Response) => {
   const id = req.params.id as string;
  const result = await sessionsService.getSubjects(id);
  res
    .status(200)
    .json({ success: true, message: "Subjects retrieved", data: result });
});

export const addSubject = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    res.status(400);
    throw new Error("Session ID is required");
  }
  const result = await sessionsService.addSubject(id, req.body);
  res
    .status(201)
    .json({ success: true, message: "Subject added", data: result });
});

export const updateSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }
    const subjectId = req.params.subjectId as string;
    if (!subjectId) {
      res.status(400);
      throw new Error("subject ID is required");
    }
    const result = await sessionsService.updateSubject(
      id,
      subjectId,
      req.body,
    );
    res
      .status(200)
      .json({ success: true, message: "Subject updated", data: result });
  },
);

export const deleteSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }
    const subjectId = req.params.subjectId as string;
    if (!subjectId) {
      res.status(400);
      throw new Error("subject ID is required");
    }
    await sessionsService.deleteSubject(id, subjectId);
    res
      .status(200)
      .json({ success: true, message: "Subject deleted", data: null });
  },
);

export const getGradingConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await sessionsService.getGradingConfig(id);
    res
      .status(200)
      .json({
        success: true,
        message: "Grading config retrieved",
        data: result,
      });
  },
);

export const setGradingConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await sessionsService.setGradingConfig(
      id,
      req.body,
      req.user!.id,
    );
    res
      .status(200)
      .json({ success: true, message: "Grading config saved", data: result });
  },
);