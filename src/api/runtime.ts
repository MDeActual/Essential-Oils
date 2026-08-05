/**
 * runtime.ts — Explicit API runtime, storage, and identity configuration
 *
 * Development and test may use deterministic in-memory storage and disabled
 * authentication. Staging and production require PostgreSQL plus a statically
 * configured OIDC issuer, audience, and HTTPS JWKS endpoint.
 */

export type RuntimeMode = "development" | "test" | "staging" | "production";
export type StorageMode = "memory" | "database";
export type AuthMode = "disabled" | "oidc";
export type JwtAlgorithm = "RS256";

export interface OidcRuntimeConfig {
  issuer: string;
  audience: string;
  jwksUri: string;
  algorithms: readonly JwtAlgorithm[];
}

export interface RuntimeConfig {
  runtimeMode: RuntimeMode;
  storageMode: StorageMode;
  databaseConfigured: boolean;
  authMode: AuthMode;
  oidc: Readonly<OidcRuntimeConfig> | null;
  port: number;
}

export class RuntimeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeConfigurationError";
  }
}

const RUNTIME_MODES = new Set<RuntimeMode>([
  "development",
  "test",
  "staging",
  "production",
]);
const STORAGE_MODES = new Set<StorageMode>(["memory", "database"]);
const AUTH_MODES = new Set<AuthMode>(["disabled", "oidc"]);
const ALGORITHMS: readonly JwtAlgorithm[] = Object.freeze(["RS256"]);
const validatedConfigurations = new WeakSet<object>();

function nonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function requiredTrimmed(
  environment: NodeJS.ProcessEnv,
  key: string,
  description: string
): string {
  const value = environment[key];
  if (!nonEmpty(value)) {
    throw new RuntimeConfigurationError(`${description} requires ${key}.`);
  }
  return value!.trim();
}

function runtimeModeFrom(environment: NodeJS.ProcessEnv): RuntimeMode {
  const explicitMode = environment["PHYTO_RUNTIME_MODE"];
  const nodeMode = environment["NODE_ENV"];

  // Deployment platforms conventionally set NODE_ENV=production. A stale or
  // locally inherited override must never weaken production storage or identity
  // invariants, so production may only remain production.
  if (nodeMode === "production"
      && explicitMode !== undefined
      && explicitMode !== "production") {
    throw new RuntimeConfigurationError(
      "NODE_ENV=production cannot be downgraded by PHYTO_RUNTIME_MODE."
    );
  }

  const raw = explicitMode ?? nodeMode ?? "development";
  if (!RUNTIME_MODES.has(raw as RuntimeMode)) {
    throw new RuntimeConfigurationError(
      `Unsupported runtime mode '${raw}'. Expected development, test, staging, or production.`
    );
  }
  return raw as RuntimeMode;
}

function portFrom(environment: NodeJS.ProcessEnv): number {
  const raw = environment["PORT"] ?? "3000";
  if (!/^[1-9][0-9]{0,4}$/.test(raw)) {
    throw new RuntimeConfigurationError(
      "PORT must contain only an integer between 1 and 65535."
    );
  }
  const port = Number(raw);
  if (!Number.isSafeInteger(port) || port > 65535) {
    throw new RuntimeConfigurationError(
      "PORT must contain only an integer between 1 and 65535."
    );
  }
  return port;
}

function validateAbsoluteHttpsUrl(value: string, field: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new RuntimeConfigurationError(`${field} must be an absolute HTTPS URL.`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.hash) {
    throw new RuntimeConfigurationError(
      `${field} must be an absolute HTTPS URL without credentials or fragments.`
    );
  }
  return parsed;
}

function normalizedAbsoluteHttpsUrl(value: string, field: string): string {
  return validateAbsoluteHttpsUrl(value, field).toString();
}

function exactAbsoluteHttpsUrl(value: string, field: string): string {
  validateAbsoluteHttpsUrl(value, field);
  return value;
}

function oidcConfigFrom(
  environment: NodeJS.ProcessEnv,
  authMode: AuthMode
): Readonly<OidcRuntimeConfig> | null {
  if (authMode === "disabled") return null;

  const issuer = exactAbsoluteHttpsUrl(
    requiredTrimmed(environment, "PHYTO_OIDC_ISSUER", "OIDC authentication"),
    "PHYTO_OIDC_ISSUER"
  );
  const audience = requiredTrimmed(
    environment,
    "PHYTO_OIDC_AUDIENCE",
    "OIDC authentication"
  );
  const jwksUri = normalizedAbsoluteHttpsUrl(
    requiredTrimmed(environment, "PHYTO_OIDC_JWKS_URI", "OIDC authentication"),
    "PHYTO_OIDC_JWKS_URI"
  );

  return Object.freeze({
    issuer,
    audience,
    jwksUri,
    algorithms: ALGORITHMS,
  });
}

function validateRuntimeInvariants(config: RuntimeConfig): void {
  if (!RUNTIME_MODES.has(config.runtimeMode)) {
    throw new RuntimeConfigurationError("Runtime configuration contains an unsupported runtime mode.");
  }
  if (!STORAGE_MODES.has(config.storageMode)) {
    throw new RuntimeConfigurationError("Runtime configuration contains an unsupported storage mode.");
  }
  if (!AUTH_MODES.has(config.authMode)) {
    throw new RuntimeConfigurationError("Runtime configuration contains an unsupported authentication mode.");
  }
  if (!Number.isSafeInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new RuntimeConfigurationError("Runtime configuration contains an invalid port.");
  }
  if (config.storageMode === "database" && config.databaseConfigured !== true) {
    throw new RuntimeConfigurationError("Database storage requires configured database credentials.");
  }
  if ((config.runtimeMode === "staging" || config.runtimeMode === "production")
      && config.storageMode !== "database") {
    throw new RuntimeConfigurationError(
      `${config.runtimeMode} runtime cannot use in-memory storage.`
    );
  }
  if ((config.runtimeMode === "staging" || config.runtimeMode === "production")
      && config.authMode !== "oidc") {
    throw new RuntimeConfigurationError(
      `${config.runtimeMode} runtime requires OIDC authentication.`
    );
  }
  if (config.authMode === "oidc") {
    if (!config.oidc) {
      throw new RuntimeConfigurationError("OIDC authentication requires trusted provider configuration.");
    }
    validateAbsoluteHttpsUrl(config.oidc.issuer, "OIDC issuer");
    validateAbsoluteHttpsUrl(config.oidc.jwksUri, "OIDC JWKS URI");
    if (!nonEmpty(config.oidc.audience)) {
      throw new RuntimeConfigurationError("OIDC authentication requires a non-empty audience.");
    }
    if (config.oidc.algorithms.length !== 1 || config.oidc.algorithms[0] !== "RS256") {
      throw new RuntimeConfigurationError("Only the pinned RS256 JWT algorithm is supported.");
    }
  } else if (config.oidc !== null) {
    throw new RuntimeConfigurationError("Disabled authentication cannot carry OIDC provider configuration.");
  }
}

export function loadRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env
): Readonly<RuntimeConfig> {
  const runtimeMode = runtimeModeFrom(environment);
  const databaseConfigured = nonEmpty(environment["DATABASE_URL"]);
  const requestedStorage = environment["PHYTO_STORAGE_MODE"];
  const requestedAuth = environment["PHYTO_AUTH_MODE"]
    ?? ((runtimeMode === "staging" || runtimeMode === "production") ? "oidc" : "disabled");

  if (requestedStorage !== undefined
      && !STORAGE_MODES.has(requestedStorage as StorageMode)) {
    throw new RuntimeConfigurationError(
      `Unsupported storage mode '${requestedStorage}'. Expected memory or database.`
    );
  }
  if (!AUTH_MODES.has(requestedAuth as AuthMode)) {
    throw new RuntimeConfigurationError(
      `Unsupported authentication mode '${requestedAuth}'. Expected disabled or oidc.`
    );
  }

  const storageMode = (requestedStorage as StorageMode | undefined)
    ?? (databaseConfigured ? "database" : "memory");
  const authMode = requestedAuth as AuthMode;

  if (storageMode === "database" && !databaseConfigured) {
    throw new RuntimeConfigurationError(
      "Database storage requires DATABASE_URL. The credential value was not logged."
    );
  }

  const config: RuntimeConfig = {
    runtimeMode,
    storageMode,
    databaseConfigured,
    authMode,
    oidc: oidcConfigFrom(environment, authMode),
    port: portFrom(environment),
  };
  validateRuntimeInvariants(config);
  Object.freeze(config);
  validatedConfigurations.add(config);
  return config;
}

export function assertValidatedRuntimeConfig(
  config: Readonly<RuntimeConfig>
): asserts config is Readonly<RuntimeConfig> {
  if (!config || typeof config !== "object" || !validatedConfigurations.has(config)) {
    throw new RuntimeConfigurationError(
      "createApp requires a runtime configuration produced by loadRuntimeConfig()."
    );
  }
  validateRuntimeInvariants(config);
}

export function safeRuntimeDiagnostics(
  config: Readonly<RuntimeConfig>
): Record<string, unknown> {
  assertValidatedRuntimeConfig(config);
  return {
    runtimeMode: config.runtimeMode,
    storageMode: config.storageMode,
    databaseConfigured: config.databaseConfigured,
    authMode: config.authMode,
    identityConfigured: config.oidc !== null,
    port: config.port,
  };
}
