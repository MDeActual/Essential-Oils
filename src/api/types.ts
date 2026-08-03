/**
 * types.ts — API Layer Shared Types
 *
 * Defines the canonical read-only API response envelopes and public payloads.
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  generatedAt: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  generatedAt: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthPayload {
  status: "ok";
  version: string;
  uptime: number;
  runtimeMode: "development" | "test" | "staging" | "production";
  storageMode: "memory" | "database";
}

export interface ReadinessPayload {
  status: "ready";
  runtimeMode: "development" | "test" | "staging" | "production";
  storageMode: "memory" | "database";
  database: "connected" | "not_required";
}

export interface ProtocolSummary {
  protocolId: string;
  version: string;
  goal: string;
  durationDays: number;
  status: string;
  phaseCount: number;
  createdAt: string;
}

export interface ProtocolDetail {
  protocolId: string;
  version: string;
  goal: string;
  durationDays: number;
  status: string;
  phases: ProtocolPhaseDetail[];
  challengeCount: number;
  createdAt: string;
}

export interface ProtocolPhaseDetail {
  phaseIndex: number;
  label: string;
  durationDays: number;
  instructions: string;
}

export interface AnalyticsProtocolsPayload {
  protocolCount: number;
  totalEligibleRecords: number;
  totalExcludedRecords: number;
  segments: AnalyticsSegmentSummary[];
  generatedAt: string;
}

export interface AnalyticsSegmentSummary {
  protocolId: string;
  eligibleRecordCount: number;
  averageAdherenceScore: number;
  averageChallengeCompletionRate: number;
}

export interface AnalyticsProtocolDetailPayload {
  protocolId: string;
  eligibleRecordCount: number;
  excludedRecordCount: number;
  averageAdherenceScore: number;
  averageChallengeCompletionRate: number;
  minAdherenceScore: number;
  maxAdherenceScore: number;
  exclusionBreakdown: Record<string, number>;
  computedAt: string;
}
