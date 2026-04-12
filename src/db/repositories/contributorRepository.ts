/**
 * contributorRepository.ts — Contributor Repository Interface
 *
 * Defines the persistence contract for Contributor records (Contributor Record
 * entity from docs/DOMAIN_MODEL.md). Implementations must satisfy LOCK-003:
 * - All records must carry dataOrigin and exclusionStatus.
 * - Query helpers are provided for analytics-layer filtering, but enforcement
 *   of business rules (e.g. adherence threshold) remains in src/analytics/.
 *
 * MOAT NOTICE (M-004): The population analytics signal model is proprietary.
 *   This interface exposes only structural CRUD and query operations.
 */

import { ContributorRecord, DataOrigin, ExclusionStatus } from "../../analytics/types";
import { PaginationOptions, PagedResult } from "../types";

// ---------------------------------------------------------------------------
// Create / Update input shapes
// ---------------------------------------------------------------------------

/**
 * Data required to persist a new Contributor record.
 * The caller is responsible for supplying a valid, application-generated recordId.
 *
 * LOCK-003: dataOrigin and exclusionStatus are mandatory fields.
 */
export type CreateContributorInput = Omit<ContributorRecord, never>;

/**
 * Fields that may be updated on an existing Contributor record.
 * recordId, userId, protocolId, and dataOrigin are immutable after creation.
 */
export type UpdateContributorInput = Partial<
  Pick<
    ContributorRecord,
    | "exclusionStatus"
    | "exclusionReason"
    | "adherenceScore"
    | "challengeCompletionRate"
    | "outcomeNotes"
  >
>;

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Repository interface for Contributor record persistence.
 *
 * Implementations back this interface with a database (e.g. Prisma client)
 * while callers interact with domain types only, preserving layer separation.
 */
export interface IContributorRepository {
  /**
   * Retrieves a single Contributor record by its application-level recordId.
   * Returns null when no matching record exists.
   */
  findById(recordId: string): Promise<ContributorRecord | null>;

  /**
   * Retrieves all Contributor records associated with a given protocolId.
   */
  findByProtocolId(
    protocolId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<ContributorRecord>>;

  /**
   * Retrieves Contributor records filtered by their dataOrigin value.
   * Used by the analytics layer to isolate real_contributor rows (LOCK-003).
   */
  findByDataOrigin(
    origin: DataOrigin,
    pagination?: PaginationOptions
  ): Promise<PagedResult<ContributorRecord>>;

  /**
   * Retrieves Contributor records filtered by their exclusionStatus.
   */
  findByExclusionStatus(
    status: ExclusionStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<ContributorRecord>>;

  /**
   * Persists a new Contributor record.
   * Returns the persisted record on success.
   */
  create(input: CreateContributorInput): Promise<ContributorRecord>;

  /**
   * Updates mutable fields on an existing Contributor record identified by recordId.
   * Returns the updated record, or null when no matching record exists.
   */
  update(
    recordId: string,
    input: UpdateContributorInput
  ): Promise<ContributorRecord | null>;
}
