import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as authService from "./auth.service.js";
import { audit } from "../../utils/auditLogger.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000, 
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await authService.loginUser(req.body);

  audit({
    userId: user.id,
    action: "AUTH_LOGIN",
    entity: "AUTH",
    entityId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: { role: user.role },
  }).catch(() => {});

  res.status(200).cookie("jwt", token, cookieOptions).json({
    success: true,
    message: "Login successful",
    data: { user, token },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.changeUserPassword(req.user!.id, req.body);

    audit({
      userId: req.user!.id,
      action: "AUTH_PASSWORD_CHANGED",
      entity: "AUTH",
      entityId: req.user!.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: {},
    }).catch(() => {});

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "Password changed — please log in again",
      data: result,
    });
  },
);

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  res.status(200).json({ success: true, data: user });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body);

    // FIX: Removed audit() entirely here because it's an unauthenticated flow 
    // and passing "anonymous" breaks FK constraints on the User table (Issue 3)

    res.status(200).json({
      success: true,
      message: "if this email exists, a reset link has been sent",
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);

    // FIX: Removed audit() entirely for the same FK constraint reason (Issue 3)

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "password reset successfully, please login again",
    });
  },
);