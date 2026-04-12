/**
 * types.ts — API Layer Shared Types
 *
 * Defines the canonical response envelope and error types used by all API
 * endpoints. These types ensure a consistent response format across the entire
 * external API surface (Phase 3).
 *
 * MOAT NOTICE: The API layer is read-only. No moat-protected internals
 * (synergy scoring matrix, protocol generation algorithm, challenge engine rules)
 * are exposed through this interface (LOCK-002).
 */

// ---------------------------------------------------------------------------
// API Response Envelope
// ---------------------------------------------------------------------------

/**
 * Standard success response envelope returned by all API endpoints.
 * All successful responses are wrapped in this structure.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  /** ISO 8601 timestamp when this response was generated. */
  generatedAt: string;
}

/**
 * Standard error response envelope returned when a request fails.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    /** Machine-readable error code. */
    code: string;
    /** Human-readable error message. */
    message: string;
  };
  /** ISO 8601 timestamp when this response was generated. */
  generatedAt: string;
}

/** Union of all possible API response envelopes. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Health Response
// ---------------------------------------------------------------------------

/** Response payload for GET /health. */
export interface HealthPayload {
  status: "ok";
  version: string;
  uptime: number;
}

// ---------------------------------------------------------------------------
// Protocol Response
// ---------------------------------------------------------------------------

/**
 * Publicly-safe Protocol summary returned by GET /protocols.
 * Omits moat-protected generation metadata per LOCK-002.
 */
export interface ProtocolSummary {
  protocolId: string;
  version: string;
  goal: string;
  durationDays: number;
  status: string;
  phaseCount: number;
  createdAt: string;
}

/**
 * Publicly-safe Protocol detail returned by GET /protocols/:id.
 * Includes phase structure and challenge count, but never exposes
 * the generation algorithm or proprietary scoring weights (LOCK-002, M-002, M-003).
 */
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

/** Publicly-safe representation of a single protocol phase. */
export interface ProtocolPhaseDetail {
  phaseIndex: number;
  label: string;
  durationDays: number;
  instructions: string;
}

// ---------------------------------------------------------------------------
// Analytics Response
// ---------------------------------------------------------------------------

/** Response payload for GET /analytics/protocols. */
export interface AnalyticsProtocolsPayload {
  protocolCount: number;
  totalEligibleRecords: number;
  totalExcludedRecords: number;
  segments: AnalyticsSegmentSummary[];
  generatedAt: string;
}

/** Per-protocol segment summary included in GET /analytics/protocols. */
export interface AnalyticsSegmentSummary {
  protocolId: string;
  eligibleRecordCount: number;
  averageAdherenceScore: number;
  averageChallengeCompletionRate: number;
}

/** Response payload for GET /analytics/protocols/:id. */
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
