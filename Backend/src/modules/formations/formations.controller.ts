import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import * as formationsService from "./formations.service.js";
import { audit } from "../../utils/auditLogger.js";

export const createFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const formation = await formationsService.createFormation(
      req.body,
      req.user!.id,
    );

    // ✅ AUDIT
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

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "FORMATION_UPDATED",
      entity: "FORMATION",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { fieldsChanged: Object.keys(req.body) },
    }).catch(() => {});

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

  // ✅ AUDIT
  audit({
    userId: req.user!.id,
    action: "FORMATION_STAFF_ASSIGNED",
    entity: "FORMATION_STAFF",
    entityId: result.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: { userId: result.userId, role: result.role },
  }).catch(() => {});

  res
    .status(201)
    .json({ success: true, message: "Staff assigned", data: result });
});

export const removeStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) throw new AppError("Formation ID is required", 400);
  
  const userId = req.params.userId as string;
  if (!userId) throw new AppError("User ID is required", 400);

  // FIX: Controller now extracts role from body to pass to the service
  const role = req.body.role;
  if (!role) throw new AppError("Role is required", 400);

  // FIX: Receiving the deleted record's ID
  const deletedRecord = await formationsService.removeStaff(id, userId, role);

  audit({
    userId: req.user!.id,
    action: "FORMATION_STAFF_REMOVED",
    entity: "FORMATION_STAFF",
    entityId: deletedRecord.id, // FIX: Auditing the specific staff assignment record, not the formation ID (Issue 2)
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: { userId, role },
  }).catch(() => {});

  res.status(200).json({ success: true, message: "Staff removed", data: null });
});