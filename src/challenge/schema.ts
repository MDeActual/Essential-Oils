/**
 * schema.ts — Challenge Lifecycle Schema and Constants
 *
 * Defines the state machine for challenge lifecycle transitions, field-level
 * constraint schemas for participation and completion records, and module-level
 * constants governing challenge lifecycle data integrity.
 *
 * MOAT NOTICE (M-003): The VALID_TRANSITIONS map encodes only the structural
 * validity of state transitions (i.e., which status changes are mechanically
 * allowed). It does NOT implement the challenge engine rules that determine
 * when or why a transition should be triggered. That logic is moat-protected.
 */

import { ChallengeCompletionStatus, ChallengeLifecycleEventType } from "./types";

// ---------------------------------------------------------------------------
// Re-export shared FieldConstraint type from the protocol layer to avoid
// duplicating the constraint infrastructure.
// ---------------------------------------------------------------------------

export type {
  FieldConstraint,
  StringConstraint,
  NumberConstraint,
  BooleanConstraint,
  ArrayConstraint,
  EnumConstraint,
} from "../protocol/schema";

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

/** Maximum length of a user response string in a participation or completion record. */
export const CHALLENGE_RESPONSE_MAX_LENGTH = 5000;

/** Maximum length of a skip reason string. */
export const CHALLENGE_SKIP_REASON_MAX_LENGTH = 1000;

/** Maximum length of a participation or completion record ID. */
export const CHALLENGE_RECORD_ID_MAX_LENGTH = 200;

/** Maximum length of a user ID reference. */
export const CHALLENGE_USER_ID_MAX_LENGTH = 200;

// ---------------------------------------------------------------------------
// Lifecycle state machine — valid transitions
//
// Only the transitions listed below are structurally permitted. Terminal states
// (Completed, Skipped) do not allow further transitions.
//
// MOAT NOTICE (M-003): This map defines STRUCTURAL validity only. The rule
// system that determines WHEN and WHY a transition should be triggered lives
// exclusively in the moat-protected challenge engine layer.
// ---------------------------------------------------------------------------

/**
 * Maps each ChallengeCompletionStatus to the set of statuses it may legally
 * transition to.
 *
 * Allowed transitions:
 *   Pending  → Completed  (user completed the challenge)
 *   Pending  → Skipped    (user skipped the challenge)
 *
 * Terminal states (Completed, Skipped) admit no outgoing transitions.
 */
export const VALID_TRANSITIONS: ReadonlyMap<
  ChallengeCompletionStatus,
  ReadonlySet<ChallengeCompletionStatus>
> = new Map([
  [
    ChallengeCompletionStatus.Pending,
    new Set([
      ChallengeCompletionStatus.Completed,
      ChallengeCompletionStatus.Skipped,
    ]),
  ],
  [ChallengeCompletionStatus.Completed, new Set<ChallengeCompletionStatus>()],
  [ChallengeCompletionStatus.Skipped, new Set<ChallengeCompletionStatus>()],
]);

// ---------------------------------------------------------------------------
// Participation record schema
// ---------------------------------------------------------------------------

import type { FieldConstraint } from "../protocol/schema";

/** Schema for the ChallengeParticipation record. */
export const CHALLENGE_PARTICIPATION_SCHEMA: Record<string, FieldConstraint> = {
  participationId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_RECORD_ID_MAX_LENGTH,
    pattern: /^[a-z0-9][a-z0-9-]*$/,
  },
  challengeId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_RECORD_ID_MAX_LENGTH,
  },
  protocolId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_RECORD_ID_MAX_LENGTH,
  },
  userId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_USER_ID_MAX_LENGTH,
  },
  eventType: {
    type: "enum",
    required: true,
    allowedValues: Object.values(ChallengeLifecycleEventType),
  },
  occurredAt: {
    type: "string",
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}T[\d:+Z.]+$/,
  },
};

// ---------------------------------------------------------------------------
// Completion record schema
// ---------------------------------------------------------------------------

/** Schema for the ChallengeCompletionRecord (top-level required fields only). */
export const CHALLENGE_COMPLETION_RECORD_SCHEMA: Record<string, FieldConstraint> = {
  recordId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_RECORD_ID_MAX_LENGTH,
    pattern: /^[a-z0-9][a-z0-9-]*$/,
  },
  challengeId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_RECORD_ID_MAX_LENGTH,
  },
  protocolId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_RECORD_ID_MAX_LENGTH,
  },
  userId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_USER_ID_MAX_LENGTH,
  },
  finalStatus: {
    type: "enum",
    required: true,
    allowedValues: [
      ChallengeCompletionStatus.Completed,
      ChallengeCompletionStatus.Skipped,
    ],
  },
  completedAt: {
    type: "string",
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}T[\d:+Z.]+$/,
  },
  wasTimely: {
    type: "boolean",
    required: true,
  },
};

// ---------------------------------------------------------------------------
// Transition validation schema
// ---------------------------------------------------------------------------

/** Schema for required string fields in a ChallengeTransition. */
export const CHALLENGE_TRANSITION_SCHEMA: Record<string, FieldConstraint> = {
  challengeId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: CHALLENGE_RECORD_ID_MAX_LENGTH,
  },
  fromStatus: {
    type: "enum",
    required: true,
    allowedValues: Object.values(ChallengeCompletionStatus),
  },
  toStatus: {
    type: "enum",
    required: true,
    allowedValues: Object.values(ChallengeCompletionStatus),
  },
  occurredAt: {
    type: "string",
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}T[\d:+Z.]+$/,
  },
};
