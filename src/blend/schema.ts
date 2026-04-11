/**
 * schema.ts — Blend Property Schema
 *
 * Defines the structural constraints that govern valid Blend records.
 * These rules are used by the validation layer to enforce data integrity
 * before records are accepted into the blend registry or assigned to protocols.
 */

import { ApplicationMethod } from "../ontology/types";
import { BlendRole, BlendSafetyStatus } from "./types";

// ---------------------------------------------------------------------------
// Field-level constraint definitions (re-used from ontology layer pattern)
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
// Blend entity schema
// ---------------------------------------------------------------------------

/** Schema definition for the top-level Blend entity. */
export const BLEND_SCHEMA: Record<string, FieldConstraint> = {
  blendId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 200,
    // Lowercase alphanumeric characters and hyphens only.
    pattern: /^[a-z0-9][a-z0-9-]*$/,
  },
  oils: {
    type: "array",
    required: true,
    minItems: 2, // A blend must contain at least two oil entries.
  },
  synergyScore: {
    type: "number",
    required: true,
    min: 0,
    max: 100,
  },
  applicationMethod: {
    type: "enum",
    required: true,
    allowedValues: Object.values(ApplicationMethod),
  },
  intendedEffect: {
    type: "string",
    required: true,
    minLength: 3,
    maxLength: 500,
  },
  safetyStatus: {
    type: "enum",
    required: true,
    allowedValues: Object.values(BlendSafetyStatus),
  },
  createdAt: {
    type: "string",
    required: true,
    // ISO 8601 datetime
    pattern: /^\d{4}-\d{2}-\d{2}T[\d:+Z.]+$/,
  },
  lastReviewedAt: {
    type: "string",
    required: true,
    // ISO 8601 date or datetime
    pattern: /^\d{4}-\d{2}-\d{2}(T[\d:+Z.]+)?$/,
  },
};

/** Schema definition for a BlendOilEntry item. */
export const BLEND_OIL_ENTRY_SCHEMA: Record<string, FieldConstraint> = {
  oilId: {
    type: "string",
    required: true,
    minLength: 3,
    // Snake-case genus_species pattern (matches ontology OilId format).
    pattern: /^[a-z]+_[a-z]+(_[a-z]+)?$/,
  },
  ratio: {
    type: "number",
    required: true,
    min: 0, // Must be strictly > 0; checked separately as a cross-field rule.
  },
  role: {
    type: "enum",
    required: true,
    allowedValues: Object.values(BlendRole),
  },
};

/** Valid blend role strings (aligned with BlendRole enum). */
export const VALID_BLEND_ROLES: ReadonlySet<string> = new Set(Object.values(BlendRole));

/** Minimum number of oil entries required in a valid blend. */
export const BLEND_MIN_OILS = 2;

/** Maximum number of oil entries permitted in a blend. */
export const BLEND_MAX_OILS = 10;

/** Valid synergy score range. */
export const SYNERGY_SCORE_MIN = 0;
export const SYNERGY_SCORE_MAX = 100;
