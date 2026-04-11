/**
 * scoring.ts — Analytics Intelligence Scoring
 *
 * Computes structural scoring metrics from analytics-eligible contributor records.
 * These scores describe observable protocol and contributor performance patterns
 * using basic aggregation — they do NOT implement the moat-protected signal
 * extraction methodology.
 *
 * All functions in this module require pre-filtered analytics-eligible records
 * (real_contributor, exclusionStatus: included, adherenceScore >= 50) per LOCK-003.
 *
 * MOAT NOTICE (M-001): BlendSynergyInfluenceSignal is a structural co-occurrence
 * signal only. It does NOT include, infer, or expose the synergy scoring matrix,
 * weights, or blend intelligence computation (M-001).
 *
 * MOAT NOTICE (M-004): All scores in this module are basic structural aggregations.
 * The Population Analytics Signal Model weighting scheme and protocol evolution
 * recommendation logic are moat-protected and must NOT be implemented here.
 */

import {
  BlendSynergyInfluenceSignal,
  ContributorRecord,
  ContributorReliabilityScore,
  ProtocolEffectivenessScore,
} from "./types";

// ---------------------------------------------------------------------------
// Protocol effectiveness score
// ---------------------------------------------------------------------------

/**
 * Computes a structural protocol effectiveness score for a single protocol, based
 * on the arithmetic mean of average adherence and average challenge completion rate
 * across analytics-eligible contributors.
 *
 * MOAT NOTICE (M-004): This score is a structural aggregate only.
 *
 * @param protocolId - The protocol to score.
 * @param eligibleRecords - Analytics-eligible records (LOCK-003 pre-filtered).
 *                          Records not matching protocolId are ignored.
 * @returns A ProtocolEffectivenessScore. Score is 0 and sampleSize is 0 when no
 *          eligible records reference the given protocolId.
 */
export function computeProtocolEffectivenessScore(
  protocolId: string,
  eligibleRecords: ContributorRecord[]
): ProtocolEffectivenessScore {
  const matching = eligibleRecords.filter((r) => r.protocolId === protocolId);
  const computedAt = new Date().toISOString();

  if (matching.length === 0) {
    return { protocolId, score: 0, sampleSize: 0, computedAt };
  }

  let sumAdherence = 0;
  let sumChallenge = 0;
  for (const r of matching) {
    sumAdherence += r.adherenceScore;
    sumChallenge += r.challengeCompletionRate;
  }

  const n = matching.length;
  const avgAdherence = sumAdherence / n;
  const avgChallenge = sumChallenge / n;
  const score = Math.round(((avgAdherence + avgChallenge) / 2) * 100) / 100;

  return { protocolId, score, sampleSize: n, computedAt };
}

// ---------------------------------------------------------------------------
// Blend synergy influence signals
// ---------------------------------------------------------------------------

/**
 * Computes blend synergy influence signals for a set of blend IDs.
 *
 * For each blendId, the signal records how many analytics-eligible contributor
 * records are associated with protocols that reference the blend (via protocolId
 * lookup), along with the average adherence of those records.
 *
 * Since this module does not hold a blend-to-protocol mapping, callers supply a
 * `blendProtocolMap` that maps each blendId to the set of protocolIds it is used in.
 *
 * MOAT NOTICE (M-001): This function produces structural co-occurrence data only.
 * The synergy scoring matrix (M-001) and its computation are moat-protected and
 * are NOT referenced or replicated here.
 *
 * @param blendProtocolMap - A mapping from blendId to the set of protocolIds
 *                           that reference the blend.
 * @param eligibleRecords  - Analytics-eligible records (LOCK-003 pre-filtered).
 * @returns Array of BlendSynergyInfluenceSignal, one per blendId.
 */
export function computeBlendSynergyInfluenceSignals(
  blendProtocolMap: ReadonlyMap<string, ReadonlySet<string>>,
  eligibleRecords: ContributorRecord[]
): BlendSynergyInfluenceSignal[] {
  const computedAt = new Date().toISOString();
  const results: BlendSynergyInfluenceSignal[] = [];

  for (const [blendId, protocolIds] of blendProtocolMap) {
    const matching = eligibleRecords.filter((r) => protocolIds.has(r.protocolId));
    const observationCount = matching.length;
    const averageProtocolAdherence =
      observationCount === 0
        ? 0
        : Math.round(
            (matching.reduce((sum, r) => sum + r.adherenceScore, 0) / observationCount) *
              100
          ) / 100;

    results.push({ blendId, observationCount, averageProtocolAdherence, computedAt });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Contributor reliability score
// ---------------------------------------------------------------------------

/**
 * Computes a structural reliability score for a single contributor based on their
 * average adherence score across all analytics-eligible protocol runs.
 *
 * MOAT NOTICE (M-004): This score is a structural average only.
 *
 * @param userId         - The anonymized user identifier.
 * @param eligibleRecords - Analytics-eligible records (LOCK-003 pre-filtered).
 *                          Records not matching userId are ignored.
 * @returns A ContributorReliabilityScore. Score is 0 and recordCount is 0 when
 *          no eligible records reference the given userId.
 */
export function computeContributorReliabilityScore(
  userId: string,
  eligibleRecords: ContributorRecord[]
): ContributorReliabilityScore {
  const matching = eligibleRecords.filter((r) => r.userId === userId);
  const computedAt = new Date().toISOString();

  if (matching.length === 0) {
    return {
      userId,
      reliabilityScore: 0,
      recordCount: 0,
      averageAdherenceScore: 0,
      computedAt,
    };
  }

  const sum = matching.reduce((acc, r) => acc + r.adherenceScore, 0);
  const averageAdherenceScore = Math.round((sum / matching.length) * 100) / 100;

  return {
    userId,
    reliabilityScore: averageAdherenceScore,
    recordCount: matching.length,
    averageAdherenceScore,
    computedAt,
  };
}
