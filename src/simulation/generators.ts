/**
 * generators.ts — Synthetic Contributor Record Generators
 *
 * Provides factory functions for creating synthetic ContributorRecord objects
 * for use in testing and protocol preview workflows.
 *
 * SIMULATION SAFETY NOTICE (LOCK-003):
 * Every record produced by this module carries:
 *   - dataOrigin: DataOrigin.SyntheticSimulation
 *   - exclusionStatus: ExclusionStatus.Excluded
 *   - exclusionReason: ExclusionReason.SyntheticData
 *
 * These flags are not overridable by callers. This guarantees that synthetic
 * records cannot silently enter production analytics paths.
 *
 * The analytics signal model (M-004) is intentionally excluded from this
 * module. No production evidence is generated here.
 */

import { ADHERENCE_EXCLUSION_THRESHOLD } from "./schema";
import {
  DataOrigin,
  ExclusionReason,
  ExclusionStatus,
  SimulationBatch,
  SimulationContext,
  SyntheticContributorRecord,
  SyntheticRecordOptions,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Produces a zero-padded sequential record ID for a batch.
 * Format: `sim-<simulationId>-<zeroPaddedIndex>`.
 */
function makeRecordId(simulationId: string, index: number, batchSize: number): string {
  const padWidth = String(batchSize).length;
  const padded = String(index).padStart(padWidth, "0");
  return `sim-${simulationId}-${padded}`;
}

/**
 * Produces a deterministic synthetic user ID for a batch record.
 * Format: `synth-user-<zeroPaddedIndex>`.
 */
function makeUserId(index: number, batchSize: number): string {
  const padWidth = String(batchSize).length;
  return `synth-user-${String(index).padStart(padWidth, "0")}`;
}

// ---------------------------------------------------------------------------
// Single record generator
// ---------------------------------------------------------------------------

/**
 * Generates a single synthetic ContributorRecord with mandatory isolation flags.
 *
 * The returned record is typed as SyntheticContributorRecord, which guarantees
 * at the TypeScript level that:
 * - dataOrigin === DataOrigin.SyntheticSimulation
 * - exclusionStatus === ExclusionStatus.Excluded
 * - exclusionReason === ExclusionReason.SyntheticData
 *
 * Callers may supply optional overrides for adherenceScore,
 * challengeCompletionRate, and outcomeNotes. Isolation flags are immutable
 * regardless of what callers provide.
 *
 * @param simulationId - Identifier for the parent simulation run.
 * @param index - Zero-based position of this record within its batch.
 * @param batchSize - Total batch size (used for zero-padding record IDs).
 * @param options - Optional field overrides.
 * @param recordedAt - ISO 8601 timestamp for this record. Defaults to now.
 * @returns A fully-isolated SyntheticContributorRecord.
 */
export function generateSyntheticContributorRecord(
  simulationId: string,
  index: number,
  batchSize: number,
  options: SyntheticRecordOptions,
  recordedAt?: string
): SyntheticContributorRecord {
  const adherenceScore =
    options.adherenceScore !== undefined ? options.adherenceScore : ADHERENCE_EXCLUSION_THRESHOLD;
  const challengeCompletionRate =
    options.challengeCompletionRate !== undefined ? options.challengeCompletionRate : 50;

  const baseNotes =
    adherenceScore < ADHERENCE_EXCLUSION_THRESHOLD
      ? `[synthetic] adherence_below_threshold (${adherenceScore}%)`
      : "[synthetic]";
  const outcomeNotes = options.outcomeNotes
    ? `${baseNotes} ${options.outcomeNotes}`
    : baseNotes;

  return {
    recordId: makeRecordId(simulationId, index, batchSize),
    userId: makeUserId(index, batchSize),
    protocolId: options.protocolId,
    // Isolation flags — immutable, always set by this generator.
    dataOrigin: DataOrigin.SyntheticSimulation,
    exclusionStatus: ExclusionStatus.Excluded,
    exclusionReason: ExclusionReason.SyntheticData,
    adherenceScore,
    challengeCompletionRate,
    outcomeNotes,
    recordedAt: recordedAt ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Batch generator
// ---------------------------------------------------------------------------

/**
 * Generates a batch of synthetic ContributorRecords and wraps them in a
 * SimulationBatch with a SimulationContext.
 *
 * All records in the returned batch carry mandatory synthetic isolation flags.
 * The SimulationContext.isSyntheticIsolated flag is permanently set to true.
 *
 * @param simulationId - Unique identifier for this simulation run.
 * @param targetProtocolId - Protocol ID being simulated.
 * @param batchSize - Number of records to generate (must be >= 1).
 * @param options - Per-record option overrides applied uniformly to every record.
 *                  Pass an array of length === batchSize for per-record control.
 * @param createdAt - ISO 8601 timestamp for the SimulationContext. Defaults to now.
 * @returns A SimulationBatch with context metadata and synthetic records.
 * @throws {RangeError} If batchSize is less than 1.
 */
export function generateSyntheticContributorBatch(
  simulationId: string,
  targetProtocolId: string,
  batchSize: number,
  options: SyntheticRecordOptions | SyntheticRecordOptions[],
  createdAt?: string
): SimulationBatch {
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new RangeError(
      `generateSyntheticContributorBatch: batchSize must be a positive integer. Got ${batchSize}.`
    );
  }

  const timestamp = createdAt ?? new Date().toISOString();

  const context: SimulationContext = {
    simulationId,
    createdAt: timestamp,
    targetProtocolId,
    batchSize,
    isSyntheticIsolated: true,
  };

  const records: SyntheticContributorRecord[] = Array.from({ length: batchSize }, (_, i) => {
    const recordOptions = Array.isArray(options) ? options[i] ?? options[0] : options;
    return generateSyntheticContributorRecord(
      simulationId,
      i,
      batchSize,
      { ...recordOptions, protocolId: targetProtocolId },
      timestamp
    );
  });

  return { context, records };
}
