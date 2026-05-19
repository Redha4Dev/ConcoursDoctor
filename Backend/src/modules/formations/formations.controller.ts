import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { audit } from "../../utils/auditLogger.js";

import * as formationService from "./formations.service.js";

// ─── FORMATIONS ───────────────────────────────────────────────────────────────

export const createFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const formation = await formationService.createFormation(
      req.body,
      req.user!.id,
    );

    audit({
      userId: req.user!.id,
      action: "FORMATION_CREATED",
      entity: "FORMATION",
      entityId: formation.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { name: formation.name, code: formation.code },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Formation created successfully",
      data: formation,
    });
  },
);

export const getFormations = asyncHandler(
  async (_req: Request, res: Response) => {
    const formations = await formationService.getFormations();
    res.status(200).json({ success: true, data: formations });
  },
);

export const getFormationById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) throw new AppError("Formation ID is required", 400);

    const formation = await formationService.getFormationById(id);
    res.status(200).json({ success: true, data: formation });
  },
);

export const updateFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) throw new AppError("Formation ID is required", 400);

    const result = await formationService.updateFormation(id, req.body);

    audit({
      userId: req.user!.id,
      action: "FORMATION_UPDATED",
      entity: "FORMATION",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { fieldsChanged: Object.keys(req.body) },
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Formation updated",
      data: result,
    });
  },
);

export const deleteFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) throw new AppError("Formation ID is required", 400);

    const result = await formationService.deleteFormation(id);

    audit({
      userId: req.user!.id,
      action: result.permanent ? "FORMATION_DELETED" : "FORMATION_DEACTIVATED",
      entity: "FORMATION",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: result.permanent
        ? "Formation permanently deleted"
        : "Formation deactivated",
      data: result,
    });
  },
);

// ─── SPECIALIZATIONS ──────────────────────────────────────────────────────────

export const addSpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const formationId = req.params.id as string;
    if (!formationId) throw new AppError("Formation ID is required", 400);

    const result = await formationService.addSpecialization(
      formationId,
      req.body,
    );

    audit({
      userId: req.user!.id,
      action: "SPECIALIZATION_CREATED",
      entity: "SPECIALIZATION",
      entityId: result.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { name: result.name, code: result.code },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Specialization added",
      data: result,
    });
  },
);

export const getSpecializations = asyncHandler(
  async (req: Request, res: Response) => {
    const formationId = req.params.id as string;
    if (!formationId) throw new AppError("Formation ID is required", 400);

    const result = await formationService.getSpecializations(formationId);

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const updateSpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const formationId = req.params.id as string;
    const specializationId = req.params.specId as string;

    if (!formationId || !specializationId) {
      throw new AppError("Formation ID and Specialization ID required", 400);
    }

    const result = await formationService.updateSpecialization(
      formationId,
      specializationId,
      req.body,
    );

    audit({
      userId: req.user!.id,
      action: "SPECIALIZATION_UPDATED",
      entity: "SPECIALIZATION",
      entityId: specializationId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Specialization updated",
      data: result,
    });
  },
);

export const deleteSpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const formationId = req.params.id as string;
    const specializationId = req.params.specId as string;

    if (!formationId || !specializationId) {
      throw new AppError("Formation ID and Specialization ID required", 400);
    }

    const result = await formationService.deleteSpecialization(
      formationId,
      specializationId,
    );

    audit({
      userId: req.user!.id,
      action: "SPECIALIZATION_DELETED",
      entity: "SPECIALIZATION",
      entityId: specializationId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Specialization deleted",
      data: result,
    });
  },
);

export const getSpecializationById = asyncHandler(
  async (req: Request, res: Response) => {
    const formationId = req.params.id as string;
    const specializationId = req.params.specId as string;

    if (!formationId || !specializationId) {
      throw new AppError("Formation ID and Specialization ID required", 400);
    }

    const result = await formationService.getSpecializationById(
      formationId,
      specializationId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);
