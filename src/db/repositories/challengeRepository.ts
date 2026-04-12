/**
 * challengeRepository.ts — Challenge Repository Interface
 *
 * Defines the persistence contract for Challenge records (Challenge entity from
 * docs/DOMAIN_MODEL.md). Only the entity structure is persisted here — the
 * challenge engine rule logic, sequencing heuristics, and selection criteria
 * (M-003) are moat-protected and must never appear in this module.
 *
 * MOAT NOTICE (M-003): The challenge engine rule system is proprietary and
 *   must not be implemented in or derived from this interface.
 */

import { Challenge, ChallengeCompletionStatus, ChallengeType } from "../../protocol/types";
import { PaginationOptions, PagedResult } from "../types";

// ---------------------------------------------------------------------------
// Create / Update input shapes
// ---------------------------------------------------------------------------

/**
 * Data required to persist a new Challenge record.
 * The caller is responsible for supplying a valid, application-generated challengeId.
 */
export type CreateChallengeInput = Omit<Challenge, never>;

/**
 * Fields that may be updated on an existing Challenge record.
 * challengeId, protocolId, type, prompt, and dueDay are immutable after creation.
 */
export type UpdateChallengeInput = Partial<
  Pick<Challenge, "completionStatus" | "response">
>;

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Repository interface for Challenge record persistence.
 */
export interface IChallengeRepository {
  /**
   * Retrieves a single Challenge by its application-level challengeId.
   * Returns null when no matching record exists.
   */
  findById(challengeId: string): Promise<Challenge | null>;

  /**
   * Retrieves all Challenge records belonging to a given protocolId.
   */
  findByProtocolId(
    protocolId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Challenge>>;

  /**
   * Retrieves Challenge records filtered by functional type.
   */
  findByType(
    type: ChallengeType,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Challenge>>;

  /**
   * Retrieves Challenge records filtered by completion status.
   */
  findByCompletionStatus(
    status: ChallengeCompletionStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Challenge>>;

  /**
   * Persists a new Challenge record.
   * Returns the persisted record on success.
   */
  create(input: CreateChallengeInput): Promise<Challenge>;

  /**
   * Updates the completion state and optional response on an existing Challenge.
   * Returns the updated record, or null when no matching record exists.
   */
  update(
    challengeId: string,
    input: UpdateChallengeInput
  ): Promise<Challenge | null>;
}
