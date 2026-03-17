import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as formationsService from "./formations.service.js";

export const createFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const formation = await formationsService.createFormation(
      req.body,
      req.user!.id,
    );
    res.status(201).json({
      success: true,
      message: "Formation created successfully",
      data: formation,
    });
  },
);

export const getFormations = asyncHandler(
  async (_req: Request, res: Response) => {
    const formations = await formationsService.getFormations();
    res.status(200).json({ success: true, data: formations });
  },
);

export const getFormationById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const formation = await formationsService.getFormationById(id);
    res.status(200).json({ success: true, data: formation });
  },
);
