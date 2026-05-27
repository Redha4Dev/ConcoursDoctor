import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { audit } from "../../utils/auditLogger.js";
import {
  anonymizeSession,
  getAnonymizationCodes,
  lookupCode,
  getAnonymizationStats,
} from "./anonymization.service.js";

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

// ─── Zod schema: exactly one of qrCode or anonymousCode must be provided ──────
const LookupQuerySchema = z
  .object({
    qrCode: z.string().min(1).optional(),
    anonymousCode: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.qrCode) !== Boolean(data.anonymousCode), {
    message:
      "Exactly one of qrCode or anonymousCode must be provided, not both and not neither",
  });

// ─── Existing ─────────────────────────────────────────────────────────────────

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

// ─── New: GET /api/v1/anonymization/:sessionId/codes ──────────────────────────

export const getAnonymizationCodesController = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = getRouteParam(req, "sessionId");
    const data = await getAnonymizationCodes(sessionId);

    return res.status(200).json({
      success: true,
      message: `Retrieved ${data.length} anonymization codes`,
      data,
    });
  },
);

// ─── New: GET /api/v1/anonymization/:sessionId/lookup ─────────────────────────

export const lookupCodeController = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = getRouteParam(req, "sessionId");

    const parsed = LookupQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      throw new AppError(message, 400);
    }

    const data = await lookupCode(sessionId, parsed.data);

    return res.status(200).json({
      success: true,
      message: "Mapping found",
      data,
    });
  },
);

// ─── New: GET /api/v1/anonymization/:sessionId/stats ──────────────────────────

export const getAnonymizationStatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = getRouteParam(req, "sessionId");
    const data = await getAnonymizationStats(sessionId);

    return res.status(200).json({
      success: true,
      message: "Anonymization statistics retrieved",
      data,
    });
  },
);

