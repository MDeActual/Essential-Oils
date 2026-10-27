import { SEMVER_PATTERN } from "../protocol/schema";
import type {
  BuildEvolutionCandidateReportInput,
  EvolutionCandidate,
  EvolutionCandidateReport,
  EvolutionChangeType,
  EvolutionSignal,
} from "./types";

const MINIMUM_EVIDENCE_COUNT = 30;

const candidateRecommendations: Record<
  EvolutionSignal["type"],
  { changeType: EvolutionChangeType; recommendedChange: string; versionBump: "minor" | "major" }
> = {
  low_adherence_alert: {
    changeType: "phase_restructure",
    recommendedChange: "Review protocol phases and timing using the aggregate adherence signal.",
    versionBump: "major",
  },
  high_skip_rate: {
    changeType: "challenge_revision",
    recommendedChange: "Review the affected challenge using aggregate skip-rate evidence.",
    versionBump: "minor",
  },
  phase_drop_off: {
    changeType: "phase_restructure",
    recommendedChange: "Review phase structure using aggregate completion evidence.",
    versionBump: "major",
  },
  positive_outcome_cluster: {
    changeType: "oil_substitution",
    recommendedChange: "Review the aggregate outcome signal for a possible protocol refinement.",
    versionBump: "minor",
  },
  regression_alert: {
    changeType: "deprecation",
    recommendedChange: "Review the regression before considering any further protocol evolution.",
    versionBump: "minor",
  },
};

function isValidTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function validateInput(input: BuildEvolutionCandidateReportInput): void {
  if (!input.reportId.trim() || !input.protocolId.trim()) {
    throw new Error("Report and protocol identifiers are required.");
  }
  if (!SEMVER_PATTERN.test(input.currentVersion)) {
    throw new Error("Current protocol version must use semantic versioning.");
  }
  if (!isValidTimestamp(input.generatedAt)) {
    throw new Error("Report generation time must be a valid timestamp.");
  }

  const signalIds = new Set<string>();
  for (const signal of input.signals) {
    if (!signal.signalId.trim() || signalIds.has(signal.signalId)) {
      throw new Error("Signal identifiers must be non-empty and unique.");
    }
    signalIds.add(signal.signalId);

    if (
      signal.protocolId !== input.protocolId ||
      signal.protocolVersion !== input.currentVersion
    ) {
      throw new Error("Signals must match the report protocol and version.");
    }
    if (
      !Number.isInteger(signal.evidenceCount) ||
      signal.evidenceCount < MINIMUM_EVIDENCE_COUNT ||
      !Number.isFinite(signal.metricValue) ||
      signal.metricValue < 0 ||
      signal.metricValue > 100 ||
      !isValidTimestamp(signal.timestamp)
    ) {
      throw new Error("Signals must contain valid aggregate evidence.");
    }
  }
}

function buildCandidate(signal: EvolutionSignal): EvolutionCandidate {
  const recommendation = candidateRecommendations[signal.type];
  return {
    candidateId: `${signal.signalId}-candidate`,
    signalId: signal.signalId,
    recommendedChange: recommendation.recommendedChange,
    changeType: recommendation.changeType,
    evidenceSummary: `${signal.metric} measured ${signal.metricValue}% across ${signal.evidenceCount} eligible contributors.`,
    proposedVersionBump: recommendation.versionBump,
    status: "proposed",
    requiresHumanApproval: true,
  };
}

export function buildEvolutionCandidateReport(
  input: BuildEvolutionCandidateReportInput
): EvolutionCandidateReport {
  validateInput(input);

  return {
    reportId: input.reportId,
    generatedAt: input.generatedAt,
    protocolId: input.protocolId,
    currentVersion: input.currentVersion,
    signals: input.signals.map((signal) => ({ ...signal })),
    candidates: input.signals.map(buildCandidate),
  };
}
