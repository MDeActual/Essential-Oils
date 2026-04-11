/**
 * validation.ts — Ontology Validation Rules
 *
 * Implements the validation layer for the oil ontology registry.
 * Rules enforce structural correctness, field-level constraints,
 * and cross-field business rules derived from docs/DOMAIN_MODEL.md
 * and docs/ARCHITECTURE_LOCK.md.
 *
 * NOTE: This module validates ontology structure only. Blend synergy
 * scoring and protocol generation logic are moat-protected (LOCK-002)
 * and must not be implemented here.
 */

import {
  ChemicalConstituent,
  Oil,
  OntologyTags,
  OntologyValidationError,
  OntologyValidationResult,
  SafetyProfile,
} from "./types";
import {
  CANONICAL_OIL_IDS,
  CHEMICAL_CONSTITUENT_SCHEMA,
  FieldConstraint,
  OIL_SCHEMA,
  ONTOLOGY_TAGS_SCHEMA,
  SAFETY_PROFILE_SCHEMA,
  VALID_PROTOCOL_ROLES,
} from "./schema";

// ---------------------------------------------------------------------------
// Low-level field validators
// ---------------------------------------------------------------------------

function applyConstraint(
  value: unknown,
  field: string,
  constraint: FieldConstraint,
  errors: OntologyValidationError[],
  oilId?: string
): void {
  if (value === undefined || value === null) {
    if (constraint.required) {
      errors.push({ oilId, field, message: `Required field '${field}' is missing.` });
    }
    return;
  }

  switch (constraint.type) {
    case "string": {
      if (typeof value !== "string") {
        errors.push({ oilId, field, message: `Field '${field}' must be a string.` });
        return;
      }
      if (constraint.minLength !== undefined && value.length < constraint.minLength) {
        errors.push({
          oilId,
          field,
          message: `Field '${field}' must be at least ${constraint.minLength} characters.`,
        });
      }
      if (constraint.maxLength !== undefined && value.length > constraint.maxLength) {
        errors.push({
          oilId,
          field,
          message: `Field '${field}' must not exceed ${constraint.maxLength} characters.`,
        });
      }
      if (constraint.pattern && !constraint.pattern.test(value)) {
        errors.push({
          oilId,
          field,
          message: `Field '${field}' does not match the required format.`,
        });
      }
      break;
    }

    case "number": {
      if (typeof value !== "number" || isNaN(value)) {
        errors.push({ oilId, field, message: `Field '${field}' must be a number.` });
        return;
      }
      if (constraint.min !== undefined && value < constraint.min) {
        errors.push({
          oilId,
          field,
          message: `Field '${field}' must be >= ${constraint.min}.`,
        });
      }
      if (constraint.max !== undefined && value > constraint.max) {
        errors.push({
          oilId,
          field,
          message: `Field '${field}' must be <= ${constraint.max}.`,
        });
      }
      break;
    }

    case "boolean": {
      if (typeof value !== "boolean") {
        errors.push({ oilId, field, message: `Field '${field}' must be a boolean.` });
      }
      break;
    }

    case "array": {
      if (!Array.isArray(value)) {
        errors.push({ oilId, field, message: `Field '${field}' must be an array.` });
        return;
      }
      if (constraint.minItems !== undefined && value.length < constraint.minItems) {
        errors.push({
          oilId,
          field,
          message: `Field '${field}' must contain at least ${constraint.minItems} item(s).`,
        });
      }
      if (constraint.maxItems !== undefined && value.length > constraint.maxItems) {
        errors.push({
          oilId,
          field,
          message: `Field '${field}' must not contain more than ${constraint.maxItems} item(s).`,
        });
      }
      if (constraint.allowedValues) {
        const allowed = new Set(constraint.allowedValues);
        (value as unknown[]).forEach((item, idx) => {
          if (typeof item === "string" && !allowed.has(item)) {
            errors.push({
              oilId,
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
          oilId,
          field,
          message: `Field '${field}' contains unknown value '${String(value)}'.`,
        });
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Sub-object validators
// ---------------------------------------------------------------------------

function validateSafetyProfile(
  profile: SafetyProfile,
  oilId: string,
  errors: OntologyValidationError[]
): void {
  const record = profile as unknown as Record<string, unknown>;
  for (const [field, constraint] of Object.entries(SAFETY_PROFILE_SCHEMA)) {
    applyConstraint(record[field], `safetyProfile.${field}`, constraint, errors, oilId);
  }

  // Cross-field rule: high-safety-tier oils must list at least one contraindication.
  if (profile.tier === "high" && profile.contraindications.length === 0) {
    errors.push({
      oilId,
      field: "safetyProfile.contraindications",
      message:
        "Oils with SafetyTier.High must list at least one contraindication.",
    });
  }
}

function validateOntologyTags(
  tags: OntologyTags,
  oilId: string,
  errors: OntologyValidationError[]
): void {
  const record = tags as unknown as Record<string, unknown>;
  for (const [field, constraint] of Object.entries(ONTOLOGY_TAGS_SCHEMA)) {
    applyConstraint(record[field], `ontologyTags.${field}`, constraint, errors, oilId);
  }

  // protocolRoles must contain only recognized role values.
  tags.protocolRoles.forEach((role, idx) => {
    if (!VALID_PROTOCOL_ROLES.has(role)) {
      errors.push({
        oilId,
        field: `ontologyTags.protocolRoles[${idx}]`,
        message: `Unknown protocol role '${role}'. Must be one of: ${[...VALID_PROTOCOL_ROLES].join(", ")}.`,
      });
    }
  });

  // Duplicate remedyClass in secondaryClasses is a logical error.
  if (tags.secondaryClasses.includes(tags.remedyClass)) {
    errors.push({
      oilId,
      field: "ontologyTags.secondaryClasses",
      message: `Primary remedyClass '${tags.remedyClass}' must not appear in secondaryClasses.`,
    });
  }
}

function validateChemicalConstituents(
  constituents: ChemicalConstituent[],
  oilId: string,
  errors: OntologyValidationError[]
): void {
  constituents.forEach((constituent, idx) => {
    const record = constituent as unknown as Record<string, unknown>;
    for (const [field, constraint] of Object.entries(CHEMICAL_CONSTITUENT_SCHEMA)) {
      applyConstraint(
        record[field],
        `chemicalConstituents[${idx}].${field}`,
        constraint,
        errors,
        oilId
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Primary validation entrypoint
// ---------------------------------------------------------------------------

/**
 * Validates a single Oil record against the ontology schema and business rules.
 *
 * @param oil - The oil record to validate.
 * @returns An OntologyValidationResult indicating whether the record is valid
 *          and listing any errors found.
 */
export function validateOil(oil: Oil): OntologyValidationResult {
  const errors: OntologyValidationError[] = [];
  const oilId = typeof oil?.oilId === "string" ? oil.oilId : "(unknown)";
  const record = oil as unknown as Record<string, unknown>;

  // Top-level field constraints
  for (const [field, constraint] of Object.entries(OIL_SCHEMA)) {
    applyConstraint(record[field], field, constraint, errors, oilId);
  }

  // oilId must be a registered canonical identifier
  if (typeof oil.oilId === "string" && !CANONICAL_OIL_IDS.has(oil.oilId as never)) {
    errors.push({
      oilId,
      field: "oilId",
      message: `OilId '${oil.oilId}' is not a registered canonical identifier.`,
    });
  }

  // Sub-object validation
  if (oil.safetyProfile && typeof oil.safetyProfile === "object") {
    validateSafetyProfile(oil.safetyProfile, oilId, errors);
  } else {
    errors.push({ oilId, field: "safetyProfile", message: "Required field 'safetyProfile' is missing." });
  }

  if (oil.ontologyTags && typeof oil.ontologyTags === "object") {
    validateOntologyTags(oil.ontologyTags, oilId, errors);
  } else {
    errors.push({ oilId, field: "ontologyTags", message: "Required field 'ontologyTags' is missing." });
  }

  if (Array.isArray(oil.chemicalConstituents)) {
    validateChemicalConstituents(oil.chemicalConstituents, oilId, errors);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all oils in the registry, ensuring uniqueness of oilId values.
 *
 * @param oils - Array of Oil records to validate.
 * @returns An OntologyValidationResult aggregating all errors.
 */
export function validateOilRegistry(oils: Oil[]): OntologyValidationResult {
  const allErrors: OntologyValidationError[] = [];

  // Uniqueness check across the registry
  const seen = new Map<string, number>();
  oils.forEach((oil, idx) => {
    if (typeof oil?.oilId === "string") {
      if (seen.has(oil.oilId)) {
        allErrors.push({
          oilId: oil.oilId,
          field: "oilId",
          message: `Duplicate oilId '${oil.oilId}' found at index ${idx} (first seen at index ${seen.get(oil.oilId)}).`,
        });
      } else {
        seen.set(oil.oilId, idx);
      }
    }
  });

  // Per-record validation
  oils.forEach((oil) => {
    const result = validateOil(oil);
    allErrors.push(...result.errors);
  });

  return { valid: allErrors.length === 0, errors: allErrors };
}
