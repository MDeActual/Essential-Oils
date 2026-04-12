/**
 * errorHandler.ts — Global Error Handling Middleware
 *
 * Catches any errors propagated via next(err) in Express route handlers and
 * returns a consistent ApiErrorResponse envelope. No internal stack traces are
 * exposed to callers.
 */

import { NextFunction, Request, Response } from "express";
import { ApiErrorResponse } from "../types";

/** Sentinel error subclass for request validation failures (400). */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Sentinel error subclass for resource-not-found conditions (404). */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Express error-handling middleware.
 *
 * Must be registered AFTER all routes so that errors forwarded via next(err)
 * are caught here.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const generatedAt = new Date().toISOString();

  if (err instanceof ValidationError) {
    const body: ApiErrorResponse = {
      success: false,
      error: { code: "VALIDATION_ERROR", message: err.message },
      generatedAt,
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof NotFoundError) {
    const body: ApiErrorResponse = {
      success: false,
      error: { code: "NOT_FOUND", message: err.message },
      generatedAt,
    };
    res.status(404).json(body);
    return;
  }

  // Unexpected / unhandled error — do not leak internal details.
  const body: ApiErrorResponse = {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
    generatedAt,
  };
  res.status(500).json(body);
}
