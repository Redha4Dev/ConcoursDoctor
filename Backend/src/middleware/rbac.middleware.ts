// src/middleware/rbac.middleware.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import type { Role } from "../generated/identity/client.js";

const GLOBAL_ROLES: readonly Role[] = ["ADMIN", "COORDINATOR", "STAFF"];

const isGlobalRole = (role: unknown): role is Role => {
  return typeof role === "string" && GLOBAL_ROLES.includes(role as Role);
};

// Basic system-level access control based on global Role.
export const restrictTo = (...roles: Role[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (roles.length === 0) {
      return next(new AppError("No roles configured for this route", 500));
    }

    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!isGlobalRole(req.user.role)) {
      return next(new AppError("Invalid authenticated user role", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied - requires one of: ${roles.join(", ")}`,
          403,
        ),
      );
    }

    return next();
  };
};

// Alias for consistency across modules.
export const requireRole = restrictTo;
