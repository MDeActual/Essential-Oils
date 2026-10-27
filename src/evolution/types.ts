export type EvolutionSignalType =
  | "low_adherence_alert"
  | "high_skip_rate"
  | "phase_drop_off"
  | "positive_outcome_cluster"
  | "regression_alert";

export type EvolutionMetric =
  | "average_adherence"
  | "challenge_skip_rate"
  | "phase_completion"
  | "positive_outcome_rate";

export type EvolutionSeverity = "info" | "warning" | "critical";

export interface EvolutionSignal {
  signalId: string;
  type: EvolutionSignalType;
  severity: EvolutionSeverity;
  protocolId: string;
  protocolVersion: string;
  evidenceCount: number;
  metric: EvolutionMetric;
  metricValue: number;
  timestamp: string;
}

export type EvolutionChangeType =
  | "challenge_revision"
  | "oil_substitution"
  | "phase_restructure"
  | "deprecation";

export interface EvolutionCandidate {
  candidateId: string;
  signalId: string;
  recommendedChange: string;
  changeType: EvolutionChangeType;
  evidenceSummary: string;
  proposedVersionBump: "minor" | "major";
  status: "proposed";
  requiresHumanApproval: true;
}

export interface EvolutionCandidateReport {
  reportId: string;
  generatedAt: string;
  protocolId: string;
  currentVersion: string;
  signals: EvolutionSignal[];
  candidates: EvolutionCandidate[];
}

export interface BuildEvolutionCandidateReportInput {
  reportId: string;
  generatedAt: string;
  protocolId: string;
  currentVersion: string;
  signals: EvolutionSignal[];
}
