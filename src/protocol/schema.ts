/**
 * schema.ts — Protocol Property Schema
 *
 * Defines the structural constraints that govern valid Protocol and Challenge
 * records. These rules are used by the validation layer to enforce data
 * integrity before records are accepted into the protocol registry or
 * dispatched to the analytics and simulation layers.
 */

import { ChallengeCompletionStatus, ChallengeType, ProtocolStatus } from "./types";

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

/** Constraint for a boolean field. */
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
// Module-level constants (declared before schemas that reference them)
// ---------------------------------------------------------------------------

/** Minimum number of phases required in a valid protocol. */
export const PROTOCOL_MIN_PHASES = 1;

/** Maximum number of phases allowed in a protocol. */
export const PROTOCOL_MAX_PHASES = 20;

/** Minimum protocol duration in days. */
export const PROTOCOL_MIN_DURATION_DAYS = 1;

/** Maximum protocol duration in days (≈ 2 years). */
export const PROTOCOL_MAX_DURATION_DAYS = 730;

// ---------------------------------------------------------------------------
// Semantic version pattern (LOCK-005)
// ---------------------------------------------------------------------------

/**
 * Regex for semantic versioning (MAJOR.MINOR.PATCH).
 * Enforces LOCK-005: Protocol versions must follow semantic versioning.
 */
export const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

// ---------------------------------------------------------------------------
// Protocol entity schema
// ---------------------------------------------------------------------------

/** Schema definition for the top-level Protocol entity. */
export const PROTOCOL_SCHEMA: Record<string, FieldConstraint> = {
  protocolId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-z0-9][a-z0-9-]*$/,
  },
  version: {
    type: "string",
    required: true,
    // Validated as semver in the cross-field rules section of validation.ts
    minLength: 5, // "0.0.0" minimum
    maxLength: 30,
  },
  userProfileId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  goal: {
    type: "string",
    required: true,
    minLength: 3,
    maxLength: 500,
  },
  phases: {
    type: "array",
    required: true,
    minItems: PROTOCOL_MIN_PHASES,
  },
  durationDays: {
    type: "number",
    required: true,
    min: PROTOCOL_MIN_DURATION_DAYS,
    max: PROTOCOL_MAX_DURATION_DAYS,
  },
  challengeIds: {
    type: "array",
    required: true,
    minItems: 0,
  },
  createdAt: {
    type: "string",
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}T[\d:+Z.]+$/,
  },
  status: {
    type: "enum",
    required: true,
    allowedValues: Object.values(ProtocolStatus),
  },
};

// ---------------------------------------------------------------------------
// ProtocolPhase entity schema
// ---------------------------------------------------------------------------

/** Schema definition for a single ProtocolPhase item. */
export const PROTOCOL_PHASE_SCHEMA: Record<string, FieldConstraint> = {
  phaseIndex: {
    type: "number",
    required: true,
    min: 0,
  },
  label: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  durationDays: {
    type: "number",
    required: true,
    min: 1,
  },
  blendIds: {
    type: "array",
    required: true,
    minItems: 0,
  },
  oilIds: {
    type: "array",
    required: true,
    minItems: 0,
  },
  instructions: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 2000,
  },
};

// ---------------------------------------------------------------------------
// Challenge entity schema
// ---------------------------------------------------------------------------

/** Schema definition for the Challenge entity. */
export const CHALLENGE_SCHEMA: Record<string, FieldConstraint> = {
  challengeId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-z0-9][a-z0-9-]*$/,
  },
  protocolId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  type: {
    type: "enum",
    required: true,
    allowedValues: Object.values(ChallengeType),
  },
  prompt: {
    type: "string",
    required: true,
    minLength: 5,
    maxLength: 1000,
  },
  dueDay: {
    type: "number",
    required: true,
    min: 1,
  },
  completionStatus: {
    type: "enum",
    required: true,
    allowedValues: Object.values(ChallengeCompletionStatus),
  },
};
