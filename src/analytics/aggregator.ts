/**
 * aggregator.ts — Analytics Intelligence Aggregator
 *
 * Aggregates contributor activity and protocol outcomes from analytics-eligible
 * contributor records, and provides a utility for normalizing signal values to
 * the unit interval [0, 1].
 *
 * All functions in this module operate exclusively on analytics-eligible records
 * (real_contributor, exclusionStatus: included, adherenceScore >= 50) per LOCK-003.
 * Callers must pass pre-filtered eligible records or use filterAnalyticsEligible()
 * from pipeline.ts before invoking these functions.
 *
 * MOAT NOTICE (M-004): This module produces structural aggregations only.
 * The Population Analytics Signal Model — including the weighting scheme,
 * aggregation methodology, and signal extraction logic — is moat-protected
 * proprietary IP and must NOT be implemented here.
 */

import {
  ContributorActivitySummary,
  ContributorRecord,
  ProtocolOutcomeSummary,
} from "./types";

// ---------------------------------------------------------------------------
// Contributor activity aggregation
// ---------------------------------------------------------------------------

/**
 * Aggregates contributor activity from a mixed set of contributor records.
 *
 * For each distinct userId, computes:
 * - Total records (all records for the user, eligible or not)
 * - Eligible records count
 * - Average adherence and challenge completion rate over eligible records
 * - Distinct protocol IDs from eligible records
 *
 * MOAT NOTICE (M-004): Produces structural per-user summaries only.
 *
 * @param allRecords      - All contributor records for the population (may include
 *                          excluded records; this function separates them internally).
 * @param eligibleRecords - Pre-filtered analytics-eligible records (LOCK-003).
 *                          Must be a strict subset of allRecords.
 * @returns Array of ContributorActivitySummary, one per distinct userId across
 *          allRecords.
 */
export function aggregateContributorActivity(
  allRecords: ContributorRecord[],
  eligibleRecords: ContributorRecord[]
): ContributorActivitySummary[] {
  const computedAt = new Date().toISOString();

  // Build per-user totals from all records.
  const totalByUser = new Map<string, number>();
  for (const r of allRecords) {
    totalByUser.set(r.userId, (totalByUser.get(r.userId) ?? 0) + 1);
  }

  // Build per-user eligible aggregations.
  const eligibleMap = new Map<
    string,
    { adherenceSum: number; challengeSum: number; protocols: Set<string>; count: number }
  >();
  for (const r of eligibleRecords) {
    const entry = eligibleMap.get(r.userId) ?? {
      adherenceSum: 0,
      challengeSum: 0,
      protocols: new Set<string>(),
      count: 0,
    };
    entry.adherenceSum += r.adherenceScore;
    entry.challengeSum += r.challengeCompletionRate;
    entry.protocols.add(r.protocolId);
    entry.count += 1;
    eligibleMap.set(r.userId, entry);
  }

  const summaries: ContributorActivitySummary[] = [];
  for (const [userId, total] of totalByUser) {
    const eligible = eligibleMap.get(userId);
    const eligibleCount = eligible?.count ?? 0;
    const averageAdherenceScore =
      eligible && eligible.count > 0
        ? Math.round((eligible.adherenceSum / eligible.count) * 100) / 100
        : 0;
    const averageChallengeCompletionRate =
      eligible && eligible.count > 0
        ? Math.round((eligible.challengeSum / eligible.count) * 100) / 100
        : 0;

    summaries.push({
      userId,
      totalRecords: total,
      eligibleRecords: eligibleCount,
      averageAdherenceScore,
      averageChallengeCompletionRate,
      protocolIds: eligible ? Array.from(eligible.protocols).sort() : [],
      computedAt,
    });
  }

  return summaries;
}

// ---------------------------------------------------------------------------
// Protocol outcome aggregation
// ---------------------------------------------------------------------------

/**
 * Aggregates protocol outcomes from a mixed set of contributor records.
 *
 * For each distinct protocolId, computes:
 * - Total contributors (all records for the protocol, eligible or not)
 * - Eligible contributors count
 * - Average adherence and challenge completion rate over eligible records
 *
 * MOAT NOTICE (M-004): Produces structural per-protocol summaries only.
 *
 * @param allRecords      - All contributor records for the population (may include
 *                          excluded records).
 * @param eligibleRecords - Pre-filtered analytics-eligible records (LOCK-003).
 * @returns Array of ProtocolOutcomeSummary, one per distinct protocolId across
 *          allRecords.
 */
export function aggregateProtocolOutcomes(
  allRecords: ContributorRecord[],
  eligibleRecords: ContributorRecord[]
): ProtocolOutcomeSummary[] {
  const computedAt = new Date().toISOString();

  // Build per-protocol totals from all records.
  const totalByProtocol = new Map<string, number>();
  for (const r of allRecords) {
    totalByProtocol.set(r.protocolId, (totalByProtocol.get(r.protocolId) ?? 0) + 1);
  }

  // Build per-protocol eligible aggregations.
  const eligibleMap = new Map<
    string,
    { adherenceSum: number; challengeSum: number; count: number }
  >();
  for (const r of eligibleRecords) {
    const entry = eligibleMap.get(r.protocolId) ?? {
      adherenceSum: 0,
      challengeSum: 0,
      count: 0,
    };
    entry.adherenceSum += r.adherenceScore;
    entry.challengeSum += r.challengeCompletionRate;
    entry.count += 1;
    eligibleMap.set(r.protocolId, entry);
  }

  const summaries: ProtocolOutcomeSummary[] = [];
  for (const [protocolId, total] of totalByProtocol) {
    const eligible = eligibleMap.get(protocolId);
    const eligibleCount = eligible?.count ?? 0;
    const averageAdherenceScore =
      eligible && eligible.count > 0
        ? Math.round((eligible.adherenceSum / eligible.count) * 100) / 100
        : 0;
    const averageChallengeCompletionRate =
      eligible && eligible.count > 0
        ? Math.round((eligible.challengeSum / eligible.count) * 100) / 100
        : 0;

    summaries.push({
      protocolId,
      totalContributors: total,
      eligibleContributors: eligibleCount,
      averageAdherenceScore,
      averageChallengeCompletionRate,
      computedAt,
    });
  }

  return summaries;
}

// ---------------------------------------------------------------------------
// Signal normalization
// ---------------------------------------------------------------------------

/**
 * Normalizes a numeric signal value from an arbitrary [min, max] range to the
 * unit interval [0, 1].
 *
 * - When min === max (zero-range), returns 0.
 * - The output is clamped to [0, 1] in case the value falls outside [min, max].
 * - The result is rounded to 6 decimal places.
 *
 * @param value - The raw signal value to normalize.
 * @param min   - The minimum expected value of the signal range.
 * @param max   - The maximum expected value of the signal range.
 * @returns Normalized value in [0, 1].
 */
export function normalizeSignalValue(value: number, min: number, max: number): number {
  if (min === max) return 0;
  const normalized = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, normalized));
  return Math.round(clamped * 1e6) / 1e6;
}
