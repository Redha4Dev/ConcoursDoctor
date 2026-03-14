import type { Request, Response, NextFunction, RequestHandler } from "express";

// Use RequestHandler to ensure the function signature is correct
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
