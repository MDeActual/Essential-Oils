/**
 * types.ts — Contributor Analytics Type Definitions
 *
 * Defines the canonical TypeScript types and enums for the Phyto.ai contributor
 * analytics layer. These types implement the Contributor Record entity defined in
 * docs/DOMAIN_MODEL.md and enforce the data integrity constraints from LOCK-003.
 *
 * MOAT NOTICE (M-004): The Population Analytics Signal Model — including the
 * aggregation methodology, weighting scheme, and signal extraction logic used
 * to translate contributor data into protocol evolution recommendations — is
 * proprietary and must NOT be implemented in this module. This module provides
 * only structural types, validation, and basic aggregation utilities.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * Origin of a contributor record — distinguishes real production data from
 * synthetic simulation data (LOCK-003).
 */
export enum DataOrigin {
  /** Record produced by a real platform user participating in a live protocol. */
  RealContributor = "real_contributor",
  /** Record produced by the simulation environment (must never enter production analytics). */
  SyntheticSimulation = "synthetic_simulation",
}

/**
 * Whether a contributor record is eligible for inclusion in production analytics
 * scoring (LOCK-003).
 */
export enum ExclusionStatus {
  /** Record meets all eligibility criteria and is included in analytics. */
  Included = "included",
  /** Record has been excluded from analytics scoring. */
  Excluded = "excluded",
}

/**
 * Reason a record was excluded from analytics eligibility.
 * Only populated when exclusion_status is Excluded.
 */
export enum ExclusionReason {
  /** Adherence score fell below the 50% threshold (LOCK-003). */
  AdherenceBelowThreshold = "adherence_below_threshold",
  /** Record originated from the simulation environment (LOCK-003). */
  SyntheticData = "synthetic_data",
  /** Record was manually flagged by an administrator. */
  ManualFlag = "manual_flag",
  /** Record is incomplete — required fields are missing. */
  IncompleteRecord = "incomplete_record",
}

// ---------------------------------------------------------------------------
// Contributor Record
// ---------------------------------------------------------------------------

/**
 * A contributor record representing one user's participation data for a single
 * protocol run. Used for population-level analytics and protocol evolution signals.
 *
 * This type directly implements the Contributor Record entity in docs/DOMAIN_MODEL.md.
 * LOCK-003 constraints are enforced by the validation layer.
 */
export interface ContributorRecord {
  /** Unique canonical identifier for this contributor record. */
  recordId: RecordId;
  /**
   * Reference to the user (anonymized for analytics purposes).
   * Must not contain personally identifiable information in analytics payloads.
   */
  userId: string;
  /** Reference to the associated Protocol. */
  protocolId: string;
  /**
   * Origin of this record (LOCK-003).
   * Only `real_contributor` records are analytics-eligible.
   */
  dataOrigin: DataOrigin;
  /**
   * Whether this record is included in production analytics scoring (LOCK-003).
   * Records with adherence below 50% must be excluded.
   */
  exclusionStatus: ExclusionStatus;
  /**
   * Reason for exclusion, if applicable.
   * Must be present when exclusionStatus is Excluded; must be absent when Included.
   */
  exclusionReason?: ExclusionReason;
  /**
   * Adherence score as a percentage (0–100).
   * Records with adherenceScore < 50 must carry exclusionStatus: Excluded (LOCK-003).
   */
  adherenceScore: number;
  /** Challenge completion rate as a percentage (0–100). */
  challengeCompletionRate: number;
  /** Optional qualitative outcome notes from the contributor. */
  outcomeNotes?: string;
  /** ISO 8601 timestamp when this record was created. */
  recordedAt: string;
}

// ---------------------------------------------------------------------------
// Canonical Record Identifier (RecordId)
// ---------------------------------------------------------------------------

/**
 * Contributor record identifiers are arbitrary strings (UUID or slug).
 * Identifier format: lowercase alphanumeric characters and hyphens only.
 */
export type RecordId = string;

// ---------------------------------------------------------------------------
// Cohort Metrics
// ---------------------------------------------------------------------------

/**
 * Aggregated metrics for a cohort of analytics-eligible contributor records.
 *
 * MOAT NOTICE (M-004): This structure contains only basic structural aggregations.
 * The proprietary signal extraction methodology, weighting scheme, and protocol
 * evolution recommendation logic are moat-protected and must not be derived from
 * or embedded in this type.
 */
export interface CohortMetrics {
  /** Total number of analytics-eligible records in this cohort. */
  eligibleRecordCount: number;
  /** Total number of records that were excluded before aggregation. */
  excludedRecordCount: number;
  /** Average adherence score across eligible records (0–100). */
  averageAdherenceScore: number;
  /** Average challenge completion rate across eligible records (0–100). */
  averageChallengeCompletionRate: number;
  /** Minimum adherence score observed in the eligible cohort. */
  minAdherenceScore: number;
  /** Maximum adherence score observed in the eligible cohort. */
  maxAdherenceScore: number;
  /** Distribution of exclusion reasons across excluded records. */
  exclusionBreakdown: Record<string, number>;
  /** ISO 8601 timestamp when these metrics were computed. */
  computedAt: string;
}

// ---------------------------------------------------------------------------
// Analytics Pipeline Result
// ---------------------------------------------------------------------------

/**
 * The full result of running the analytics pipeline over a set of contributor records.
 */
export interface AnalyticsPipelineResult {
  /** Whether the pipeline ran without errors. */
  success: boolean;
  /** Aggregated cohort metrics (present when success is true). */
  metrics?: CohortMetrics;
  /** Errors encountered during the pipeline run. */
  errors: AnalyticsError[];
}

// ---------------------------------------------------------------------------
// Validation Types
// ---------------------------------------------------------------------------

/** Structured validation error returned by the analytics validation layer. */
export interface AnalyticsValidationError {
  /** The record identifier that failed validation, if applicable. */
  recordId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of a contributor record validation operation. */
export interface AnalyticsValidationResult {
  valid: boolean;
  errors: AnalyticsValidationError[];
}

/** Structured error type for analytics pipeline execution. */
export interface AnalyticsError {
  /** Error code for programmatic handling. */
  code: string;
  /** Human-readable description of the error. */
  message: string;
}
