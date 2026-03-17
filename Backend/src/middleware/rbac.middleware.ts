import type { Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import type { AuthRequest } from "./authMiddleware.js";
import type { Role } from "../generated/identity/client.js";

export const restrictTo = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Check if user exists (should be handled by 'protect' middleware first)
    if (!req.user) {
      return next(
        new AppError("Authentication required to check permissions.", 401),
      );
    }

    // 2. Check if user's role is in the allowed list
    // req.user.role is a string, so we cast it to Role to match the enum
    if (!roles.includes(req.user.role as Role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};
