/**
 * index.ts — Ontology Module Public Interface
 *
 * Exports the public surface of src/ontology/ for use by other platform modules
 * (protocol engine, blend intelligence, API layer).
 *
 * MOAT NOTICE (M-005): The full ontology graph, relational structure, and
 * mechanism tags are proprietary. Only individual oil property lookups and
 * per-record validation results are permitted through this interface.
 * The full getAllOils() export is for internal platform use only and must
 * not be forwarded to any external-facing API endpoint.
 */

// Types — all type definitions are safe to re-export for internal module use.
export type { Oil, OilId, ChemicalConstituent, SafetyProfile, OntologyTags, OntologyValidationError, OntologyValidationResult } from "./types";
export { ApplicationMethod, TherapeuticProperty, RemedyClass, RouteType, SafetyTier } from "./types";

// Schema — field constraint definitions for use by consuming modules.
export { CANONICAL_OIL_IDS, VALID_PROTOCOL_ROLES } from "./schema";
export type { FieldConstraint, StringConstraint, NumberConstraint, BooleanConstraint, ArrayConstraint, EnumConstraint } from "./schema";

// Oil registry accessors (internal use; full graph not for external exposure).
export {
  getOilById,
  getAllOils,
  getOilsByRemedyClass,
  getOilsByApplicationMethod,
  isRegisteredOilId,
  getOilCount,
} from "./oils";

// Validation
export { validateOil, validateOilRegistry } from "./validation";
