// src/middleware/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { identityDb } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    // extract token from cookie or Authorization header
    let token: string | undefined;

    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authenticated — please log in", 401));
    }

    // verify token
    const decoded = verifyToken(token) as {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
    };

    // live DB lookup — ensures deactivated users can't use old tokens
    const user = await identityDb.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return next(new AppError("User not found or account is inactive", 401));
    }

    // NOT_ASSIGNED users cannot access anything except auth routes
    if (user.role === "NOT_ASSIGNED") {
      return next(
        new AppError(
          "Account not yet assigned — contact your administrator",
          403,
        ),
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch {
    next(new AppError("Invalid or expired token — please log in again", 401));
  }
};
