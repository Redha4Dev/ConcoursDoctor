import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues // ← was .errors, now .issues in Zod v4
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return next(new AppError(message, 400));
    }
    req.body = result.data;
    next();
  };
};
