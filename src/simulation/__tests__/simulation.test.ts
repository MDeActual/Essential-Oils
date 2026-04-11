/**
 * simulation.test.ts — Simulation Module Tests
 *
 * Tests for:
 * - Type definitions and enum values
 * - Schema constants (ADHERENCE_EXCLUSION_THRESHOLD, field constraints)
 * - generateSyntheticContributorRecord() — isolation flags, field values, options
 * - generateSyntheticContributorBatch() — batch output, context metadata, isolation
 * - validateContributorRecord() — valid records, LOCK-003 business rules
 * - validateContributorRecordCollection() — uniqueness and aggregation
 * - assertSyntheticIsolation() — synthetic-safe and contaminated batches
 * - assertBatchIsolation() — full SimulationBatch isolation guard
 * - filterAnalyticsEligible() — production gateway correctness
 * - Moat boundary: no analytics signal model, no production data mixing (M-004)
 */

import {
  ADHERENCE_EXCLUSION_THRESHOLD,
  ADHERENCE_SCORE_MAX,
  ADHERENCE_SCORE_MIN,
  CHALLENGE_COMPLETION_RATE_MAX,
  CHALLENGE_COMPLETION_RATE_MIN,
  DataOrigin,
  ExclusionReason,
  ExclusionStatus,
  assertBatchIsolation,
  assertSyntheticIsolation,
  filterAnalyticsEligible,
  generateSyntheticContributorBatch,
  generateSyntheticContributorRecord,
  validateContributorRecord,
  validateContributorRecordCollection,
} from "../index";
import type {
  ContributorRecord,
  SimulationBatch,
  SyntheticContributorRecord,
} from "../index";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

/** Factory for a valid real_contributor record that should be analytics-eligible. */
function makeRealRecord(overrides: Partial<ContributorRecord> = {}): ContributorRecord {
  return {
    recordId: "rec-real-001",
    userId: "user-abc",
    protocolId: "protocol-sleep-support",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 75,
    challengeCompletionRate: 80,
    outcomeNotes: "Significant improvement in sleep quality.",
    recordedAt: "2026-04-11T00:00:00Z",
    ...overrides,
  };
}

/** Factory for a valid synthetic record. */
function makeSyntheticRecord(
  overrides: Partial<SyntheticContributorRecord> = {}
): SyntheticContributorRecord {
  return {
    recordId: "sim-run-01-0",
    userId: "synth-user-0",
    protocolId: "protocol-sleep-support",
    dataOrigin: DataOrigin.SyntheticSimulation,
    exclusionStatus: ExclusionStatus.Excluded,
    exclusionReason: ExclusionReason.SyntheticData,
    adherenceScore: 60,
    challengeCompletionRate: 55,
    outcomeNotes: "[synthetic]",
    recordedAt: "2026-04-11T00:00:00Z",
    ...overrides,
  } as SyntheticContributorRecord;
}

// ---------------------------------------------------------------------------
// Schema constants
// ---------------------------------------------------------------------------

describe("Schema constants", () => {
  test("ADHERENCE_EXCLUSION_THRESHOLD is 50", () => {
    expect(ADHERENCE_EXCLUSION_THRESHOLD).toBe(50);
  });

  test("ADHERENCE_SCORE_MIN is 0", () => {
    expect(ADHERENCE_SCORE_MIN).toBe(0);
  });

  test("ADHERENCE_SCORE_MAX is 100", () => {
    expect(ADHERENCE_SCORE_MAX).toBe(100);
  });

  test("CHALLENGE_COMPLETION_RATE_MIN is 0", () => {
    expect(CHALLENGE_COMPLETION_RATE_MIN).toBe(0);
  });

  test("CHALLENGE_COMPLETION_RATE_MAX is 100", () => {
    expect(CHALLENGE_COMPLETION_RATE_MAX).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Enum values
// ---------------------------------------------------------------------------

describe("DataOrigin enum", () => {
  test("has real_contributor value", () => {
    expect(DataOrigin.RealContributor).toBe("real_contributor");
  });

  test("has synthetic_simulation value", () => {
    expect(DataOrigin.SyntheticSimulation).toBe("synthetic_simulation");
  });

  test("has exactly two values", () => {
    expect(Object.values(DataOrigin)).toHaveLength(2);
  });
});

describe("ExclusionStatus enum", () => {
  test("has included value", () => {
    expect(ExclusionStatus.Included).toBe("included");
  });

  test("has excluded value", () => {
    expect(ExclusionStatus.Excluded).toBe("excluded");
  });

  test("has exactly two values", () => {
    expect(Object.values(ExclusionStatus)).toHaveLength(2);
  });
});

describe("ExclusionReason enum", () => {
  test("has adherence_below_threshold value", () => {
    expect(ExclusionReason.AdherenceBelowThreshold).toBe("adherence_below_threshold");
  });

  test("has synthetic_data value", () => {
    expect(ExclusionReason.SyntheticData).toBe("synthetic_data");
  });

  test("has manual_exclusion value", () => {
    expect(ExclusionReason.ManualExclusion).toBe("manual_exclusion");
  });

  test("has incomplete_record value", () => {
    expect(ExclusionReason.IncompleteRecord).toBe("incomplete_record");
  });
});

// ---------------------------------------------------------------------------
// generateSyntheticContributorRecord
// ---------------------------------------------------------------------------

describe("generateSyntheticContributorRecord", () => {
  const simulationId = "run-01";
  const batchSize = 5;
  const baseOptions = { protocolId: "protocol-stress-relief" };

  test("always sets dataOrigin to SyntheticSimulation", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions);
    expect(record.dataOrigin).toBe(DataOrigin.SyntheticSimulation);
  });

  test("always sets exclusionStatus to Excluded", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions);
    expect(record.exclusionStatus).toBe(ExclusionStatus.Excluded);
  });

  test("always sets exclusionReason to SyntheticData", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions);
    expect(record.exclusionReason).toBe(ExclusionReason.SyntheticData);
  });

  test("uses default adherenceScore equal to ADHERENCE_EXCLUSION_THRESHOLD when not specified", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions);
    expect(record.adherenceScore).toBe(ADHERENCE_EXCLUSION_THRESHOLD);
  });

  test("uses provided adherenceScore when specified", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, {
      ...baseOptions,
      adherenceScore: 80,
    });
    expect(record.adherenceScore).toBe(80);
  });

  test("uses provided challengeCompletionRate when specified", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, {
      ...baseOptions,
      challengeCompletionRate: 90,
    });
    expect(record.challengeCompletionRate).toBe(90);
  });

  test("generates a sequential recordId", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions);
    expect(record.recordId).toMatch(/^sim-run-01-\d+$/);
  });

  test("generates a synthetic userId", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions);
    expect(record.userId).toMatch(/^synth-user-\d+$/);
  });

  test("sets protocolId from options", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions);
    expect(record.protocolId).toBe("protocol-stress-relief");
  });

  test("includes [synthetic] tag in outcomeNotes", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions);
    expect(record.outcomeNotes).toContain("[synthetic]");
  });

  test("includes adherence_below_threshold hint in outcomeNotes when adherence is low", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, {
      ...baseOptions,
      adherenceScore: 30,
    });
    expect(record.outcomeNotes).toContain("adherence_below_threshold");
  });

  test("appends caller-supplied outcomeNotes after [synthetic] prefix", () => {
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, {
      ...baseOptions,
      outcomeNotes: "trial notes",
    });
    expect(record.outcomeNotes).toContain("[synthetic]");
    expect(record.outcomeNotes).toContain("trial notes");
  });

  test("uses provided recordedAt timestamp", () => {
    const ts = "2026-01-15T08:00:00Z";
    const record = generateSyntheticContributorRecord(simulationId, 0, batchSize, baseOptions, ts);
    expect(record.recordedAt).toBe(ts);
  });

  test("record IDs are zero-padded to batchSize width", () => {
    const record9 = generateSyntheticContributorRecord("r", 9, 10, baseOptions);
    expect(record9.recordId).toBe("sim-r-09");
    const record0 = generateSyntheticContributorRecord("r", 0, 100, baseOptions);
    expect(record0.recordId).toBe("sim-r-000");
  });
});

// ---------------------------------------------------------------------------
// generateSyntheticContributorBatch
// ---------------------------------------------------------------------------

describe("generateSyntheticContributorBatch", () => {
  const simulationId = "batch-run-01";
  const protocolId = "protocol-immunity";
  const opts = { protocolId };

  test("returns a SimulationBatch with context and records", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 3, opts);
    expect(batch).toHaveProperty("context");
    expect(batch).toHaveProperty("records");
  });

  test("context.simulationId matches argument", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 3, opts);
    expect(batch.context.simulationId).toBe(simulationId);
  });

  test("context.targetProtocolId matches argument", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 3, opts);
    expect(batch.context.targetProtocolId).toBe(protocolId);
  });

  test("context.batchSize matches argument", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 5, opts);
    expect(batch.context.batchSize).toBe(5);
  });

  test("context.isSyntheticIsolated is always true", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 2, opts);
    expect(batch.context.isSyntheticIsolated).toBe(true);
  });

  test("records array has the requested number of records", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 7, opts);
    expect(batch.records).toHaveLength(7);
  });

  test("all records carry SyntheticSimulation dataOrigin", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 4, opts);
    batch.records.forEach((r) =>
      expect(r.dataOrigin).toBe(DataOrigin.SyntheticSimulation)
    );
  });

  test("all records carry Excluded exclusionStatus", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 4, opts);
    batch.records.forEach((r) =>
      expect(r.exclusionStatus).toBe(ExclusionStatus.Excluded)
    );
  });

  test("all records carry SyntheticData exclusionReason", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 4, opts);
    batch.records.forEach((r) =>
      expect(r.exclusionReason).toBe(ExclusionReason.SyntheticData)
    );
  });

  test("all records have unique recordIds", () => {
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 10, opts);
    const ids = batch.records.map((r) => r.recordId);
    expect(new Set(ids).size).toBe(10);
  });

  test("per-record options array is respected", () => {
    const perRecordOpts = [
      { protocolId, adherenceScore: 60 },
      { protocolId, adherenceScore: 80 },
    ];
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 2, perRecordOpts);
    expect(batch.records[0].adherenceScore).toBe(60);
    expect(batch.records[1].adherenceScore).toBe(80);
  });

  test("uses provided createdAt timestamp in context", () => {
    const ts = "2026-03-01T12:00:00Z";
    const batch = generateSyntheticContributorBatch(simulationId, protocolId, 1, opts, ts);
    expect(batch.context.createdAt).toBe(ts);
  });

  test("throws RangeError when batchSize is 0", () => {
    expect(() =>
      generateSyntheticContributorBatch(simulationId, protocolId, 0, opts)
    ).toThrow(RangeError);
  });

  test("throws RangeError when batchSize is negative", () => {
    expect(() =>
      generateSyntheticContributorBatch(simulationId, protocolId, -1, opts)
    ).toThrow(RangeError);
  });

  test("throws RangeError when batchSize is not an integer", () => {
    expect(() =>
      generateSyntheticContributorBatch(simulationId, protocolId, 1.5, opts)
    ).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// validateContributorRecord — valid records
// ---------------------------------------------------------------------------

describe("validateContributorRecord — valid records", () => {
  test("accepts a valid real_contributor record", () => {
    const result = validateContributorRecord(makeRealRecord());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid synthetic record", () => {
    const result = validateContributorRecord(makeSyntheticRecord());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a record without optional outcomeNotes", () => {
    const record = makeRealRecord();
    delete (record as Partial<ContributorRecord>).outcomeNotes;
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  test("accepts a record with adherenceScore exactly at threshold (50)", () => {
    const result = validateContributorRecord(
      makeRealRecord({ adherenceScore: 50, exclusionStatus: ExclusionStatus.Included })
    );
    expect(result.valid).toBe(true);
  });

  test("accepts a record with adherenceScore 0 when excluded", () => {
    const result = validateContributorRecord(
      makeRealRecord({
        adherenceScore: 0,
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.AdherenceBelowThreshold,
      })
    );
    expect(result.valid).toBe(true);
  });

  test("accepts a real_contributor record excluded for manual_exclusion", () => {
    const result = validateContributorRecord(
      makeRealRecord({
        adherenceScore: 70,
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.ManualExclusion,
      })
    );
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateContributorRecord — LOCK-003 business rules
// ---------------------------------------------------------------------------

describe("validateContributorRecord — LOCK-003 rules", () => {
  test("rejects record with adherence below threshold that is not excluded", () => {
    const result = validateContributorRecord(
      makeRealRecord({ adherenceScore: 49, exclusionStatus: ExclusionStatus.Included })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionStatus")).toBe(true);
  });

  test("rejects excluded record that lacks an exclusionReason", () => {
    const record = makeRealRecord({
      adherenceScore: 70,
      exclusionStatus: ExclusionStatus.Excluded,
    });
    delete (record as Partial<ContributorRecord>).exclusionReason;
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionReason")).toBe(true);
  });

  test("rejects synthetic record that is not excluded", () => {
    const result = validateContributorRecord(
      makeSyntheticRecord(
        { exclusionStatus: ExclusionStatus.Included } as unknown as Partial<SyntheticContributorRecord>
      )
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionStatus")).toBe(true);
  });

  test("rejects record with non-integer adherenceScore", () => {
    const result = validateContributorRecord(
      makeRealRecord({ adherenceScore: 75.5 })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "adherenceScore")).toBe(true);
  });

  test("rejects record with non-integer challengeCompletionRate", () => {
    const result = validateContributorRecord(
      makeRealRecord({ challengeCompletionRate: 80.3 })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeCompletionRate")).toBe(true);
  });

  test("rejects record with adherenceScore > 100", () => {
    const result = validateContributorRecord(makeRealRecord({ adherenceScore: 101 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "adherenceScore")).toBe(true);
  });

  test("rejects record with adherenceScore < 0", () => {
    const result = validateContributorRecord(
      makeRealRecord({
        adherenceScore: -1,
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.AdherenceBelowThreshold,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "adherenceScore")).toBe(true);
  });

  test("rejects record with invalid dataOrigin value", () => {
    const result = validateContributorRecord(
      makeRealRecord({ dataOrigin: "unknown_origin" as DataOrigin })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "dataOrigin")).toBe(true);
  });

  test("rejects record with invalid exclusionStatus value", () => {
    const result = validateContributorRecord(
      makeRealRecord({ exclusionStatus: "unknown_status" as ExclusionStatus })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionStatus")).toBe(true);
  });

  test("rejects record with invalid exclusionReason value", () => {
    const result = validateContributorRecord(
      makeRealRecord({
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: "bad_reason" as ExclusionReason,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "exclusionReason")).toBe(true);
  });

  test("rejects record with missing required fields", () => {
    const result = validateContributorRecord({} as ContributorRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("rejects record with empty recordId", () => {
    const result = validateContributorRecord(makeRealRecord({ recordId: "" }));
    expect(result.valid).toBe(false);
  });

  test("rejects record with recordId not matching slug pattern", () => {
    const result = validateContributorRecord(makeRealRecord({ recordId: "UPPERCASE-ID" }));
    expect(result.valid).toBe(false);
  });

  test("rejects record with invalid recordedAt timestamp", () => {
    const result = validateContributorRecord(makeRealRecord({ recordedAt: "not-a-date" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordedAt")).toBe(true);
  });

  test("rejects record with empty outcomeNotes string", () => {
    const result = validateContributorRecord(makeRealRecord({ outcomeNotes: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "outcomeNotes")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateContributorRecordCollection
// ---------------------------------------------------------------------------

describe("validateContributorRecordCollection", () => {
  test("passes with two valid distinct records", () => {
    const records = [
      makeRealRecord({ recordId: "rec-001" }),
      makeRealRecord({ recordId: "rec-002" }),
    ];
    const result = validateContributorRecordCollection(records);
    expect(result.valid).toBe(true);
  });

  test("fails with duplicate recordIds", () => {
    const records = [
      makeRealRecord({ recordId: "rec-001" }),
      makeRealRecord({ recordId: "rec-001" }),
    ];
    const result = validateContributorRecordCollection(records);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordId")).toBe(true);
  });

  test("aggregates errors from multiple invalid records", () => {
    const records = [
      makeRealRecord({ recordId: "rec-001", adherenceScore: 30, exclusionStatus: ExclusionStatus.Included }),
      makeRealRecord({ recordId: "rec-002", adherenceScore: 200 }),
    ];
    const result = validateContributorRecordCollection(records);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  test("passes with an empty collection", () => {
    const result = validateContributorRecordCollection([]);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// assertSyntheticIsolation
// ---------------------------------------------------------------------------

describe("assertSyntheticIsolation", () => {
  test("passes on an empty array", () => {
    const result = assertSyntheticIsolation([]);
    expect(result.isolated).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  test("passes on an array of properly isolated synthetic records", () => {
    const records = [makeSyntheticRecord(), makeSyntheticRecord({ recordId: "sim-run-01-1" })];
    const result = assertSyntheticIsolation(records);
    expect(result.isolated).toBe(true);
  });

  test("fails when a record has dataOrigin = real_contributor", () => {
    const records = [makeSyntheticRecord(), makeRealRecord({ recordId: "rec-real-002" })];
    const result = assertSyntheticIsolation(records);
    expect(result.isolated).toBe(false);
    expect(result.violations.some((v) => v.field === "dataOrigin")).toBe(true);
  });

  test("fails when a record has exclusionStatus = included", () => {
    const contaminated = makeSyntheticRecord(
      { exclusionStatus: ExclusionStatus.Included } as unknown as Partial<SyntheticContributorRecord>
    );
    const result = assertSyntheticIsolation([contaminated]);
    expect(result.isolated).toBe(false);
    expect(result.violations.some((v) => v.field === "exclusionStatus")).toBe(true);
  });

  test("reports violations referencing the offending recordId", () => {
    const result = assertSyntheticIsolation([makeRealRecord({ recordId: "bad-record" })]);
    expect(result.isolated).toBe(false);
    expect(result.violations.some((v) => v.recordId === "bad-record")).toBe(true);
  });

  test("violations contain LOCK-003 reference in message", () => {
    const result = assertSyntheticIsolation([makeRealRecord()]);
    expect(result.violations.some((v) => v.message.includes("LOCK-003"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// assertBatchIsolation
// ---------------------------------------------------------------------------

describe("assertBatchIsolation", () => {
  function makeBatch(overrides: Partial<SimulationBatch["context"]> = {}): SimulationBatch {
    return generateSyntheticContributorBatch("run-02", "protocol-test", 2, {
      protocolId: "protocol-test",
    });
  }

  test("passes on a properly generated SimulationBatch", () => {
    const batch = makeBatch();
    const result = assertBatchIsolation(batch);
    expect(result.isolated).toBe(true);
  });

  test("fails when context.isSyntheticIsolated is false", () => {
    const batch = makeBatch();
    // Force the flag to false to simulate a tampered context.
    (batch.context as { isSyntheticIsolated: boolean }).isSyntheticIsolated = false;
    const result = assertBatchIsolation(batch);
    expect(result.isolated).toBe(false);
    expect(
      result.violations.some((v) => v.field === "context.isSyntheticIsolated")
    ).toBe(true);
  });

  test("fails when a record in the batch has a contaminated dataOrigin", () => {
    const batch = makeBatch();
    (batch.records[0] as Partial<ContributorRecord>).dataOrigin =
      DataOrigin.RealContributor;
    const result = assertBatchIsolation(batch);
    expect(result.isolated).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// filterAnalyticsEligible (LOCK-003 production gateway)
// ---------------------------------------------------------------------------

describe("filterAnalyticsEligible", () => {
  test("returns only real_contributor + included records", () => {
    const records: ContributorRecord[] = [
      makeRealRecord({ recordId: "rec-001" }),
      makeSyntheticRecord({ recordId: "sim-001" }),
      makeRealRecord({
        recordId: "rec-002",
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.ManualExclusion,
      }),
    ];
    const eligible = filterAnalyticsEligible(records);
    expect(eligible).toHaveLength(1);
    expect(eligible[0].recordId).toBe("rec-001");
  });

  test("returns empty array when all records are synthetic", () => {
    const batch = generateSyntheticContributorBatch("run-x", "protocol-y", 5, {
      protocolId: "protocol-y",
    });
    const eligible = filterAnalyticsEligible(batch.records);
    expect(eligible).toHaveLength(0);
  });

  test("returns empty array when all real records are excluded", () => {
    const records = [
      makeRealRecord({
        adherenceScore: 40,
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.AdherenceBelowThreshold,
      }),
    ];
    const eligible = filterAnalyticsEligible(records);
    expect(eligible).toHaveLength(0);
  });

  test("returns all records when all are real_contributor + included", () => {
    const records = [
      makeRealRecord({ recordId: "rec-a" }),
      makeRealRecord({ recordId: "rec-b" }),
    ];
    const eligible = filterAnalyticsEligible(records);
    expect(eligible).toHaveLength(2);
  });

  test("returns empty array for empty input", () => {
    expect(filterAnalyticsEligible([])).toHaveLength(0);
  });

  test("filters out mixed real+synthetic batch correctly", () => {
    const synthBatch = generateSyntheticContributorBatch("run-z", "p-01", 3, {
      protocolId: "p-01",
    });
    const realRecords = [makeRealRecord({ recordId: "rec-real-z" })];
    const mixed: ContributorRecord[] = [...synthBatch.records, ...realRecords];
    const eligible = filterAnalyticsEligible(mixed);
    expect(eligible).toHaveLength(1);
    expect(eligible[0].dataOrigin).toBe(DataOrigin.RealContributor);
  });
});

// ---------------------------------------------------------------------------
// Integration: generator output is always validation-safe
// ---------------------------------------------------------------------------

describe("Integration: generated records pass validation", () => {
  test("single generated record passes validateContributorRecord", () => {
    const record = generateSyntheticContributorRecord("int-run", 0, 1, {
      protocolId: "protocol-integration",
    });
    const result = validateContributorRecord(record);
    expect(result.valid).toBe(true);
  });

  test("batch records all pass validateContributorRecordCollection", () => {
    const batch = generateSyntheticContributorBatch("int-batch", "protocol-batch", 5, {
      protocolId: "protocol-batch",
      adherenceScore: 70,
    });
    const result = validateContributorRecordCollection(batch.records);
    expect(result.valid).toBe(true);
  });

  test("batch passes assertBatchIsolation", () => {
    const batch = generateSyntheticContributorBatch("iso-run", "protocol-iso", 3, {
      protocolId: "protocol-iso",
    });
    const result = assertBatchIsolation(batch);
    expect(result.isolated).toBe(true);
  });

  test("generated records are never analytics-eligible", () => {
    const batch = generateSyntheticContributorBatch("prod-run", "protocol-prod", 10, {
      protocolId: "protocol-prod",
    });
    const eligible = filterAnalyticsEligible(batch.records);
    expect(eligible).toHaveLength(0);
  });

  test("batch with low-adherence option still validates and is isolated", () => {
    const batch = generateSyntheticContributorBatch("low-adh", "protocol-la", 2, {
      protocolId: "protocol-la",
      adherenceScore: 10,
    });
    const valResult = validateContributorRecordCollection(batch.records);
    const isoResult = assertBatchIsolation(batch);
    expect(valResult.valid).toBe(true);
    expect(isoResult.isolated).toBe(true);
  });
});
