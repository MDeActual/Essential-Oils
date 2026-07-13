/**
 * types.ts — Contributor Analytics Type Definitions
 *
 * Defines canonical TypeScript types and enums for the Phyto.ai contributor
 * analytics layer. These types implement the Contributor Record entity defined in
 * docs/DOMAIN_MODEL.md and enforce the data integrity constraints from LOCK-003.
 *
 * MOAT NOTICE (M-004): The Population Analytics Signal Model — including the
 * aggregation methodology, weighting scheme, and signal extraction logic used
 * to translate contributor data into protocol evolution recommendations — is
 * proprietary and must NOT be implemented in this module. This module provides
 * only structural types, validation, and basic aggregation utilities.
 */

export enum DataOrigin {
  RealContributor = "real_contributor",
  SyntheticSimulation = "synthetic_simulation",
}

export enum ExclusionStatus {
  Included = "included",
  Excluded = "excluded",
}

export enum ExclusionReason {
  AdherenceBelowThreshold = "adherence_below_threshold",
  SyntheticData = "synthetic_data",
  ManualFlag = "manual_flag",
  IncompleteRecord = "incomplete_record",
}

export type RecordId = string;

export interface ContributorRecord {
  recordId: RecordId;
  userId: string;
  protocolId: string;
  dataOrigin: DataOrigin;
  exclusionStatus: ExclusionStatus;
  exclusionReason?: ExclusionReason;
  adherenceScore: number;
  challengeCompletionRate: number;
  outcomeNotes?: string;
  recordedAt: string;
}

export interface CohortMetrics {
  eligibleRecordCount: number;
  excludedRecordCount: number;
  averageAdherenceScore: number;
  averageChallengeCompletionRate: number;
  minAdherenceScore: number;
  maxAdherenceScore: number;
  exclusionBreakdown: Record<string, number>;
  computedAt: string;
}

export interface AnalyticsPipelineResult {
  success: boolean;
  metrics?: CohortMetrics;
  errors: AnalyticsError[];
}

// ---------------------------------------------------------------------------
// Protocol Cohort Segmentation — accepted ADR-010 public API
// ---------------------------------------------------------------------------

/**
 * Aggregated cohort metrics for a single protocol, produced by the protocol
 * segmentation pipeline.
 *
 * MOAT NOTICE (M-004): Contains only structural aggregations. Protocol ranking,
 * comparative scoring, and protocol evolution signal extraction are moat-protected
 * and must not be derived from or embedded in this type.
 */
export interface ProtocolCohortSegment {
  protocolId: string;
  metrics: CohortMetrics;
}

/**
 * The full result of the protocol segmentation pipeline: one segment per distinct
 * protocolId found in the input record set.
 *
 * MOAT NOTICE (M-004): This report provides structural per-protocol aggregation
 * only. The signal extraction methodology that translates these metrics into
 * protocol evolution recommendations is moat-protected and must not be
 * reconstructed from this output.
 */
export interface ProtocolSegmentReport {
  success: boolean;
  segments?: ProtocolCohortSegment[];
  protocolCount?: number;
  totalEligibleRecords?: number;
  totalExcludedRecords?: number;
  generatedAt?: string;
  errors: AnalyticsError[];
}

export interface AnalyticsValidationError {
  recordId?: string;
  field: string;
  message: string;
}

export interface AnalyticsValidationResult {
  valid: boolean;
  errors: AnalyticsValidationError[];
}

export interface AnalyticsError {
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Signal Interfaces
// ---------------------------------------------------------------------------

export interface AdherenceSignal {
  recordId: RecordId;
  protocolId: string;
  adherenceScore: number;
  normalizedScore: number;
  computedAt: string;
}

export interface ProtocolCompletionSignal {
  recordId: RecordId;
  protocolId: string;
  challengeCompletionRate: number;
  adherenceScore: number;
  completionIndex: number;
  computedAt: string;
}

export interface OilUsageFrequencySignal {
  protocolId: string;
  observationCount: number;
  computedAt: string;
}

export interface ChallengeParticipationSignal {
  recordId: RecordId;
  protocolId: string;
  challengeCompletionRate: number;
  normalizedRate: number;
  computedAt: string;
}

// ---------------------------------------------------------------------------
// Scoring Types
// ---------------------------------------------------------------------------

export interface ProtocolEffectivenessScore {
  protocolId: string;
  score: number;
  sampleSize: number;
  computedAt: string;
}

export interface BlendSynergyInfluenceSignal {
  blendId: string;
  observationCount: number;
  averageProtocolAdherence: number;
  computedAt: string;
}

export interface ContributorReliabilityScore {
  userId: string;
  reliabilityScore: number;
  recordCount: number;
  averageAdherenceScore: number;
  computedAt: string;
}

// ---------------------------------------------------------------------------
// Aggregation Types
// ---------------------------------------------------------------------------

export interface ContributorActivitySummary {
  userId: string;
  totalRecords: number;
  eligibleRecords: number;
  averageAdherenceScore: number;
  averageChallengeCompletionRate: number;
  protocolIds: string[];
  computedAt: string;
}

export interface ProtocolOutcomeSummary {
  protocolId: string;
  totalContributors: number;
  eligibleContributors: number;
  averageAdherenceScore: number;
  averageChallengeCompletionRate: number;
  computedAt: string;
}
