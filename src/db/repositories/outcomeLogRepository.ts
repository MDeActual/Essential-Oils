/**
 * outcomeLogRepository.ts — OutcomeLog Repository Interface
 *
 * Defines the persistence contract for OutcomeLog records. OutcomeLog entries
 * are structured, time-stamped qualitative outcome notes associated with a
 * Contributor record. They complement the free-text outcomeNotes field on
 * Contributor with individual log entries for finer-grained outcome tracking.
 *
 * All OutcomeLog queries are scoped to a contributorId or protocolId — no
 * cross-contributor analytics queries are defined here. Analytics aggregation
 * and signal extraction remain in src/analytics/ (M-004 boundary).
 *
 * MOAT NOTICE (M-004): The population analytics signal model is proprietary.
 *   This interface exposes structural CRUD operations only.
 */

import { PaginationOptions, PagedResult } from "../types";

// ---------------------------------------------------------------------------
// OutcomeLog domain type
// ---------------------------------------------------------------------------

/**
 * A single qualitative outcome log entry associated with a Contributor record.
 * This type mirrors the OutcomeLog model in prisma/schema.prisma.
 */
export interface OutcomeLog {
  /** Application-level identifier for this log entry (DB-generated cuid). */
  id: string;
  /** Reference to the parent Contributor record (application-level recordId). */
  contributorId: string;
  /** Reference to the associated Protocol (denormalised for query convenience). */
  protocolId: string;
  /** Qualitative outcome notes for this log entry. */
  notes: string;
  /** Timestamp when this outcome was logged (application-supplied). */
  loggedAt: string;
  /** ISO 8601 timestamp when this row was inserted into the database. */
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Create input shape
// ---------------------------------------------------------------------------

/**
 * Data required to persist a new OutcomeLog entry.
 * The id and createdAt fields are DB-generated and must not be supplied by the caller.
 */
export type CreateOutcomeLogInput = Omit<OutcomeLog, "id" | "createdAt">;

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Repository interface for OutcomeLog record persistence.
 */
export interface IOutcomeLogRepository {
  /**
   * Retrieves a single OutcomeLog entry by its database-generated id.
   * Returns null when no matching entry exists.
   */
  findById(id: string): Promise<OutcomeLog | null>;

  /**
   * Retrieves all OutcomeLog entries associated with a given contributorId.
   */
  findByContributorId(
    contributorId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<OutcomeLog>>;

  /**
   * Retrieves all OutcomeLog entries associated with a given protocolId.
   */
  findByProtocolId(
    protocolId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<OutcomeLog>>;

  /**
   * Persists a new OutcomeLog entry.
   * Returns the persisted entry (including the DB-generated id and createdAt) on success.
   */
  create(input: CreateOutcomeLogInput): Promise<OutcomeLog>;
}
