import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as usersService from "./users.service.js";
import { audit } from "../../utils/auditLogger.js";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await usersService.createUser(req.body, req.user!.id);

  // ✅ AUDIT
  audit({
    userId: req.user!.id,
    action: "USER_CREATED",
    entity: "USER",
    entityId: result.user.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: { role: result.user.role, email: result.user.email },
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: result,
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await usersService.getUsers({
    search: req.query.search as string | undefined,
    role: req.query.role as string | undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  });
  res.status(200).json({ success: true, data: result });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await usersService.getUserById(id);
  res.status(200).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await usersService.updateUser(id, req.body);

  // ✅ AUDIT
  audit({
    userId: req.user!.id,
    action: "USER_UPDATED",
    entity: "USER",
    entityId: id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: { fieldsChanged: Object.keys(req.body) },
  }).catch(() => {});

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const deactivateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await usersService.deactivateUser(id);

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "USER_DEACTIVATED",
      entity: "USER",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { role: result.role },
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: result,
    });
  },
);

export const reactivateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await usersService.reactivateUser(id);

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "USER_REACTIVATED",
      entity: "USER",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { role: result.role },
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "User reactivated successfully",
      data: result,
    });
  },
);

export const resendWelcomeEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await usersService.resendWelcomeEmail(id);

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "USER_EMAIL_RESENT",
      entity: "USER",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { email: result.email },
    }).catch(() => {});

    res.status(200).json({ success: true, data: result });
  },
);
