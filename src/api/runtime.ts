/**
 * runtime.ts — Explicit API runtime and storage configuration
 *
 * Development and test may use deterministic in-memory seed stores.
 * Staging and production require PostgreSQL. Loader-produced objects are
 * tracked by module identity so alternate entry points cannot pass a forged
 * structurally compatible object into createApp().
 */

export type RuntimeMode = "development" | "test" | "staging" | "production";
export type StorageMode = "memory" | "database";

export interface RuntimeConfig {
  runtimeMode: RuntimeMode;
  storageMode: StorageMode;
  databaseConfigured: boolean;
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
const validatedConfigurations = new WeakSet<object>();

function nonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function runtimeModeFrom(environment: NodeJS.ProcessEnv): RuntimeMode {
  const raw = environment["PHYTO_RUNTIME_MODE"]
    ?? environment["NODE_ENV"]
    ?? "development";
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

function validateRuntimeInvariants(config: RuntimeConfig): void {
  if (!RUNTIME_MODES.has(config.runtimeMode)) {
    throw new RuntimeConfigurationError("Runtime configuration contains an unsupported runtime mode.");
  }
  if (!STORAGE_MODES.has(config.storageMode)) {
    throw new RuntimeConfigurationError("Runtime configuration contains an unsupported storage mode.");
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
}

export function loadRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env
): Readonly<RuntimeConfig> {
  const runtimeMode = runtimeModeFrom(environment);
  const databaseConfigured = nonEmpty(environment["DATABASE_URL"]);
  const requestedStorage = environment["PHYTO_STORAGE_MODE"];

  if (requestedStorage !== undefined
      && !STORAGE_MODES.has(requestedStorage as StorageMode)) {
    throw new RuntimeConfigurationError(
      `Unsupported storage mode '${requestedStorage}'. Expected memory or database.`
    );
  }

  const storageMode = (requestedStorage as StorageMode | undefined)
    ?? (databaseConfigured ? "database" : "memory");

  if (storageMode === "database" && !databaseConfigured) {
    throw new RuntimeConfigurationError(
      "Database storage requires DATABASE_URL. The credential value was not logged."
    );
  }

  const config: RuntimeConfig = {
    runtimeMode,
    storageMode,
    databaseConfigured,
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
    port: config.port,
  };
}
