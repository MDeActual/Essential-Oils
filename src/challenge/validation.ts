/**
 * validation.ts — Challenge Lifecycle Validation Rules
 *
 * Implements the validation layer for challenge lifecycle records: state
 * transitions, participation events, and completion records.
 *
 * Rules enforce structural correctness, field-level constraints, and
 * cross-field business rules derived from docs/DOMAIN_MODEL.md and
 * docs/ARCHITECTURE_LOCK.md.
 *
 * MOAT NOTICE (M-003): This module does NOT implement challenge engine rules.
 * It validates only the structural correctness of lifecycle records. The rule
 * evaluation logic — governing when and why challenges are presented, sequenced,
 * or personalized — must not be reconstructed here or in any public module.
 */

import {
  ChallengeCompletionRecord,
  ChallengeCompletionRecordValidationError,
  ChallengeCompletionRecordValidationResult,
  ChallengeCompletionStatus,
  ChallengeLifecycleEventType,
  ChallengeParticipation,
  ChallengeParticipationValidationError,
  ChallengeParticipationValidationResult,
  ChallengeTransition,
  ChallengeTransitionValidationError,
  ChallengeTransitionValidationResult,
} from "./types";
import {
  CHALLENGE_COMPLETION_RECORD_SCHEMA,
  CHALLENGE_PARTICIPATION_SCHEMA,
  CHALLENGE_RECORD_ID_MAX_LENGTH,
  CHALLENGE_RESPONSE_MAX_LENGTH,
  CHALLENGE_SKIP_REASON_MAX_LENGTH,
  CHALLENGE_TRANSITION_SCHEMA,
  VALID_TRANSITIONS,
} from "./schema";
import {
  applyFieldConstraints,
} from "../protocol/validation";

// ---------------------------------------------------------------------------
// validateChallengeTransition
// ---------------------------------------------------------------------------

/**
 * Validates that a ChallengeTransition is structurally correct and represents
 * a permitted lifecycle state change.
 *
 * Rules:
 * - All required fields must be present and well-formed.
 * - The (fromStatus, toStatus) pair must exist in VALID_TRANSITIONS.
 * - A transition where fromStatus === toStatus is always rejected (no self-loops).
 *
 * @param transition - The transition record to validate.
 * @returns A ChallengeTransitionValidationResult with any errors found.
 */
export function validateChallengeTransition(
  transition: ChallengeTransition
): ChallengeTransitionValidationResult {
  const errors: ChallengeTransitionValidationError[] = [];
  const challengeId =
    typeof transition?.challengeId === "string" ? transition.challengeId : "(unknown)";
  const record = transition as unknown as Record<string, unknown>;
  const push = (field: string, message: string) =>
    errors.push({ challengeId, field, message });

  // Field-level constraints.
  applyFieldConstraints(record, CHALLENGE_TRANSITION_SCHEMA, push);

  // Self-transition guard.
  if (
    typeof transition.fromStatus === "string" &&
    typeof transition.toStatus === "string" &&
    transition.fromStatus === transition.toStatus
  ) {
    push(
      "toStatus",
      `Self-transition rejected: fromStatus and toStatus are both '${transition.fromStatus}'.`
    );
    return { valid: errors.length === 0, errors };
  }

  // State machine guard.
  if (
    typeof transition.fromStatus === "string" &&
    typeof transition.toStatus === "string"
  ) {
    const allowed = VALID_TRANSITIONS.get(
      transition.fromStatus as ChallengeCompletionStatus
    );
    if (!allowed || !allowed.has(transition.toStatus as ChallengeCompletionStatus)) {
      push(
        "toStatus",
        `Transition from '${transition.fromStatus}' to '${transition.toStatus}' is not permitted. ` +
          `'${transition.fromStatus}' is a terminal state or the target state is not reachable from it.`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// validateChallengeParticipation
// ---------------------------------------------------------------------------

/**
 * Validates a ChallengeParticipation record against structural constraints and
 * cross-field business rules.
 *
 * Cross-field rules:
 * - Responded and Completed events must include a non-empty response.
 * - Skipped events must not include a response.
 * - skipReason, when present, must be a non-empty string not exceeding the
 *   CHALLENGE_SKIP_REASON_MAX_LENGTH limit.
 * - response, when present, must be a non-empty string not exceeding the
 *   CHALLENGE_RESPONSE_MAX_LENGTH limit.
 * - Presented and Expired events must not carry a response or skipReason.
 *
 * @param participation - The participation record to validate.
 * @returns A ChallengeParticipationValidationResult with any errors found.
 */
export function validateChallengeParticipation(
  participation: ChallengeParticipation
): ChallengeParticipationValidationResult {
  const errors: ChallengeParticipationValidationError[] = [];
  const participationId =
    typeof participation?.participationId === "string"
      ? participation.participationId
      : "(unknown)";
  const record = participation as unknown as Record<string, unknown>;
  const push = (field: string, message: string) =>
    errors.push({ participationId, field, message });

  // Field-level constraints.
  applyFieldConstraints(record, CHALLENGE_PARTICIPATION_SCHEMA, push);

  const eventType = participation.eventType;

  // Cross-field: response requirements by event type.
  if (
    eventType === ChallengeLifecycleEventType.Responded ||
    eventType === ChallengeLifecycleEventType.Completed
  ) {
    if (participation.response === undefined || participation.response === null) {
      push(
        "response",
        `A '${eventType}' event must include a non-empty response.`
      );
    } else if (typeof participation.response !== "string") {
      push("response", `Field 'response' must be a string.`);
    } else if (participation.response.length === 0) {
      push("response", `Field 'response' must not be empty for a '${eventType}' event.`);
    } else if (participation.response.length > CHALLENGE_RESPONSE_MAX_LENGTH) {
      push(
        "response",
        `Field 'response' must not exceed ${CHALLENGE_RESPONSE_MAX_LENGTH} characters.`
      );
    }
  }

  if (
    eventType === ChallengeLifecycleEventType.Presented ||
    eventType === ChallengeLifecycleEventType.Expired
  ) {
    if (participation.response !== undefined) {
      push(
        "response",
        `Field 'response' must not be present on a '${eventType}' event.`
      );
    }
    if (participation.skipReason !== undefined) {
      push(
        "skipReason",
        `Field 'skipReason' must not be present on a '${eventType}' event.`
      );
    }
  }

  if (eventType === ChallengeLifecycleEventType.Skipped) {
    if (participation.response !== undefined) {
      push("response", `Field 'response' must not be present on a 'skipped' event.`);
    }
  }

  // Validate optional skipReason if present.
  if (participation.skipReason !== undefined) {
    if (typeof participation.skipReason !== "string") {
      push("skipReason", `Field 'skipReason' must be a string when provided.`);
    } else if (participation.skipReason.length === 0) {
      push("skipReason", `Field 'skipReason' must not be empty when provided.`);
    } else if (participation.skipReason.length > CHALLENGE_SKIP_REASON_MAX_LENGTH) {
      push(
        "skipReason",
        `Field 'skipReason' must not exceed ${CHALLENGE_SKIP_REASON_MAX_LENGTH} characters.`
      );
    }
  }

  // Validate optional response if present (for event types where it is optional).
  if (
    participation.response !== undefined &&
    eventType !== ChallengeLifecycleEventType.Responded &&
    eventType !== ChallengeLifecycleEventType.Completed
  ) {
    // Already handled the Presented/Expired case above; remaining case is
    // any unknown eventType that passed schema validation.
    // No additional action needed here.
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// validateChallengeCompletionRecord
// ---------------------------------------------------------------------------

/**
 * Validates a ChallengeCompletionRecord against structural constraints and
 * cross-field business rules.
 *
 * Cross-field rules:
 * - finalStatus must be Completed or Skipped (never Pending).
 * - Completed records must include a non-empty response not exceeding
 *   CHALLENGE_RESPONSE_MAX_LENGTH.
 * - Skipped records must not include a response.
 * - skipReason, when present on a Skipped record, must be a non-empty string
 *   not exceeding CHALLENGE_SKIP_REASON_MAX_LENGTH.
 * - Completed records must not include a skipReason.
 *
 * @param completionRecord - The completion record to validate.
 * @returns A ChallengeCompletionRecordValidationResult with any errors found.
 */
export function validateChallengeCompletionRecord(
  completionRecord: ChallengeCompletionRecord
): ChallengeCompletionRecordValidationResult {
  const errors: ChallengeCompletionRecordValidationError[] = [];
  const recordId =
    typeof completionRecord?.recordId === "string"
      ? completionRecord.recordId
      : "(unknown)";
  const record = completionRecord as unknown as Record<string, unknown>;
  const push = (field: string, message: string) =>
    errors.push({ recordId, field, message });

  // Field-level constraints (also validates that finalStatus is Completed or Skipped).
  applyFieldConstraints(record, CHALLENGE_COMPLETION_RECORD_SCHEMA, push);

  const { finalStatus, response, skipReason } = completionRecord;

  // Cross-field: Completed records require a non-empty response.
  if (finalStatus === ChallengeCompletionStatus.Completed) {
    if (response === undefined || response === null) {
      push(
        "response",
        `A completion record with finalStatus 'completed' must include a non-empty response.`
      );
    } else if (typeof response !== "string") {
      push("response", `Field 'response' must be a string.`);
    } else if (response.length === 0) {
      push("response", `Field 'response' must not be empty for a 'completed' record.`);
    } else if (response.length > CHALLENGE_RESPONSE_MAX_LENGTH) {
      push(
        "response",
        `Field 'response' must not exceed ${CHALLENGE_RESPONSE_MAX_LENGTH} characters.`
      );
    }
    // Completed records must not carry a skipReason.
    if (skipReason !== undefined) {
      push(
        "skipReason",
        `Field 'skipReason' must not be present on a 'completed' record.`
      );
    }
  }

  // Cross-field: Skipped records must not include a response.
  if (finalStatus === ChallengeCompletionStatus.Skipped) {
    if (response !== undefined) {
      push(
        "response",
        `Field 'response' must not be present on a 'skipped' completion record.`
      );
    }
    // Validate optional skipReason for Skipped records.
    if (skipReason !== undefined) {
      if (typeof skipReason !== "string") {
        push("skipReason", `Field 'skipReason' must be a string when provided.`);
      } else if (skipReason.length === 0) {
        push("skipReason", `Field 'skipReason' must not be empty when provided.`);
      } else if (skipReason.length > CHALLENGE_SKIP_REASON_MAX_LENGTH) {
        push(
          "skipReason",
          `Field 'skipReason' must not exceed ${CHALLENGE_SKIP_REASON_MAX_LENGTH} characters.`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// validateChallengeCompletionRecordCollection
// ---------------------------------------------------------------------------

/**
 * Validates a collection of ChallengeCompletionRecords, enforcing uniqueness
 * of recordId values and applying per-record validation to each entry.
 *
 * @param records - Array of ChallengeCompletionRecord items to validate.
 * @returns A ChallengeCompletionRecordValidationResult aggregating all errors.
 */
export function validateChallengeCompletionRecordCollection(
  records: ChallengeCompletionRecord[]
): ChallengeCompletionRecordValidationResult {
  const allErrors: ChallengeCompletionRecordValidationError[] = [];

  const seenRecordIds = new Map<string, number>();
  const seenChallengeIds = new Map<string, number>();

  records.forEach((rec, idx) => {
    // Uniqueness: recordId
    if (typeof rec?.recordId === "string") {
      if (seenRecordIds.has(rec.recordId)) {
        allErrors.push({
          recordId: rec.recordId,
          field: "recordId",
          message: `Duplicate recordId '${rec.recordId}' found at index ${idx} (first seen at index ${seenRecordIds.get(rec.recordId)}).`,
        });
      } else {
        seenRecordIds.set(rec.recordId, idx);
      }
    }

    // Uniqueness: challengeId — at most one completion record per challenge.
    if (typeof rec?.challengeId === "string") {
      if (seenChallengeIds.has(rec.challengeId)) {
        allErrors.push({
          recordId: rec.recordId,
          field: "challengeId",
          message: `Duplicate challengeId '${rec.challengeId}' found at index ${idx}. Each challenge may have at most one completion record (first seen at index ${seenChallengeIds.get(rec.challengeId)}).`,
        });
      } else {
        seenChallengeIds.set(rec.challengeId, idx);
      }
    }
  });

  // Per-record validation.
  records.forEach((rec) => {
    const result = validateChallengeCompletionRecord(rec);
    allErrors.push(...result.errors);
  });

  return { valid: allErrors.length === 0, errors: allErrors };
}
