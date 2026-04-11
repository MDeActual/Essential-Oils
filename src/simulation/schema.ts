/**
 * schema.ts — Simulation Layer Property Schema
 *
 * Defines the structural constraints that govern valid ContributorRecord
 * entities in the simulation layer. These rules enforce the integrity
 * requirements of LOCK-003 (analytics data integrity) and are used by
 * the validation layer before records are processed or forwarded.
 */

import { DataOrigin, ExclusionReason, ExclusionStatus } from "./types";

// ---------------------------------------------------------------------------
// Field-level constraint definitions (mirrors ontology and blend layer pattern)
// ---------------------------------------------------------------------------

/** Constraint for a required string field. */
export interface StringConstraint {
  type: "string";
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

/** Constraint for a required number field. */
export interface NumberConstraint {
  type: "number";
  required: boolean;
  min?: number;
  max?: number;
}

/** Constraint for an enum field. */
export interface EnumConstraint {
  type: "enum";
  required: boolean;
  allowedValues: readonly string[];
}

export type FieldConstraint = StringConstraint | NumberConstraint | EnumConstraint;

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

/**
 * Adherence score threshold below which a record must be excluded from
 * analytics scoring (LOCK-003).
 *
 * Records with adherence_score < ADHERENCE_EXCLUSION_THRESHOLD are
 * ineligible for production analytics regardless of data_origin.
 */
export const ADHERENCE_EXCLUSION_THRESHOLD = 50;

/**
 * Minimum challenge completion rate for a contributor record (0%).
 * A rate of 0 is valid — it means no challenges were completed.
 */
export const CHALLENGE_COMPLETION_RATE_MIN = 0;

/** Maximum challenge completion rate (100%). */
export const CHALLENGE_COMPLETION_RATE_MAX = 100;

/** Minimum adherence score (0%). */
export const ADHERENCE_SCORE_MIN = 0;

/** Maximum adherence score (100%). */
export const ADHERENCE_SCORE_MAX = 100;

// ---------------------------------------------------------------------------
// ContributorRecord entity schema
// ---------------------------------------------------------------------------

/** Schema definition for a ContributorRecord entity. */
export const CONTRIBUTOR_RECORD_SCHEMA: Record<string, FieldConstraint> = {
  recordId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-z0-9][a-z0-9-]*$/,
  },
  userId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  protocolId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  dataOrigin: {
    type: "enum",
    required: true,
    allowedValues: Object.values(DataOrigin),
  },
  exclusionStatus: {
    type: "enum",
    required: true,
    allowedValues: Object.values(ExclusionStatus),
  },
  adherenceScore: {
    type: "number",
    required: true,
    min: ADHERENCE_SCORE_MIN,
    max: ADHERENCE_SCORE_MAX,
  },
  challengeCompletionRate: {
    type: "number",
    required: true,
    min: CHALLENGE_COMPLETION_RATE_MIN,
    max: CHALLENGE_COMPLETION_RATE_MAX,
  },
  recordedAt: {
    type: "string",
    required: true,
    // ISO 8601 datetime
    pattern: /^\d{4}-\d{2}-\d{2}T[\d:+Z.]+$/,
  },
};

/** Schema definition for the optional exclusionReason field (enum). */
export const EXCLUSION_REASON_CONSTRAINT: EnumConstraint = {
  type: "enum",
  required: false,
  allowedValues: Object.values(ExclusionReason),
};
