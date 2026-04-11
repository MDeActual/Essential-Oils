/**
 * types.ts — Protocol Entity Type Definitions
 *
 * Defines the canonical TypeScript types and enums for the Phyto.ai protocol layer.
 * These types implement the Protocol and Challenge entities defined in
 * docs/DOMAIN_MODEL.md.
 *
 * MOAT NOTICE (M-002): The protocol generation algorithm is proprietary and must
 * NOT be implemented in this module. This module handles only structural types
 * and validation — the generation logic resides in the moat-protected layer.
 *
 * MOAT NOTICE (M-003): The challenge engine rule system is proprietary and must
 * NOT be implemented in this module. Only the Challenge entity type and structural
 * validation are permitted here.
 */

import { ApplicationMethod, OilId } from "../ontology/types";
import { BlendId } from "../blend/types";

// Re-export for consumers who need them without importing from sub-layers.
export { ApplicationMethod } from "../ontology/types";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/** Lifecycle status of a Protocol record. */
export enum ProtocolStatus {
  /** Not yet activated — may still be edited. */
  Draft = "draft",
  /** Currently in use by a user. */
  Active = "active",
  /** Successfully completed by the user. */
  Completed = "completed",
  /** No longer in use; superseded or abandoned. */
  Deprecated = "deprecated",
}

/**
 * Functional type of a Challenge within a Protocol.
 * Drives how the challenge is presented and tracked.
 *
 * MOAT NOTICE (M-003): The rule system that determines when and how challenges
 * are selected or sequenced is proprietary and excluded from this layer.
 */
export enum ChallengeType {
  /** Tracks user compliance with a protocol step. */
  Adherence = "adherence",
  /** Delivers educational content to the user. */
  Educational = "educational",
  /** Prompts a first-hand sensory or application experience. */
  Experiential = "experiential",
}

/** Completion state of a Challenge record. */
export enum ChallengeCompletionStatus {
  /** Challenge has been presented but not acted on. */
  Pending = "pending",
  /** User has completed the challenge. */
  Completed = "completed",
  /** User chose to skip this challenge. */
  Skipped = "skipped",
}

// ---------------------------------------------------------------------------
// Protocol Phase
// ---------------------------------------------------------------------------

/**
 * A single phase within a Protocol, containing oil and blend references
 * and instructions for the user.
 *
 * Phases are ordered by their `phaseIndex` (0-based). The sum of all phase
 * `durationDays` values should equal the Protocol's `durationDays`.
 */
export interface ProtocolPhase {
  /** Zero-based index that defines the display and execution order of the phase. */
  phaseIndex: number;
  /** Human-readable label for the phase (e.g., "Preparation", "Core Treatment"). */
  label: string;
  /** Duration of this phase in days (must be >= 1). */
  durationDays: number;
  /**
   * Blend IDs referenced in this phase.
   * The actual Blend records are resolved by the consuming layer.
   */
  blendIds: BlendId[];
  /**
   * Direct oil references for single-oil applications in this phase.
   * These are complementary to blendIds and may be empty.
   */
  oilIds: OilId[];
  /** Instructions for the user describing how to execute this phase. */
  instructions: string;
}

// ---------------------------------------------------------------------------
// Protocol
// ---------------------------------------------------------------------------

/**
 * A structured, personalized sequence of oil application recommendations
 * designed to address a user's health goals over time.
 *
 * This type directly implements the Protocol entity in docs/DOMAIN_MODEL.md.
 *
 * MOAT NOTICE (M-002): The algorithm that generates Protocol records from a
 * user profile is proprietary. This type definition and its validation are
 * purely structural — they describe the output shape, not the generation logic.
 */
export interface Protocol {
  /** Unique canonical protocol identifier (UUID or slug). */
  protocolId: ProtocolId;
  /**
   * Semantic version of this protocol record (MAJOR.MINOR.PATCH).
   * Required by LOCK-005: production changes require a MINOR or MAJOR bump.
   */
  version: string;
  /** Reference to the User Profile that owns this protocol. */
  userProfileId: string;
  /** Primary health objective for this protocol. */
  goal: string;
  /** Ordered array of protocol phases. */
  phases: ProtocolPhase[];
  /** Total recommended duration in days (must equal sum of phase durations). */
  durationDays: number;
  /** IDs of Challenges associated with this protocol. */
  challengeIds: string[];
  /** ISO 8601 timestamp when this protocol record was created. */
  createdAt: string;
  /** Current lifecycle status of the protocol. */
  status: ProtocolStatus;
}

// ---------------------------------------------------------------------------
// Challenge
// ---------------------------------------------------------------------------

/**
 * A structured milestone or behavioral prompt within a Protocol that drives
 * adherence and tracks progress.
 *
 * This type directly implements the Challenge entity in docs/DOMAIN_MODEL.md.
 *
 * MOAT NOTICE (M-003): The rule system that determines when, how, and why
 * challenges are presented is proprietary. Only the entity type and structural
 * validation are implemented here.
 */
export interface Challenge {
  /** Unique canonical challenge identifier (UUID or slug). */
  challengeId: ChallengeId;
  /** Reference to the parent Protocol. */
  protocolId: ProtocolId;
  /** Functional type of this challenge. */
  type: ChallengeType;
  /**
   * The challenge instruction or question presented to the user.
   * Only the prompt text may be returned externally (LOCK-002, M-003).
   */
  prompt: string;
  /** Day within the protocol lifecycle when this challenge is presented (>= 1). */
  dueDay: number;
  /** Current completion state. */
  completionStatus: ChallengeCompletionStatus;
  /**
   * The user's recorded response or completion evidence.
   * Optional — may be absent when completionStatus is Pending.
   */
  response?: string;
}

// ---------------------------------------------------------------------------
// Canonical Identifiers
// ---------------------------------------------------------------------------

/**
 * Protocol identifiers are arbitrary strings (UUID or slug).
 * Format: lowercase alphanumeric characters and hyphens only.
 */
export type ProtocolId = string;

/**
 * Challenge identifiers are arbitrary strings (UUID or slug).
 * Format: lowercase alphanumeric characters and hyphens only.
 */
export type ChallengeId = string;

// ---------------------------------------------------------------------------
// Validation Types
// ---------------------------------------------------------------------------

/** Structured validation error returned by the protocol validation layer. */
export interface ProtocolValidationError {
  /** The protocol identifier that failed validation, if applicable. */
  protocolId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of a protocol validation operation. */
export interface ProtocolValidationResult {
  valid: boolean;
  errors: ProtocolValidationError[];
}

/** Structured validation error returned by the challenge validation layer. */
export interface ChallengeValidationError {
  /** The challenge identifier that failed validation, if applicable. */
  challengeId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of a challenge validation operation. */
export interface ChallengeValidationResult {
  valid: boolean;
  errors: ChallengeValidationError[];
}
