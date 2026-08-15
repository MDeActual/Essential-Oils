/**
 * evolution.test.ts — Protocol Evolution Advisory Service Tests
 *
 * Tests for:
 * - EvolutionSignalType enum values
 * - VersionBumpType enum values
 * - validateEvolutionCandidate() — valid and invalid candidates
 * - checkProtocolEvolutionEligibility() — active/deprecated/draft/completed protocols
 * - validateRegressionAlert() — valid and invalid regression alerts
 */

import {
  EvolutionCandidate,
  EvolutionSignalType,
  ProtocolRegressionAlert,
  VersionBumpType,
  checkProtocolEvolutionEligibility,
  validateEvolutionCandidate,
  validateRegressionAlert,
} from "../evolution";
import { Protocol, ProtocolStatus, ChallengeType, ChallengeCompletionStatus } from "../index";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeProtocol(overrides: Partial<Protocol> = {}): Protocol {
  return {
    protocolId: "protocol-sleep-support",
    version: "1.0.0",
    userProfileId: "user-abc",
    goal: "Improve sleep quality",
    phases: [
      {
        phaseIndex: 0,
        label: "Foundation",
        durationDays: 7,
        blendIds: [],
        oilIds: [],
        instructions: "Apply lavender before bed.",
      },
    ],
    durationDays: 7,
    challengeIds: ["c-001"],
    createdAt: "2026-04-01T00:00:00Z",
    status: ProtocolStatus.Active,
    ...overrides,
  };
}

function makeCandidate(overrides: Partial<EvolutionCandidate> = {}): EvolutionCandidate {
  return {
    protocolId: "protocol-sleep-support",
    currentVersion: "1.0.0",
    signals: [EvolutionSignalType.LowAdherence],
    rationale: "Cohort adherence has dropped below 50% over the last 14-day window.",
    recommendedBump: VersionBumpType.Minor,
    generatedAt: "2026-04-15T10:00:00Z",
    advisoryNote:
      "Protocol sleep-support v1.0.0 shows low adherence signals. Human review recommended before MINOR bump.",
    ...overrides,
  };
}

function makeAlert(overrides: Partial<ProtocolRegressionAlert> = {}): ProtocolRegressionAlert {
  return {
    protocolId: "protocol-sleep-support",
    affectedVersion: "1.1.0",
    signals: [EvolutionSignalType.HighSkipRate],
    description: "Skip rate for adherence challenges increased 30% vs. v1.0.0.",
    generatedAt: "2026-04-20T12:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Enum tests
// ---------------------------------------------------------------------------

describe("EvolutionSignalType enum", () => {
  it("contains 'low_adherence'", () => {
    expect(EvolutionSignalType.LowAdherence).toBe("low_adherence");
  });
  it("contains 'high_skip_rate'", () => {
    expect(EvolutionSignalType.HighSkipRate).toBe("high_skip_rate");
  });
  it("contains 'phase_completion_gap'", () => {
    expect(EvolutionSignalType.PhaseCompletionGap).toBe("phase_completion_gap");
  });
  it("contains 'version_lag'", () => {
    expect(EvolutionSignalType.VersionLag).toBe("version_lag");
  });
  it("has exactly 4 values", () => {
    expect(Object.values(EvolutionSignalType)).toHaveLength(4);
  });
});

describe("VersionBumpType enum", () => {
  it("contains 'patch'", () => {
    expect(VersionBumpType.Patch).toBe("patch");
  });
  it("contains 'minor'", () => {
    expect(VersionBumpType.Minor).toBe("minor");
  });
  it("contains 'major'", () => {
    expect(VersionBumpType.Major).toBe("major");
  });
  it("has exactly 3 values", () => {
    expect(Object.values(VersionBumpType)).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// validateEvolutionCandidate
// ---------------------------------------------------------------------------

describe("validateEvolutionCandidate", () => {
  it("accepts a well-formed evolution candidate", () => {
    const result = validateEvolutionCandidate(makeCandidate());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects a candidate with an empty protocolId", () => {
    const result = validateEvolutionCandidate(makeCandidate({ protocolId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("rejects a candidate with an invalid semver version", () => {
    const result = validateEvolutionCandidate(
      makeCandidate({ currentVersion: "1.0" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "currentVersion")).toBe(true);
  });

  it("rejects a candidate with an empty signals array", () => {
    const result = validateEvolutionCandidate(makeCandidate({ signals: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "signals")).toBe(true);
  });

  it("rejects a candidate with an unknown signal type", () => {
    const result = validateEvolutionCandidate(
      makeCandidate({ signals: ["unknown_signal" as EvolutionSignalType] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "signals")).toBe(true);
  });

  it("rejects a candidate with an empty rationale", () => {
    const result = validateEvolutionCandidate(makeCandidate({ rationale: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "rationale")).toBe(true);
  });

  it("rejects a candidate with an empty advisoryNote", () => {
    const result = validateEvolutionCandidate(makeCandidate({ advisoryNote: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "advisoryNote")).toBe(true);
  });

  it("rejects a candidate with an invalid recommendedBump", () => {
    const result = validateEvolutionCandidate(
      makeCandidate({ recommendedBump: "hotfix" as VersionBumpType })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recommendedBump")).toBe(true);
  });

  it("rejects a candidate with a malformed generatedAt timestamp", () => {
    const result = validateEvolutionCandidate(
      makeCandidate({ generatedAt: "not-a-date" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "generatedAt")).toBe(true);
  });

  it("accepts multiple valid signal types", () => {
    const result = validateEvolutionCandidate(
      makeCandidate({
        signals: [EvolutionSignalType.LowAdherence, EvolutionSignalType.HighSkipRate],
      })
    );
    expect(result.valid).toBe(true);
  });

  it("accepts a major bump candidate", () => {
    const result = validateEvolutionCandidate(
      makeCandidate({ recommendedBump: VersionBumpType.Major, currentVersion: "2.0.0" })
    );
    expect(result.valid).toBe(true);
  });

  it("rejects null input gracefully", () => {
    const result = validateEvolutionCandidate(null as unknown as EvolutionCandidate);
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkProtocolEvolutionEligibility
// ---------------------------------------------------------------------------

describe("checkProtocolEvolutionEligibility", () => {
  it("marks an active protocol as eligible", () => {
    const result = checkProtocolEvolutionEligibility(
      makeProtocol({ status: ProtocolStatus.Active })
    );
    expect(result.eligible).toBe(true);
  });

  it("marks a deprecated protocol as eligible", () => {
    const result = checkProtocolEvolutionEligibility(
      makeProtocol({ status: ProtocolStatus.Deprecated })
    );
    expect(result.eligible).toBe(true);
  });

  it("marks a draft protocol as ineligible", () => {
    const result = checkProtocolEvolutionEligibility(
      makeProtocol({ status: ProtocolStatus.Draft })
    );
    expect(result.eligible).toBe(false);
    expect(result.message).toMatch(/draft/);
  });

  it("marks a completed protocol as ineligible", () => {
    const result = checkProtocolEvolutionEligibility(
      makeProtocol({ status: ProtocolStatus.Completed })
    );
    expect(result.eligible).toBe(false);
    expect(result.message).toMatch(/completed/);
  });

  it("rejects a protocol with an empty protocolId", () => {
    const result = checkProtocolEvolutionEligibility(
      makeProtocol({ protocolId: "" })
    );
    expect(result.eligible).toBe(false);
  });

  it("rejects null input gracefully", () => {
    const result = checkProtocolEvolutionEligibility(null as unknown as Protocol);
    expect(result.eligible).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateRegressionAlert
// ---------------------------------------------------------------------------

describe("validateRegressionAlert", () => {
  it("accepts a well-formed regression alert", () => {
    const result = validateRegressionAlert(makeAlert());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects an alert with an empty protocolId", () => {
    const result = validateRegressionAlert(makeAlert({ protocolId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("rejects an alert with an invalid semver affectedVersion", () => {
    const result = validateRegressionAlert(makeAlert({ affectedVersion: "v1" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "affectedVersion")).toBe(true);
  });

  it("rejects an alert with an empty signals array", () => {
    const result = validateRegressionAlert(makeAlert({ signals: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "signals")).toBe(true);
  });

  it("rejects an alert with an empty description", () => {
    const result = validateRegressionAlert(makeAlert({ description: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "description")).toBe(true);
  });

  it("rejects an alert with a malformed generatedAt", () => {
    const result = validateRegressionAlert(makeAlert({ generatedAt: "2026/04/20" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "generatedAt")).toBe(true);
  });

  it("accepts an alert with multiple signal types", () => {
    const result = validateRegressionAlert(
      makeAlert({
        signals: [EvolutionSignalType.HighSkipRate, EvolutionSignalType.PhaseCompletionGap],
      })
    );
    expect(result.valid).toBe(true);
  });

  it("rejects null input gracefully", () => {
    const result = validateRegressionAlert(null as unknown as ProtocolRegressionAlert);
    expect(result.valid).toBe(false);
  });
});
