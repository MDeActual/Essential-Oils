/**
 * index.ts — Blend Module Public Interface
 *
 * Exports the public surface of src/blend/ for use by other platform modules
 * (protocol engine, API layer).
 *
 * MOAT NOTICE (M-001): The synergy scoring algorithm and weight matrix are
 * moat-protected proprietary components. This module exposes only structural
 * types, validation utilities, and schema constants. The synergyScore field
 * is accepted as a pre-computed value; the computation method must not be
 * implemented here or in any external-facing module.
 */

// Types — all type definitions are safe to re-export for internal module use.
export type {
  Blend,
  BlendId,
  BlendOilEntry,
  BlendValidationError,
  BlendValidationResult,
} from "./types";
export { ApplicationMethod, BlendRole, BlendSafetyStatus } from "./types";

// Schema — field constraint definitions and constants for use by consuming modules.
export {
  BLEND_MIN_OILS,
  BLEND_MAX_OILS,
  SYNERGY_SCORE_MIN,
  SYNERGY_SCORE_MAX,
  VALID_BLEND_ROLES,
} from "./schema";
export type {
  FieldConstraint,
  StringConstraint,
  NumberConstraint,
  BooleanConstraint,
  ArrayConstraint,
  EnumConstraint,
} from "./schema";

// Validation
export { validateBlend, validateBlendCollection } from "./validation";
