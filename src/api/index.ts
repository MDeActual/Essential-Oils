/**
 * index.ts — API Module Public Interface
 *
 * Exports the application factory, validated runtime boundary, and public
 * identity/response types. Internal middleware, controllers, repositories,
 * JWKS caches, and seed stores remain private to the module.
 */

export { createApp } from "./server";
export {
  RuntimeConfigurationError,
  assertValidatedRuntimeConfig,
  loadRuntimeConfig,
  safeRuntimeDiagnostics,
} from "./runtime";
export type {
  AuthMode,
  JwtAlgorithm,
  OidcRuntimeConfig,
  RuntimeConfig,
  RuntimeMode,
  StorageMode,
} from "./runtime";
export type {
  AuthenticatedPrincipal,
  PrincipalPermission,
  TokenVerifier,
} from "./security/identity";
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
  ReadinessPayload,
} from "./types";
