/**
 * signals.ts — Analytics Intelligence Signal Extraction
 *
 * Converts analytics-eligible contributor records into structured observable
 * signals used by the protocol scoring and blend optimization layers.
 *
 * All functions in this module operate exclusively on analytics-eligible records
 * (real_contributor, exclusionStatus: included, adherenceScore >= 50) per LOCK-003.
 * Callers must pass pre-filtered eligible records or use filterAnalyticsEligible()
 * from pipeline.ts before invoking these functions.
 *
 * MOAT NOTICE (M-004): This module produces structural observable signals only.
 * The Population Analytics Signal Model — including the weighting scheme, signal
 * extraction methodology, and protocol evolution recommendation logic — is
 * moat-protected proprietary IP and must NOT be implemented here.
 *
 * MOAT NOTICE (M-003): Challenge participation signals are structural rate
 * observables. The challenge engine sequencing rules and personalization
 * heuristics are moat-protected and must not be reconstructed from these signals.
 */

import {
  AdherenceSignal,
  ChallengeParticipationSignal,
  ContributorRecord,
  OilUsageFrequencySignal,
  ProtocolCompletionSignal,
  RecordId,
} from "./types";

// ---------------------------------------------------------------------------
// Normalization helper
// ---------------------------------------------------------------------------

/**
 * Normalizes a percentage value (0–100) to the unit interval [0, 1].
 * Values are clamped to the valid range before normalization.
 */
function normalizePercent(value: number): number {
  const clamped = Math.max(0, Math.min(100, value));
  return Math.round((clamped / 100) * 1e6) / 1e6;
}

// ---------------------------------------------------------------------------
// Adherence signals
// ---------------------------------------------------------------------------

/**
 * Extracts an adherence signal from a single analytics-eligible contributor record.
 *
 * @param record - An analytics-eligible ContributorRecord.
 * @returns An AdherenceSignal with normalized score.
 */
export function extractAdherenceSignal(record: ContributorRecord): AdherenceSignal {
  return {
    recordId: record.recordId as RecordId,
    protocolId: record.protocolId,
    adherenceScore: record.adherenceScore,
    normalizedScore: normalizePercent(record.adherenceScore),
    computedAt: new Date().toISOString(),
  };
}

/**
 * Extracts adherence signals from a collection of analytics-eligible contributor records.
 *
 * @param records - Analytics-eligible ContributorRecord array (LOCK-003 pre-filtered).
 * @returns Array of AdherenceSignal, one per record.
 */
export function extractAdherenceSignals(
  records: ContributorRecord[]
): AdherenceSignal[] {
  return records.map(extractAdherenceSignal);
}

// ---------------------------------------------------------------------------
// Protocol completion signals
// ---------------------------------------------------------------------------

/**
 * Extracts a protocol completion signal from a single analytics-eligible record.
 * The completionIndex is the arithmetic mean of normalized adherence and normalized
 * challenge completion rate.
 *
 * MOAT NOTICE (M-004): The completionIndex is a structural composite only.
 *
 * @param record - An analytics-eligible ContributorRecord.
 * @returns A ProtocolCompletionSignal with composite completionIndex.
 */
export function extractProtocolCompletionSignal(
  record: ContributorRecord
): ProtocolCompletionSignal {
  const normAdherence = normalizePercent(record.adherenceScore);
  const normChallenge = normalizePercent(record.challengeCompletionRate);
  const completionIndex = Math.round(((normAdherence + normChallenge) / 2) * 1e6) / 1e6;

  return {
    recordId: record.recordId as RecordId,
    protocolId: record.protocolId,
    challengeCompletionRate: record.challengeCompletionRate,
    adherenceScore: record.adherenceScore,
    completionIndex,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Extracts protocol completion signals from a collection of analytics-eligible records.
 *
 * @param records - Analytics-eligible ContributorRecord array (LOCK-003 pre-filtered).
 * @returns Array of ProtocolCompletionSignal, one per record.
 */
export function extractProtocolCompletionSignals(
  records: ContributorRecord[]
): ProtocolCompletionSignal[] {
  return records.map(extractProtocolCompletionSignal);
}

// ---------------------------------------------------------------------------
// Oil usage frequency signals
// ---------------------------------------------------------------------------

/**
 * Extracts oil usage frequency signals from a collection of analytics-eligible records.
 *
 * Frequency is measured by counting how many distinct analytics-eligible contributor
 * records reference each protocolId. This serves as a structural proxy for protocol
 * (and thus oil blend) reach within the contributor base.
 *
 * MOAT NOTICE (M-004): Observation counts are structural measures only.
 *
 * @param records - Analytics-eligible ContributorRecord array (LOCK-003 pre-filtered).
 * @returns Array of OilUsageFrequencySignal, one per distinct protocolId.
 */
export function extractOilUsageFrequencySignals(
  records: ContributorRecord[]
): OilUsageFrequencySignal[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    counts.set(record.protocolId, (counts.get(record.protocolId) ?? 0) + 1);
  }

  const computedAt = new Date().toISOString();
  return Array.from(counts.entries()).map(([protocolId, observationCount]) => ({
    protocolId,
    observationCount,
    computedAt,
  }));
}

// ---------------------------------------------------------------------------
// Challenge participation signals
// ---------------------------------------------------------------------------

/**
 * Extracts a challenge participation signal from a single analytics-eligible record.
 *
 * MOAT NOTICE (M-003): This is a structural rate observable only. Challenge engine
 * sequencing rules and personalization heuristics are moat-protected.
 *
 * @param record - An analytics-eligible ContributorRecord.
 * @returns A ChallengeParticipationSignal with normalized rate.
 */
export function extractChallengeParticipationSignal(
  record: ContributorRecord
): ChallengeParticipationSignal {
  return {
    recordId: record.recordId as RecordId,
    protocolId: record.protocolId,
    challengeCompletionRate: record.challengeCompletionRate,
    normalizedRate: normalizePercent(record.challengeCompletionRate),
    computedAt: new Date().toISOString(),
  };
}

/**
 * Extracts challenge participation signals from a collection of analytics-eligible records.
 *
 * @param records - Analytics-eligible ContributorRecord array (LOCK-003 pre-filtered).
 * @returns Array of ChallengeParticipationSignal, one per record.
 */
export function extractChallengeParticipationSignals(
  records: ContributorRecord[]
): ChallengeParticipationSignal[] {
  return records.map(extractChallengeParticipationSignal);
}
