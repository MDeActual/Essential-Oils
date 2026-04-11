/**
 * types.ts — Blend Entity Type Definitions
 *
 * Defines the canonical TypeScript types and enums for the Phyto.ai blend layer.
 * These types implement the Blend entity defined in docs/DOMAIN_MODEL.md.
 *
 * MOAT NOTICE (M-001): The synergy scoring algorithm and weight matrix are
 * proprietary and must NOT be implemented in this module. The `synergyScore`
 * field accepts a pre-computed value produced by the moat-protected blend
 * intelligence layer. This module handles only structural types and validation.
 */

import { ApplicationMethod, OilId } from "../ontology/types";

// Re-export ApplicationMethod so blend consumers need not import from ontology directly.
export { ApplicationMethod } from "../ontology/types";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * The functional role an oil plays within a blend.
 * Roles guide how a blend is constructed and how constituent oils are used.
 */
export enum BlendRole {
  /** The oil providing the primary therapeutic effect. */
  Primary = "primary",
  /** An oil that amplifies or complements the primary oil. */
  Supportive = "supportive",
  /** A minor-dose modifier added for synergistic effect. */
  Adjuvant = "adjuvant",
  /** An oil that enhances bioavailability or interaction among other oils. */
  Synergist = "synergist",
  /** A fixed or vegetable oil used to dilute and deliver the blend. */
  Carrier = "carrier",
}

/** Safety validation tier for a complete blend. */
export enum BlendSafetyStatus {
  /** Blend has been validated safe for its declared application method and intended user profile. */
  Validated = "validated",
  /** Blend has not yet been subjected to safety review. */
  Pending = "pending",
  /** Safety review identified issues; blend must not be used. */
  Rejected = "rejected",
}

// ---------------------------------------------------------------------------
// Blend Oil Entry
// ---------------------------------------------------------------------------

/**
 * A single oil constituent within a blend, with its proportional ratio and role.
 *
 * Ratios across all entries in a blend must be > 0. They are expressed as
 * relative proportions (e.g., 3:2:1) and need not sum to any specific total.
 */
export interface BlendOilEntry {
  /** The canonical oil identifier from the ontology registry. */
  oilId: OilId;
  /**
   * Proportional ratio of this oil in the blend (must be > 0).
   * Expressed relative to other entries (e.g., ratios of 3, 2, 1 yield
   * approximately 50%, 33%, 17%).
   */
  ratio: number;
  /** Functional role this oil plays in the blend. */
  role: BlendRole;
}

// ---------------------------------------------------------------------------
// Blend
// ---------------------------------------------------------------------------

/**
 * A specific combination of two or more Oils with defined ratios, application
 * context, and a synergy score produced by the moat-protected blend intelligence
 * layer (M-001).
 *
 * This type directly implements the Blend entity in docs/DOMAIN_MODEL.md.
 */
export interface Blend {
  /** Unique canonical blend identifier (UUID or human-readable slug). */
  blendId: BlendId;
  /**
   * Constituent oils with their ratios and roles.
   * A blend must contain at least two entries (domain constraint).
   */
  oils: BlendOilEntry[];
  /**
   * Computed blend compatibility score in the range [0, 100].
   *
   * MOAT NOTICE (M-001): This value is produced by the proprietary synergy
   * scoring algorithm. The computation method and weight matrix must not be
   * exposed. Only the final score is permitted in external-facing payloads.
   */
  synergyScore: number;
  /** Primary application method for this blend. */
  applicationMethod: ApplicationMethod;
  /** Primary therapeutic goal of the blend. */
  intendedEffect: string;
  /**
   * Whether this blend has passed safety validation.
   * A blend must be `Validated` before it can be included in a live protocol.
   */
  safetyStatus: BlendSafetyStatus;
  /** ISO 8601 timestamp when this blend record was created. */
  createdAt: string;
  /** ISO 8601 date this blend record was last reviewed. */
  lastReviewedAt: string;
}

// ---------------------------------------------------------------------------
// Canonical Blend Identifier (BlendId)
// ---------------------------------------------------------------------------

/**
 * Blend identifiers are arbitrary strings (UUID or slug). Unlike OilId, there
 * is no fixed canonical set — blends are generated dynamically by the protocol
 * engine.
 *
 * Identifier format: lowercase alphanumeric characters and hyphens only.
 * Example: "blend-lavender-frankincense-calming"
 */
export type BlendId = string;

// ---------------------------------------------------------------------------
// Blend Validation Types
// ---------------------------------------------------------------------------

/** Structured validation error returned by the blend validation layer. */
export interface BlendValidationError {
  /** The blend identifier that failed validation, if applicable. */
  blendId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of a blend validation operation. */
export interface BlendValidationResult {
  valid: boolean;
  errors: BlendValidationError[];
}
