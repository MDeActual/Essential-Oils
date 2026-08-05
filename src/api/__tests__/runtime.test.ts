import {
  RuntimeConfigurationError,
  loadRuntimeConfig,
  safeRuntimeDiagnostics,
} from "../runtime";

function env(values: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return { ...values };
}

const OIDC = {
  PHYTO_AUTH_MODE: "oidc",
  PHYTO_OIDC_ISSUER: "https://issuer.example.test/",
  PHYTO_OIDC_AUDIENCE: "api://phyto-test",
  PHYTO_OIDC_JWKS_URI: "https://issuer.example.test/.well-known/jwks.json",
};

describe("loadRuntimeConfig", () => {
  it("defaults local execution to development memory mode with authentication disabled", () => {
    expect(loadRuntimeConfig(env({}))).toEqual({
      runtimeMode: "development",
      storageMode: "memory",
      databaseConfigured: false,
      authMode: "disabled",
      oidc: null,
      port: 3000,
    });
  });

  it("allows deterministic memory storage and disabled authentication in test mode", () => {
    const config = loadRuntimeConfig(env({ NODE_ENV: "test" }));
    expect(config.storageMode).toBe("memory");
    expect(config.authMode).toBe("disabled");
  });

  it("selects database and OIDC modes for a fully configured production runtime", () => {
    const config = loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "production",
      DATABASE_URL: "postgresql://user:secret@example.invalid/phyto",
      PORT: "8080",
      ...OIDC,
    }));

    expect(config).toEqual({
      runtimeMode: "production",
      storageMode: "database",
      databaseConfigured: true,
      authMode: "oidc",
      oidc: {
        issuer: "https://issuer.example.test/",
        audience: "api://phyto-test",
        jwksUri: "https://issuer.example.test/.well-known/jwks.json",
        algorithms: ["RS256"],
      },
      port: 8080,
    });
  });

  it("preserves the exact configured issuer string for JWT iss matching", () => {
    const config = loadRuntimeConfig(env({
      NODE_ENV: "test",
      ...OIDC,
      PHYTO_OIDC_ISSUER: "https://issuer.example.test",
    }));

    expect(config.oidc?.issuer).toBe("https://issuer.example.test");
  });

  it.each(["development", "test", "staging"])(
    "rejects PHYTO_RUNTIME_MODE=%s when NODE_ENV is production",
    (runtimeMode) => {
      expect(() => loadRuntimeConfig(env({
        NODE_ENV: "production",
        PHYTO_RUNTIME_MODE: runtimeMode,
        DATABASE_URL: "postgresql://configured",
        PHYTO_AUTH_MODE: "disabled",
      }))).toThrow(/cannot be downgraded/);
    }
  );

  it.each(["staging", "production"])(
    "fails closed when %s has no database configuration",
    (runtimeMode) => {
      expect(() => loadRuntimeConfig(env({
        PHYTO_RUNTIME_MODE: runtimeMode,
        ...OIDC,
      }))).toThrow(RuntimeConfigurationError);
    }
  );

  it.each(["staging", "production"])(
    "fails closed when %s has no trusted identity configuration",
    (runtimeMode) => {
      expect(() => loadRuntimeConfig(env({
        PHYTO_RUNTIME_MODE: runtimeMode,
        DATABASE_URL: "postgresql://configured",
      }))).toThrow(/PHYTO_OIDC_ISSUER/);
    }
  );

  it("rejects explicit disabled authentication in production", () => {
    expect(() => loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "production",
      DATABASE_URL: "postgresql://configured",
      PHYTO_AUTH_MODE: "disabled",
    }))).toThrow(/requires OIDC authentication/);
  });

  it("rejects explicit memory mode in production even when a database URL exists", () => {
    expect(() => loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "production",
      PHYTO_STORAGE_MODE: "memory",
      DATABASE_URL: "postgresql://configured-but-not-selected",
      ...OIDC,
    }))).toThrow(/cannot use in-memory storage/);
  });

  it("rejects database mode without DATABASE_URL", () => {
    expect(() => loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "development",
      PHYTO_STORAGE_MODE: "database",
    }))).toThrow(/requires DATABASE_URL/);
  });

  it.each(["70000", "3000junk", "3.5", " 3000", "0", "-1"])(
    "rejects invalid PORT value %s",
    (port) => {
      expect(() => loadRuntimeConfig(env({ PORT: port }))).toThrow(/PORT/);
    }
  );

  it("rejects unknown runtime, storage, and authentication modes", () => {
    expect(() => loadRuntimeConfig(env({ PHYTO_RUNTIME_MODE: "prod" })))
      .toThrow(/Unsupported runtime mode/);
    expect(() => loadRuntimeConfig(env({ PHYTO_STORAGE_MODE: "seed" })))
      .toThrow(/Unsupported storage mode/);
    expect(() => loadRuntimeConfig(env({ PHYTO_AUTH_MODE: "jwt-ish" })))
      .toThrow(/Unsupported authentication mode/);
  });

  it("rejects non-HTTPS or credential-bearing OIDC URLs", () => {
    expect(() => loadRuntimeConfig(env({
      NODE_ENV: "test",
      ...OIDC,
      PHYTO_OIDC_JWKS_URI: "http://issuer.example.test/jwks",
    }))).toThrow(/HTTPS/);
    expect(() => loadRuntimeConfig(env({
      NODE_ENV: "test",
      ...OIDC,
      PHYTO_OIDC_JWKS_URI: "https://user:secret@issuer.example.test/jwks",
    }))).toThrow(/without credentials/);
  });

  it("safe diagnostics omit database and identity-provider values", () => {
    const secretUrl = "postgresql://user:secret@example.invalid/phyto";
    const diagnostics = safeRuntimeDiagnostics(loadRuntimeConfig(env({
      PHYTO_RUNTIME_MODE: "staging",
      DATABASE_URL: secretUrl,
      ...OIDC,
    })));

    const serialized = JSON.stringify(diagnostics);
    expect(serialized).not.toContain(secretUrl);
    expect(serialized).not.toContain(OIDC.PHYTO_OIDC_ISSUER);
    expect(serialized).not.toContain(OIDC.PHYTO_OIDC_AUDIENCE);
    expect(serialized).not.toContain(OIDC.PHYTO_OIDC_JWKS_URI);
    expect(diagnostics).toEqual({
      runtimeMode: "staging",
      storageMode: "database",
      databaseConfigured: true,
      authMode: "oidc",
      identityConfigured: true,
      port: 3000,
    });
  });
});
