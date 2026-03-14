import type { Request, Response, NextFunction } from "express";

// Define an interface for errors that might have a status code
interface AppErro extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppErro,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message =
    err.isOperational && err.message ? err.message : "Internal server error";

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json({
    status: "error",
    message,
  });
};
