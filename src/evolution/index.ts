/**
 * Protocol Evolution advisory interface.
 *
 * This module consumes precomputed aggregate signals only. It does not derive
 * analytics signals or modify protocol data; every candidate requires human
 * approval (LOCK-004, M-004).
 */

export { buildEvolutionCandidateReport } from "./advisory";
export type {
  BuildEvolutionCandidateReportInput,
  EvolutionCandidate,
  EvolutionCandidateReport,
  EvolutionChangeType,
  EvolutionMetric,
  EvolutionSeverity,
  EvolutionSignal,
  EvolutionSignalType,
} from "./types";
