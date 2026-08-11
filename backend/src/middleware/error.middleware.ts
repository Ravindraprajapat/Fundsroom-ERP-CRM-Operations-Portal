import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[SERVER ERROR DETAILED]:`, err);
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Something went wrong";

  res.status(statusCode).json({ success: false, message });
}

export function createError(message: string, statusCode: number): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  return err;
}
