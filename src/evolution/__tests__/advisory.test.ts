import { buildEvolutionCandidateReport } from "../advisory";
import type { BuildEvolutionCandidateReportInput } from "../types";

function makeInput(
  overrides: Partial<BuildEvolutionCandidateReportInput> = {}
): BuildEvolutionCandidateReportInput {
  return {
    reportId: "evol-2026-10-27-001",
    generatedAt: "2026-10-27T08:00:00.000Z",
    protocolId: "protocol-sleep-support",
    currentVersion: "1.2.0",
    signals: [
      {
        signalId: "signal-1",
        type: "high_skip_rate",
        severity: "warning",
        protocolId: "protocol-sleep-support",
        protocolVersion: "1.2.0",
        evidenceCount: 30,
        metric: "challenge_skip_rate",
        metricValue: 45,
        timestamp: "2026-10-27T07:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

describe("Protocol Evolution advisory reports", () => {
  it("creates proposed candidates that require human approval from aggregate signals", () => {
    const report = buildEvolutionCandidateReport(makeInput());

    expect(report.candidates).toEqual([
      expect.objectContaining({
        signalId: "signal-1",
        changeType: "challenge_revision",
        status: "proposed",
        requiresHumanApproval: true,
        evidenceSummary: expect.stringContaining("30 eligible contributors"),
      }),
    ]);
  });

  it("rejects signals below the minimum eligible evidence count", () => {
    const input = makeInput({
      signals: makeInput().signals.map((signal) => ({ ...signal, evidenceCount: 29 })),
    });

    expect(() => buildEvolutionCandidateReport(input)).toThrow(
      "Signals must contain valid aggregate evidence."
    );
  });

  it("rejects signals that do not match the report protocol version", () => {
    const input = makeInput({
      signals: makeInput().signals.map((signal) => ({
        ...signal,
        protocolVersion: "1.1.0",
      })),
    });

    expect(() => buildEvolutionCandidateReport(input)).toThrow(
      "Signals must match the report protocol and version."
    );
  });
});
