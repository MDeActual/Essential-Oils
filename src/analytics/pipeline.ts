/**
 * pipeline.ts — Contributor Analytics Pipeline
 *
 * Implements the analytics pipeline that processes contributor records and
 * produces aggregate cohort metrics. This pipeline enforces the LOCK-003 data
 * integrity rules and respects the M-004 moat boundary.
 *
 * MOAT NOTICE (M-004): This module implements structural aggregation only
 * (counts, averages, distributions). The proprietary signal extraction
 * methodology, weighting scheme, and protocol evolution recommendation logic
 * that translate cohort data into actionable protocol evolution signals are
 * moat-protected and must NOT be implemented here. Only the Contributor
 * Analytics Agent operating in the moat-protected layer may implement M-004.
 *
 * LOCK-003: Only records meeting all three eligibility criteria are processed:
 * 1. dataOrigin === DataOrigin.RealContributor
 * 2. exclusionStatus === ExclusionStatus.Included
 * 3. adherenceScore >= ADHERENCE_EXCLUSION_THRESHOLD (50)
 */

import { ADHERENCE_EXCLUSION_THRESHOLD } from "./schema";
import {
  AnalyticsError,
  AnalyticsPipelineResult,
  CohortMetrics,
  ContributorRecord,
  DataOrigin,
  ExclusionStatus,
} from "./types";
import { validateContributorRecordCollection } from "./validation";

// ---------------------------------------------------------------------------
// Eligibility filter
// ---------------------------------------------------------------------------

/**
 * Filters a set of contributor records to those eligible for analytics processing.
 *
 * Eligibility criteria (LOCK-003):
 * - dataOrigin must be DataOrigin.RealContributor
 * - exclusionStatus must be ExclusionStatus.Included
 * - adherenceScore must be >= ADHERENCE_EXCLUSION_THRESHOLD
 *
 * @param records - The full set of contributor records to filter.
 * @returns Only the records that pass all eligibility criteria.
 */
export function filterAnalyticsEligible(
  records: ContributorRecord[]
): ContributorRecord[] {
  return records.filter(
    (r) =>
      r.dataOrigin === DataOrigin.RealContributor &&
      r.exclusionStatus === ExclusionStatus.Included &&
      r.adherenceScore >= ADHERENCE_EXCLUSION_THRESHOLD
  );
}

// ---------------------------------------------------------------------------
// Cohort metrics aggregation
// ---------------------------------------------------------------------------

/**
 * Aggregates cohort metrics from a pre-filtered set of analytics-eligible records.
 *
 * MOAT NOTICE (M-004): Produces basic structural aggregations only.
 * Signal extraction and protocol evolution inference are moat-protected.
 *
 * @param eligible - Records that have passed the eligibility filter.
 * @param excluded - Records that did not pass the eligibility filter.
 * @returns Aggregated CohortMetrics for the cohort.
 */
export function aggregateCohortMetrics(
  eligible: ContributorRecord[],
  excluded: ContributorRecord[]
): CohortMetrics {
  const exclusionBreakdown: Record<string, number> = {};
  for (const record of excluded) {
    const reason = record.exclusionReason ?? "unknown";
    exclusionBreakdown[reason] = (exclusionBreakdown[reason] ?? 0) + 1;
  }

  if (eligible.length === 0) {
    return {
      eligibleRecordCount: 0,
      excludedRecordCount: excluded.length,
      averageAdherenceScore: 0,
      averageChallengeCompletionRate: 0,
      minAdherenceScore: 0,
      maxAdherenceScore: 0,
      exclusionBreakdown,
      computedAt: new Date().toISOString(),
    };
  }

  let sumAdherence = 0;
  let sumChallengeCompletion = 0;
  let minAdherence = eligible[0].adherenceScore;
  let maxAdherence = eligible[0].adherenceScore;

  for (const record of eligible) {
    sumAdherence += record.adherenceScore;
    sumChallengeCompletion += record.challengeCompletionRate;
    if (record.adherenceScore < minAdherence) minAdherence = record.adherenceScore;
    if (record.adherenceScore > maxAdherence) maxAdherence = record.adherenceScore;
  }

  const count = eligible.length;

  return {
    eligibleRecordCount: count,
    excludedRecordCount: excluded.length,
    averageAdherenceScore: Math.round((sumAdherence / count) * 100) / 100,
    averageChallengeCompletionRate:
      Math.round((sumChallengeCompletion / count) * 100) / 100,
    minAdherenceScore: minAdherence,
    maxAdherenceScore: maxAdherence,
    exclusionBreakdown,
    computedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Full pipeline entrypoint
// ---------------------------------------------------------------------------

/**
 * Runs the full contributor analytics pipeline over a set of raw contributor records.
 *
 * Steps:
 * 1. Validate all records for structural correctness and LOCK-003 compliance.
 * 2. Abort with errors if any record fails validation.
 * 3. Filter records to the analytics-eligible subset.
 * 4. Aggregate cohort metrics from the eligible records.
 *
 * MOAT NOTICE (M-004): This pipeline produces structural cohort metrics only.
 * The moat-protected signal extraction layer must be invoked separately to
 * derive protocol evolution recommendations from these metrics.
 *
 * @param records - Raw contributor records to process.
 * @returns An AnalyticsPipelineResult with cohort metrics or error details.
 */
export function runAnalyticsPipeline(
  records: ContributorRecord[]
): AnalyticsPipelineResult {
  // Step 1: Validate all records.
  const validationResult = validateContributorRecordCollection(records);
  if (!validationResult.valid) {
    const errors: AnalyticsError[] = validationResult.errors.map((e) => ({
      code: "VALIDATION_ERROR",
      message: `[${e.recordId ?? "unknown"}] ${e.field}: ${e.message}`,
    }));
    return { success: false, errors };
  }

  // Step 2: Filter to analytics-eligible records.
  const eligible = filterAnalyticsEligible(records);
  const excluded = records.filter((r) => !eligible.includes(r));

  // Step 3: Aggregate cohort metrics.
  const metrics = aggregateCohortMetrics(eligible, excluded);

  return { success: true, metrics, errors: [] };
}
