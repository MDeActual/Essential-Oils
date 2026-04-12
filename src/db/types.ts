/**
 * types.ts — Shared Persistence Layer Types
 *
 * Defines shared types used across all repository interfaces in the
 * Phyto.ai persistence layer. These types are infrastructure concerns only —
 * no business logic or domain validation is implemented here.
 *
 * Repository interfaces depend on domain types from src/ modules; these
 * shared types provide standard query helpers used by all interfaces.
 */

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Options for paginating a findMany repository query.
 */
export interface PaginationOptions {
  /** Maximum number of records to return. Must be >= 1. */
  limit: number;
  /** Number of records to skip before returning results. Must be >= 0. */
  offset: number;
}

/**
 * Result wrapper for paginated repository queries.
 */
export interface PagedResult<T> {
  /** The page of records returned by this query. */
  items: T[];
  /** Total number of records matching the query (before pagination). */
  total: number;
}

// ---------------------------------------------------------------------------
// Repository Error
// ---------------------------------------------------------------------------

/**
 * Error codes returned by repository operations.
 */
export enum RepositoryErrorCode {
  /** The requested record was not found. */
  NotFound = "NOT_FOUND",
  /** A unique-constraint violation occurred during a write operation. */
  Conflict = "CONFLICT",
  /** The database connection or query failed. */
  DatabaseError = "DATABASE_ERROR",
}

/**
 * Structured error returned by repository operations.
 */
export interface RepositoryError {
  /** Machine-readable error code. */
  code: RepositoryErrorCode;
  /** Human-readable description of the error. */
  message: string;
  /** Original cause, if available. */
  cause?: unknown;
}
