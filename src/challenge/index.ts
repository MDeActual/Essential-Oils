/**
 * index.ts — Challenge Lifecycle Module Public Interface
 *
 * Exports the public surface of src/challenge/ for use by other platform
 * modules (analytics, simulation, API layer).
 *
 * MOAT NOTICE (M-003): The challenge engine rule system is moat-protected.
 * This module exposes only lifecycle types, structural validation utilities,
 * and schema constants. The rule evaluation logic — governing when, how, and
 * why challenges are presented and sequenced — must not be implemented here
 * or in any external-facing module.
 *
 * Challenge entity types (Challenge, ChallengeType, ChallengeCompletionStatus)
 * are re-exported here for convenience; they originate in src/protocol/.
 */

// Re-export Challenge entity types from the protocol layer.
export type { Challenge, ChallengeId, ProtocolId } from "./types";
export { ChallengeCompletionStatus, ChallengeType } from "./types";

// Lifecycle types
export { ChallengeLifecycleEventType } from "./types";
export type {
  ChallengeTransition,
  ChallengeParticipation,
  ChallengeCompletionRecord,
  ChallengeTransitionValidationError,
  ChallengeTransitionValidationResult,
  ChallengeParticipationValidationError,
  ChallengeParticipationValidationResult,
  ChallengeCompletionRecordValidationError,
  ChallengeCompletionRecordValidationResult,
} from "./types";

// Schema — state machine map and constants for consuming modules.
export {
  VALID_TRANSITIONS,
  CHALLENGE_RESPONSE_MAX_LENGTH,
  CHALLENGE_SKIP_REASON_MAX_LENGTH,
  CHALLENGE_RECORD_ID_MAX_LENGTH,
  CHALLENGE_USER_ID_MAX_LENGTH,
} from "./schema";

// Validation
export {
  validateChallengeTransition,
  validateChallengeParticipation,
  validateChallengeCompletionRecord,
  validateChallengeCompletionRecordCollection,
} from "./validation";
