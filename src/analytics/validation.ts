/**
 * validation.ts — Contributor Record Validation Rules
 *
 * Implements the validation layer for contributor records.
 * Rules enforce structural correctness, field-level constraints,
 * and cross-field business rules derived from docs/DOMAIN_MODEL.md
 * and LOCK-003 in docs/ARCHITECTURE_LOCK.md.
 *
 * LOCK-003 rules enforced here:
 * 1. All records must include dataOrigin and exclusionStatus.
 * 2. Only real_contributor records are analytics-eligible.
 * 3. Records with adherenceScore < 50 must carry exclusionStatus: Excluded.
 * 4. Synthetic simulation data must be isolated (never marked Included).
 */

import {
  AnalyticsValidationError,
  AnalyticsValidationResult,
  ContributorRecord,
  DataOrigin,
  ExclusionStatus,
} from "./types";
import {
  ADHERENCE_EXCLUSION_THRESHOLD,
  CONTRIBUTOR_RECORD_SCHEMA,
  FieldConstraint,
  SCORE_MAX,
  SCORE_MIN,
  VALID_EXCLUSION_REASONS,
} from "./schema";

// ---------------------------------------------------------------------------
// Low-level field validator (mirrors blend/protocol validation pattern)
// ---------------------------------------------------------------------------

function applyConstraint(
  value: unknown,
  field: string,
  constraint: FieldConstraint,
  errors: AnalyticsValidationError[],
  recordId?: string
): void {
  if (value === undefined || value === null) {
    if (constraint.required) {
      errors.push({ recordId, field, message: `Required field '${field}' is missing.` });
    }
    return;
  }

  switch (constraint.type) {
    case "string": {
      if (typeof value !== "string") {
        errors.push({ recordId, field, message: `Field '${field}' must be a string.` });
        return;
      }
      if (constraint.minLength !== undefined && value.length < constraint.minLength) {
        errors.push({
          recordId,
          field,
          message: `Field '${field}' must be at least ${constraint.minLength} characters.`,
        });
      }
      if (constraint.maxLength !== undefined && value.length > constraint.maxLength) {
        errors.push({
          recordId,
          field,
          message: `Field '${field}' must not exceed ${constraint.maxLength} characters.`,
        });
      }
      if (constraint.pattern && !constraint.pattern.test(value)) {
        errors.push({
          recordId,
          field,
          message: `Field '${field}' does not match the required format.`,
        });
      }
      break;
    }

    case "number": {
      if (typeof value !== "number" || isNaN(value)) {
        errors.push({ recordId, field, message: `Field '${field}' must be a number.` });
        return;
      }
      if (constraint.min !== undefined && value < constraint.min) {
        errors.push({
          recordId,
          field,
          message: `Field '${field}' must be >= ${constraint.min}.`,
        });
      }
      if (constraint.max !== undefined && value > constraint.max) {
        errors.push({
          recordId,
          field,
          message: `Field '${field}' must be <= ${constraint.max}.`,
        });
      }
      break;
    }

    case "boolean": {
      if (typeof value !== "boolean") {
        errors.push({ recordId, field, message: `Field '${field}' must be a boolean.` });
      }
      break;
    }

    case "array": {
      if (!Array.isArray(value)) {
        errors.push({ recordId, field, message: `Field '${field}' must be an array.` });
        return;
      }
      if (constraint.minItems !== undefined && value.length < constraint.minItems) {
        errors.push({
          recordId,
          field,
          message: `Field '${field}' must contain at least ${constraint.minItems} item(s).`,
        });
      }
      if (constraint.maxItems !== undefined && value.length > constraint.maxItems) {
        errors.push({
          recordId,
          field,
          message: `Field '${field}' must not contain more than ${constraint.maxItems} item(s).`,
        });
      }
      break;
    }

    case "enum": {
      const allowed = new Set(constraint.allowedValues);
      if (!allowed.has(value as string)) {
        errors.push({
          recordId,
          field,
          message: `Field '${field}' contains unknown value '${String(value)}'.`,
        });
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Primary validation entrypoint
// ---------------------------------------------------------------------------

/**
 * Validates a single ContributorRecord against the schema and LOCK-003 business rules.
 *
 * @param record - The contributor record to validate.
 * @returns An AnalyticsValidationResult indicating whether the record is valid
 *          and listing any errors found.
 */
export function validateContributorRecord(
  record: ContributorRecord
): AnalyticsValidationResult {
  const errors: AnalyticsValidationError[] = [];
  const recordId =
    typeof record?.recordId === "string" ? record.recordId : "(unknown)";
  const raw = record as unknown as Record<string, unknown>;

  // Field-level constraints.
  for (const [field, constraint] of Object.entries(CONTRIBUTOR_RECORD_SCHEMA)) {
    applyConstraint(raw[field], field, constraint, errors, recordId);
  }

  // LOCK-003: adherenceScore range (checked separately for explicit error message).
  if (typeof record.adherenceScore === "number") {
    if (record.adherenceScore < SCORE_MIN || record.adherenceScore > SCORE_MAX) {
      errors.push({
        recordId,
        field: "adherenceScore",
        message: `adherenceScore must be between ${SCORE_MIN} and ${SCORE_MAX}. Got ${record.adherenceScore}.`,
      });
    }
  }

  // LOCK-003: Records with adherenceScore < 50 must have exclusionStatus: Excluded.
  if (
    typeof record.adherenceScore === "number" &&
    record.adherenceScore < ADHERENCE_EXCLUSION_THRESHOLD &&
    record.exclusionStatus === ExclusionStatus.Included
  ) {
    errors.push({
      recordId,
      field: "exclusionStatus",
      message: `Records with adherenceScore < ${ADHERENCE_EXCLUSION_THRESHOLD} must have exclusionStatus '${ExclusionStatus.Excluded}'. Got '${record.exclusionStatus}'.`,
    });
  }

  // LOCK-003: Synthetic simulation records must not be marked Included.
  if (
    record.dataOrigin === DataOrigin.SyntheticSimulation &&
    record.exclusionStatus === ExclusionStatus.Included
  ) {
    errors.push({
      recordId,
      field: "exclusionStatus",
      message: `Records with dataOrigin '${DataOrigin.SyntheticSimulation}' must not have exclusionStatus '${ExclusionStatus.Included}'. Synthetic data must be isolated from production analytics (LOCK-003).`,
    });
  }

  // exclusionReason must be a valid ExclusionReason when provided.
  if (record.exclusionReason !== undefined) {
    if (!VALID_EXCLUSION_REASONS.has(record.exclusionReason)) {
      errors.push({
        recordId,
        field: "exclusionReason",
        message: `exclusionReason '${record.exclusionReason}' is not a valid ExclusionReason value.`,
      });
    }
  }

  // exclusionReason must be absent when exclusionStatus is Included.
  if (
    record.exclusionStatus === ExclusionStatus.Included &&
    record.exclusionReason !== undefined
  ) {
    errors.push({
      recordId,
      field: "exclusionReason",
      message: `exclusionReason must not be present when exclusionStatus is '${ExclusionStatus.Included}'.`,
    });
  }

  // exclusionReason should be present when exclusionStatus is Excluded.
  if (
    record.exclusionStatus === ExclusionStatus.Excluded &&
    record.exclusionReason === undefined
  ) {
    errors.push({
      recordId,
      field: "exclusionReason",
      message: `exclusionReason is required when exclusionStatus is '${ExclusionStatus.Excluded}'.`,
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all records in a collection, ensuring uniqueness of recordId values.
 *
 * @param records - Array of ContributorRecord entries to validate.
 * @returns An AnalyticsValidationResult aggregating all errors across the collection.
 */
export function validateContributorRecordCollection(
  records: ContributorRecord[]
): AnalyticsValidationResult {
  const allErrors: AnalyticsValidationError[] = [];

  // Uniqueness check across the collection.
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

  // Per-record validation.
  records.forEach((record) => {
    const result = validateContributorRecord(record);
    allErrors.push(...result.errors);
  });

  return { valid: allErrors.length === 0, errors: allErrors };
}
