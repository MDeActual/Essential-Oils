import {
  RuntimeConfigurationError,
  loadRuntimeConfig,
  safeRuntimeDiagnostics,
} from "../runtime";

function env(values: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return { ...values };
}

describe("loadRuntimeConfig", () => {
  it("defaults local execution to development memory mode", () => {
    expect(loadRuntimeConfig(env({}))).toEqual({
      runtimeMode: "development",
      storageMode: "memory",
      databaseConfigured: false,
      port: 3000,
    });
  });

  it("allows deterministic memory storage in test mode", () => {
    expect(loadRuntimeConfig(env({ NODE_ENV: "test" })).storageMode).toBe("memory");
  });

  it("selects database mode when DATABASE_URL is configured", () => {
    const config = loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "production",
      DATABASE_URL: "postgresql://user:secret@example.invalid/phyto",
      PORT: "8080",
    }));

    expect(config).toEqual({
      runtimeMode: "production",
      storageMode: "database",
      databaseConfigured: true,
      port: 8080,
    });
  });

  it.each(["staging", "production"])(
    "fails closed when %s has no database configuration",
    (runtimeMode) => {
      expect(() => loadRuntimeConfig(env({ PHYTO_RUNTIME_MODE: runtimeMode })))
        .toThrow(RuntimeConfigurationError);
    }
  );

  it("rejects explicit memory mode in production even when a database URL exists", () => {
    expect(() => loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "production",
      PHYTO_STORAGE_MODE: "memory",
      DATABASE_URL: "postgresql://configured-but-not-selected",
    }))).toThrow(/cannot use in-memory storage/);
  });

  it("rejects database mode without DATABASE_URL", () => {
    expect(() => loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "development",
      PHYTO_STORAGE_MODE: "database",
    }))).toThrow(/requires DATABASE_URL/);
  });

  it("rejects unknown modes and invalid ports", () => {
    expect(() => loadRuntimeConfig(env({ PHYTO_RUNTIME_MODE: "prod" })))
      .toThrow(/Unsupported runtime mode/);
    expect(() => loadRuntimeConfig(env({ PORT: "70000" })))
      .toThrow(/PORT/);
  });

  it("safe diagnostics never include the connection string", () => {
    const secretUrl = "postgresql://user:secret@example.invalid/phyto";
    const diagnostics = safeRuntimeDiagnostics(loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "staging",
      DATABASE_URL: secretUrl,
    })));

    expect(JSON.stringify(diagnostics)).not.toContain(secretUrl);
    expect(diagnostics).toEqual({
      runtimeMode: "staging",
      storageMode: "database",
      databaseConfigured: true,
      port: 3000,
    });
  });
});
