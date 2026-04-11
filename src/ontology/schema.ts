/**
 * schema.ts — Oil Property Schema
 *
 * Defines the structural constraints that govern valid Oil ontology records.
 * These rules are used by the validation layer to enforce data integrity
 * before records are accepted into the ontology registry.
 */

import {
  ApplicationMethod,
  OilId,
  RouteType,
  SafetyTier,
  TherapeuticProperty,
  RemedyClass,
} from "./types";

// ---------------------------------------------------------------------------
// Field-level constraint definitions
// ---------------------------------------------------------------------------

/** Constraint for a required string field. */
export interface StringConstraint {
  type: "string";
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

/** Constraint for a required number field. */
export interface NumberConstraint {
  type: "number";
  required: boolean;
  min?: number;
  max?: number;
}

/** Constraint for a required boolean field. */
export interface BooleanConstraint {
  type: "boolean";
  required: boolean;
}

/** Constraint for an array field with a minimum number of items. */
export interface ArrayConstraint {
  type: "array";
  required: boolean;
  minItems?: number;
  maxItems?: number;
  allowedValues?: readonly string[];
}

/** Constraint for an enum field. */
export interface EnumConstraint {
  type: "enum";
  required: boolean;
  allowedValues: readonly string[];
}

export type FieldConstraint =
  | StringConstraint
  | NumberConstraint
  | BooleanConstraint
  | ArrayConstraint
  | EnumConstraint;

// ---------------------------------------------------------------------------
// Oil property schema
// ---------------------------------------------------------------------------

/** Schema definition for the top-level Oil entity. */
export const OIL_SCHEMA: Record<string, FieldConstraint> = {
  oilId: {
    type: "string",
    required: true,
    minLength: 3,
    // Snake-case genus_species pattern (allows underscores and lowercase letters only)
    pattern: /^[a-z]+_[a-z]+(_[a-z]+)?$/,
  },
  commonName: {
    type: "string",
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  latinName: {
    type: "string",
    required: true,
    minLength: 5,
    maxLength: 150,
  },
  plantFamily: {
    type: "string",
    required: true,
    minLength: 2,
    maxLength: 80,
  },
  chemicalConstituents: {
    type: "array",
    required: true,
    minItems: 1,
  },
  therapeuticProperties: {
    type: "array",
    required: true,
    minItems: 1,
    allowedValues: Object.values(TherapeuticProperty),
  },
  applicationMethods: {
    type: "array",
    required: true,
    minItems: 1,
    allowedValues: Object.values(ApplicationMethod),
  },
  description: {
    type: "string",
    required: true,
    minLength: 10,
    maxLength: 1000,
  },
  lastReviewedAt: {
    type: "string",
    required: true,
    // ISO 8601 date or datetime
    pattern: /^\d{4}-\d{2}-\d{2}(T[\d:+Z.]+)?$/,
  },
};

/** Schema definition for the SafetyProfile sub-object. */
export const SAFETY_PROFILE_SCHEMA: Record<string, FieldConstraint> = {
  tier: {
    type: "enum",
    required: true,
    allowedValues: Object.values(SafetyTier),
  },
  maxDilutionPercent: {
    type: "number",
    required: true,
    min: 0,
    max: 100,
  },
  safeInPregnancy: {
    type: "boolean",
    required: true,
  },
  safeForChildren: {
    type: "boolean",
    required: true,
  },
  photosensitizing: {
    type: "boolean",
    required: true,
  },
  contraindications: {
    type: "array",
    required: true,
    // Empty array is valid (no known contraindications)
    minItems: 0,
  },
};

/** Schema definition for the OntologyTags sub-object. */
export const ONTOLOGY_TAGS_SCHEMA: Record<string, FieldConstraint> = {
  remedyClass: {
    type: "enum",
    required: true,
    allowedValues: Object.values(RemedyClass),
  },
  secondaryClasses: {
    type: "array",
    required: true,
    minItems: 0,
    allowedValues: Object.values(RemedyClass),
  },
  routeTypes: {
    type: "array",
    required: true,
    minItems: 1,
    allowedValues: Object.values(RouteType),
  },
  protocolRoles: {
    type: "array",
    required: true,
    minItems: 1,
  },
  mechanismTags: {
    type: "array",
    required: true,
    minItems: 0,
  },
};

/** Schema definition for a ChemicalConstituent entry. */
export const CHEMICAL_CONSTITUENT_SCHEMA: Record<string, FieldConstraint> = {
  name: {
    type: "string",
    required: true,
    minLength: 2,
    maxLength: 200,
  },
  percentageRange: {
    type: "string",
    required: true,
    // Expects a range like "30-50%", "~40%", "0.02-2%", or "<1%"
    pattern: /^[~<]?[\d.]+([-–][\d.]+)?%$/,
  },
  role: {
    type: "string",
    required: true,
    minLength: 3,
    maxLength: 200,
  },
};

/** All registered canonical oil identifiers (type-safe set). */
export const CANONICAL_OIL_IDS: ReadonlySet<OilId> = new Set<OilId>([
  "lavandula_angustifolia",
  "mentha_piperita",
  "eucalyptus_globulus",
  "melaleuca_alternifolia",
  "origanum_vulgare",
  "zingiber_officinale",
  "boswellia_sacra",
  "citrus_limon",
  "citrus_bergamia",
  "rosa_damascena",
  "chamomilla_recutita",
  "cymbopogon_flexuosus",
  "santalum_album",
  "cinnamomum_verum",
  "pelargonium_graveolens",
  "vetiveria_zizanioides",
  "cedrus_atlantica",
  "juniperus_communis",
  "pogostemon_cablin",
  "cananga_odorata",
]);

/** Valid protocol role strings an oil can fulfil in a protocol phase. */
export const VALID_PROTOCOL_ROLES: ReadonlySet<string> = new Set([
  "primary",
  "supportive",
  "adjuvant",
  "synergist",
  "carrier",
]);
