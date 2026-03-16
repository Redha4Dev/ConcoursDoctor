import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as authService from "./auth.service.js";
import type { AuthRequest } from "../../middleware/authMiddleware.js";

const sendTokenResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  token: string,
  statusCode: number,
  res: Response,
) => {
  const cookieOptions = {
    // 1 day in milliseconds (matches the 1d JWT_EXPIRES_IN)
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  };
  res.status(statusCode).cookie("jwt", token, cookieOptions).json({
    status: "success",
    data: { user },
  });
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  sendTokenResponse(user, token, 200, res);
});


export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.id; // Guaranteed by the protect middleware

    const result = await authService.changeUserPassword(userId, {
      oldPassword,
      newPassword,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 500), // Expire in 0.5 seconds
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
});