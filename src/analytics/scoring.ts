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

interface ProtocolRecordAggregate {
  observationCount: number;
  adherenceSum: number;
}

/**
 * Computes structural blend co-occurrence signals without repeated full-array scans.
 *
 * Records are first indexed by protocolId, then each blend aggregates over the
 * protocol IDs supplied by the caller. This keeps the function bounded by the
 * number of records plus the number of blend-protocol associations.
 */
export function computeBlendSynergyInfluenceSignals(
  blendProtocolMap: ReadonlyMap<string, ReadonlySet<string>>,
  eligibleRecords: ContributorRecord[]
): BlendSynergyInfluenceSignal[] {
  const computedAt = new Date().toISOString();
  const recordsByProtocol = new Map<string, ProtocolRecordAggregate>();

  for (const record of eligibleRecords) {
    const aggregate = recordsByProtocol.get(record.protocolId) ?? {
      observationCount: 0,
      adherenceSum: 0,
    };
    aggregate.observationCount += 1;
    aggregate.adherenceSum += record.adherenceScore;
    recordsByProtocol.set(record.protocolId, aggregate);
  }

  const results: BlendSynergyInfluenceSignal[] = [];

  for (const [blendId, protocolIds] of blendProtocolMap) {
    let observationCount = 0;
    let adherenceSum = 0;

    for (const protocolId of protocolIds) {
      const aggregate = recordsByProtocol.get(protocolId);
      if (!aggregate) continue;
      observationCount += aggregate.observationCount;
      adherenceSum += aggregate.adherenceSum;
    }

    const averageProtocolAdherence =
      observationCount === 0
        ? 0
        : Math.round((adherenceSum / observationCount) * 100) / 100;

    results.push({ blendId, observationCount, averageProtocolAdherence, computedAt });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Contributor reliability score
// ---------------------------------------------------------------------------

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
