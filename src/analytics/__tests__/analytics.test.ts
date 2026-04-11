/**
 * analytics.test.ts — Contributor Analytics Module Tests
 *
 * Tests cover:
 * - ContributorRecord validation (field-level + LOCK-003 business rules)
 * - validateContributorRecordCollection() uniqueness and aggregation
 * - filterAnalyticsEligible() — eligibility filter per LOCK-003
 * - aggregateCohortMetrics() — structural aggregation
 * - runAnalyticsPipeline() — full pipeline integration
 */

import {
  aggregateCohortMetrics,
  filterAnalyticsEligible,
  runAnalyticsPipeline,
  validateContributorRecord,
  validateContributorRecordCollection,
} from "../index";
import {
  ContributorRecord,
  DataOrigin,
  ExclusionReason,
  ExclusionStatus,
} from "../types";

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
    adherenceScore: 75,
    challengeCompletionRate: 80,
    recordedAt: "2026-04-11T10:00:00Z",
    ...overrides,
  };
}

function makeExcludedRecord(overrides: Partial<ContributorRecord> = {}): ContributorRecord {
  return {
    recordId: "record-excl-001",
    userId: "user-def",
    protocolId: "protocol-xyz",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Excluded,
    exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    adherenceScore: 30,
    challengeCompletionRate: 40,
    recordedAt: "2026-04-11T10:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateContributorRecord — required fields
// ---------------------------------------------------------------------------

describe("validateContributorRecord — required fields", () => {
  it("accepts a valid real_contributor record", () => {
    const result = validateContributorRecord(makeRecord());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts a valid excluded record with exclusionReason", () => {
    const result = validateContributorRecord(makeExcludedRecord());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects missing recordId", () => {
    const record = makeRecord({ recordId: undefined as unknown as string });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordId")).toBe(true);
  });

  it("rejects missing userId", () => {
    const record = makeRecord({ userId: undefined as unknown as string });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "userId")).toBe(true);
  });

  it("rejects missing protocolId", () => {
    const record = makeRecord({ protocolId: undefined as unknown as string });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("rejects missing dataOrigin", () => {
    const record = makeRecord({ dataOrigin: undefined as unknown as DataOrigin });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "dataOrigin")).toBe(true);
  });

  it("rejects invalid dataOrigin", () => {
    const record = makeRecord({ dataOrigin: "bad_origin" as DataOrigin });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "dataOrigin")).toBe(true);
  });

  it("rejects missing exclusionStatus", () => {
    const record = makeRecord({ exclusionStatus: undefined as unknown as ExclusionStatus });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionStatus")).toBe(true);
  });

  it("rejects invalid exclusionStatus", () => {
    const record = makeRecord({ exclusionStatus: "maybe" as ExclusionStatus });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionStatus")).toBe(true);
  });

  it("rejects missing recordedAt", () => {
    const record = makeRecord({ recordedAt: undefined as unknown as string });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordedAt")).toBe(true);
  });

  it("rejects invalid recordedAt format", () => {
    const record = makeRecord({ recordedAt: "April 11 2026" });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordedAt")).toBe(true);
  });

  it("rejects recordId with uppercase letters", () => {
    const record = makeRecord({ recordId: "Record-001" });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordId")).toBe(true);
  });

  it("rejects empty recordId", () => {
    const record = makeRecord({ recordId: "" });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordId")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateContributorRecord — adherenceScore / challengeCompletionRate ranges
// ---------------------------------------------------------------------------

describe("validateContributorRecord — score ranges", () => {
  it("accepts adherenceScore of 0", () => {
    // adherence 0 must be excluded, so set status accordingly
    const record = makeRecord({
      adherenceScore: 0,
      exclusionStatus: ExclusionStatus.Excluded,
      exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  it("accepts adherenceScore of 100", () => {
    const record = makeRecord({ adherenceScore: 100 });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  it("rejects adherenceScore below 0", () => {
    const record = makeRecord({ adherenceScore: -1 });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "adherenceScore")).toBe(true);
  });

  it("rejects adherenceScore above 100", () => {
    const record = makeRecord({ adherenceScore: 101 });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "adherenceScore")).toBe(true);
  });

  it("rejects challengeCompletionRate below 0", () => {
    const record = makeRecord({ challengeCompletionRate: -5 });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeCompletionRate")).toBe(true);
  });

  it("rejects challengeCompletionRate above 100", () => {
    const record = makeRecord({ challengeCompletionRate: 105 });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeCompletionRate")).toBe(true);
  });

  it("accepts challengeCompletionRate of 0", () => {
    const record = makeRecord({ challengeCompletionRate: 0 });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  it("accepts challengeCompletionRate of 100", () => {
    const record = makeRecord({ challengeCompletionRate: 100 });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateContributorRecord — LOCK-003 business rules
// ---------------------------------------------------------------------------

describe("validateContributorRecord — LOCK-003 data integrity", () => {
  it("rejects record with adherenceScore < 50 but exclusionStatus Included", () => {
    const record = makeRecord({
      adherenceScore: 45,
      exclusionStatus: ExclusionStatus.Included,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionStatus")).toBe(true);
  });

  it("accepts record with adherenceScore exactly 50 and exclusionStatus Included", () => {
    const record = makeRecord({
      adherenceScore: 50,
      exclusionStatus: ExclusionStatus.Included,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  it("accepts record with adherenceScore 49 when exclusionStatus is Excluded", () => {
    const record = makeRecord({
      adherenceScore: 49,
      exclusionStatus: ExclusionStatus.Excluded,
      exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  it("rejects synthetic record marked as Included", () => {
    const record = makeRecord({
      dataOrigin: DataOrigin.SyntheticSimulation,
      exclusionStatus: ExclusionStatus.Included,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionStatus")).toBe(true);
  });

  it("accepts synthetic record when Excluded", () => {
    const record = makeRecord({
      dataOrigin: DataOrigin.SyntheticSimulation,
      exclusionStatus: ExclusionStatus.Excluded,
      exclusionReason: ExclusionReason.SyntheticData,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  it("rejects excluded record without exclusionReason", () => {
    const record = makeRecord({
      adherenceScore: 30,
      exclusionStatus: ExclusionStatus.Excluded,
      exclusionReason: undefined,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionReason")).toBe(true);
  });

  it("rejects included record that has an exclusionReason", () => {
    const record = makeRecord({
      exclusionStatus: ExclusionStatus.Included,
      exclusionReason: ExclusionReason.ManualFlag,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionReason")).toBe(true);
  });

  it("rejects invalid exclusionReason value", () => {
    const record = makeRecord({
      adherenceScore: 20,
      exclusionStatus: ExclusionStatus.Excluded,
      exclusionReason: "some_bad_reason" as ExclusionReason,
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionReason")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateContributorRecord — optional fields
// ---------------------------------------------------------------------------

describe("validateContributorRecord — optional fields", () => {
  it("accepts record with outcomeNotes present", () => {
    const record = makeRecord({ outcomeNotes: "User reported improved sleep quality." });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  it("accepts record without outcomeNotes", () => {
    const record = makeRecord({ outcomeNotes: undefined });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateContributorRecordCollection
// ---------------------------------------------------------------------------

describe("validateContributorRecordCollection", () => {
  it("accepts a valid collection", () => {
    const records = [
      makeRecord({ recordId: "record-001" }),
      makeRecord({ recordId: "record-002" }),
      makeExcludedRecord({ recordId: "record-003" }),
    ];
    const result = validateContributorRecordCollection(records);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects duplicate recordId values in the collection", () => {
    const records = [
      makeRecord({ recordId: "record-dup" }),
      makeRecord({ recordId: "record-dup" }),
    ];
    const result = validateContributorRecordCollection(records);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordId" && e.recordId === "record-dup")).toBe(true);
  });

  it("collects errors from multiple invalid records", () => {
    const records = [
      makeRecord({ recordId: "record-001", adherenceScore: 150 }),
      makeRecord({ recordId: "record-002", recordedAt: "bad-date" }),
    ];
    const result = validateContributorRecordCollection(records);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("accepts empty collection", () => {
    const result = validateContributorRecordCollection([]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterAnalyticsEligible
// ---------------------------------------------------------------------------

describe("filterAnalyticsEligible", () => {
  it("includes only real_contributor Included records with adherence >= 50", () => {
    const records = [
      makeRecord({ recordId: "r1", adherenceScore: 75 }),
      makeRecord({ recordId: "r2", adherenceScore: 50 }),
      makeRecord({
        recordId: "r3",
        adherenceScore: 49,
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.AdherenceBelowThreshold,
      }),
      makeRecord({
        recordId: "r4",
        dataOrigin: DataOrigin.SyntheticSimulation,
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.SyntheticData,
      }),
    ];
    const eligible = filterAnalyticsEligible(records);
    expect(eligible).toHaveLength(2);
    expect(eligible.map((r) => r.recordId)).toEqual(["r1", "r2"]);
  });

  it("returns empty array when no records are eligible", () => {
    const records = [
      makeExcludedRecord({ recordId: "r1" }),
      makeRecord({
        recordId: "r2",
        dataOrigin: DataOrigin.SyntheticSimulation,
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.SyntheticData,
      }),
    ];
    const eligible = filterAnalyticsEligible(records);
    expect(eligible).toHaveLength(0);
  });

  it("returns empty array for an empty input", () => {
    expect(filterAnalyticsEligible([])).toHaveLength(0);
  });

  it("excludes records where dataOrigin is synthetic even if exclusionStatus is set correctly", () => {
    const record = makeRecord({
      recordId: "r-synth",
      dataOrigin: DataOrigin.SyntheticSimulation,
      exclusionStatus: ExclusionStatus.Excluded,
      exclusionReason: ExclusionReason.SyntheticData,
    });
    const eligible = filterAnalyticsEligible([record]);
    expect(eligible).toHaveLength(0);
  });

  it("excludes records where adherenceScore is exactly 49", () => {
    const record = makeRecord({
      recordId: "r-low",
      adherenceScore: 49,
      exclusionStatus: ExclusionStatus.Excluded,
      exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    });
    const eligible = filterAnalyticsEligible([record]);
    expect(eligible).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// aggregateCohortMetrics
// ---------------------------------------------------------------------------

describe("aggregateCohortMetrics", () => {
  it("returns zero metrics for an empty eligible cohort", () => {
    const metrics = aggregateCohortMetrics([], [makeExcludedRecord()]);
    expect(metrics.eligibleRecordCount).toBe(0);
    expect(metrics.excludedRecordCount).toBe(1);
    expect(metrics.averageAdherenceScore).toBe(0);
    expect(metrics.averageChallengeCompletionRate).toBe(0);
    expect(metrics.minAdherenceScore).toBe(0);
    expect(metrics.maxAdherenceScore).toBe(0);
  });

  it("correctly computes averages for a single record", () => {
    const eligible = [makeRecord({ adherenceScore: 80, challengeCompletionRate: 90 })];
    const metrics = aggregateCohortMetrics(eligible, []);
    expect(metrics.eligibleRecordCount).toBe(1);
    expect(metrics.averageAdherenceScore).toBe(80);
    expect(metrics.averageChallengeCompletionRate).toBe(90);
    expect(metrics.minAdherenceScore).toBe(80);
    expect(metrics.maxAdherenceScore).toBe(80);
  });

  it("correctly computes averages for multiple records", () => {
    const eligible = [
      makeRecord({ recordId: "r1", adherenceScore: 60, challengeCompletionRate: 70 }),
      makeRecord({ recordId: "r2", adherenceScore: 80, challengeCompletionRate: 90 }),
      makeRecord({ recordId: "r3", adherenceScore: 100, challengeCompletionRate: 100 }),
    ];
    const metrics = aggregateCohortMetrics(eligible, []);
    expect(metrics.eligibleRecordCount).toBe(3);
    expect(metrics.averageAdherenceScore).toBeCloseTo(80);
    expect(metrics.averageChallengeCompletionRate).toBeCloseTo(86.67);
    expect(metrics.minAdherenceScore).toBe(60);
    expect(metrics.maxAdherenceScore).toBe(100);
  });

  it("populates exclusionBreakdown from excluded records", () => {
    const excluded = [
      makeExcludedRecord({ recordId: "e1", exclusionReason: ExclusionReason.AdherenceBelowThreshold }),
      makeExcludedRecord({ recordId: "e2", exclusionReason: ExclusionReason.AdherenceBelowThreshold }),
      makeExcludedRecord({ recordId: "e3", exclusionReason: ExclusionReason.ManualFlag }),
    ];
    const metrics = aggregateCohortMetrics([], excluded);
    expect(metrics.exclusionBreakdown[ExclusionReason.AdherenceBelowThreshold]).toBe(2);
    expect(metrics.exclusionBreakdown[ExclusionReason.ManualFlag]).toBe(1);
    expect(metrics.excludedRecordCount).toBe(3);
  });

  it("sets computedAt to a valid ISO 8601 timestamp", () => {
    const metrics = aggregateCohortMetrics([makeRecord()], []);
    expect(metrics.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:+Z.]+$/);
  });

  it("returns zero counts and empty breakdown for fully empty input", () => {
    const metrics = aggregateCohortMetrics([], []);
    expect(metrics.eligibleRecordCount).toBe(0);
    expect(metrics.excludedRecordCount).toBe(0);
    expect(metrics.exclusionBreakdown).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// runAnalyticsPipeline — integration
// ---------------------------------------------------------------------------

describe("runAnalyticsPipeline", () => {
  it("returns success with metrics for a valid mixed collection", () => {
    const records = [
      makeRecord({ recordId: "r1", adherenceScore: 75, challengeCompletionRate: 80 }),
      makeRecord({ recordId: "r2", adherenceScore: 90, challengeCompletionRate: 95 }),
      makeExcludedRecord({ recordId: "r3" }),
    ];
    const result = runAnalyticsPipeline(records);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.metrics).toBeDefined();
    expect(result.metrics!.eligibleRecordCount).toBe(2);
    expect(result.metrics!.excludedRecordCount).toBe(1);
  });

  it("returns success with zero eligible records when all are excluded", () => {
    const records = [makeExcludedRecord({ recordId: "r1" })];
    const result = runAnalyticsPipeline(records);
    expect(result.success).toBe(true);
    expect(result.metrics!.eligibleRecordCount).toBe(0);
    expect(result.metrics!.excludedRecordCount).toBe(1);
  });

  it("returns failure when any record fails validation", () => {
    const records = [
      makeRecord({ recordId: "r1" }),
      makeRecord({ recordId: "r2", adherenceScore: 200 }), // invalid
    ];
    const result = runAnalyticsPipeline(records);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.metrics).toBeUndefined();
  });

  it("returns failure for LOCK-003 violation (synthetic marked Included)", () => {
    const records = [
      makeRecord({
        recordId: "r1",
        dataOrigin: DataOrigin.SyntheticSimulation,
        exclusionStatus: ExclusionStatus.Included,
      }),
    ];
    const result = runAnalyticsPipeline(records);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "VALIDATION_ERROR")).toBe(true);
  });

  it("returns failure for LOCK-003 violation (low adherence marked Included)", () => {
    const records = [
      makeRecord({
        recordId: "r1",
        adherenceScore: 30,
        exclusionStatus: ExclusionStatus.Included,
      }),
    ];
    const result = runAnalyticsPipeline(records);
    expect(result.success).toBe(false);
  });

  it("succeeds with empty collection", () => {
    const result = runAnalyticsPipeline([]);
    expect(result.success).toBe(true);
    expect(result.metrics!.eligibleRecordCount).toBe(0);
    expect(result.metrics!.excludedRecordCount).toBe(0);
  });

  it("returns failure for duplicate recordId values", () => {
    const records = [
      makeRecord({ recordId: "dup" }),
      makeRecord({ recordId: "dup" }),
    ];
    const result = runAnalyticsPipeline(records);
    expect(result.success).toBe(false);
  });

  it("correctly filters out synthetic records from metrics even when valid", () => {
    const records = [
      makeRecord({ recordId: "r-real", adherenceScore: 75 }),
      makeRecord({
        recordId: "r-synth",
        dataOrigin: DataOrigin.SyntheticSimulation,
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.SyntheticData,
      }),
    ];
    const result = runAnalyticsPipeline(records);
    expect(result.success).toBe(true);
    expect(result.metrics!.eligibleRecordCount).toBe(1);
    expect(result.metrics!.excludedRecordCount).toBe(1);
  });
});
