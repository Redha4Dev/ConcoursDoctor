// src/middleware/sessionAuth.middleware.ts
import type { Request, Response, NextFunction } from "express"; // Fix 1: Added Request and Response imports
import { identityDb } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
// Fix 2: Imported the brand new enums from your generated client
import { Role, type SessionFunction } from "../generated/identity/client.js";

// Fix 3: Strongly type the parameter to SessionFunction instead of string
export const restrictToSessionFunction = (
  requiredFunction: SessionFunction,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.params.sessionId as string; // Assuming sessionId is passed as a URL parameter

    if (!sessionId) {
      return next(
        new AppError(
          "Route configuration error: sessionId parameter missing",
          500,
        ),
      );
    }

    const userId = req.user?.id;
    if (!userId) return next(new AppError("Not authenticated", 401));

    // Fix 4: Use the new SystemRole enum constants for the bypass check
    if (req.user?.role === Role.ADMIN || req.user?.role === Role.COORDINATOR) {
      return next();
    }

    // Check if this specific user has the required function for this specific session
    const staffAssignment = await identityDb.sessionStaff.findFirst({
      where: {
        sessionId,
        userId,
        function: requiredFunction,
      },
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
