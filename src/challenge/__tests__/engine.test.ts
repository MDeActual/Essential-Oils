/**
 * engine.test.ts — Challenge Engine Structural Service Tests
 *
 * Tests for:
 * - CE-001: checkActiveAdherenceLimit()
 * - CE-002: checkDueDay()
 * - CE-004: deriveScoreTier()
 * - CE-005: validateMinimumChallengeSet()
 * - CE-007: isTerminalStatus()
 * - Re-exported validation functions (structural regression only)
 */

import {
  ChallengeCompletionStatus,
  ChallengeLifecycleEventType,
  ChallengeType,
  validateChallengeCompletionRecord,
  validateChallengeParticipation,
  validateChallengeTransition,
} from "../index";
import type { Challenge, ChallengeCompletionRecord } from "../index";
import {
  ActiveAdherenceCheckResult,
  ChallengeScoreTier,
  checkActiveAdherenceLimit,
  checkDueDay,
  deriveScoreTier,
  isTerminalStatus,
  validateMinimumChallengeSet,
} from "../engine";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    challengeId: "challenge-day1-checkin",
    protocolId: "protocol-sleep-support",
    type: ChallengeType.Adherence,
    prompt: "Did you apply lavender before bed?",
    dueDay: 3,
    completionStatus: ChallengeCompletionStatus.Pending,
    ...overrides,
  };
}

function makeCompletionRecord(
  overrides: Partial<ChallengeCompletionRecord> = {}
): ChallengeCompletionRecord {
  return {
    recordId: "rec-001",
    challengeId: "challenge-day1-checkin",
    protocolId: "protocol-sleep-support",
    userId: "user-abc",
    finalStatus: ChallengeCompletionStatus.Completed,
    completedAt: "2026-04-11T08:00:00Z",
    response: "Applied lavender to wrists.",
    wasTimely: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// CE-001: checkActiveAdherenceLimit
// ---------------------------------------------------------------------------

describe("checkActiveAdherenceLimit (CE-001)", () => {
  it("allows a non-adherence challenge regardless of pending adherence challenges", () => {
    const candidate = makeChallenge({
      challengeId: "challenge-edu-001",
      type: ChallengeType.Educational,
    });
    const active: Challenge[] = [
      makeChallenge({
        challengeId: "challenge-day1-checkin",
        type: ChallengeType.Adherence,
        completionStatus: ChallengeCompletionStatus.Pending,
      }),
    ];
    const result = checkActiveAdherenceLimit(candidate, active);
    expect(result.eligible).toBe(true);
    expect(result.blockingChallengeId).toBeUndefined();
  });

  it("allows an adherence challenge when no other pending adherence challenge exists", () => {
    const candidate = makeChallenge();
    const result = checkActiveAdherenceLimit(candidate, []);
    expect(result.eligible).toBe(true);
  });

  it("blocks an adherence challenge when another pending adherence challenge is present", () => {
    const candidate = makeChallenge({ challengeId: "challenge-day2-checkin" });
    const blocking = makeChallenge({
      challengeId: "challenge-day1-checkin",
      completionStatus: ChallengeCompletionStatus.Pending,
    });
    const result = checkActiveAdherenceLimit(candidate, [blocking]);
    expect(result.eligible).toBe(false);
    expect(result.blockingChallengeId).toBe("challenge-day1-checkin");
  });

  it("does not block the candidate against itself", () => {
    const candidate = makeChallenge({ challengeId: "challenge-day1-checkin" });
    // Active list includes the candidate itself — should not self-block.
    const result = checkActiveAdherenceLimit(candidate, [candidate]);
    expect(result.eligible).toBe(true);
  });

  it("allows an adherence challenge when the existing adherence challenge is completed", () => {
    const candidate = makeChallenge({ challengeId: "challenge-day2-checkin" });
    const completed = makeChallenge({
      challengeId: "challenge-day1-checkin",
      completionStatus: ChallengeCompletionStatus.Completed,
    });
    const result = checkActiveAdherenceLimit(candidate, [completed]);
    expect(result.eligible).toBe(true);
  });

  it("allows an adherence challenge when the existing adherence challenge is skipped", () => {
    const candidate = makeChallenge({ challengeId: "challenge-day2-checkin" });
    const skipped = makeChallenge({
      challengeId: "challenge-day1-checkin",
      completionStatus: ChallengeCompletionStatus.Skipped,
    });
    const result = checkActiveAdherenceLimit(candidate, [skipped]);
    expect(result.eligible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CE-002: checkDueDay
// ---------------------------------------------------------------------------

describe("checkDueDay (CE-002)", () => {
  it("returns wasTimely true when resolved on the due day", () => {
    const result = checkDueDay(3, 3);
    expect(result.wasTimely).toBe(true);
  });

  it("returns wasTimely true when resolved before the due day", () => {
    const result = checkDueDay(5, 2);
    expect(result.wasTimely).toBe(true);
  });

  it("returns wasTimely false when resolved after the due day", () => {
    const result = checkDueDay(3, 4);
    expect(result.wasTimely).toBe(false);
  });

  it("returns wasTimely false when resolved well after the due day", () => {
    const result = checkDueDay(1, 10);
    expect(result.wasTimely).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CE-004: deriveScoreTier
// ---------------------------------------------------------------------------

describe("deriveScoreTier (CE-004)", () => {
  it("returns FullWeight for a timely completed record", () => {
    const record = makeCompletionRecord({ wasTimely: true });
    expect(deriveScoreTier(record)).toBe(ChallengeScoreTier.FullWeight);
  });

  it("returns PartialWeight for a late completed record", () => {
    const record = makeCompletionRecord({ wasTimely: false });
    expect(deriveScoreTier(record)).toBe(ChallengeScoreTier.PartialWeight);
  });

  it("returns ZeroWeight for a skipped record", () => {
    const record = makeCompletionRecord({
      finalStatus: ChallengeCompletionStatus.Skipped,
      response: undefined,
      wasTimely: false,
    });
    expect(deriveScoreTier(record)).toBe(ChallengeScoreTier.ZeroWeight);
  });

  it("returns ZeroWeight for a skipped record that was timely", () => {
    const record = makeCompletionRecord({
      finalStatus: ChallengeCompletionStatus.Skipped,
      response: undefined,
      wasTimely: true,
    });
    expect(deriveScoreTier(record)).toBe(ChallengeScoreTier.ZeroWeight);
  });
});

// ---------------------------------------------------------------------------
// CE-005: validateMinimumChallengeSet
// ---------------------------------------------------------------------------

describe("validateMinimumChallengeSet (CE-005)", () => {
  it("passes when every phase has at least one adherence challenge", () => {
    const phases = [
      {
        phaseIndex: 0,
        challenges: [
          makeChallenge({ type: ChallengeType.Adherence }),
          makeChallenge({ challengeId: "c-edu-0", type: ChallengeType.Educational }),
        ],
      },
      {
        phaseIndex: 1,
        challenges: [makeChallenge({ challengeId: "c-adh-1", type: ChallengeType.Adherence })],
      },
    ];
    const result = validateMinimumChallengeSet(phases);
    expect(result.valid).toBe(true);
    expect(result.invalidPhaseIndices).toHaveLength(0);
  });

  it("fails when a phase has no adherence challenge", () => {
    const phases = [
      {
        phaseIndex: 0,
        challenges: [makeChallenge({ challengeId: "c-adh-0", type: ChallengeType.Adherence })],
      },
      {
        phaseIndex: 1,
        challenges: [makeChallenge({ challengeId: "c-edu-1", type: ChallengeType.Educational })],
      },
    ];
    const result = validateMinimumChallengeSet(phases);
    expect(result.valid).toBe(false);
    expect(result.invalidPhaseIndices).toContain(1);
    expect(result.invalidPhaseIndices).toHaveLength(1);
  });

  it("fails for multiple phases missing adherence challenges", () => {
    const phases = [
      {
        phaseIndex: 0,
        challenges: [makeChallenge({ challengeId: "c-edu-0", type: ChallengeType.Educational })],
      },
      {
        phaseIndex: 1,
        challenges: [makeChallenge({ challengeId: "c-exp-1", type: ChallengeType.Experiential })],
      },
    ];
    const result = validateMinimumChallengeSet(phases);
    expect(result.valid).toBe(false);
    expect(result.invalidPhaseIndices).toEqual([0, 1]);
  });

  it("passes for a single-phase protocol with one adherence challenge", () => {
    const phases = [
      { phaseIndex: 0, challenges: [makeChallenge()] },
    ];
    expect(validateMinimumChallengeSet(phases).valid).toBe(true);
  });

  it("passes for an empty phase list (no phases to violate)", () => {
    expect(validateMinimumChallengeSet([]).valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CE-007: isTerminalStatus
// ---------------------------------------------------------------------------

describe("isTerminalStatus (CE-007)", () => {
  it("returns false for Pending (non-terminal)", () => {
    expect(isTerminalStatus(ChallengeCompletionStatus.Pending)).toBe(false);
  });

  it("returns true for Completed (terminal)", () => {
    expect(isTerminalStatus(ChallengeCompletionStatus.Completed)).toBe(true);
  });

  it("returns true for Skipped (terminal)", () => {
    expect(isTerminalStatus(ChallengeCompletionStatus.Skipped)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Re-exported validation functions (structural regression)
// ---------------------------------------------------------------------------

describe("Engine re-exports validation functions", () => {
  it("validateChallengeTransition is re-exported and functional", () => {
    const result = validateChallengeTransition({
      challengeId: "c-001",
      fromStatus: ChallengeCompletionStatus.Pending,
      toStatus: ChallengeCompletionStatus.Completed,
      occurredAt: "2026-04-11T08:00:00Z",
    });
    expect(result.valid).toBe(true);
  });

  it("validateChallengeParticipation is re-exported and functional", () => {
    const result = validateChallengeParticipation({
      participationId: "part-001",
      challengeId: "c-001",
      protocolId: "p-001",
      userId: "u-001",
      eventType: ChallengeLifecycleEventType.Completed,
      occurredAt: "2026-04-11T08:00:00Z",
      response: "Applied oil.",
    });
    expect(result.valid).toBe(true);
  });

  it("validateChallengeCompletionRecord is re-exported and functional", () => {
    const result = validateChallengeCompletionRecord(makeCompletionRecord());
    expect(result.valid).toBe(true);
  });
});
