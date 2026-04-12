/**
 * index.ts — API Module Public Interface
 *
 * Exports the public surface of src/api/ for use by the application entry
 * point and integration tests. Only the application factory and shared types
 * are exported; internal middleware, controllers, and stores are not exposed.
 */

export { createApp } from "./server";
export type {
  AnalyticsProtocolDetailPayload,
  AnalyticsProtocolsPayload,
  AnalyticsSegmentSummary,
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  HealthPayload,
  ProtocolDetail,
  ProtocolPhaseDetail,
  ProtocolSummary,
} from "./types";
