import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as authService from "./auth.service.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000, // ← use maxAge not expires
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await authService.loginUser(req.body);

  res.status(200).cookie("jwt", token, cookieOptions).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      // ← never send token in body — it's in the cookie
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // ← clear the cookie properly instead of overwriting with fake value
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

    // ← force re-login after password change
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

// ← ADD getMe — you need this
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  res.status(200).json({ success: true, data: user });
});
