/**
 * validateId.ts — Path Parameter ID Validation Middleware
 *
 * Validates that the `:id` path parameter conforms to the canonical identifier
 * format used by Protocol and Contributor Record entities: lowercase
 * alphanumeric characters and hyphens only (e.g., "protocol-001", "abc-123").
 *
 * Rejects malformed identifiers with a 400 ValidationError before the request
 * reaches a controller, preventing downstream injection or lookup anomalies.
 */

import { NextFunction, Request, Response } from "express";
import { ValidationError } from "./errorHandler";

/** Canonical identifier pattern: lowercase alphanumeric and hyphens. */
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

/**
 * Express middleware that validates `req.params.id` against the canonical
 * identifier pattern. Calls next(ValidationError) if invalid, next() otherwise.
 */
export function validateId(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { id } = req.params;

  if (typeof id !== "string" || id.trim().length === 0) {
    next(new ValidationError("Path parameter 'id' must be a non-empty string."));
    return;
  }

  if (!ID_PATTERN.test(id)) {
    next(
      new ValidationError(
        `Path parameter 'id' must contain only lowercase alphanumeric characters and hyphens.`
      )
    );
    return;
  }

  next();
}
