/**
 * validation.ts — Protocol and Challenge Validation Rules
 *
 * Implements the validation layer for Protocol and Challenge records.
 * Rules enforce structural correctness, field-level constraints, and
 * cross-field business rules derived from docs/DOMAIN_MODEL.md and
 * docs/ARCHITECTURE_LOCK.md.
 *
 * MOAT NOTICE (M-002): This module does NOT implement the protocol generation
 * algorithm. It only validates that a provided Protocol record conforms to the
 * structural schema. The generation logic is the exclusive concern of the
 * moat-protected protocol intelligence layer.
 *
 * MOAT NOTICE (M-003): This module does NOT implement challenge engine rules.
 * It only validates structural correctness of Challenge records. The rule
 * evaluation logic must not be reconstructed here.
 */

import {
  Challenge,
  ChallengeValidationError,
  ChallengeValidationResult,
  Protocol,
  ProtocolPhase,
  ProtocolValidationError,
  ProtocolValidationResult,
} from "./types";
import {
  CHALLENGE_SCHEMA,
  FieldConstraint,
  PROTOCOL_MAX_DURATION_DAYS,
  PROTOCOL_MAX_PHASES,
  PROTOCOL_MIN_DURATION_DAYS,
  PROTOCOL_MIN_PHASES,
  PROTOCOL_PHASE_SCHEMA,
  PROTOCOL_SCHEMA,
  SEMVER_PATTERN,
} from "./schema";

// ---------------------------------------------------------------------------
// Low-level field validator (shared across Protocol and Challenge layers)
//
// Uses a generic push callback so the same logic can populate typed error
// arrays (ProtocolValidationError | ChallengeValidationError) without
// duplicating ~200 lines of switch/case code.
// ---------------------------------------------------------------------------

export type ErrorPush = (field: string, message: string) => void;

/**
 * Applies all field constraints from a schema record to a data record,
 * pushing any violations to the provided error callback.
 *
 * Exported as a shared utility for consuming modules (e.g., src/challenge/).
 * Not re-exported through src/protocol/index.ts to keep the public API clean.
 */
export function applyFieldConstraints(
  record: Record<string, unknown>,
  schema: Record<string, FieldConstraint>,
  push: ErrorPush
): void {
  for (const [field, constraint] of Object.entries(schema)) {
    applyConstraint(record[field], field, constraint, push);
  }
}

/**
 * Applies a single field constraint to a value, pushing any violations to the
 * provided error callback.
 *
 * Handles string, number, boolean, array, and enum constraint types.
 * Exported as a shared utility for consuming modules (e.g., src/challenge/).
 * Not re-exported through src/protocol/index.ts to keep the public API clean.
 *
 * @param value - The value to validate.
 * @param field - The field name (used in error messages).
 * @param constraint - The constraint definition from a schema record.
 * @param push - Callback to receive any validation errors.
 */
export function applyConstraint(
  value: unknown,
  field: string,
  constraint: FieldConstraint,
  push: ErrorPush
): void {
  if (value === undefined || value === null) {
    if (constraint.required) {
      push(field, `Required field '${field}' is missing.`);
    }
    return;
  }

  switch (constraint.type) {
    case "string": {
      if (typeof value !== "string") {
        push(field, `Field '${field}' must be a string.`);
        return;
      }
      if (constraint.minLength !== undefined && value.length < constraint.minLength) {
        push(field, `Field '${field}' must be at least ${constraint.minLength} characters.`);
      }
      if (constraint.maxLength !== undefined && value.length > constraint.maxLength) {
        push(field, `Field '${field}' must not exceed ${constraint.maxLength} characters.`);
      }
      if (constraint.pattern && !constraint.pattern.test(value)) {
        push(field, `Field '${field}' does not match the required format.`);
      }
      break;
    }

    case "number": {
      if (typeof value !== "number" || isNaN(value)) {
        push(field, `Field '${field}' must be a number.`);
        return;
      }
      if (constraint.min !== undefined && value < constraint.min) {
        push(field, `Field '${field}' must be >= ${constraint.min}.`);
      }
      if (constraint.max !== undefined && value > constraint.max) {
        push(field, `Field '${field}' must be <= ${constraint.max}.`);
      }
      break;
    }

    case "boolean": {
      if (typeof value !== "boolean") {
        push(field, `Field '${field}' must be a boolean.`);
      }
      break;
    }

    case "array": {
      if (!Array.isArray(value)) {
        push(field, `Field '${field}' must be an array.`);
        return;
      }
      if (constraint.minItems !== undefined && value.length < constraint.minItems) {
        push(field, `Field '${field}' must contain at least ${constraint.minItems} item(s).`);
      }
      if (constraint.maxItems !== undefined && value.length > constraint.maxItems) {
        push(field, `Field '${field}' must not contain more than ${constraint.maxItems} item(s).`);
      }
      break;
    }

    case "enum": {
      const allowed = new Set(constraint.allowedValues);
      if (!allowed.has(value as string)) {
        push(field, `Field '${field}' contains unknown value '${String(value)}'.`);
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// ProtocolPhase validator
// ---------------------------------------------------------------------------

function validateProtocolPhases(
  phases: ProtocolPhase[],
  protocolId: string,
  protocolDurationDays: number,
  errors: ProtocolValidationError[]
): void {
  const push = (field: string, message: string) => errors.push({ protocolId, field, message });

  if (phases.length < PROTOCOL_MIN_PHASES) {
    push("phases", `A protocol must contain at least ${PROTOCOL_MIN_PHASES} phase(s). Found ${phases.length}.`);
  }

  if (phases.length > PROTOCOL_MAX_PHASES) {
    push("phases", `A protocol must not contain more than ${PROTOCOL_MAX_PHASES} phases. Found ${phases.length}.`);
  }

  const seenIndices = new Set<number>();
  let phaseDurationSum = 0;

  phases.forEach((phase, arrayIdx) => {
    const record = phase as unknown as Record<string, unknown>;
    const prefix = `phases[${arrayIdx}]`;
    const phasePush = (field: string, message: string) => errors.push({ protocolId, field, message });

    for (const [field, constraint] of Object.entries(PROTOCOL_PHASE_SCHEMA)) {
      applyConstraint(record[field], `${prefix}.${field}`, constraint, phasePush);
    }

    // phaseIndex must be a non-negative integer.
    if (typeof phase.phaseIndex === "number") {
      if (!Number.isInteger(phase.phaseIndex) || phase.phaseIndex < 0) {
        phasePush(
          `${prefix}.phaseIndex`,
          `Field '${prefix}.phaseIndex' must be a non-negative integer. Got ${phase.phaseIndex}.`
        );
      } else if (seenIndices.has(phase.phaseIndex)) {
        phasePush(
          `${prefix}.phaseIndex`,
          `Duplicate phaseIndex ${phase.phaseIndex} found at array position ${arrayIdx}.`
        );
      } else {
        seenIndices.add(phase.phaseIndex);
      }
    }

    // durationDays must be a positive integer.
    if (typeof phase.durationDays === "number") {
      if (!Number.isInteger(phase.durationDays) || phase.durationDays < 1) {
        phasePush(
          `${prefix}.durationDays`,
          `Field '${prefix}.durationDays' must be a positive integer. Got ${phase.durationDays}.`
        );
      } else {
        phaseDurationSum += phase.durationDays;
      }
    }

    // Each phase must have at least one blend or oil reference.
    const hasBlends = Array.isArray(phase.blendIds) && phase.blendIds.length > 0;
    const hasOils = Array.isArray(phase.oilIds) && phase.oilIds.length > 0;
    if (!hasBlends && !hasOils) {
      phasePush(`${prefix}`, `Phase at index ${arrayIdx} must reference at least one blend or oil.`);
    }
  });

  // Phase duration sum must equal the protocol's durationDays.
  if (
    phases.length > 0 &&
    phases.every((p) => typeof p.durationDays === "number" && Number.isInteger(p.durationDays)) &&
    phaseDurationSum !== protocolDurationDays &&
    typeof protocolDurationDays === "number"
  ) {
    push(
      "durationDays",
      `Protocol durationDays (${protocolDurationDays}) must equal the sum of all phase durationDays (${phaseDurationSum}).`
    );
  }
}

// ---------------------------------------------------------------------------
// Primary Protocol validation entrypoint
// ---------------------------------------------------------------------------

/**
 * Validates a single Protocol record against the protocol schema and business rules.
 *
 * @param protocol - The protocol record to validate.
 * @returns A ProtocolValidationResult indicating whether the record is valid
 *          and listing any errors found.
 */
export function validateProtocol(protocol: Protocol): ProtocolValidationResult {
  const errors: ProtocolValidationError[] = [];
  const protocolId =
    typeof protocol?.protocolId === "string" ? protocol.protocolId : "(unknown)";
  const record = protocol as unknown as Record<string, unknown>;
  const push = (field: string, message: string) => errors.push({ protocolId, field, message });

  // Top-level field constraints.
  for (const [field, constraint] of Object.entries(PROTOCOL_SCHEMA)) {
    applyConstraint(record[field], field, constraint, push);
  }

  // Semantic version check (LOCK-005).
  if (typeof protocol.version === "string" && !SEMVER_PATTERN.test(protocol.version)) {
    push("version", `Protocol version '${protocol.version}' does not follow semantic versioning (MAJOR.MINOR.PATCH).`);
  }

  // durationDays must be a positive integer.
  if (
    typeof protocol.durationDays === "number" &&
    (!Number.isInteger(protocol.durationDays) || protocol.durationDays < PROTOCOL_MIN_DURATION_DAYS)
  ) {
    push("durationDays", `Protocol durationDays must be a positive integer >= ${PROTOCOL_MIN_DURATION_DAYS}.`);
  }

  if (
    typeof protocol.durationDays === "number" &&
    protocol.durationDays > PROTOCOL_MAX_DURATION_DAYS
  ) {
    push("durationDays", `Protocol durationDays must not exceed ${PROTOCOL_MAX_DURATION_DAYS}.`);
  }

  // Validate phases array.
  if (Array.isArray(protocol.phases)) {
    validateProtocolPhases(protocol.phases, protocolId, protocol.durationDays, errors);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all protocols in a collection, ensuring uniqueness of protocolId values.
 *
 * @param protocols - Array of Protocol records to validate.
 * @returns A ProtocolValidationResult aggregating all errors across the collection.
 */
export function validateProtocolCollection(protocols: Protocol[]): ProtocolValidationResult {
  const allErrors: ProtocolValidationError[] = [];

  const seen = new Map<string, number>();
  protocols.forEach((protocol, idx) => {
    if (typeof protocol?.protocolId === "string") {
      if (seen.has(protocol.protocolId)) {
        allErrors.push({
          protocolId: protocol.protocolId,
          field: "protocolId",
          message: `Duplicate protocolId '${protocol.protocolId}' found at index ${idx} (first seen at index ${seen.get(protocol.protocolId)}).`,
        });
      } else {
        seen.set(protocol.protocolId, idx);
      }
    }
  });

  protocols.forEach((protocol) => {
    const result = validateProtocol(protocol);
    allErrors.push(...result.errors);
  });

  return { valid: allErrors.length === 0, errors: allErrors };
}

// ---------------------------------------------------------------------------
// Challenge validation
// ---------------------------------------------------------------------------

/**
 * Validates a single Challenge record against the challenge schema and business rules.
 *
 * @param challenge - The challenge record to validate.
 * @returns A ChallengeValidationResult indicating whether the record is valid
 *          and listing any errors found.
 */
export function validateChallenge(challenge: Challenge): ChallengeValidationResult {
  const errors: ChallengeValidationError[] = [];
  const challengeId =
    typeof challenge?.challengeId === "string" ? challenge.challengeId : "(unknown)";
  const record = challenge as unknown as Record<string, unknown>;
  const push = (field: string, message: string) => errors.push({ challengeId, field, message });

  // Top-level field constraints.
  for (const [field, constraint] of Object.entries(CHALLENGE_SCHEMA)) {
    applyConstraint(record[field], field, constraint, push);
  }

  // dueDay must be a positive integer.
  if (
    typeof challenge.dueDay === "number" &&
    (!Number.isInteger(challenge.dueDay) || challenge.dueDay < 1)
  ) {
    push("dueDay", `Challenge dueDay must be a positive integer >= 1. Got ${challenge.dueDay}.`);
  }

  // Optional response field — if present, must be a non-empty string.
  if (challenge.response !== undefined) {
    if (typeof challenge.response !== "string") {
      push("response", `Field 'response' must be a string when provided.`);
    } else if (challenge.response.length === 0) {
      push("response", `Field 'response' must not be an empty string when provided.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all challenges in a collection, ensuring uniqueness of challengeId values.
 *
 * @param challenges - Array of Challenge records to validate.
 * @returns A ChallengeValidationResult aggregating all errors across the collection.
 */
export function validateChallengeCollection(challenges: Challenge[]): ChallengeValidationResult {
  const allErrors: ChallengeValidationError[] = [];

  const seen = new Map<string, number>();
  challenges.forEach((challenge, idx) => {
    if (typeof challenge?.challengeId === "string") {
      if (seen.has(challenge.challengeId)) {
        allErrors.push({
          challengeId: challenge.challengeId,
          field: "challengeId",
          message: `Duplicate challengeId '${challenge.challengeId}' found at index ${idx} (first seen at index ${seen.get(challenge.challengeId)}).`,
        });
      } else {
        seen.set(challenge.challengeId, idx);
      }
    }
  });

  challenges.forEach((challenge) => {
    const result = validateChallenge(challenge);
    allErrors.push(...result.errors);
  });

  return { valid: allErrors.length === 0, errors: allErrors };
}
