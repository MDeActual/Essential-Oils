/**
 * schema.ts — Contributor Analytics Property Schema
 *
 * Defines the structural constraints that govern valid ContributorRecord entries.
 * These rules are used by the validation layer to enforce data integrity before
 * records enter the analytics pipeline.
 *
 * LOCK-003: All analytics-eligible records must include data_origin and
 * exclusion_status. Only real_contributor records are analytics-eligible.
 * Records with adherence below 50% must be excluded from scoring.
 */

import { DataOrigin, ExclusionReason, ExclusionStatus } from "./types";

// ---------------------------------------------------------------------------
// Field-level constraint definitions (mirrors pattern from ontology/blend/protocol)
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

/** Constraint for a required boolean field. */
export interface BooleanConstraint {
  type: "boolean";
  required: boolean;
}

/** Constraint for an array field with min/max items. */
export interface ArrayConstraint {
  type: "array";
  required: boolean;
  minItems?: number;
  maxItems?: number;
  allowedValues?: readonly string[];
}

/** Constraint for an enum field. */
export interface EnumConstraint {
  type: "enum";
  required: boolean;
  allowedValues: readonly string[];
}

export type FieldConstraint =
  | StringConstraint
  | NumberConstraint
  | BooleanConstraint
  | ArrayConstraint
  | EnumConstraint;

// ---------------------------------------------------------------------------
// Analytics data integrity constants (LOCK-003)
// ---------------------------------------------------------------------------

/**
 * Adherence score threshold below which a record must be excluded from analytics
 * scoring (LOCK-003). Records with adherenceScore < ADHERENCE_EXCLUSION_THRESHOLD
 * must carry exclusionStatus: Excluded.
 */
export const ADHERENCE_EXCLUSION_THRESHOLD = 50;

/** Valid percentage range (inclusive) for adherenceScore and challengeCompletionRate. */
export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

// ---------------------------------------------------------------------------
// ContributorRecord entity schema
// ---------------------------------------------------------------------------

/** Schema definition for the top-level ContributorRecord entity. */
export const CONTRIBUTOR_RECORD_SCHEMA: Record<string, FieldConstraint> = {
  recordId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
    // Lowercase alphanumeric characters and hyphens only.
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
    min: SCORE_MIN,
    max: SCORE_MAX,
  },
  challengeCompletionRate: {
    type: "number",
    required: true,
    min: SCORE_MIN,
    max: SCORE_MAX,
  },
  recordedAt: {
    type: "string",
    required: true,
    // ISO 8601 datetime
    pattern: /^\d{4}-\d{2}-\d{2}T[\d:+Z.]+$/,
  },
};

/** Valid exclusion reason strings (aligned with ExclusionReason enum). */
export const VALID_EXCLUSION_REASONS: ReadonlySet<string> = new Set(
  Object.values(ExclusionReason)
);
