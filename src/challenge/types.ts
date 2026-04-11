/**
 * types.ts — Challenge Lifecycle Type Definitions
 *
 * Defines the canonical TypeScript types for the Phyto.ai challenge lifecycle
 * layer. This module extends the Challenge entity defined in src/protocol/
 * with lifecycle event tracking, state transition records, participation
 * events, and authoritative completion records.
 *
 * MOAT NOTICE (M-003): The challenge engine rule system — the proprietary logic
 * governing WHEN, HOW, and WHY challenges are selected, sequenced, and
 * personalized — is NOT implemented here. This module handles only the
 * structural lifecycle types: state transitions, participation tracking, and
 * completion record integrity. The rule evaluation logic resides exclusively
 * in the moat-protected challenge intelligence layer.
 *
 * Dependencies: src/protocol/ (Challenge, ChallengeId, ChallengeType,
 * ChallengeCompletionStatus, ProtocolId)
 */

export type {
  Challenge,
  ChallengeId,
  ProtocolId,
} from "../protocol/types";
export { ChallengeCompletionStatus, ChallengeType } from "../protocol/types";

// ---------------------------------------------------------------------------
// Lifecycle event types
// ---------------------------------------------------------------------------

/**
 * Discrete event types in the challenge lifecycle.
 *
 * These events describe observable state changes and user interactions.
 * They do NOT encode the rule system that determines when events are
 * triggered — that logic is moat-protected (M-003).
 */
export enum ChallengeLifecycleEventType {
  /** The challenge was surfaced and shown to the user. */
  Presented = "presented",
  /** The user submitted a partial or complete response. */
  Responded = "responded",
  /** The challenge was marked as fully completed by the user. */
  Completed = "completed",
  /** The user explicitly chose to skip the challenge. */
  Skipped = "skipped",
  /** The challenge passed its due day without any user action. */
  Expired = "expired",
}

// ---------------------------------------------------------------------------
// State transition record
// ---------------------------------------------------------------------------

/**
 * Records a single lifecycle state change for a Challenge record.
 *
 * Transitions are validated against the VALID_TRANSITIONS map in schema.ts.
 * Only transitions permitted by that map are accepted; all others are rejected
 * to enforce the lifecycle state machine.
 *
 * Terminal states (Completed, Skipped) do not permit further transitions.
 */
export interface ChallengeTransition {
  /** The challenge whose status is changing. */
  challengeId: string;
  /** The status before the transition. */
  fromStatus: import("../protocol/types").ChallengeCompletionStatus;
  /** The status after the transition. */
  toStatus: import("../protocol/types").ChallengeCompletionStatus;
  /** ISO 8601 timestamp when the transition occurred. */
  occurredAt: string;
}

// ---------------------------------------------------------------------------
// Participation record
// ---------------------------------------------------------------------------

/**
 * Records a single user interaction event against a Challenge.
 *
 * A participation record documents each meaningful event in the challenge
 * lifecycle: when the challenge was presented, when the user responded, when
 * it was completed or skipped, or when it expired.
 *
 * Multiple participation records may exist per challenge (e.g., a Presented
 * event followed by a Responded event and finally a Completed event).
 *
 * MOAT NOTICE (M-003): The business rules that determine whether a user SHOULD
 * be presented with a challenge are moat-protected. This record type documents
 * only that a presentation event occurred — not why or how it was triggered.
 */
export interface ChallengeParticipation {
  /** Unique identifier for this participation record (UUID or slug). */
  participationId: string;
  /** The challenge this event is associated with. */
  challengeId: string;
  /** The parent protocol this challenge belongs to. */
  protocolId: string;
  /** The user who interacted with the challenge. */
  userId: string;
  /** The type of lifecycle event being recorded. */
  eventType: ChallengeLifecycleEventType;
  /** ISO 8601 timestamp when this event occurred. */
  occurredAt: string;
  /**
   * The user's response content.
   * Required when eventType is Responded or Completed.
   * Optional for all other event types.
   */
  response?: string;
  /**
   * The reason the user provided for skipping.
   * Optional when eventType is Skipped.
   */
  skipReason?: string;
}

// ---------------------------------------------------------------------------
// Completion record
// ---------------------------------------------------------------------------

/**
 * The authoritative record of a challenge that has reached a terminal state
 * (Completed or Skipped).
 *
 * A ChallengeCompletionRecord is created once per challenge, when the challenge
 * moves to a terminal status. It captures the final outcome, timing, and
 * response data in a single authoritative record used by the analytics layer.
 *
 * Data integrity rules (enforced by validateChallengeCompletionRecord):
 * - finalStatus must be Completed or Skipped (not Pending).
 * - Completed records must include a non-empty response.
 * - Skipped records may include an optional skipReason.
 * - wasTimely must be a boolean indicating whether the terminal status was
 *   reached on or before the challenge's due day.
 */
export interface ChallengeCompletionRecord {
  /** Unique identifier for this completion record (UUID or slug). */
  recordId: string;
  /** The challenge that was completed or skipped. */
  challengeId: string;
  /** The parent protocol this challenge belongs to. */
  protocolId: string;
  /** The user who completed or skipped the challenge. */
  userId: string;
  /**
   * The terminal status of the challenge.
   * Only Completed or Skipped are valid values here.
   */
  finalStatus:
    | import("../protocol/types").ChallengeCompletionStatus.Completed
    | import("../protocol/types").ChallengeCompletionStatus.Skipped;
  /** ISO 8601 timestamp when the challenge reached terminal status. */
  completedAt: string;
  /**
   * The user's recorded response.
   * Required when finalStatus is Completed; must be a non-empty string.
   * Must be absent or undefined when finalStatus is Skipped.
   */
  response?: string;
  /**
   * The reason the user provided for skipping.
   * Optional when finalStatus is Skipped.
   * Must be absent or undefined when finalStatus is Completed.
   */
  skipReason?: string;
  /**
   * True if the terminal status was reached on or before the challenge's
   * dueDay within the protocol. False if the challenge was completed or
   * skipped after the due day had passed.
   */
  wasTimely: boolean;
}

// ---------------------------------------------------------------------------
// Validation result types
// ---------------------------------------------------------------------------

/** Structured validation error for a ChallengeTransition. */
export interface ChallengeTransitionValidationError {
  /** The challenge identifier that was being transitioned, if available. */
  challengeId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of a challenge transition validation operation. */
export interface ChallengeTransitionValidationResult {
  valid: boolean;
  errors: ChallengeTransitionValidationError[];
}

/** Structured validation error for a ChallengeParticipation record. */
export interface ChallengeParticipationValidationError {
  /** The participation record identifier, if available. */
  participationId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of a challenge participation validation operation. */
export interface ChallengeParticipationValidationResult {
  valid: boolean;
  errors: ChallengeParticipationValidationError[];
}

/** Structured validation error for a ChallengeCompletionRecord. */
export interface ChallengeCompletionRecordValidationError {
  /** The completion record identifier, if available. */
  recordId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of a challenge completion record validation operation. */
export interface ChallengeCompletionRecordValidationResult {
  valid: boolean;
  errors: ChallengeCompletionRecordValidationError[];
}
