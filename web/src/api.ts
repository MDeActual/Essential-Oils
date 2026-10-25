import { frontendConfig } from "./config";
import type {
  AnalyticsProtocolDetailPayload,
  AnalyticsProtocolsPayload,
  ApiResponse,
  HealthPayload,
  ProtocolDetail,
  ProtocolSummary,
} from "./types";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(
    message: string,
    status: number,
    code: string | null
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

function buildHeaders(): Headers {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (frontendConfig.tenantId) {
    headers.set("X-Phyto-Tenant-Id", frontendConfig.tenantId);
  }

  return headers;
}

async function fetchEnvelope<T>(path: string): Promise<T> {
  const response = await fetch(`${frontendConfig.apiBaseUrl}${path}`, {
    method: "GET",
    headers: buildHeaders(),
  });

  let body: ApiResponse<T> | null = null;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const code = body && "error" in body ? body.error.code : null;
    const message = body && "error" in body
      ? body.error.message
      : `Request failed with status ${response.status}`;
    throw new ApiRequestError(message, response.status, code);
  }

  if (!body || !("success" in body) || body.success !== true) {
    throw new ApiRequestError("API response was not a success envelope.", response.status, null);
  }

  return body.data;
}

export function getHealth(): Promise<HealthPayload> {
  return fetchEnvelope<HealthPayload>("/health");
}

export function getProtocols(): Promise<ProtocolSummary[]> {
  return fetchEnvelope<ProtocolSummary[]>("/protocols");
}

export function getProtocol(protocolId: string): Promise<ProtocolDetail> {
  return fetchEnvelope<ProtocolDetail>(`/protocols/${protocolId}`);
}

export function getAnalyticsProtocols(): Promise<AnalyticsProtocolsPayload> {
  return fetchEnvelope<AnalyticsProtocolsPayload>("/analytics/protocols");
}

export function getAnalyticsProtocol(
  protocolId: string
): Promise<AnalyticsProtocolDetailPayload> {
  return fetchEnvelope<AnalyticsProtocolDetailPayload>(`/analytics/protocols/${protocolId}`);
}
