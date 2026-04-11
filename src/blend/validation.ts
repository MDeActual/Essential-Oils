/**
 * validation.ts — Blend Validation Rules
 *
 * Implements the validation layer for blend records.
 * Rules enforce structural correctness, field-level constraints,
 * and cross-field business rules derived from docs/DOMAIN_MODEL.md
 * and docs/ARCHITECTURE_LOCK.md.
 *
 * MOAT NOTICE (M-001): This module does NOT implement synergy scoring logic.
 * It only validates that a provided synergyScore is within the permitted range.
 * The scoring computation is the exclusive concern of the moat-protected blend
 * intelligence layer and must not be reconstructed here.
 */

import { isRegisteredOilId } from "../ontology/oils";
import {
  Blend,
  BlendOilEntry,
  BlendValidationError,
  BlendValidationResult,
} from "./types";
import {
  BLEND_MAX_OILS,
  BLEND_MIN_OILS,
  BLEND_OIL_ENTRY_SCHEMA,
  BLEND_SCHEMA,
  FieldConstraint,
  SYNERGY_SCORE_MAX,
  SYNERGY_SCORE_MIN,
  VALID_BLEND_ROLES,
} from "./schema";

// ---------------------------------------------------------------------------
// Low-level field validator (mirrors ontology validation pattern)
// ---------------------------------------------------------------------------

function applyConstraint(
  value: unknown,
  field: string,
  constraint: FieldConstraint,
  errors: BlendValidationError[],
  blendId?: string
): void {
  if (value === undefined || value === null) {
    if (constraint.required) {
      errors.push({ blendId, field, message: `Required field '${field}' is missing.` });
    }
    return;
  }

  switch (constraint.type) {
    case "string": {
      if (typeof value !== "string") {
        errors.push({ blendId, field, message: `Field '${field}' must be a string.` });
        return;
      }
      if (constraint.minLength !== undefined && value.length < constraint.minLength) {
        errors.push({
          blendId,
          field,
          message: `Field '${field}' must be at least ${constraint.minLength} characters.`,
        });
      }
      if (constraint.maxLength !== undefined && value.length > constraint.maxLength) {
        errors.push({
          blendId,
          field,
          message: `Field '${field}' must not exceed ${constraint.maxLength} characters.`,
        });
      }
      if (constraint.pattern && !constraint.pattern.test(value)) {
        errors.push({
          blendId,
          field,
          message: `Field '${field}' does not match the required format.`,
        });
      }
      break;
    }

    case "number": {
      if (typeof value !== "number" || isNaN(value)) {
        errors.push({ blendId, field, message: `Field '${field}' must be a number.` });
        return;
      }
      if (constraint.min !== undefined && value < constraint.min) {
        errors.push({
          blendId,
          field,
          message: `Field '${field}' must be >= ${constraint.min}.`,
        });
      }
      if (constraint.max !== undefined && value > constraint.max) {
        errors.push({
          blendId,
          field,
          message: `Field '${field}' must be <= ${constraint.max}.`,
        });
      }
      break;
    }

    case "boolean": {
      if (typeof value !== "boolean") {
        errors.push({ blendId, field, message: `Field '${field}' must be a boolean.` });
      }
      break;
    }

    case "array": {
      if (!Array.isArray(value)) {
        errors.push({ blendId, field, message: `Field '${field}' must be an array.` });
        return;
      }
      if (constraint.minItems !== undefined && value.length < constraint.minItems) {
        errors.push({
          blendId,
          field,
          message: `Field '${field}' must contain at least ${constraint.minItems} item(s).`,
        });
      }
      if (constraint.maxItems !== undefined && value.length > constraint.maxItems) {
        errors.push({
          blendId,
          field,
          message: `Field '${field}' must not contain more than ${constraint.maxItems} item(s).`,
        });
      }
      if (constraint.allowedValues) {
        const allowed = new Set(constraint.allowedValues);
        (value as unknown[]).forEach((item, idx) => {
          if (typeof item === "string" && !allowed.has(item)) {
            errors.push({
              blendId,
              field,
              message: `Field '${field}[${idx}]' contains unknown value '${item}'.`,
            });
          }
        });
      }
      break;
    }

    case "enum": {
      const allowed = new Set(constraint.allowedValues);
      if (!allowed.has(value as string)) {
        errors.push({
          blendId,
          field,
          message: `Field '${field}' contains unknown value '${String(value)}'.`,
        });
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// BlendOilEntry validator
// ---------------------------------------------------------------------------

function validateBlendOilEntries(
  entries: BlendOilEntry[],
  blendId: string,
  errors: BlendValidationError[]
): void {
  // Enforce min/max oil count as a cross-field rule.
  if (entries.length < BLEND_MIN_OILS) {
    errors.push({
      blendId,
      field: "oils",
      message: `A blend must contain at least ${BLEND_MIN_OILS} oil entries. Found ${entries.length}.`,
    });
  }
  if (entries.length > BLEND_MAX_OILS) {
    errors.push({
      blendId,
      field: "oils",
      message: `A blend must not contain more than ${BLEND_MAX_OILS} oil entries. Found ${entries.length}.`,
    });
  }

  const seenOilIds = new Set<string>();

  entries.forEach((entry, idx) => {
    const record = entry as unknown as Record<string, unknown>;
    const prefix = `oils[${idx}]`;

    // Apply field-level constraints for each entry.
    for (const [field, constraint] of Object.entries(BLEND_OIL_ENTRY_SCHEMA)) {
      applyConstraint(record[field], `${prefix}.${field}`, constraint, errors, blendId);
    }

    // Ratio must be strictly positive (> 0).
    if (typeof entry.ratio === "number" && entry.ratio <= 0) {
      errors.push({
        blendId,
        field: `${prefix}.ratio`,
        message: `Field '${prefix}.ratio' must be > 0. Got ${entry.ratio}.`,
      });
    }

    // Role must be a valid BlendRole value.
    if (typeof entry.role === "string" && !VALID_BLEND_ROLES.has(entry.role)) {
      errors.push({
        blendId,
        field: `${prefix}.role`,
        message: `Field '${prefix}.role' contains unknown role '${entry.role}'.`,
      });
    }

    // oilId must be registered in the canonical ontology registry.
    if (typeof entry.oilId === "string") {
      if (!isRegisteredOilId(entry.oilId)) {
        errors.push({
          blendId,
          field: `${prefix}.oilId`,
          message: `OilId '${entry.oilId}' is not registered in the canonical ontology.`,
        });
      }

      // Duplicate oilIds within the same blend are not permitted.
      if (seenOilIds.has(entry.oilId)) {
        errors.push({
          blendId,
          field: `${prefix}.oilId`,
          message: `Duplicate oilId '${entry.oilId}' found in blend. Each oil may appear only once.`,
        });
      } else {
        seenOilIds.add(entry.oilId);
      }
    }
  });

  // A blend must have exactly one Primary-role oil.
  const primaryEntries = entries.filter((e) => e.role === "primary");
  if (entries.length >= BLEND_MIN_OILS && primaryEntries.length !== 1) {
    errors.push({
      blendId,
      field: "oils",
      message: `A blend must have exactly one oil with role 'primary'. Found ${primaryEntries.length}.`,
    });
  }
}

// ---------------------------------------------------------------------------
// Primary validation entrypoint
// ---------------------------------------------------------------------------

/**
 * Validates a single Blend record against the blend schema and business rules.
 *
 * @param blend - The blend record to validate.
 * @returns A BlendValidationResult indicating whether the record is valid
 *          and listing any errors found.
 */
export function validateBlend(blend: Blend): BlendValidationResult {
  const errors: BlendValidationError[] = [];
  const blendId = typeof blend?.blendId === "string" ? blend.blendId : "(unknown)";
  const record = blend as unknown as Record<string, unknown>;

  // Top-level field constraints.
  for (const [field, constraint] of Object.entries(BLEND_SCHEMA)) {
    applyConstraint(record[field], field, constraint, errors, blendId);
  }

  // Synergy score range check (M-001: value only, not computation).
  if (
    typeof blend.synergyScore === "number" &&
    (blend.synergyScore < SYNERGY_SCORE_MIN || blend.synergyScore > SYNERGY_SCORE_MAX)
  ) {
    errors.push({
      blendId,
      field: "synergyScore",
      message: `synergyScore must be between ${SYNERGY_SCORE_MIN} and ${SYNERGY_SCORE_MAX}. Got ${blend.synergyScore}.`,
    });
  }

  // BlendOilEntry sub-array validation.
  if (Array.isArray(blend.oils)) {
    validateBlendOilEntries(blend.oils, blendId, errors);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all blends in a collection, ensuring uniqueness of blendId values.
 *
 * @param blends - Array of Blend records to validate.
 * @returns A BlendValidationResult aggregating all errors across the collection.
 */
export function validateBlendCollection(blends: Blend[]): BlendValidationResult {
  const allErrors: BlendValidationError[] = [];

  // Uniqueness check across the collection.
  const seen = new Map<string, number>();
  blends.forEach((blend, idx) => {
    if (typeof blend?.blendId === "string") {
      if (seen.has(blend.blendId)) {
        allErrors.push({
          blendId: blend.blendId,
          field: "blendId",
          message: `Duplicate blendId '${blend.blendId}' found at index ${idx} (first seen at index ${seen.get(blend.blendId)}).`,
        });
      } else {
        seen.set(blend.blendId, idx);
      }
    }
  });

  // Per-record validation.
  blends.forEach((blend) => {
    const result = validateBlend(blend);
    allErrors.push(...result.errors);
  });

  return { valid: allErrors.length === 0, errors: allErrors };
}
