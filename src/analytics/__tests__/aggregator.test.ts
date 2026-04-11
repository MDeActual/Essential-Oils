/**
 * aggregator.test.ts — Unit Tests for Analytics Aggregator Module
 *
 * Tests cover:
 * - aggregateContributorActivity
 * - aggregateProtocolOutcomes
 * - normalizeSignalValue
 */

import { aggregateContributorActivity, aggregateProtocolOutcomes, normalizeSignalValue } from "../aggregator";
import { ContributorRecord, DataOrigin, ExclusionReason, ExclusionStatus } from "../types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeRecord(overrides: Partial<ContributorRecord> = {}): ContributorRecord {
  return {
    recordId: "record-001",
    userId: "user-abc",
    protocolId: "protocol-xyz",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 80,
    challengeCompletionRate: 70,
    recordedAt: "2026-04-11T10:00:00Z",
    ...overrides,
  };
}

function makeExcludedRecord(overrides: Partial<ContributorRecord> = {}): ContributorRecord {
  return makeRecord({
    exclusionStatus: ExclusionStatus.Excluded,
    exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    adherenceScore: 30,
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// aggregateContributorActivity
// ---------------------------------------------------------------------------

describe("aggregateContributorActivity", () => {
  it("returns one summary per distinct userId in allRecords", () => {
    const allRecords = [
      makeRecord({ recordId: "r1", userId: "user-a" }),
      makeRecord({ recordId: "r2", userId: "user-b" }),
    ];
    const eligible = [...allRecords];
    const summaries = aggregateContributorActivity(allRecords, eligible);
    expect(summaries).toHaveLength(2);
    const userIds = summaries.map((s) => s.userId).sort();
    expect(userIds).toEqual(["user-a", "user-b"]);
  });

  it("returns empty array for empty allRecords", () => {
    expect(aggregateContributorActivity([], [])).toEqual([]);
  });

  it("counts totalRecords including excluded records", () => {
    const allRecords = [
      makeRecord({ recordId: "r1", userId: "user-a" }),
      makeExcludedRecord({ recordId: "r2", userId: "user-a" }),
    ];
    const eligible = [allRecords[0]];
    const summaries = aggregateContributorActivity(allRecords, eligible);
    const summary = summaries.find((s) => s.userId === "user-a")!;
    expect(summary.totalRecords).toBe(2);
    expect(summary.eligibleRecords).toBe(1);
  });

  it("averages adherence and challenge rates over eligible records only", () => {
    const allRecords = [
      makeRecord({ recordId: "r1", userId: "user-a", adherenceScore: 80, challengeCompletionRate: 60 }),
      makeRecord({ recordId: "r2", userId: "user-a", adherenceScore: 60, challengeCompletionRate: 80 }),
    ];
    const eligible = [...allRecords];
    const summaries = aggregateContributorActivity(allRecords, eligible);
    const summary = summaries.find((s) => s.userId === "user-a")!;
    expect(summary.averageAdherenceScore).toBeCloseTo(70, 2);
    expect(summary.averageChallengeCompletionRate).toBeCloseTo(70, 2);
  });

  it("sets averages to 0 when user has no eligible records", () => {
    const allRecords = [makeExcludedRecord({ userId: "user-x" })];
    const eligible: ContributorRecord[] = [];
    const summaries = aggregateContributorActivity(allRecords, eligible);
    const summary = summaries.find((s) => s.userId === "user-x")!;
    expect(summary.eligibleRecords).toBe(0);
    expect(summary.averageAdherenceScore).toBe(0);
    expect(summary.averageChallengeCompletionRate).toBe(0);
    expect(summary.protocolIds).toEqual([]);
  });

  it("collects distinct protocol IDs from eligible records", () => {
    const allRecords = [
      makeRecord({ recordId: "r1", userId: "user-a", protocolId: "proto-a" }),
      makeRecord({ recordId: "r2", userId: "user-a", protocolId: "proto-b" }),
      makeRecord({ recordId: "r3", userId: "user-a", protocolId: "proto-a" }),
    ];
    const eligible = [...allRecords];
    const summaries = aggregateContributorActivity(allRecords, eligible);
    const summary = summaries.find((s) => s.userId === "user-a")!;
    expect(summary.protocolIds.sort()).toEqual(["proto-a", "proto-b"]);
  });

  it("includes a computedAt ISO timestamp on each summary", () => {
    const allRecords = [makeRecord()];
    const eligible = [...allRecords];
    const summaries = aggregateContributorActivity(allRecords, eligible);
    expect(summaries[0].computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ---------------------------------------------------------------------------
// aggregateProtocolOutcomes
// ---------------------------------------------------------------------------

describe("aggregateProtocolOutcomes", () => {
  it("returns one summary per distinct protocolId in allRecords", () => {
    const allRecords = [
      makeRecord({ recordId: "r1", protocolId: "proto-a" }),
      makeRecord({ recordId: "r2", protocolId: "proto-b" }),
    ];
    const eligible = [...allRecords];
    const summaries = aggregateProtocolOutcomes(allRecords, eligible);
    expect(summaries).toHaveLength(2);
    const protocolIds = summaries.map((s) => s.protocolId).sort();
    expect(protocolIds).toEqual(["proto-a", "proto-b"]);
  });

  it("returns empty array for empty allRecords", () => {
    expect(aggregateProtocolOutcomes([], [])).toEqual([]);
  });

  it("counts totalContributors including excluded records", () => {
    const allRecords = [
      makeRecord({ recordId: "r1", protocolId: "proto-a" }),
      makeExcludedRecord({ recordId: "r2", protocolId: "proto-a" }),
    ];
    const eligible = [allRecords[0]];
    const summaries = aggregateProtocolOutcomes(allRecords, eligible);
    const summary = summaries.find((s) => s.protocolId === "proto-a")!;
    expect(summary.totalContributors).toBe(2);
    expect(summary.eligibleContributors).toBe(1);
  });

  it("averages adherence and challenge rates over eligible records only", () => {
    const allRecords = [
      makeRecord({ recordId: "r1", protocolId: "proto-a", adherenceScore: 80, challengeCompletionRate: 60 }),
      makeRecord({ recordId: "r2", protocolId: "proto-a", adherenceScore: 60, challengeCompletionRate: 80 }),
    ];
    const eligible = [...allRecords];
    const summaries = aggregateProtocolOutcomes(allRecords, eligible);
    const summary = summaries.find((s) => s.protocolId === "proto-a")!;
    expect(summary.averageAdherenceScore).toBeCloseTo(70, 2);
    expect(summary.averageChallengeCompletionRate).toBeCloseTo(70, 2);
  });

  it("sets averages to 0 when protocol has no eligible records", () => {
    const allRecords = [makeExcludedRecord({ protocolId: "proto-x" })];
    const eligible: ContributorRecord[] = [];
    const summaries = aggregateProtocolOutcomes(allRecords, eligible);
    const summary = summaries.find((s) => s.protocolId === "proto-x")!;
    expect(summary.eligibleContributors).toBe(0);
    expect(summary.averageAdherenceScore).toBe(0);
    expect(summary.averageChallengeCompletionRate).toBe(0);
  });

  it("includes a computedAt ISO timestamp on each summary", () => {
    const allRecords = [makeRecord()];
    const eligible = [...allRecords];
    const summaries = aggregateProtocolOutcomes(allRecords, eligible);
    expect(summaries[0].computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ---------------------------------------------------------------------------
// normalizeSignalValue
// ---------------------------------------------------------------------------

describe("normalizeSignalValue", () => {
  it("normalizes a value at min to 0", () => {
    expect(normalizeSignalValue(0, 0, 100)).toBe(0);
  });

  it("normalizes a value at max to 1", () => {
    expect(normalizeSignalValue(100, 0, 100)).toBe(1);
  });

  it("normalizes a midpoint correctly", () => {
    expect(normalizeSignalValue(50, 0, 100)).toBeCloseTo(0.5, 5);
  });

  it("works with non-zero min", () => {
    // value=75, min=50, max=100 → (75-50)/(100-50) = 0.5
    expect(normalizeSignalValue(75, 50, 100)).toBeCloseTo(0.5, 5);
  });

  it("clamps values below min to 0", () => {
    expect(normalizeSignalValue(-10, 0, 100)).toBe(0);
  });

  it("clamps values above max to 1", () => {
    expect(normalizeSignalValue(150, 0, 100)).toBe(1);
  });

  it("returns 0 when min equals max (zero-range)", () => {
    expect(normalizeSignalValue(50, 50, 50)).toBe(0);
  });

  it("handles negative ranges", () => {
    // value=-5, min=-10, max=0 → (-5-(-10))/(0-(-10)) = 5/10 = 0.5
    expect(normalizeSignalValue(-5, -10, 0)).toBeCloseTo(0.5, 5);
  });

  it("returns a value with at most 6 decimal places", () => {
    const result = normalizeSignalValue(1, 0, 3);
    const decimals = result.toString().split(".")[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(6);
  });
});
