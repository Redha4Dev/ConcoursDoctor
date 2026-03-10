import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message =
    err.isOperational && err.message ? err.message : "Internal server error";

  // Dev mode: full error
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }

  // Prod mode: safe error
  return res.status(statusCode).json({
    status: "error",
    message,
  });
};
