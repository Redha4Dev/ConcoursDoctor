// middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any, // Use 'any' or 'unknown' here because third-party libs can throw weird things
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  // 1. Set default values
  const error = { ...err };
  error.message = err.message;
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // 2. Force JSON response (Ensures Express never falls back to its default HTML formatter)
  res.setHeader("Content-Type", "application/json");

  // 3. Development vs Production responses
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status,
      error: err,
      message: error.message,
      stack: err.stack,
    });
  }

  // Production
  if (err.isOperational) {
    // Expected, operational error (e.g., user not found, invalid input)
    return res.status(statusCode).json({
      status,
      message: error.message,
    });
  } else {
    // Unexpected programming error or third-party library failure
    // Log the error so you can fix it later!
    console.error("💥 CRITICAL ERROR:", err);

    // Send a generic, safe JSON message to the client instead of HTML/stack traces
    return res.status(500).json({
      status: "error",
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};
