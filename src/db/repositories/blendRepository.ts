/**
 * blendRepository.ts — Blend Repository Interface
 *
 * Defines the persistence contract for Blend records (Blend entity from
 * docs/DOMAIN_MODEL.md). Only the structural blend shape and the pre-computed
 * synergyScore are persisted. The scoring algorithm and weight matrix (M-001)
 * are moat-protected and must never appear in this module.
 *
 * MOAT NOTICE (M-001): The synergy scoring algorithm is proprietary. Only the
 *   final synergyScore value (supplied by the moat-protected blend intelligence
 *   layer) is stored or retrieved here.
 */

import { Blend, BlendSafetyStatus, ApplicationMethod } from "../../blend/types";
import { PaginationOptions, PagedResult } from "../types";

// ---------------------------------------------------------------------------
// Create / Update input shapes
// ---------------------------------------------------------------------------

/**
 * Data required to persist a new Blend record.
 * The caller is responsible for supplying a valid, application-generated blendId
 * and a pre-computed synergyScore from the moat-protected blend intelligence layer.
 *
 * MOAT NOTICE (M-001): synergyScore must be supplied by the moat-protected layer;
 *   the computation must not be reconstructed here.
 */
export type CreateBlendInput = Omit<Blend, never>;

/**
 * Fields that may be updated on an existing Blend record.
 * blendId, oils, applicationMethod, intendedEffect, and createdAt are immutable
 * after creation.
 */
export type UpdateBlendInput = Partial<
  Pick<Blend, "synergyScore" | "safetyStatus" | "lastReviewedAt">
>;

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Repository interface for Blend record persistence.
 */
export interface IBlendRepository {
  /**
   * Retrieves a single Blend by its application-level blendId.
   * Returns null when no matching record exists.
   */
  findById(blendId: string): Promise<Blend | null>;

  /**
   * Retrieves Blend records filtered by application method.
   */
  findByApplicationMethod(
    method: ApplicationMethod,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Blend>>;

  /**
   * Retrieves Blend records filtered by safety validation status.
   */
  findBySafetyStatus(
    status: BlendSafetyStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Blend>>;

  /**
   * Persists a new Blend record.
   * Returns the persisted record on success.
   *
   * MOAT NOTICE (M-001): The synergyScore in the input must have been produced
   *   by the moat-protected blend intelligence layer.
   */
  create(input: CreateBlendInput): Promise<Blend>;

  /**
   * Updates mutable fields on an existing Blend record identified by blendId.
   * Returns the updated record, or null when no matching record exists.
   */
  update(blendId: string, input: UpdateBlendInput): Promise<Blend | null>;
}
