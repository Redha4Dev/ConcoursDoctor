import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { audit } from "../../utils/auditLogger.js";
import { anonymizeSession } from "./anonymization.service.js";

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

export const anonymizeSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Not authenticated", 401);

    const sessionId = getRouteParam(req, "sessionId");
    const data = await anonymizeSession(sessionId);

    void audit({
      userId: req.user.id,
      action: "SESSION_ANONYMIZED",
      entity: "CompetitionSession",
      entityId: sessionId,
      ipAddress: req.ip ?? "",
      userAgent: getUserAgent(req),
      payload: {
        sessionId,
        anonymizedCount: data.anonymizedCount,
      },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `Session anonymized successfully: ${data.anonymizedCount} scripts`,
      data,
    });
  },
);
