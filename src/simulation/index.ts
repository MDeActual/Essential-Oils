/**
 * index.ts — Simulation Module Public Interface
 *
 * Exports the canonical public API for src/simulation/.
 *
 * SIMULATION SAFETY NOTICE (LOCK-003): All exports from this module are
 * governed by the analytics data integrity rules established in LOCK-003.
 * Synthetic records produced here must never reach production analytics
 * paths without passing through assertSyntheticIsolation() or
 * assertBatchIsolation().
 *
 * MOAT NOTICE (M-004): The analytics signal model is not exposed here.
 * Only structural types, schema constants, generators, and validation
 * utilities are part of the public interface.
 */

// Types
export type {
  ContributorRecord,
  ContributorRecordValidationResult,
  SimulationBatch,
  SimulationContext,
  SimulationValidationError,
  SyntheticContributorRecord,
  SyntheticIsolationResult,
  SyntheticRecordOptions,
} from "./types";

export { DataOrigin, ExclusionReason, ExclusionStatus } from "./types";

// Schema constants
export {
  ADHERENCE_EXCLUSION_THRESHOLD,
  ADHERENCE_SCORE_MAX,
  ADHERENCE_SCORE_MIN,
  CHALLENGE_COMPLETION_RATE_MAX,
  CHALLENGE_COMPLETION_RATE_MIN,
  CONTRIBUTOR_RECORD_SCHEMA,
} from "./schema";

// Generators
export {
  generateSyntheticContributorBatch,
  generateSyntheticContributorRecord,
} from "./generators";

// Validation and isolation guards
export {
  assertBatchIsolation,
  assertSyntheticIsolation,
  filterAnalyticsEligible,
  validateContributorRecord,
  validateContributorRecordCollection,
} from "./validation";
