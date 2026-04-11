/**
 * protocol.test.ts — Protocol Module Tests
 *
 * Tests for:
 * - Protocol and Challenge type constraints and schema correctness
 * - validateProtocol() — valid and invalid records
 * - validateProtocolCollection() — uniqueness and aggregation
 * - validateChallenge() — valid and invalid records
 * - validateChallengeCollection() — uniqueness and aggregation
 * - Cross-field business rules (semver, phase duration sum, phase indices, etc.)
 * - Moat boundary: no generation logic, no challenge engine rules (M-002, M-003)
 */

import {
  ChallengeCompletionStatus,
  ChallengeType,
  PROTOCOL_MAX_DURATION_DAYS,
  PROTOCOL_MAX_PHASES,
  PROTOCOL_MIN_DURATION_DAYS,
  PROTOCOL_MIN_PHASES,
  ProtocolStatus,
  SEMVER_PATTERN,
  validateChallenge,
  validateChallengeCollection,
  validateProtocol,
  validateProtocolCollection,
} from "../index";
import type { Challenge, Protocol, ProtocolPhase } from "../index";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

/** Factory for a valid ProtocolPhase. */
function makePhase(overrides: Partial<ProtocolPhase> = {}): ProtocolPhase {
  return {
    phaseIndex: 0,
    label: "Core Treatment",
    durationDays: 14,
    blendIds: ["blend-lavender-frankincense"],
    oilIds: [],
    instructions: "Apply blend to pulse points each morning and evening.",
    ...overrides,
  };
}

/** Factory for a valid Protocol record. */
function makeProtocol(overrides: Partial<Protocol> = {}): Protocol {
  return {
    protocolId: "protocol-sleep-support",
    version: "1.0.0",
    userProfileId: "user-abc123",
    goal: "Improve sleep quality and reduce bedtime anxiety",
    phases: [makePhase()],
    durationDays: 14,
    challengeIds: ["challenge-day1-checkin"],
    createdAt: "2026-04-11T00:00:00Z",
    status: ProtocolStatus.Draft,
    ...overrides,
  };
}

/** Factory for a valid two-phase Protocol record. */
function makeTwoPhaseProtocol(): Protocol {
  return makeProtocol({
    protocolId: "protocol-two-phase",
    durationDays: 28,
    phases: [
      makePhase({ phaseIndex: 0, label: "Phase A", durationDays: 14 }),
      makePhase({ phaseIndex: 1, label: "Phase B", durationDays: 14, blendIds: ["blend-citrus-refresh"] }),
    ],
  });
}

/** Factory for a valid Challenge record. */
function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    challengeId: "challenge-day1-checkin",
    protocolId: "protocol-sleep-support",
    type: ChallengeType.Adherence,
    prompt: "Did you apply the sleep blend tonight before bed?",
    dueDay: 1,
    completionStatus: ChallengeCompletionStatus.Pending,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Schema and constants
// ---------------------------------------------------------------------------

describe("Protocol module constants", () => {
  it("PROTOCOL_MIN_PHASES is 1", () => {
    expect(PROTOCOL_MIN_PHASES).toBe(1);
  });

  it("PROTOCOL_MAX_PHASES is 20", () => {
    expect(PROTOCOL_MAX_PHASES).toBe(20);
  });

  it("PROTOCOL_MIN_DURATION_DAYS is 1", () => {
    expect(PROTOCOL_MIN_DURATION_DAYS).toBe(1);
  });

  it("PROTOCOL_MAX_DURATION_DAYS is 730", () => {
    expect(PROTOCOL_MAX_DURATION_DAYS).toBe(730);
  });

  it("SEMVER_PATTERN matches valid semver strings", () => {
    expect(SEMVER_PATTERN.test("1.0.0")).toBe(true);
    expect(SEMVER_PATTERN.test("0.1.0")).toBe(true);
    expect(SEMVER_PATTERN.test("10.2.3")).toBe(true);
  });

  it("SEMVER_PATTERN rejects non-semver strings", () => {
    expect(SEMVER_PATTERN.test("1.0")).toBe(false);
    expect(SEMVER_PATTERN.test("v1.0.0")).toBe(false);
    expect(SEMVER_PATTERN.test("1.0.0-beta")).toBe(false);
    expect(SEMVER_PATTERN.test("latest")).toBe(false);
  });

  it("ProtocolStatus enum contains expected values", () => {
    expect(ProtocolStatus.Draft).toBe("draft");
    expect(ProtocolStatus.Active).toBe("active");
    expect(ProtocolStatus.Completed).toBe("completed");
    expect(ProtocolStatus.Deprecated).toBe("deprecated");
  });

  it("ChallengeType enum contains expected values", () => {
    expect(ChallengeType.Adherence).toBe("adherence");
    expect(ChallengeType.Educational).toBe("educational");
    expect(ChallengeType.Experiential).toBe("experiential");
  });

  it("ChallengeCompletionStatus enum contains expected values", () => {
    expect(ChallengeCompletionStatus.Pending).toBe("pending");
    expect(ChallengeCompletionStatus.Completed).toBe("completed");
    expect(ChallengeCompletionStatus.Skipped).toBe("skipped");
  });
});

// ---------------------------------------------------------------------------
// validateProtocol — valid records
// ---------------------------------------------------------------------------

describe("validateProtocol — valid records", () => {
  it("returns valid=true for a minimal valid protocol (1 phase)", () => {
    const result = validateProtocol(makeProtocol());
    if (!result.valid) console.error(result.errors);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid=true for a two-phase protocol", () => {
    const result = validateProtocol(makeTwoPhaseProtocol());
    if (!result.valid) console.error(result.errors);
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for ProtocolStatus.Active", () => {
    const result = validateProtocol(makeProtocol({ status: ProtocolStatus.Active }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for ProtocolStatus.Completed", () => {
    const result = validateProtocol(makeProtocol({ status: ProtocolStatus.Completed }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for ProtocolStatus.Deprecated", () => {
    const result = validateProtocol(makeProtocol({ status: ProtocolStatus.Deprecated }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true when protocol has empty challengeIds", () => {
    const result = validateProtocol(makeProtocol({ challengeIds: [] }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for a protocol with oilIds-only phase (no blendIds)", () => {
    const phase = makePhase({ blendIds: [], oilIds: ["lavandula_angustifolia" as never] });
    const result = validateProtocol(makeProtocol({ phases: [phase] }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for minimum durationDays (1)", () => {
    const phase = makePhase({ durationDays: 1 });
    const result = validateProtocol(makeProtocol({ phases: [phase], durationDays: 1 }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for a valid semantic version 2.1.0", () => {
    const result = validateProtocol(makeProtocol({ version: "2.1.0" }));
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateProtocol — top-level field errors
// ---------------------------------------------------------------------------

describe("validateProtocol — top-level field errors", () => {
  it("reports error when protocolId is empty string", () => {
    const result = validateProtocol(makeProtocol({ protocolId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("reports error when protocolId has invalid format (uppercase)", () => {
    const result = validateProtocol(makeProtocol({ protocolId: "PROTOCOL-SLEEP" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("reports error when protocolId starts with a hyphen", () => {
    const result = validateProtocol(makeProtocol({ protocolId: "-protocol-sleep" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("reports error when version is not semver", () => {
    const result = validateProtocol(makeProtocol({ version: "v1.0.0" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "version")).toBe(true);
  });

  it("reports error when version has only two parts (1.0)", () => {
    const result = validateProtocol(makeProtocol({ version: "1.0" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "version")).toBe(true);
  });

  it("reports error when version is a plain string (not semver)", () => {
    const result = validateProtocol(makeProtocol({ version: "latest" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "version")).toBe(true);
  });

  it("reports error when userProfileId is empty string", () => {
    const result = validateProtocol(makeProtocol({ userProfileId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "userProfileId")).toBe(true);
  });

  it("reports error when goal is too short (< 3 chars)", () => {
    const result = validateProtocol(makeProtocol({ goal: "ok" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "goal")).toBe(true);
  });

  it("reports error when status is an unknown value", () => {
    const result = validateProtocol(makeProtocol({ status: "in_progress" as ProtocolStatus }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "status")).toBe(true);
  });

  it("reports error when createdAt has invalid format", () => {
    const result = validateProtocol(makeProtocol({ createdAt: "April 11 2026" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "createdAt")).toBe(true);
  });

  it("reports error when durationDays is 0", () => {
    const result = validateProtocol(makeProtocol({ durationDays: 0 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "durationDays")).toBe(true);
  });

  it("reports error when durationDays exceeds maximum", () => {
    const result = validateProtocol(makeProtocol({ durationDays: 731 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "durationDays")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateProtocol — phase business rules
// ---------------------------------------------------------------------------

describe("validateProtocol — phase business rules", () => {
  it("reports error when phases array is empty", () => {
    const result = validateProtocol(makeProtocol({ phases: [], durationDays: 14 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "phases")).toBe(true);
  });

  it("reports error when phase has no blend or oil references", () => {
    const emptyPhase = makePhase({ blendIds: [], oilIds: [] });
    const result = validateProtocol(makeProtocol({ phases: [emptyPhase] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.startsWith("phases["))).toBe(true);
  });

  it("reports error when phase durationDays is 0", () => {
    const phase = makePhase({ durationDays: 0 });
    const result = validateProtocol(makeProtocol({ phases: [phase], durationDays: 0 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.includes("durationDays"))).toBe(true);
  });

  it("reports error when phase label is empty", () => {
    const phase = makePhase({ label: "" });
    const result = validateProtocol(makeProtocol({ phases: [phase] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.includes("label"))).toBe(true);
  });

  it("reports error when phase instructions are empty", () => {
    const phase = makePhase({ instructions: "" });
    const result = validateProtocol(makeProtocol({ phases: [phase] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.includes("instructions"))).toBe(true);
  });

  it("reports error when duplicate phaseIndex values appear", () => {
    const result = validateProtocol(
      makeProtocol({
        durationDays: 28,
        phases: [
          makePhase({ phaseIndex: 0, durationDays: 14 }),
          makePhase({ phaseIndex: 0, durationDays: 14, label: "Duplicate Index Phase" }),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate phaseIndex"))).toBe(true);
  });

  it("reports error when sum of phase durationDays does not match protocol durationDays", () => {
    const result = validateProtocol(
      makeProtocol({
        durationDays: 30, // declared total
        phases: [makePhase({ durationDays: 14 })], // actual sum = 14
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "durationDays" && e.message.includes("sum"))).toBe(true);
  });

  it("reports error for more than PROTOCOL_MAX_PHASES phases", () => {
    const phases: ProtocolPhase[] = Array.from({ length: PROTOCOL_MAX_PHASES + 1 }, (_, i) =>
      makePhase({ phaseIndex: i, durationDays: 1, label: `Phase ${i}` })
    );
    const result = validateProtocol(
      makeProtocol({ phases, durationDays: phases.length })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "phases")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateProtocol — moat boundary guard
// ---------------------------------------------------------------------------

describe("validateProtocol — moat boundary (M-002)", () => {
  it("does not expose any generation logic — only validates structure", () => {
    // The module must not contain generation code. This test confirms that
    // passing a structurally valid protocol always returns valid=true regardless
    // of goal semantics, confirming no semantic intelligence is applied.
    const result1 = validateProtocol(makeProtocol({ goal: "Reduce stress and improve focus" }));
    const result2 = validateProtocol(makeProtocol({ goal: "Support digestive health naturally" }));
    expect(result1.valid).toBe(true);
    expect(result2.valid).toBe(true);
  });

  it("accepts any valid ProtocolStatus without applying generation heuristics", () => {
    for (const status of Object.values(ProtocolStatus)) {
      const result = validateProtocol(makeProtocol({ status }));
      expect(result.valid).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// validateProtocolCollection
// ---------------------------------------------------------------------------

describe("validateProtocolCollection — valid collection", () => {
  it("returns valid=true for a collection of distinct valid protocols", () => {
    const protocols: Protocol[] = [
      makeProtocol({ protocolId: "protocol-alpha" }),
      makeTwoPhaseProtocol(),
    ];
    const result = validateProtocolCollection(protocols);
    if (!result.valid) console.error(result.errors);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid=true for an empty collection", () => {
    const result = validateProtocolCollection([]);
    expect(result.valid).toBe(true);
  });
});

describe("validateProtocolCollection — invalid collection", () => {
  it("reports error for duplicate protocolId", () => {
    const protocols: Protocol[] = [makeProtocol(), makeProtocol()]; // same protocolId
    const result = validateProtocolCollection(protocols);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
  });

  it("aggregates errors from multiple invalid protocols", () => {
    const protocols: Protocol[] = [
      makeProtocol({ protocolId: "protocol-a", goal: "ok" }), // goal too short
      makeProtocol({ protocolId: "protocol-b", version: "bad-version" }), // bad semver
    ];
    const result = validateProtocolCollection(protocols);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// validateChallenge — valid records
// ---------------------------------------------------------------------------

describe("validateChallenge — valid records", () => {
  it("returns valid=true for a minimal valid challenge", () => {
    const result = validateChallenge(makeChallenge());
    if (!result.valid) console.error(result.errors);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid=true for an Educational challenge", () => {
    const result = validateChallenge(
      makeChallenge({ type: ChallengeType.Educational, prompt: "Read about lavender constituents today." })
    );
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for an Experiential challenge", () => {
    const result = validateChallenge(
      makeChallenge({ type: ChallengeType.Experiential, prompt: "Try a 5-minute aromatic diffusion session." })
    );
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for ChallengeCompletionStatus.Completed", () => {
    const result = validateChallenge(
      makeChallenge({
        completionStatus: ChallengeCompletionStatus.Completed,
        response: "Yes, I applied it at 9 PM.",
      })
    );
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for ChallengeCompletionStatus.Skipped", () => {
    const result = validateChallenge(
      makeChallenge({ completionStatus: ChallengeCompletionStatus.Skipped })
    );
    expect(result.valid).toBe(true);
  });

  it("returns valid=true when response is absent (Pending status)", () => {
    const challenge = makeChallenge();
    expect(challenge.response).toBeUndefined();
    const result = validateChallenge(challenge);
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for dueDay at boundary value (1)", () => {
    const result = validateChallenge(makeChallenge({ dueDay: 1 }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for a high dueDay value", () => {
    const result = validateChallenge(makeChallenge({ dueDay: 365 }));
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallenge — field errors
// ---------------------------------------------------------------------------

describe("validateChallenge — field errors", () => {
  it("reports error when challengeId is empty string", () => {
    const result = validateChallenge(makeChallenge({ challengeId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeId")).toBe(true);
  });

  it("reports error when challengeId has invalid format (uppercase)", () => {
    const result = validateChallenge(makeChallenge({ challengeId: "CHALLENGE-DAY1" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeId")).toBe(true);
  });

  it("reports error when protocolId is empty string", () => {
    const result = validateChallenge(makeChallenge({ protocolId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("reports error when type is an unknown value", () => {
    const result = validateChallenge(makeChallenge({ type: "reminder" as ChallengeType }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "type")).toBe(true);
  });

  it("reports error when prompt is too short (< 5 chars)", () => {
    const result = validateChallenge(makeChallenge({ prompt: "Go?" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "prompt")).toBe(true);
  });

  it("reports error when dueDay is 0", () => {
    const result = validateChallenge(makeChallenge({ dueDay: 0 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "dueDay")).toBe(true);
  });

  it("reports error when dueDay is negative", () => {
    const result = validateChallenge(makeChallenge({ dueDay: -1 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "dueDay")).toBe(true);
  });

  it("reports error when completionStatus is unknown", () => {
    const result = validateChallenge(
      makeChallenge({ completionStatus: "done" as ChallengeCompletionStatus })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "completionStatus")).toBe(true);
  });

  it("reports error when response is an empty string", () => {
    const result = validateChallenge(makeChallenge({ response: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallenge — moat boundary guard
// ---------------------------------------------------------------------------

describe("validateChallenge — moat boundary (M-003)", () => {
  it("does not apply challenge engine rule evaluation — only validates structure", () => {
    // The module must not determine when/why challenges should be triggered.
    // Any structurally valid challenge should pass regardless of prompt content.
    const c1 = makeChallenge({ prompt: "Did you apply your blend this morning?" });
    const c2 = makeChallenge({ prompt: "How does the aroma make you feel today?" });
    expect(validateChallenge(c1).valid).toBe(true);
    expect(validateChallenge(c2).valid).toBe(true);
  });

  it("accepts all ChallengeType values without applying engine prioritization", () => {
    for (const type of Object.values(ChallengeType)) {
      const result = validateChallenge(makeChallenge({ type, prompt: "A valid prompt for testing." }));
      expect(result.valid).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// validateChallengeCollection
// ---------------------------------------------------------------------------

describe("validateChallengeCollection — valid collection", () => {
  it("returns valid=true for a collection of distinct valid challenges", () => {
    const challenges: Challenge[] = [
      makeChallenge({ challengeId: "challenge-day1" }),
      makeChallenge({ challengeId: "challenge-day7", dueDay: 7, type: ChallengeType.Educational, prompt: "Read today's educational content." }),
    ];
    const result = validateChallengeCollection(challenges);
    if (!result.valid) console.error(result.errors);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid=true for an empty collection", () => {
    const result = validateChallengeCollection([]);
    expect(result.valid).toBe(true);
  });
});

describe("validateChallengeCollection — invalid collection", () => {
  it("reports error for duplicate challengeId", () => {
    const challenges: Challenge[] = [makeChallenge(), makeChallenge()];
    const result = validateChallengeCollection(challenges);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
  });

  it("aggregates errors from multiple invalid challenges", () => {
    const challenges: Challenge[] = [
      makeChallenge({ challengeId: "challenge-a", prompt: "Too?" }), // prompt too short
      makeChallenge({ challengeId: "challenge-b", dueDay: 0 }), // invalid dueDay
    ];
    const result = validateChallengeCollection(challenges);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("detects duplicate challengeId and also validates individual records", () => {
    const invalid = makeChallenge({ prompt: "Nah" }); // same challengeId as base and invalid
    const challenges: Challenge[] = [makeChallenge(), invalid];
    const result = validateChallengeCollection(challenges);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
    expect(result.errors.some((e) => e.field === "prompt")).toBe(true);
  });
});
