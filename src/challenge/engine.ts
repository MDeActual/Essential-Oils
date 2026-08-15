/**
 * engine.ts — Challenge Engine Structural Service
 *
 * Implements the public behavioral contract of the Phyto.ai Challenge Engine as
 * defined in docs/challenge_engine_specification.md. This module enforces the
 * structural rules CE-001 through CE-007 and exposes the result types consumed
 * by the API and analytics layers.
 *
 * MOAT NOTICE (M-003): This module implements only the structural behavioral
 * rules described in the public specification. The proprietary rule evaluation
 * algorithm, personalization hooks (P-001, P-002, P-003), and adherence
 * weighting formula are moat-protected and must NOT be implemented here or in
 * any external-facing module.
 *
 * Authority: The Challenge Engine writes only to lifecycle records
 * (ChallengeParticipation, ChallengeCompletionRecord). It never modifies
 * Protocol entities directly. Protocol status transitions (active → completed)
 * are delegated to the Protocol layer.
 */

import { Challenge, ChallengeCompletionStatus, ChallengeType } from "./types";
import {
  ChallengeCompletionRecord,
  ChallengeParticipation,
  ChallengeTransition,
  ChallengeCompletionRecordValidationResult,
  ChallengeParticipationValidationResult,
  ChallengeTransitionValidationResult,
} from "./types";
import { VALID_TRANSITIONS } from "./schema";
import {
  validateChallengeTransition,
  validateChallengeParticipation,
  validateChallengeCompletionRecord,
  validateChallengeCompletionRecordCollection,
} from "./validation";

// ---------------------------------------------------------------------------
// CE-001: One Active Adherence Challenge Per Phase
// ---------------------------------------------------------------------------

/**
 * Result of the CE-001 eligibility check.
 */
export interface ActiveAdherenceCheckResult {
  /** True if the challenge may be presented (no active adherence challenge exists). */
  eligible: boolean;
  /**
   * The challengeId of the currently active adherence challenge in this phase,
   * if one exists and is blocking the check.
   */
  blockingChallengeId?: string;
  message: string;
}

/**
 * Enforces CE-001: at most one `adherence`-type challenge may be in `Pending`
 * status per protocol phase.
 *
 * Educational and experiential challenges may queue freely.
 *
 * @param candidate - The challenge being considered for presentation.
 * @param activeChallengesInPhase - All challenges currently in Pending status
 *   for the same protocol phase.
 * @returns ActiveAdherenceCheckResult indicating whether CE-001 allows presentation.
 */
export function checkActiveAdherenceLimit(
  candidate: Challenge,
  activeChallengesInPhase: Challenge[]
): ActiveAdherenceCheckResult {
  if (candidate.type !== ChallengeType.Adherence) {
    return {
      eligible: true,
      message: `CE-001: Non-adherence challenge '${candidate.challengeId}' is not subject to the active adherence limit.`,
    };
  }

  const activePendingAdherence = activeChallengesInPhase.find(
    (c) =>
      c.type === ChallengeType.Adherence &&
      c.completionStatus === ChallengeCompletionStatus.Pending &&
      c.challengeId !== candidate.challengeId
  );

  if (activePendingAdherence) {
    return {
      eligible: false,
      blockingChallengeId: activePendingAdherence.challengeId,
      message: `CE-001: Adherence challenge '${candidate.challengeId}' cannot be presented. Active pending adherence challenge '${activePendingAdherence.challengeId}' must be resolved first.`,
    };
  }

  return {
    eligible: true,
    message: `CE-001: No active pending adherence challenge found. '${candidate.challengeId}' may be presented.`,
  };
}

// ---------------------------------------------------------------------------
// CE-002: Due Day Enforcement
// ---------------------------------------------------------------------------

/**
 * Result of the CE-002 timeliness check.
 */
export interface DueDayCheckResult {
  /** Whether the terminal status was reached on or before the due day. */
  wasTimely: boolean;
  message: string;
}

/**
 * Enforces CE-002: determines whether a challenge was resolved on time.
 *
 * @param dueDay - The challenge's dueDay (calendar day within the protocol,
 *   1-indexed from the protocol start date).
 * @param currentProtocolDay - The current day within the protocol lifecycle
 *   (1-indexed). A day equal to or before dueDay is timely.
 * @returns DueDayCheckResult indicating timeliness.
 */
export function checkDueDay(
  dueDay: number,
  currentProtocolDay: number
): DueDayCheckResult {
  const wasTimely = currentProtocolDay <= dueDay;
  return {
    wasTimely,
    message: wasTimely
      ? `CE-002: Challenge resolved on day ${currentProtocolDay} (due day ${dueDay}). Timely.`
      : `CE-002: Challenge resolved on day ${currentProtocolDay} (due day ${dueDay}). Late — wasTimely will be false.`,
  };
}

// ---------------------------------------------------------------------------
// CE-003: Completion Requires Non-Empty Response (delegated to validation)
// CE-006: Length Constraints (delegated to validation)
// CE-007: No Retroactive Transition (delegated to VALID_TRANSITIONS)
// ---------------------------------------------------------------------------

// These rules are structurally enforced by the existing validation layer.
// The engine exposes the validation functions directly as part of its
// structural contract, providing a single authoritative entry point.

export {
  validateChallengeTransition,
  validateChallengeParticipation,
  validateChallengeCompletionRecord,
  validateChallengeCompletionRecordCollection,
};

export type {
  ChallengeTransitionValidationResult,
  ChallengeParticipationValidationResult,
  ChallengeCompletionRecordValidationResult,
};

// ---------------------------------------------------------------------------
// CE-004: Adherence Score Contribution — public behavioral contract
// ---------------------------------------------------------------------------

/**
 * The public contribution tier for a resolved challenge outcome.
 *
 * MOAT NOTICE (M-003): The exact weighting formula is moat-protected.
 * This enum represents only the observable public tiers described in the
 * challenge engine specification (CE-004). It must not encode numeric weights.
 */
export enum ChallengeScoreTier {
  /** Completed on or before the due day. Full weight. */
  FullWeight = "full_weight",
  /** Completed after the due day. Partial weight (50% of full, per spec). */
  PartialWeight = "partial_weight",
  /** Skipped or expired. No weight contribution. */
  ZeroWeight = "zero_weight",
}

/**
 * Derives the public score tier for a resolved challenge completion record.
 *
 * CE-004 public behavioral contract:
 * - Completed + wasTimely → FullWeight
 * - Completed + !wasTimely → PartialWeight
 * - Skipped → ZeroWeight
 *
 * MOAT NOTICE (M-003): Translating this tier into a numeric adherence score
 * contribution is the exclusive concern of the moat-protected scoring layer.
 *
 * @param record - An already-validated ChallengeCompletionRecord.
 * @returns The public ChallengeScoreTier for this record.
 */
export function deriveScoreTier(
  record: ChallengeCompletionRecord
): ChallengeScoreTier {
  if (record.finalStatus === ChallengeCompletionStatus.Completed) {
    return record.wasTimely
      ? ChallengeScoreTier.FullWeight
      : ChallengeScoreTier.PartialWeight;
  }
  return ChallengeScoreTier.ZeroWeight;
}

// ---------------------------------------------------------------------------
// CE-005: Minimum Challenge Set Validation
// ---------------------------------------------------------------------------

/**
 * Result of the CE-005 minimum challenge set check.
 */
export interface MinimumChallengeSetResult {
  valid: boolean;
  /** The protocol phases (by phaseIndex) that are missing at least one adherence challenge. */
  invalidPhaseIndices: number[];
  message: string;
}

/**
 * Enforces CE-005: a valid protocol must contain at least one `adherence`-type
 * challenge per phase. Protocols missing an adherence challenge in any phase
 * are invalid and must not be promoted to `active` status.
 *
 * @param phases - Array of objects describing each phase and its challenge set.
 * @returns MinimumChallengeSetResult listing any invalid phases.
 */
export function validateMinimumChallengeSet(
  phases: Array<{ phaseIndex: number; challenges: Challenge[] }>
): MinimumChallengeSetResult {
  const invalidPhaseIndices: number[] = [];

  for (const phase of phases) {
    const hasAdherence = phase.challenges.some(
      (c) => c.type === ChallengeType.Adherence
    );
    if (!hasAdherence) {
      invalidPhaseIndices.push(phase.phaseIndex);
    }
  }

  const valid = invalidPhaseIndices.length === 0;
  return {
    valid,
    invalidPhaseIndices,
    message: valid
      ? "CE-005: All protocol phases contain at least one adherence challenge."
      : `CE-005: Protocol phases [${invalidPhaseIndices.join(", ")}] are missing at least one adherence-type challenge. Protocol cannot be promoted to active status.`,
  };
}

// ---------------------------------------------------------------------------
// CE-007: Terminal State Guard (structural re-export for consuming layers)
// ---------------------------------------------------------------------------

/**
 * Returns true if the given status is a terminal lifecycle state (Completed
 * or Skipped). Terminal states do not permit further transitions (CE-007).
 *
 * Consuming layers should call this before attempting any transition to provide
 * early rejection without going through the full transition validation.
 *
 * @param status - The current ChallengeCompletionStatus to check.
 * @returns true if the status is terminal; false if further transitions are possible.
 */
export function isTerminalStatus(status: ChallengeCompletionStatus): boolean {
  const outgoing = VALID_TRANSITIONS.get(status);
  return outgoing !== undefined && outgoing.size === 0;
}
