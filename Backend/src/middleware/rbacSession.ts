import type { Request, Response, NextFunction } from "express";
import { identityDb } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import type { SessionFunction } from "../generated/identity/client.js";

export const restrictToSessionFunction = (requiredFunction: SessionFunction) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const rawSessionId = req.params.sessionId ?? req.params.id;
    const sessionId = typeof rawSessionId === "string" ? rawSessionId : undefined;
    const user = req.user;

    if (!user) return next(new AppError("Not authenticated", 401));
    if (!sessionId) {
      return next(new AppError("Missing sessionId route parameter", 400));
    }

    // Admins and Coordinators bypass session checks
    if (user.role === "ADMIN" || user.role === "COORDINATOR") {
      return next();
    }

    // Check if this specific user has the required function for this specific session
    const staffAssignment = await identityDb.sessionStaff.findUnique({
      where: {
        sessionId_userId_function: {
          sessionId,
          userId: user.id,
          function: requiredFunction,
        },
      },
      select: { id: true },
    });

    if (!staffAssignment) {
      return next(
        new AppError(
          `You are not authorized as a ${requiredFunction} for this session`,
          403,
        ),
      );
    }

    next();
  };
};
