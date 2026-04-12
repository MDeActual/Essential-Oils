/**
 * protocolRepository.ts — Protocol Repository Interface
 *
 * Defines the persistence contract for Protocol records (Protocol entity from
 * docs/DOMAIN_MODEL.md). Implementations are responsible for persisting and
 * retrieving the structural Protocol shape; the generation algorithm (M-002)
 * must never appear in this module.
 *
 * LOCK-005: Protocol versions must follow MAJOR.MINOR.PATCH. Version format
 *   validation is enforced by the application layer (src/protocol/validation.ts),
 *   not here.
 *
 * MOAT NOTICE (M-002): The protocol generation algorithm is proprietary and
 *   must not be implemented in or derived from this interface.
 */

import { Protocol, ProtocolStatus } from "../../protocol/types";
import { PaginationOptions, PagedResult } from "../types";

// ---------------------------------------------------------------------------
// Create / Update input shapes
// ---------------------------------------------------------------------------

/**
 * Data required to persist a new Protocol record.
 * The caller is responsible for supplying a valid, application-generated protocolId.
 *
 * LOCK-005: version must satisfy MAJOR.MINOR.PATCH — enforced by the application layer.
 */
export type CreateProtocolInput = Omit<Protocol, never>;

/**
 * Fields that may be updated on an existing Protocol record.
 * protocolId, userProfileId, and createdAt are immutable after creation.
 * LOCK-005: production status changes require a MINOR or MAJOR version bump.
 */
export type UpdateProtocolInput = Partial<
  Pick<Protocol, "version" | "goal" | "phases" | "durationDays" | "challengeIds" | "status">
>;

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Repository interface for Protocol record persistence.
 */
export interface IProtocolRepository {
  /**
   * Retrieves a single Protocol by its application-level protocolId.
   * Returns null when no matching record exists.
   */
  findById(protocolId: string): Promise<Protocol | null>;

  /**
   * Retrieves all Protocol records belonging to a given userProfileId.
   */
  findByUserProfileId(
    userProfileId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Protocol>>;

  /**
   * Retrieves Protocol records filtered by lifecycle status.
   */
  findByStatus(
    status: ProtocolStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Protocol>>;

  /**
   * Persists a new Protocol record.
   * Returns the persisted record on success.
   */
  create(input: CreateProtocolInput): Promise<Protocol>;

  /**
   * Updates mutable fields on an existing Protocol record identified by protocolId.
   * Returns the updated record, or null when no matching record exists.
   */
  update(
    protocolId: string,
    input: UpdateProtocolInput
  ): Promise<Protocol | null>;
}
