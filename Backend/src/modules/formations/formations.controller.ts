import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
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
  if (!id) {
    throw new AppError("Formation ID is required", 400);
  }
    const formation = await formationsService.getFormationById(id);
    res.status(200).json({ success: true, data: formation });
  },
);


export const listFormations = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await formationsService.listFormations();
    res
      .status(200)
      .json({ success: true, message: "Formations retrieved", data: result });
  },
);


export const updateFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      throw new AppError("Formation ID is required", 400);
    }
    const result = await formationsService.updateFormation(
      id,
      req.body,
    );
    res
      .status(200)
      .json({ success: true, message: "Formation updated", data: result });
  },
);

export const getFormationStaff = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      throw new AppError("Formation ID is required", 400);
    }
    const result = await formationsService.getFormationStaff(id);
    res
      .status(200)
      .json({ success: true, message: "Staff retrieved", data: result });
  },
);

export const assignStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    throw new AppError("Formation ID is required", 400);
  }
  const result = await formationsService.assignStaff(
    id,
    req.body,
    req.user!.id,
  );
  res
    .status(201)
    .json({ success: true, message: "Staff assigned", data: result });
});

export const removeStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    throw new AppError("Formation ID is required", 400);
  }
  const userId = req.params.userId as string;
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  await formationsService.removeStaff(id, userId);
  res.status(200).json({ success: true, message: "Staff removed", data: null });
});