import {
  buildChallengeQueue,
  calculateChallengeAdherenceContribution,
  canPresentChallenge,
  ensureChallengeSetIntegrity,
  evaluateChallengeRules,
  evaluateChallengeTimeliness,
  listChallengeEngineRules,
} from "../engine";
import { ChallengeCompletionStatus, ChallengeType } from "../../protocol/types";
import type { Challenge } from "../../protocol/types";

function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    challengeId: "challenge-day1-checkin",
    protocolId: "protocol-sleep-support",
    type: ChallengeType.Adherence,
    prompt: "Apply the lavender blend at bedtime.",
    dueDay: 1,
    completionStatus: ChallengeCompletionStatus.Pending,
    response: undefined,
    ...overrides,
  };
}

describe("challenge engine internal rules", () => {
  it("lists all rule codes in order", () => {
    expect(listChallengeEngineRules()).toEqual([
      "CE-001",
      "CE-002",
      "CE-003",
      "CE-004",
      "CE-005",
      "CE-006",
      "CE-007",
    ]);
  });

  it("accepts a valid challenge set with a single active adherence challenge", () => {
    const result = evaluateChallengeRules({
      challenges: [makeChallenge()],
      completionRecords: [],
    });

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.activeAdherenceChallenges).toHaveLength(1);
  });

  it("rejects multiple active adherence challenges in the same phase", () => {
    const result = evaluateChallengeRules({
      challenges: [
        makeChallenge({ challengeId: "challenge-a", type: ChallengeType.Adherence }),
        makeChallenge({ challengeId: "challenge-b", type: ChallengeType.Adherence }),
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "CE-001")).toBe(true);
  });

  it("requires at least one adherence challenge in the set", () => {
    const result = evaluateChallengeRules({
      challenges: [
        makeChallenge({ challengeId: "edu-1", type: ChallengeType.Educational }),
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "CE-005")).toBe(true);
  });

  it("enforces non-empty responses for completed challenges", () => {
    const result = evaluateChallengeRules({
      challenges: [
        makeChallenge({
          challengeId: "challenge-complete",
          completionStatus: ChallengeCompletionStatus.Completed,
          response: "",
        }),
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "CE-003")).toBe(true);
  });

  it("calculates adherence contribution by outcome", () => {
    expect(
      calculateChallengeAdherenceContribution({
        finalStatus: ChallengeCompletionStatus.Completed,
        wasTimely: true,
      })
    ).toBe(1);

    expect(
      calculateChallengeAdherenceContribution({
        finalStatus: ChallengeCompletionStatus.Completed,
        wasTimely: false,
      })
    ).toBe(0.5);

    expect(
      calculateChallengeAdherenceContribution({
        finalStatus: ChallengeCompletionStatus.Skipped,
        wasTimely: false,
      })
    ).toBe(0);
  });

  it("detects late or invalid dueDay values", () => {
    const result = evaluateChallengeTimeliness(
      makeChallenge({ challengeId: "due-check", dueDay: 0, completionStatus: ChallengeCompletionStatus.Pending }),
      "2026-04-12T01:00:00Z"
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "CE-002")).toBe(true);
  });

  it("canPresentChallenge blocks presentation when an adherence challenge is already active", () => {
    const challenge = makeChallenge({ challengeId: "challenge-two" });
    const active = [makeChallenge({ challengeId: "challenge-one" })];

    expect(canPresentChallenge(challenge, active)).toBe(false);
  });

  it("buildChallengeQueue orders adherence before educational and experiential challenges", () => {
    const queue = buildChallengeQueue([
      makeChallenge({ challengeId: "exp", type: ChallengeType.Experiential, dueDay: 3 }),
      makeChallenge({ challengeId: "edu", type: ChallengeType.Educational, dueDay: 2 }),
      makeChallenge({ challengeId: "adh", type: ChallengeType.Adherence, dueDay: 1 }),
    ]);

    expect(queue.map((item) => item.challengeId)).toEqual(["adh", "edu", "exp"]);
  });

  it("returns the engine integrity result from helper wrapper", () => {
    const result = ensureChallengeSetIntegrity({ challenges: [makeChallenge()] });
    expect(result.valid).toBe(true);
  });
});
