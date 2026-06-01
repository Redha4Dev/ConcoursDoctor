import type { Request, Response } from "express";
import path from "path";
import { deliberationService } from "./deliberation.service.js";
import { asyncHandler } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";

// ─── POST /deliberation/:sessionId/compute ────────────────────────────────────

export const computeDeliberation = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params["sessionId"] as string;

    const result = await deliberationService.compute(sessionId);

    res.status(200).json({
      success: true,
      message: "Délibération calculée avec succès.",
      data: {
        sessionId: result.sessionId,
        stats: result.stats,
        xlsxPath: result.xlsxPath,
        emailSent: result.emailSent,
      },
    });
  },
);

// ─── GET /deliberation/:sessionId/ranking ─────────────────────────────────────

export const getRanking = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params["sessionId"] as string;

  const result = await deliberationService.getRanking(sessionId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

// ─── GET /deliberation/:sessionId/ranking/:specializationId ──────────────────

export const getRankingBySpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params["sessionId"] as string;
    const specializationId = req.params["specializationId"] as string;

    const result = await deliberationService.getRanking(
      sessionId,
      specializationId,
    );

    if (result.specializations.length === 0) {
      throw new AppError("Spécialité introuvable pour cette session", 404);
    }

    res.status(200).json({
      success: true,
      data: result.specializations[0],
    });
  },
);

// ─── POST /deliberation/:sessionId/close ──────────────────────────────────────

export const closeDeliberation = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params["sessionId"] as string;

    const result = await deliberationService.close(sessionId);

    res.status(200).json({
      success: true,
      message: `Session clôturée. ${result.candidateEmailsSent} email(s) envoyé(s) aux candidats.`,
      data: {
        sessionId: result.sessionId,
        pvAnonymatPath: result.pvAnonymatPath,
        pvNominatifPath: result.pvNominatifPath,
        candidateEmailsSent: result.candidateEmailsSent,
      },
    });
  },
);

// ─── GET /deliberation/:sessionId/pv/anonymat ─────────────────────────────────

export const servePvAnonymat = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params["sessionId"] as string;

    const filePath = deliberationService.getPvAnonymatPath(sessionId);
    const filename = path.basename(filePath);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filePath));
  },
);

// ─── GET /deliberation/:sessionId/pv/nominatif ────────────────────────────────

export const servePvNominatif = asyncHandler(
  async (req: Request, res: Response) => {
    const sessionId = req.params["sessionId"] as string;

    const filePath = await deliberationService.getPvNominatifPath(sessionId);
    const filename = path.basename(filePath);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filePath));
  },
);
