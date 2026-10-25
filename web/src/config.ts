interface FrontendConfig {
  apiBaseUrl: string;
  tenantId: string | null;
}

function normalizeBaseUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("VITE_PHYTO_API_BASE_URL must be a valid absolute URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("VITE_PHYTO_API_BASE_URL must use HTTP or HTTPS.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("VITE_PHYTO_API_BASE_URL must not include credentials.");
  }

  if (parsed.search || parsed.hash) {
    throw new Error("VITE_PHYTO_API_BASE_URL must not include query strings or fragments.");
  }

  if (import.meta.env.PROD && parsed.protocol === "http:" && parsed.hostname !== "localhost") {
    throw new Error("Production frontend requires an HTTPS API endpoint.");
  }

  return parsed.toString().replace(/\/$/, "");
}

function optionalTrimmed(value: string | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readFrontendConfig(): FrontendConfig {
  const configuredApiBaseUrl = import.meta.env.VITE_PHYTO_API_BASE_URL;
  if (import.meta.env.PROD && !optionalTrimmed(configuredApiBaseUrl)) {
    throw new Error("VITE_PHYTO_API_BASE_URL is required for production builds.");
  }
  const apiBaseUrl = normalizeBaseUrl(configuredApiBaseUrl ?? "http://localhost:3000");

  return {
    apiBaseUrl,
    tenantId: optionalTrimmed(import.meta.env.VITE_PHYTO_TENANT_ID),
  };
}

export const frontendConfig = readFrontendConfig();
