/**
 * evolution.ts — Protocol Evolution Advisory Service
 *
 * Implements the advisory output layer of the Protocol Evolution System as
 * defined in docs/protocol_evolution_system.md and the Protocol Evolution Agent
 * role in AGENTS.md.
 *
 * AUTHORITY: The Protocol Evolution Agent has LOW authority — advisory only.
 * This module surfaces evolution candidates for human review; it cannot modify
 * protocols, bump versions, or write ADR entries autonomously.
 *
 * MOAT NOTICE (M-004): The proprietary signal model that translates contributor
 * data into evolution candidates is moat-protected and must NOT be implemented
 * here. This module implements only the structural advisory contract: what
 * constitutes an evolution signal type, how candidates are described, and
 * what governance constraints apply.
 *
 * Governing rules:
 * - LOCK-005: Protocol versions follow semantic versioning (MAJOR.MINOR.PATCH).
 * - LOCK-003: Only real_contributor records with adherence_score ≥ 50 are
 *   eligible inputs to evolution signals.
 * - LOCK-004: Protocol Evolution Agent is advisory only; no autonomous changes.
 */

import { Protocol, ProtocolStatus } from "./types";

// ---------------------------------------------------------------------------
// Evolution signal types
// ---------------------------------------------------------------------------

/**
 * Observable signal categories that may indicate a protocol is a candidate
 * for evolution.
 *
 * MOAT NOTICE (M-004): The methodology that produces signals from raw
 * contributor data is moat-protected. These categories represent the
 * observable public contract only.
 */
export enum EvolutionSignalType {
  /** Adherence rate has dropped below the threshold across a cohort. */
  LowAdherence = "low_adherence",
  /** Skip rate for one or more challenge types has exceeded a threshold. */
  HighSkipRate = "high_skip_rate",
  /** Completion rate for a specific protocol phase is significantly below cohort baseline. */
  PhaseCompletionGap = "phase_completion_gap",
  /** Protocol version is outdated relative to domain model changes. */
  VersionLag = "version_lag",
}

/**
 * Recommended version bump type for a proposed protocol amendment.
 *
 * Governed by rule EV-001 (protocol_evolution_system.md):
 * - PATCH: documentation corrections, metadata; no behavioral change.
 * - MINOR: evidence-driven amendment to oil selections, challenge sequencing, timing.
 * - MAJOR: structural redesign of protocol phases or goal.
 */
export enum VersionBumpType {
  Patch = "patch",
  Minor = "minor",
  Major = "major",
}

// ---------------------------------------------------------------------------
// Evolution candidate
// ---------------------------------------------------------------------------

/**
 * An evolution candidate is a structured advisory record describing a
 * protocol that the Protocol Evolution Agent believes warrants human review
 * for possible amendment.
 *
 * All candidates are advisory only. No autonomous protocol modification
 * may be triggered from this record.
 */
export interface EvolutionCandidate {
  /** The protocol being flagged for review. */
  protocolId: string;
  /** The current semantic version of the protocol. */
  currentVersion: string;
  /** The observable signal(s) that triggered this candidate recommendation. */
  signals: EvolutionSignalType[];
  /** Human-readable description of the observed signal and its context. */
  rationale: string;
  /** Recommended version bump type if an amendment is approved. */
  recommendedBump: VersionBumpType;
  /** ISO 8601 timestamp when this candidate was generated. */
  generatedAt: string;
  /**
   * Advisory note surfaced to the human project lead.
   * Describes the observed problem and a high-level direction for review.
   */
  advisoryNote: string;
}

/**
 * Validation error for an EvolutionCandidate record.
 */
export interface EvolutionCandidateValidationError {
  protocolId?: string;
  field: string;
  message: string;
}

/**
 * Result of an evolution candidate validation operation.
 */
export interface EvolutionCandidateValidationResult {
  valid: boolean;
  errors: EvolutionCandidateValidationError[];
}

// ---------------------------------------------------------------------------
// Governance constraints
// ---------------------------------------------------------------------------

/**
 * Validates that a proposed EvolutionCandidate meets structural governance
 * constraints before it is surfaced to the human project lead.
 *
 * Rules enforced:
 * - protocolId must be a non-empty string.
 * - currentVersion must be a valid semver string (MAJOR.MINOR.PATCH).
 * - signals must be a non-empty array of known EvolutionSignalType values.
 * - rationale and advisoryNote must be non-empty strings.
 * - recommendedBump must be a known VersionBumpType value.
 * - generatedAt must be an ISO 8601 timestamp.
 *
 * @param candidate - The evolution candidate to validate.
 * @returns EvolutionCandidateValidationResult with any errors found.
 */
export function validateEvolutionCandidate(
  candidate: EvolutionCandidate
): EvolutionCandidateValidationResult {
  const errors: EvolutionCandidateValidationError[] = [];
  const protocolId =
    typeof candidate?.protocolId === "string" ? candidate.protocolId : "(unknown)";
  const push = (field: string, message: string) =>
    errors.push({ protocolId, field, message });

  if (!candidate || typeof candidate !== "object") {
    push("candidate", "Evolution candidate must be a non-null object.");
    return { valid: false, errors };
  }

  // protocolId
  if (typeof candidate.protocolId !== "string" || candidate.protocolId.length === 0) {
    push("protocolId", "Field 'protocolId' must be a non-empty string.");
  }

  // currentVersion — semver MAJOR.MINOR.PATCH
  const SEMVER_RE = /^\d+\.\d+\.\d+$/;
  if (
    typeof candidate.currentVersion !== "string" ||
    !SEMVER_RE.test(candidate.currentVersion)
  ) {
    push(
      "currentVersion",
      "Field 'currentVersion' must be a semantic version string (MAJOR.MINOR.PATCH)."
    );
  }

  // signals
  if (!Array.isArray(candidate.signals) || candidate.signals.length === 0) {
    push("signals", "Field 'signals' must be a non-empty array of EvolutionSignalType values.");
  } else {
    const validSignals = new Set<string>(Object.values(EvolutionSignalType));
    candidate.signals.forEach((s, i) => {
      if (!validSignals.has(s)) {
        push("signals", `Unknown signal type at index ${i}: '${s}'.`);
      }
    });
  }

  // rationale
  if (typeof candidate.rationale !== "string" || candidate.rationale.length === 0) {
    push("rationale", "Field 'rationale' must be a non-empty string.");
  }

  // advisoryNote
  if (typeof candidate.advisoryNote !== "string" || candidate.advisoryNote.length === 0) {
    push("advisoryNote", "Field 'advisoryNote' must be a non-empty string.");
  }

  // recommendedBump
  const validBumps = new Set<string>(Object.values(VersionBumpType));
  if (typeof candidate.recommendedBump !== "string" || !validBumps.has(candidate.recommendedBump)) {
    push(
      "recommendedBump",
      `Field 'recommendedBump' must be one of: ${Object.values(VersionBumpType).join(", ")}.`
    );
  }

  // generatedAt — ISO 8601
  const ISO_RE = /^\d{4}-\d{2}-\d{2}T[\d:.+Z]+$/;
  if (typeof candidate.generatedAt !== "string" || !ISO_RE.test(candidate.generatedAt)) {
    push("generatedAt", "Field 'generatedAt' must be an ISO 8601 timestamp string.");
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Protocol eligibility for evolution
// ---------------------------------------------------------------------------

/**
 * Result of the protocol evolution eligibility check.
 */
export interface ProtocolEvolutionEligibilityResult {
  /** True if the protocol is eligible to be an evolution candidate. */
  eligible: boolean;
  message: string;
}

/**
 * Determines whether a protocol is eligible to be surfaced as an evolution
 * candidate.
 *
 * Eligibility rules:
 * - Protocol must be in `active` or `deprecated` status (draft protocols are
 *   still being constructed; completed protocols are archived).
 * - protocolId must be non-empty.
 *
 * MOAT NOTICE (M-004): The signal scoring methodology that determines whether
 * a specific protocol SHOULD be flagged is moat-protected. This function only
 * enforces structural preconditions.
 *
 * @param protocol - The protocol to check for evolution eligibility.
 * @returns ProtocolEvolutionEligibilityResult.
 */
export function checkProtocolEvolutionEligibility(
  protocol: Protocol
): ProtocolEvolutionEligibilityResult {
  if (!protocol || typeof protocol !== "object") {
    return {
      eligible: false,
      message: "Protocol record is missing or invalid.",
    };
  }

  if (typeof protocol.protocolId !== "string" || protocol.protocolId.length === 0) {
    return {
      eligible: false,
      message: "Protocol is missing a valid protocolId.",
    };
  }

  if (
    protocol.status !== ProtocolStatus.Active &&
    protocol.status !== ProtocolStatus.Deprecated
  ) {
    return {
      eligible: false,
      message: `Protocol '${protocol.protocolId}' has status '${protocol.status}'. Only 'active' and 'deprecated' protocols are eligible for evolution review.`,
    };
  }

  return {
    eligible: true,
    message: `Protocol '${protocol.protocolId}' (status: '${protocol.status}') is eligible for evolution review.`,
  };
}

// ---------------------------------------------------------------------------
// Regression alert
// ---------------------------------------------------------------------------

/**
 * A regression alert flags a protocol whose performance has declined
 * significantly compared to a prior version. Alerts are advisory only and
 * must be reviewed by the human project lead before any protocol action.
 */
export interface ProtocolRegressionAlert {
  /** The protocol identifier affected. */
  protocolId: string;
  /** The version that is showing regression signals. */
  affectedVersion: string;
  /** Observable regression signal types detected. */
  signals: EvolutionSignalType[];
  /** Human-readable description of what regression was observed. */
  description: string;
  /** ISO 8601 timestamp when this alert was generated. */
  generatedAt: string;
}

/**
 * Validates a ProtocolRegressionAlert for structural correctness.
 *
 * @param alert - The regression alert to validate.
 * @returns EvolutionCandidateValidationResult with any errors found.
 */
export function validateRegressionAlert(
  alert: ProtocolRegressionAlert
): EvolutionCandidateValidationResult {
  const errors: EvolutionCandidateValidationError[] = [];
  const protocolId =
    typeof alert?.protocolId === "string" ? alert.protocolId : "(unknown)";
  const push = (field: string, message: string) =>
    errors.push({ protocolId, field, message });

  if (!alert || typeof alert !== "object") {
    push("alert", "Regression alert must be a non-null object.");
    return { valid: false, errors };
  }

  if (typeof alert.protocolId !== "string" || alert.protocolId.length === 0) {
    push("protocolId", "Field 'protocolId' must be a non-empty string.");
  }

  const SEMVER_RE = /^\d+\.\d+\.\d+$/;
  if (
    typeof alert.affectedVersion !== "string" ||
    !SEMVER_RE.test(alert.affectedVersion)
  ) {
    push(
      "affectedVersion",
      "Field 'affectedVersion' must be a semantic version string (MAJOR.MINOR.PATCH)."
    );
  }

  if (!Array.isArray(alert.signals) || alert.signals.length === 0) {
    push("signals", "Field 'signals' must be a non-empty array.");
  } else {
    const validSignals = new Set<string>(Object.values(EvolutionSignalType));
    alert.signals.forEach((s, i) => {
      if (!validSignals.has(s)) {
        push("signals", `Unknown signal type at index ${i}: '${s}'.`);
      }
    });
  }

  if (typeof alert.description !== "string" || alert.description.length === 0) {
    push("description", "Field 'description' must be a non-empty string.");
  }

  const ISO_RE = /^\d{4}-\d{2}-\d{2}T[\d:.+Z]+$/;
  if (typeof alert.generatedAt !== "string" || !ISO_RE.test(alert.generatedAt)) {
    push("generatedAt", "Field 'generatedAt' must be an ISO 8601 timestamp string.");
  }

  return { valid: errors.length === 0, errors };
}
