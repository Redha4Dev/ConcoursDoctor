// src/middleware/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { identityDb } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

type DecodedToken = {
  id: unknown;
};

const getAuthToken = (req: Request) => {
  if (typeof req.cookies?.jwt === "string") {
    const token = req.cookies.jwt.trim();
    return token.length > 0 ? token : undefined;
  }

  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    return token.length > 0 ? token : undefined;
  }

  return undefined;
};

const getUserIdFromToken = (token: string) => {
  const decoded = verifyToken(token) as unknown as DecodedToken;

  if (typeof decoded.id !== "string" || decoded.id.length === 0) {
    throw new AppError("Invalid token payload", 401);
  }

  return decoded.id;
};

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = getAuthToken(req);

    if (!token) {
      return next(new AppError("Not authenticated - please log in", 401));
    }

    const userId = getUserIdFromToken(token);

    // Live DB lookup ensures deactivated users cannot use old tokens.
    const user = await identityDb.user.findUnique({
      where: { id: userId },
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

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
