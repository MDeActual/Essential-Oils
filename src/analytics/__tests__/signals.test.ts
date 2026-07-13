/**
 * signals.test.ts — Unit Tests for Analytics Signals Module
 *
 * Tests cover:
 * - extractAdherenceSignal / extractAdherenceSignals
 * - extractProtocolCompletionSignal / extractProtocolCompletionSignals
 * - extractOilUsageFrequencySignals
 * - extractChallengeParticipationSignal / extractChallengeParticipationSignals
 */

import {
  extractAdherenceSignal,
  extractAdherenceSignals,
  extractChallengeParticipationSignal,
  extractChallengeParticipationSignals,
  extractOilUsageFrequencySignals,
  extractProtocolCompletionSignal,
  extractProtocolCompletionSignals,
} from "../signals";
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
    challengeCompletionRate: 60,
    recordedAt: "2026-04-11T10:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// extractAdherenceSignal
// ---------------------------------------------------------------------------

describe("extractAdherenceSignal", () => {
  it("returns a signal with correct recordId and protocolId", () => {
    const record = makeRecord({ recordId: "rec-001", protocolId: "proto-a" });
    const signal = extractAdherenceSignal(record);
    expect(signal.recordId).toBe("rec-001");
    expect(signal.protocolId).toBe("proto-a");
  });

  it("preserves the raw adherenceScore", () => {
    const signal = extractAdherenceSignal(makeRecord({ adherenceScore: 75 }));
    expect(signal.adherenceScore).toBe(75);
  });

  it("normalizes adherenceScore 100 to 1", () => {
    const signal = extractAdherenceSignal(makeRecord({ adherenceScore: 100 }));
    expect(signal.normalizedScore).toBe(1);
  });

  it("normalizes adherenceScore 0 to 0", () => {
    const signal = extractAdherenceSignal(makeRecord({ adherenceScore: 50 }));
    expect(signal.normalizedScore).toBe(0.5);
  });

  it("normalizes adherenceScore 75 to 0.75", () => {
    const signal = extractAdherenceSignal(makeRecord({ adherenceScore: 75 }));
    expect(signal.normalizedScore).toBe(0.75);
  });

  it("includes a computedAt ISO timestamp", () => {
    const signal = extractAdherenceSignal(makeRecord());
    expect(signal.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ---------------------------------------------------------------------------
// extractAdherenceSignals
// ---------------------------------------------------------------------------

describe("extractAdherenceSignals", () => {
  it("returns one signal per record", () => {
    const records = [
      makeRecord({ recordId: "r1" }),
      makeRecord({ recordId: "r2", adherenceScore: 90 }),
    ];
    const signals = extractAdherenceSignals(records);
    expect(signals).toHaveLength(2);
    expect(signals[0].recordId).toBe("r1");
    expect(signals[1].recordId).toBe("r2");
  });

  it("returns empty array for empty input", () => {
    expect(extractAdherenceSignals([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// extractProtocolCompletionSignal
// ---------------------------------------------------------------------------

describe("extractProtocolCompletionSignal", () => {
  it("preserves raw adherenceScore and challengeCompletionRate", () => {
    const record = makeRecord({ adherenceScore: 80, challengeCompletionRate: 60 });
    const signal = extractProtocolCompletionSignal(record);
    expect(signal.adherenceScore).toBe(80);
    expect(signal.challengeCompletionRate).toBe(60);
  });

  it("computes completionIndex as mean of normalized adherence and challenge rate", () => {
    // adherence 80 → 0.8, challenge 60 → 0.6, mean = 0.7
    const record = makeRecord({ adherenceScore: 80, challengeCompletionRate: 60 });
    const signal = extractProtocolCompletionSignal(record);
    expect(signal.completionIndex).toBeCloseTo(0.7, 5);
  });

  it("completionIndex is 1 when both scores are 100", () => {
    const signal = extractProtocolCompletionSignal(
      makeRecord({ adherenceScore: 100, challengeCompletionRate: 100 })
    );
    expect(signal.completionIndex).toBe(1);
  });

  it("completionIndex is 0.5 when adherence=50 and challenge=50", () => {
    const signal = extractProtocolCompletionSignal(
      makeRecord({ adherenceScore: 50, challengeCompletionRate: 50 })
    );
    expect(signal.completionIndex).toBeCloseTo(0.5, 5);
  });

  it("includes a computedAt ISO timestamp", () => {
    const signal = extractProtocolCompletionSignal(makeRecord());
    expect(signal.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ---------------------------------------------------------------------------
// extractProtocolCompletionSignals
// ---------------------------------------------------------------------------

describe("extractProtocolCompletionSignals", () => {
  it("returns one signal per record", () => {
    const records = [makeRecord({ recordId: "r1" }), makeRecord({ recordId: "r2" })];
    const signals = extractProtocolCompletionSignals(records);
    expect(signals).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(extractProtocolCompletionSignals([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// extractOilUsageFrequencySignals
// ---------------------------------------------------------------------------

describe("extractOilUsageFrequencySignals", () => {
  it("returns one signal per distinct protocolId", () => {
    const records = [
      makeRecord({ recordId: "r1", protocolId: "proto-a" }),
      makeRecord({ recordId: "r2", protocolId: "proto-b" }),
      makeRecord({ recordId: "r3", protocolId: "proto-a" }),
    ];
    const signals = extractOilUsageFrequencySignals(records);
    expect(signals).toHaveLength(2);
  });

  it("counts observations correctly per protocolId", () => {
    const records = [
      makeRecord({ recordId: "r1", protocolId: "proto-a" }),
      makeRecord({ recordId: "r2", protocolId: "proto-b" }),
      makeRecord({ recordId: "r3", protocolId: "proto-a" }),
    ];
    const signals = extractOilUsageFrequencySignals(records);
    const sigA = signals.find((s) => s.protocolId === "proto-a");
    const sigB = signals.find((s) => s.protocolId === "proto-b");
    expect(sigA?.observationCount).toBe(2);
    expect(sigB?.observationCount).toBe(1);
  });

  it("returns empty array for empty input", () => {
    expect(extractOilUsageFrequencySignals([])).toEqual([]);
  });

  it("includes a computedAt ISO timestamp on each signal", () => {
    const signals = extractOilUsageFrequencySignals([makeRecord()]);
    expect(signals[0].computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns single signal for all records on same protocol", () => {
    const records = [
      makeRecord({ recordId: "r1", protocolId: "proto-only" }),
      makeRecord({ recordId: "r2", protocolId: "proto-only" }),
      makeRecord({ recordId: "r3", protocolId: "proto-only" }),
    ];
    const signals = extractOilUsageFrequencySignals(records);
    expect(signals).toHaveLength(1);
    expect(signals[0].observationCount).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// extractChallengeParticipationSignal
// ---------------------------------------------------------------------------

describe("extractChallengeParticipationSignal", () => {
  it("preserves raw challengeCompletionRate", () => {
    const signal = extractChallengeParticipationSignal(
      makeRecord({ challengeCompletionRate: 70 })
    );
    expect(signal.challengeCompletionRate).toBe(70);
  });

  it("normalizes challengeCompletionRate 100 to 1", () => {
    const signal = extractChallengeParticipationSignal(
      makeRecord({ challengeCompletionRate: 100 })
    );
    expect(signal.normalizedRate).toBe(1);
  });

  it("normalizes challengeCompletionRate 50 to 0.5", () => {
    const signal = extractChallengeParticipationSignal(
      makeRecord({ challengeCompletionRate: 50 })
    );
    expect(signal.normalizedRate).toBe(0.5);
  });

  it("normalizes challengeCompletionRate 0 to 0", () => {
    const signal = extractChallengeParticipationSignal(
      makeRecord({ challengeCompletionRate: 0 })
    );
    expect(signal.normalizedRate).toBe(0);
  });

  it("includes recordId, protocolId, and computedAt", () => {
    const record = makeRecord({ recordId: "rec-x", protocolId: "proto-y" });
    const signal = extractChallengeParticipationSignal(record);
    expect(signal.recordId).toBe("rec-x");
    expect(signal.protocolId).toBe("proto-y");
    expect(signal.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ---------------------------------------------------------------------------
// extractChallengeParticipationSignals
// ---------------------------------------------------------------------------

describe("extractChallengeParticipationSignals", () => {
  it("returns one signal per record", () => {
    const records = [makeRecord({ recordId: "r1" }), makeRecord({ recordId: "r2" })];
    const signals = extractChallengeParticipationSignals(records);
    expect(signals).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(extractChallengeParticipationSignals([])).toEqual([]);
  });
});
