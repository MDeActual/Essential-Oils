/**
 * validation.ts — Simulation Layer Validation and Isolation Guards
 *
 * Implements validation for ContributorRecord entities and provides the
 * production-safety guards required by LOCK-003.
 *
 * Key exports:
 * - validateContributorRecord() — structural and business-rule validation
 * - validateContributorRecordCollection() — collection validation with ID uniqueness
 * - assertSyntheticIsolation() — verifies a batch contains only synthetic records
 * - filterAnalyticsEligible() — returns only production-eligible real_contributor records
 *
 * SIMULATION SAFETY NOTICE (LOCK-003):
 * filterAnalyticsEligible() is the canonical production gateway. It enforces:
 *   1. data_origin === real_contributor
 *   2. exclusion_status === included
 * Any caller that feeds data into production analytics MUST pass records
 * through this function first.
 *
 * MOAT NOTICE (M-004): This module does NOT implement the analytics signal
 * model. It only validates structural correctness and enforces isolation rules.
 */

import {
  ADHERENCE_EXCLUSION_THRESHOLD,
  ADHERENCE_SCORE_MAX,
  ADHERENCE_SCORE_MIN,
  CHALLENGE_COMPLETION_RATE_MAX,
  CHALLENGE_COMPLETION_RATE_MIN,
  CONTRIBUTOR_RECORD_SCHEMA,
  EXCLUSION_REASON_CONSTRAINT,
  FieldConstraint,
} from "./schema";
import {
  ContributorRecord,
  ContributorRecordValidationResult,
  DataOrigin,
  ExclusionReason,
  ExclusionStatus,
  SimulationBatch,
  SimulationValidationError,
  SyntheticContributorRecord,
  SyntheticIsolationResult,
} from "./types";

// ---------------------------------------------------------------------------
// Low-level field validator (mirrors pattern from ontology/blend/protocol)
// ---------------------------------------------------------------------------

type ErrorPush = (field: string, message: string) => void;

function applyConstraint(
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
// ContributorRecord validation
// ---------------------------------------------------------------------------

/**
 * Validates a single ContributorRecord against the schema and LOCK-003
 * business rules.
 *
 * Business rules enforced:
 * 1. adherenceScore must be an integer in [0, 100].
 * 2. challengeCompletionRate must be an integer in [0, 100].
 * 3. Records with adherenceScore < ADHERENCE_EXCLUSION_THRESHOLD must have
 *    exclusionStatus === Excluded.
 * 4. Records with exclusionStatus === Excluded must have an exclusionReason.
 * 5. Synthetic records (dataOrigin === SyntheticSimulation) must have
 *    exclusionStatus === Excluded.
 *
 * @param record - The contributor record to validate.
 * @returns A ContributorRecordValidationResult with any errors found.
 */
export function validateContributorRecord(
  record: ContributorRecord
): ContributorRecordValidationResult {
  const errors: SimulationValidationError[] = [];
  const recordId =
    typeof record?.recordId === "string" ? record.recordId : "(unknown)";
  const push = (field: string, message: string) =>
    errors.push({ recordId, field, message });

  const raw = record as unknown as Record<string, unknown>;

  // Apply schema constraints.
  for (const [field, constraint] of Object.entries(CONTRIBUTOR_RECORD_SCHEMA)) {
    applyConstraint(raw[field], field, constraint, push);
  }

  // adherenceScore must be a non-negative integer.
  if (typeof record.adherenceScore === "number") {
    if (!Number.isInteger(record.adherenceScore)) {
      push(
        "adherenceScore",
        `Field 'adherenceScore' must be a whole number. Got ${record.adherenceScore}.`
      );
    }
  }

  // challengeCompletionRate must be a non-negative integer.
  if (typeof record.challengeCompletionRate === "number") {
    if (!Number.isInteger(record.challengeCompletionRate)) {
      push(
        "challengeCompletionRate",
        `Field 'challengeCompletionRate' must be a whole number. Got ${record.challengeCompletionRate}.`
      );
    }
  }

  // Optional exclusionReason — if present, must be a valid enum value.
  if (raw.exclusionReason !== undefined) {
    applyConstraint(raw.exclusionReason, "exclusionReason", EXCLUSION_REASON_CONSTRAINT, push);
  }

  // LOCK-003: Records with adherence below threshold must be excluded.
  if (
    typeof record.adherenceScore === "number" &&
    Number.isInteger(record.adherenceScore) &&
    record.adherenceScore < ADHERENCE_EXCLUSION_THRESHOLD &&
    record.exclusionStatus !== ExclusionStatus.Excluded
  ) {
    push(
      "exclusionStatus",
      `Record with adherenceScore ${record.adherenceScore} (< ${ADHERENCE_EXCLUSION_THRESHOLD}) ` +
        `must have exclusionStatus '${ExclusionStatus.Excluded}' (LOCK-003).`
    );
  }

  // LOCK-003: Excluded records must carry an exclusionReason.
  if (
    record.exclusionStatus === ExclusionStatus.Excluded &&
    record.exclusionReason === undefined
  ) {
    push(
      "exclusionReason",
      `Records with exclusionStatus '${ExclusionStatus.Excluded}' must include an exclusionReason (LOCK-003).`
    );
  }

  // LOCK-003: Synthetic records must always be excluded.
  if (
    record.dataOrigin === DataOrigin.SyntheticSimulation &&
    record.exclusionStatus !== ExclusionStatus.Excluded
  ) {
    push(
      "exclusionStatus",
      `Synthetic records (dataOrigin '${DataOrigin.SyntheticSimulation}') must always have ` +
        `exclusionStatus '${ExclusionStatus.Excluded}' (LOCK-003).`
    );
  }

  // outcomeNotes — if present, must be a non-empty string.
  if (raw.outcomeNotes !== undefined) {
    if (typeof raw.outcomeNotes !== "string") {
      push("outcomeNotes", `Field 'outcomeNotes' must be a string when provided.`);
    } else if (raw.outcomeNotes.length === 0) {
      push("outcomeNotes", `Field 'outcomeNotes' must not be an empty string when provided.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all contributor records in a collection, enforcing ID uniqueness.
 *
 * @param records - Array of ContributorRecord entries to validate.
 * @returns A ContributorRecordValidationResult aggregating all errors.
 */
export function validateContributorRecordCollection(
  records: ContributorRecord[]
): ContributorRecordValidationResult {
  const allErrors: SimulationValidationError[] = [];

  const seen = new Map<string, number>();
  records.forEach((record, idx) => {
    if (typeof record?.recordId === "string") {
      if (seen.has(record.recordId)) {
        allErrors.push({
          recordId: record.recordId,
          field: "recordId",
          message: `Duplicate recordId '${record.recordId}' found at index ${idx} (first seen at index ${seen.get(record.recordId)}).`,
        });
      } else {
        seen.set(record.recordId, idx);
      }
    }
  });

  records.forEach((record) => {
    const result = validateContributorRecord(record);
    allErrors.push(...result.errors);
  });

  return { valid: allErrors.length === 0, errors: allErrors };
}

// ---------------------------------------------------------------------------
// Synthetic isolation guard (LOCK-003)
// ---------------------------------------------------------------------------

/**
 * Asserts that every record in a collection carries synthetic isolation flags.
 *
 * This guard is the primary production safety boundary. Consuming layers that
 * receive a SimulationBatch or any array of records from the simulation
 * environment MUST call this function before forwarding records to any
 * production analytics path.
 *
 * A record passes isolation when:
 * - dataOrigin === DataOrigin.SyntheticSimulation
 * - exclusionStatus === ExclusionStatus.Excluded
 *
 * @param records - Records to inspect.
 * @returns A SyntheticIsolationResult indicating whether all records are safe.
 */
export function assertSyntheticIsolation(
  records: ContributorRecord[]
): SyntheticIsolationResult {
  const violations: SimulationValidationError[] = [];

  records.forEach((record) => {
    const recordId =
      typeof record?.recordId === "string" ? record.recordId : "(unknown)";

    if (record.dataOrigin !== DataOrigin.SyntheticSimulation) {
      violations.push({
        recordId,
        field: "dataOrigin",
        message:
          `Record '${recordId}' has dataOrigin '${record.dataOrigin}'; ` +
          `expected '${DataOrigin.SyntheticSimulation}' for synthetic isolation (LOCK-003).`,
      });
    }

    if (record.exclusionStatus !== ExclusionStatus.Excluded) {
      violations.push({
        recordId,
        field: "exclusionStatus",
        message:
          `Record '${recordId}' has exclusionStatus '${record.exclusionStatus}'; ` +
          `expected '${ExclusionStatus.Excluded}' for synthetic isolation (LOCK-003).`,
      });
    }
  });

  return { isolated: violations.length === 0, violations };
}

/**
 * Asserts synthetic isolation on a complete SimulationBatch.
 *
 * In addition to per-record checks, also verifies that the SimulationContext
 * carries isSyntheticIsolated === true.
 *
 * @param batch - The SimulationBatch to inspect.
 * @returns A SyntheticIsolationResult indicating whether the batch is safe.
 */
export function assertBatchIsolation(batch: SimulationBatch): SyntheticIsolationResult {
  const violations: SimulationValidationError[] = [];

  if (!batch.context.isSyntheticIsolated) {
    violations.push({
      field: "context.isSyntheticIsolated",
      message:
        `SimulationBatch context '${batch.context.simulationId}' does not carry ` +
        `isSyntheticIsolated=true. Batch must not be forwarded to production analytics (LOCK-003).`,
    });
  }

  const recordResult = assertSyntheticIsolation(batch.records);
  violations.push(...recordResult.violations);

  return { isolated: violations.length === 0, violations };
}

// ---------------------------------------------------------------------------
// Production analytics gateway (LOCK-003)
// ---------------------------------------------------------------------------

/**
 * Filters a collection of ContributorRecords to those eligible for
 * production analytics.
 *
 * Eligibility criteria (LOCK-003):
 * 1. dataOrigin === DataOrigin.RealContributor
 * 2. exclusionStatus === ExclusionStatus.Included
 *
 * This function is the canonical production gateway. Any pipeline that feeds
 * records into analytics scoring MUST pass its inputs through this filter.
 * Synthetic records are structurally blocked from passing through.
 *
 * @param records - Mixed or homogeneous collection of ContributorRecords.
 * @returns Only the records that are analytics-eligible.
 */
export function filterAnalyticsEligible(
  records: ContributorRecord[]
): ContributorRecord[] {
  return records.filter(
    (r) =>
      r.dataOrigin === DataOrigin.RealContributor &&
      r.exclusionStatus === ExclusionStatus.Included
  );
}
