/**
 * runtime.ts — Explicit runtime and storage configuration
 *
 * Development and test may use the deterministic in-memory seed stores.
 * Staging and production must use PostgreSQL and fail before the server binds
 * when database configuration is absent or contradictory.
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

function nonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function runtimeModeFrom(environment: NodeJS.ProcessEnv): RuntimeMode {
  const raw = environment["PHYTO_RUNTIME_MODE"] ?? environment["NODE_ENV"] ?? "development";
  if (!RUNTIME_MODES.has(raw as RuntimeMode)) {
    throw new RuntimeConfigurationError(
      `Unsupported runtime mode '${raw}'. Expected development, test, staging, or production.`
    );
  }
  return raw as RuntimeMode;
}

function portFrom(environment: NodeJS.ProcessEnv): number {
  const raw = environment["PORT"] ?? "3000";
  const port = Number.parseInt(raw, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new RuntimeConfigurationError("PORT must be an integer between 1 and 65535.");
  }
  return port;
}

export function loadRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env
): Readonly<RuntimeConfig> {
  const runtimeMode = runtimeModeFrom(environment);
  const databaseConfigured = nonEmpty(environment["DATABASE_URL"]);
  const requestedStorage = environment["PHYTO_STORAGE_MODE"];

  if (requestedStorage !== undefined && !STORAGE_MODES.has(requestedStorage as StorageMode)) {
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

  if ((runtimeMode === "staging" || runtimeMode === "production")
      && storageMode !== "database") {
    throw new RuntimeConfigurationError(
      `${runtimeMode} runtime cannot use in-memory storage; configure DATABASE_URL and database storage.`
    );
  }

  return Object.freeze({
    runtimeMode,
    storageMode,
    databaseConfigured,
    port: portFrom(environment),
  });
}

export function safeRuntimeDiagnostics(config: RuntimeConfig): Record<string, unknown> {
  return {
    runtimeMode: config.runtimeMode,
    storageMode: config.storageMode,
    databaseConfigured: config.databaseConfigured,
    port: config.port,
  };
}
