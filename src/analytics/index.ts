/**
 * index.ts — Analytics Module Public Interface
 *
 * Exports the public surface of src/analytics/ for use by other platform modules
 * (simulation, API layer).
 *
 * MOAT NOTICE (M-004): The Population Analytics Signal Model — including the
 * signal extraction methodology, weighting scheme, and protocol evolution
 * recommendation logic — is moat-protected proprietary IP. This module exposes
 * only structural types, validation utilities, schema constants, and basic
 * aggregation functions. The moat-protected signal layer must not be
 * reconstructed from or embedded in these exports.
 *
 * LOCK-003: All analytics data flows must pass through validateContributorRecord()
 * before entering the pipeline. Only real_contributor records with adherence >= 50%
 * and exclusionStatus: included are pipeline-eligible.
 */

// Types — safe for internal module use.
export type {
  ContributorRecord,
  RecordId,
  CohortMetrics,
  AnalyticsPipelineResult,
  ProtocolCohortSegment,
  ProtocolSegmentReport,
  AnalyticsValidationError,
  AnalyticsValidationResult,
  AnalyticsError,
} from "./types";
export { DataOrigin, ExclusionStatus, ExclusionReason } from "./types";

// Schema — field constraint definitions and constants.
export { ADHERENCE_EXCLUSION_THRESHOLD, SCORE_MIN, SCORE_MAX, VALID_EXCLUSION_REASONS } from "./schema";
export type {
  FieldConstraint,
  StringConstraint,
  NumberConstraint,
  BooleanConstraint,
  ArrayConstraint,
  EnumConstraint,
} from "./schema";

// Validation
export {
  validateContributorRecord,
  validateContributorRecordCollection,
} from "./validation";

// Pipeline (structural aggregation; M-004 signal extraction not included)
export {
  filterAnalyticsEligible,
  aggregateCohortMetrics,
  runAnalyticsPipeline,
  segmentByProtocol,
  runProtocolSegmentPipeline,
} from "./pipeline";
