export type DataOrigin = "real_contributor" | "synthetic" | "internal_test";

export interface Contributor {
  id: string;
  name: string;
  region?: string;
  reputationScore?: number;
  dataOrigin: DataOrigin;
}

export interface ProtocolStep {
  order: number;
  method: string;
  timing: string;
  quantity: string;
  effortLevel: string;
  safetyNote?: string;
}

export interface Protocol {
  id: string;
  title: string;
  version: string;
  category: string;
  steps: ProtocolStep[];
  recommendedFor: string[];
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  protocolId: string;
  durationDays: number;
}

export interface OutcomeLog {
  id: string;
  contributorId: string;
  challengeId: string;
  protocolId: string;
  adherence: number;
  signals: Record<string, number | string>;
  createdAt: string;
  dataOrigin: DataOrigin;
}
