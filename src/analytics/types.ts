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

// ---------------------------------------------------------------------------
// Signal Interfaces
// ---------------------------------------------------------------------------

/**
 * An adherence signal derived from a single analytics-eligible contributor record.
 * Represents the normalized adherence score for a record/protocol pair.
 *
 * MOAT NOTICE (M-004): This signal is a structural observable only.
 * The weighting scheme and protocol evolution inference logic are moat-protected.
 */
export interface AdherenceSignal {
  /** The contributor record that produced this signal. */
  recordId: RecordId;
  /** The protocol associated with this signal. */
  protocolId: string;
  /** Raw adherence score (0–100). */
  adherenceScore: number;
  /** Adherence score normalized to the range [0, 1]. */
  normalizedScore: number;
  /** ISO 8601 timestamp when this signal was computed. */
  computedAt: string;
}

/**
 * A combined signal capturing how completely a contributor engaged with a protocol,
 * derived from both adherence score and challenge completion rate.
 *
 * MOAT NOTICE (M-004): The completionIndex is a structural composite metric only.
 * It must not be confused with the moat-protected protocol evolution signal model.
 */
export interface ProtocolCompletionSignal {
  /** The contributor record that produced this signal. */
  recordId: RecordId;
  /** The protocol associated with this signal. */
  protocolId: string;
  /** Raw challenge completion rate (0–100). */
  challengeCompletionRate: number;
  /** Raw adherence score (0–100). */
  adherenceScore: number;
  /**
   * Composite completion index: the arithmetic mean of normalized adherence and
   * normalized challenge completion rate. Range: [0, 1].
   */
  completionIndex: number;
  /** ISO 8601 timestamp when this signal was computed. */
  computedAt: string;
}

/**
 * A frequency signal indicating how many analytics-eligible contributor records
 * reference a given protocol. Used to gauge protocol reach in the contributor base.
 *
 * MOAT NOTICE (M-004): Observation count is a structural measure only.
 */
export interface OilUsageFrequencySignal {
  /** The protocol whose contributor observation frequency is reported. */
  protocolId: string;
  /** Number of analytics-eligible contributor records referencing this protocol. */
  observationCount: number;
  /** ISO 8601 timestamp when this signal was computed. */
  computedAt: string;
}

/**
 * A signal capturing a contributor's challenge engagement rate for a protocol run.
 *
 * MOAT NOTICE (M-004): This is a structural observable; the challenge engine
 * sequencing rules (M-003) are moat-protected and must not be derived from this.
 */
export interface ChallengeParticipationSignal {
  /** The contributor record that produced this signal. */
  recordId: RecordId;
  /** The protocol associated with this signal. */
  protocolId: string;
  /** Raw challenge completion rate (0–100). */
  challengeCompletionRate: number;
  /** Challenge completion rate normalized to the range [0, 1]. */
  normalizedRate: number;
  /** ISO 8601 timestamp when this signal was computed. */
  computedAt: string;
}

// ---------------------------------------------------------------------------
// Scoring Types
// ---------------------------------------------------------------------------

/**
 * A structural protocol effectiveness score derived from the aggregate adherence
 * and challenge completion of analytics-eligible contributors on a protocol.
 *
 * MOAT NOTICE (M-004): This is basic structural aggregation only. The moat-protected
 * signal extraction methodology must be applied separately to derive protocol
 * evolution recommendations.
 */
export interface ProtocolEffectivenessScore {
  /** The protocol being scored. */
  protocolId: string;
  /**
   * Effectiveness score (0–100): the arithmetic mean of average adherence score
   * and average challenge completion rate across eligible contributors.
   */
  score: number;
  /** Number of analytics-eligible contributor records used in the computation. */
  sampleSize: number;
  /** ISO 8601 timestamp when this score was computed. */
  computedAt: string;
}

/**
 * A structural signal associating a blend with observed protocol adherence.
 * Indicates the average adherence of contributors whose protocols referenced a blend.
 *
 * MOAT NOTICE (M-001, M-004): This signal does NOT include or infer synergy scoring
 * weights, matrix values, or blend intelligence computation details. It is a
 * structural co-occurrence signal only.
 */
export interface BlendSynergyInfluenceSignal {
  /** The blend being observed. */
  blendId: string;
  /** Number of analytics-eligible records whose protocol is associated with this blend. */
  observationCount: number;
  /** Average adherence score across eligible contributor records in the observation set. */
  averageProtocolAdherence: number;
  /** ISO 8601 timestamp when this signal was computed. */
  computedAt: string;
}

/**
 * A structural reliability score for a contributor, based on their aggregate
 * adherence across all analytics-eligible protocol runs.
 *
 * MOAT NOTICE (M-004): This score is a structural aggregate only.
 */
export interface ContributorReliabilityScore {
  /** Anonymized user identifier. */
  userId: string;
  /**
   * Reliability score (0–100): the average adherence score across all analytics-eligible
   * contributor records for this user.
   */
  reliabilityScore: number;
  /** Number of analytics-eligible records used in the computation. */
  recordCount: number;
  /** Average adherence score (mirrors reliabilityScore for transparency). */
  averageAdherenceScore: number;
  /** ISO 8601 timestamp when this score was computed. */
  computedAt: string;
}

// ---------------------------------------------------------------------------
// Aggregation Types
// ---------------------------------------------------------------------------

/**
 * Aggregated summary of a single contributor's activity across all analytics-eligible
 * protocol runs.
 */
export interface ContributorActivitySummary {
  /** Anonymized user identifier. */
  userId: string;
  /** Total contributor records (eligible + excluded) for this user. */
  totalRecords: number;
  /** Number of analytics-eligible records for this user. */
  eligibleRecords: number;
  /** Average adherence score across eligible records (0–100). */
  averageAdherenceScore: number;
  /** Average challenge completion rate across eligible records (0–100). */
  averageChallengeCompletionRate: number;
  /** Distinct protocol IDs referenced in eligible records. */
  protocolIds: string[];
  /** ISO 8601 timestamp when this summary was computed. */
  computedAt: string;
}

/**
 * Aggregated outcome summary for a single protocol across analytics-eligible
 * contributor records.
 */
export interface ProtocolOutcomeSummary {
  /** The protocol being summarized. */
  protocolId: string;
  /** Total contributor records (eligible + excluded) for this protocol. */
  totalContributors: number;
  /** Number of analytics-eligible records for this protocol. */
  eligibleContributors: number;
  /** Average adherence score across eligible records (0–100). */
  averageAdherenceScore: number;
  /** Average challenge completion rate across eligible records (0–100). */
  averageChallengeCompletionRate: number;
  /** ISO 8601 timestamp when this summary was computed. */
  computedAt: string;
}
