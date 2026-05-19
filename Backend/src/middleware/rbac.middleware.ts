// src/middleware/rbac.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import type { Role } from "../generated/identity/client.js";

// Basic system-level access control — based on Role (ADMIN | STAFF)
// Use this for routes that ADMIN-only can access regardless of session context
export const restrictTo = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied — requires one of: ${roles.join(", ")}`,
          403,
        ),
      );
    }
    next();
  };
};

// Alias for consistency across modules
export const requireRole = restrictTo;
