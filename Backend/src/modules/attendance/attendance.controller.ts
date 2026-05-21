import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { audit } from "../../utils/auditLogger.js";
import {
  ValidateAttendanceBodySchema,
  LockAttendanceBodySchema,
  CandidatesQuerySchema,
} from "./attendance.types.js";
import {
  getMyAssignments,
  getRoomCandidates,
  validateAttendance,
  getSessionSummary,
  lockAttendance,
} from "./attendance.service.js";

const getAuthenticatedUser = (req: Request) => {
  if (!req.user) throw new AppError("Not authenticated", 401);
  return req.user;
};

const getRouteParam = (req: Request, name: string) => {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(`Missing route parameter: ${name}`, 400);
  }
  return value;
};

const getUserAgent = (req: Request) => {
  const userAgent = req.headers["user-agent"];
  return Array.isArray(userAgent) ? userAgent.join(", ") : (userAgent ?? "");
};

export const getMyAssignmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: userId } = getAuthenticatedUser(req);

    const data = await getMyAssignments(userId);

    return res.status(200).json({
      success: true,
      message: "Assignments retrieved successfully",
      data,
    });
  },
);

export const getRoomCandidatesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: userId } = getAuthenticatedUser(req);
    const sessionId = getRouteParam(req, "sessionId");
    const sessionRoomId = getRouteParam(req, "sessionRoomId");

    const queryResult = CandidatesQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      throw new AppError(
        queryResult.error.issues[0]?.message ?? "Invalid query params",
        400,
      );
    }

    const data = await getRoomCandidates(
      userId,
      sessionId,
      sessionRoomId,
      queryResult.data.subjectId,
    );

    return res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data,
    });
  },
);

export const validateAttendanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: userId } = getAuthenticatedUser(req);
    const sessionId = getRouteParam(req, "sessionId");

    const bodyResult = ValidateAttendanceBodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      throw new AppError(
        bodyResult.error.issues[0]?.message ?? "Invalid request body",
        400,
      );
    }

    const data = await validateAttendance(userId, sessionId, bodyResult.data);

    void audit({
      userId,
      action: "ATTENDANCE_VALIDATED",
      entity: "AttendanceRecord",
      entityId: sessionId,
      ipAddress: req.ip ?? "",
      userAgent: getUserAgent(req),
      payload: {
        sessionRoomId: bodyResult.data.sessionRoomId,
        subjectId: bodyResult.data.subjectId,
        present: data.present,
        absent: data.absent,
      },
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: `Attendance validated: ${data.present} present, ${data.absent} absent`,
      data,
    });
  },
);

export const getSessionSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = getRouteParam(req, "sessionId");

    const data = await getSessionSummary(sessionId);

    return res.status(200).json({
      success: true,
      message: "Session summary retrieved successfully",
      data,
    });
  },
);

export const lockAttendanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: userId } = getAuthenticatedUser(req);
    const sessionId = getRouteParam(req, "sessionId");

    const bodyResult = LockAttendanceBodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      throw new AppError(
        bodyResult.error.issues[0]?.message ?? "Invalid request body",
        400,
      );
    }

    const data = await lockAttendance(sessionId);

    void audit({
      userId,
      action: "ATTENDANCE_LOCKED",
      entity: "CompetitionSession",
      entityId: sessionId,
      ipAddress: req.ip ?? "",
      userAgent: getUserAgent(req),
      payload: {
        sessionId,
        present: data.present,
        absent: data.absent,
        total: data.total,
      },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Attendance locked successfully",
      data,
    });
  },
);
