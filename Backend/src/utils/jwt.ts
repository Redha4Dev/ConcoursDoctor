import jwt from "jsonwebtoken";
import { AppError } from "./AppError.js";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

import type { SignOptions } from "jsonwebtoken";

const expiresIn = (process.env.JWT_EXPIRES_IN ||
  "24h") as SignOptions["expiresIn"];

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};
