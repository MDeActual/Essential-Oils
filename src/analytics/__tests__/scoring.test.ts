/**
 * scoring.test.ts — Unit Tests for Analytics Scoring Module
 *
 * Tests cover:
 * - computeProtocolEffectivenessScore
 * - computeBlendSynergyInfluenceSignals
 * - computeContributorReliabilityScore
 */

import {
  computeBlendSynergyInfluenceSignals,
  computeContributorReliabilityScore,
  computeProtocolEffectivenessScore,
} from "../scoring";
import { ContributorRecord, DataOrigin, ExclusionStatus } from "../types";

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

// ---------------------------------------------------------------------------
// computeProtocolEffectivenessScore
// ---------------------------------------------------------------------------

describe("computeProtocolEffectivenessScore", () => {
  it("returns score 0 and sampleSize 0 when no records match the protocolId", () => {
    const result = computeProtocolEffectivenessScore("proto-none", [makeRecord()]);
    expect(result.score).toBe(0);
    expect(result.sampleSize).toBe(0);
    expect(result.protocolId).toBe("proto-none");
  });

  it("returns score 0 and sampleSize 0 for empty record set", () => {
    const result = computeProtocolEffectivenessScore("proto-a", []);
    expect(result.score).toBe(0);
    expect(result.sampleSize).toBe(0);
  });

  it("computes mean of adherence and challenge completion for one record", () => {
    // adherence 80, challenge 60 → score = (80+60)/2 = 70
    const record = makeRecord({ protocolId: "proto-a", adherenceScore: 80, challengeCompletionRate: 60 });
    const result = computeProtocolEffectivenessScore("proto-a", [record]);
    expect(result.score).toBeCloseTo(70, 2);
    expect(result.sampleSize).toBe(1);
  });

  it("averages multiple records correctly", () => {
    const records = [
      makeRecord({ recordId: "r1", protocolId: "proto-a", adherenceScore: 80, challengeCompletionRate: 60 }),
      makeRecord({ recordId: "r2", protocolId: "proto-a", adherenceScore: 60, challengeCompletionRate: 80 }),
    ];
    // avg adherence = 70, avg challenge = 70, score = (70+70)/2 = 70
    const result = computeProtocolEffectivenessScore("proto-a", records);
    expect(result.score).toBeCloseTo(70, 2);
    expect(result.sampleSize).toBe(2);
  });

  it("ignores records from a different protocolId", () => {
    const records = [
      makeRecord({ recordId: "r1", protocolId: "proto-a" }),
      makeRecord({ recordId: "r2", protocolId: "proto-b" }),
    ];
    const result = computeProtocolEffectivenessScore("proto-a", records);
    expect(result.sampleSize).toBe(1);
  });

  it("returns score 100 when all records have perfect scores", () => {
    const records = [
      makeRecord({ recordId: "r1", protocolId: "p1", adherenceScore: 100, challengeCompletionRate: 100 }),
      makeRecord({ recordId: "r2", protocolId: "p1", adherenceScore: 100, challengeCompletionRate: 100 }),
    ];
    const result = computeProtocolEffectivenessScore("p1", records);
    expect(result.score).toBe(100);
  });

  it("includes a computedAt ISO timestamp", () => {
    const result = computeProtocolEffectivenessScore("proto-a", [makeRecord({ protocolId: "proto-a" })]);
    expect(result.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ---------------------------------------------------------------------------
// computeBlendSynergyInfluenceSignals
// ---------------------------------------------------------------------------

describe("computeBlendSynergyInfluenceSignals", () => {
  it("returns one signal per blendId in the map", () => {
    const blendMap = new Map([
      ["blend-a", new Set(["proto-a"])],
      ["blend-b", new Set(["proto-b"])],
    ]);
    const records = [
      makeRecord({ recordId: "r1", protocolId: "proto-a" }),
      makeRecord({ recordId: "r2", protocolId: "proto-b" }),
    ];
    const signals = computeBlendSynergyInfluenceSignals(blendMap, records);
    expect(signals).toHaveLength(2);
  });

  it("returns empty array for empty blendProtocolMap", () => {
    const signals = computeBlendSynergyInfluenceSignals(new Map(), [makeRecord()]);
    expect(signals).toEqual([]);
  });

  it("observationCount is 0 when no records match the blend's protocols", () => {
    const blendMap = new Map([["blend-a", new Set(["proto-x"])]]);
    const signals = computeBlendSynergyInfluenceSignals(blendMap, [makeRecord({ protocolId: "proto-other" })]);
    expect(signals[0].observationCount).toBe(0);
    expect(signals[0].averageProtocolAdherence).toBe(0);
  });

  it("counts matching records and averages adherence correctly", () => {
    const blendMap = new Map([["blend-a", new Set(["proto-a"])]]);
    const records = [
      makeRecord({ recordId: "r1", protocolId: "proto-a", adherenceScore: 70 }),
      makeRecord({ recordId: "r2", protocolId: "proto-a", adherenceScore: 90 }),
    ];
    const signals = computeBlendSynergyInfluenceSignals(blendMap, records);
    expect(signals[0].observationCount).toBe(2);
    expect(signals[0].averageProtocolAdherence).toBeCloseTo(80, 2);
  });

  it("a blend can match multiple protocols", () => {
    const blendMap = new Map([["blend-multi", new Set(["proto-a", "proto-b"])]]);
    const records = [
      makeRecord({ recordId: "r1", protocolId: "proto-a", adherenceScore: 80 }),
      makeRecord({ recordId: "r2", protocolId: "proto-b", adherenceScore: 60 }),
    ];
    const signals = computeBlendSynergyInfluenceSignals(blendMap, records);
    expect(signals[0].observationCount).toBe(2);
    expect(signals[0].averageProtocolAdherence).toBeCloseTo(70, 2);
  });

  it("includes a computedAt ISO timestamp", () => {
    const blendMap = new Map([["blend-a", new Set(["proto-a"])]]);
    const records = [makeRecord({ protocolId: "proto-a" })];
    const signals = computeBlendSynergyInfluenceSignals(blendMap, records);
    expect(signals[0].computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ---------------------------------------------------------------------------
// computeContributorReliabilityScore
// ---------------------------------------------------------------------------

describe("computeContributorReliabilityScore", () => {
  it("returns score 0 and recordCount 0 when no records match the userId", () => {
    const result = computeContributorReliabilityScore("user-none", [makeRecord()]);
    expect(result.reliabilityScore).toBe(0);
    expect(result.recordCount).toBe(0);
    expect(result.userId).toBe("user-none");
  });

  it("returns score 0 and recordCount 0 for empty record set", () => {
    const result = computeContributorReliabilityScore("user-a", []);
    expect(result.reliabilityScore).toBe(0);
    expect(result.recordCount).toBe(0);
  });

  it("computes the average adherence score across eligible records for one user", () => {
    const records = [
      makeRecord({ recordId: "r1", userId: "user-a", adherenceScore: 80 }),
      makeRecord({ recordId: "r2", userId: "user-a", adherenceScore: 60 }),
    ];
    const result = computeContributorReliabilityScore("user-a", records);
    expect(result.reliabilityScore).toBeCloseTo(70, 2);
    expect(result.recordCount).toBe(2);
  });

  it("ignores records for other users", () => {
    const records = [
      makeRecord({ recordId: "r1", userId: "user-a", adherenceScore: 80 }),
      makeRecord({ recordId: "r2", userId: "user-b", adherenceScore: 50 }),
    ];
    const result = computeContributorReliabilityScore("user-a", records);
    expect(result.recordCount).toBe(1);
    expect(result.reliabilityScore).toBe(80);
  });

  it("reliabilityScore equals averageAdherenceScore", () => {
    const records = [
      makeRecord({ recordId: "r1", userId: "user-a", adherenceScore: 75 }),
      makeRecord({ recordId: "r2", userId: "user-a", adherenceScore: 85 }),
    ];
    const result = computeContributorReliabilityScore("user-a", records);
    expect(result.reliabilityScore).toBe(result.averageAdherenceScore);
  });

  it("includes a computedAt ISO timestamp", () => {
    const result = computeContributorReliabilityScore("user-a", [makeRecord({ userId: "user-a" })]);
    expect(result.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns score 100 when the single record has perfect adherence", () => {
    const result = computeContributorReliabilityScore(
      "user-a",
      [makeRecord({ userId: "user-a", adherenceScore: 100 })]
    );
    expect(result.reliabilityScore).toBe(100);
  });
});
