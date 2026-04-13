import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { identityDb } from "../config/db.js";
import { JWT_SECRET } from "../config/env.js";
import type { Role } from "../generated/identity/client.js";

// 1. Define the User payload interface
export interface AuthUser {
  id: string;
  email: string;
  role: Role; // Using the Prisma Enum here is better for RBAC
  firstName: string;
  lastName: string;
}

// 2. Extend the Express Request type
export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const protect = async (
  req: AuthRequest, // Use AuthRequest here
  _res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in", 401));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

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
      return next(new AppError("User no longer exists or is inactive", 401));
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};
