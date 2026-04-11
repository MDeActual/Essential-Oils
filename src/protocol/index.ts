/**
 * index.ts — Protocol Module Public Interface
 *
 * Exports the public surface of src/protocol/ for use by other platform modules
 * (analytics, simulation, API layer).
 *
 * MOAT NOTICE (M-002): The protocol generation algorithm is moat-protected.
 * This module exposes only structural types, validation utilities, and schema
 * constants. The generation logic must not be implemented here or in any
 * external-facing module.
 *
 * MOAT NOTICE (M-003): The challenge engine rule system is moat-protected.
 * Only Challenge entity types and structural validation are exported here.
 */

// Types — all type definitions safe for internal module use.
export type {
  Protocol,
  ProtocolId,
  ProtocolPhase,
  Challenge,
  ChallengeId,
  ProtocolValidationError,
  ProtocolValidationResult,
  ChallengeValidationError,
  ChallengeValidationResult,
} from "./types";
export { ApplicationMethod, ChallengeCompletionStatus, ChallengeType, ProtocolStatus } from "./types";

// Schema — field constraint definitions and constants for consuming modules.
export {
  PROTOCOL_MIN_PHASES,
  PROTOCOL_MAX_PHASES,
  PROTOCOL_MIN_DURATION_DAYS,
  PROTOCOL_MAX_DURATION_DAYS,
  SEMVER_PATTERN,
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
export {
  validateProtocol,
  validateProtocolCollection,
  validateChallenge,
  validateChallengeCollection,
} from "./validation";
