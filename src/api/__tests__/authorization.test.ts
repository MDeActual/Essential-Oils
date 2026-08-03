import request from "supertest";
import { createApp } from "../server";
import { loadRuntimeConfig } from "../runtime";
import type {
  AuthenticatedPrincipal,
  TokenVerifier,
} from "../security/identity";

const TOKENS = {
  protocols: "aaa.bbb.ccc",
  analytics: "ddd.eee.fff",
  insufficient: "ggg.hhh.iii",
  invalid: "jjj.kkk.lll",
};

function principal(permissions: string[]): Readonly<AuthenticatedPrincipal> {
  return Object.freeze({
    subject: "user-123",
    tenantId: "tenant-a",
    permissions: Object.freeze([...permissions]),
    issuer: "https://issuer.example.test/",
    audience: "api://phyto-test",
    tokenExpiresAt: "2026-08-03T08:00:00.000Z",
  });
}

class TestVerifier implements TokenVerifier {
  async verify(token: string): Promise<Readonly<AuthenticatedPrincipal>> {
    if (token === TOKENS.protocols) return principal(["protocols.read"]);
    if (token === TOKENS.analytics) return principal(["analytics.read"]);
    if (token === TOKENS.insufficient) return principal([]);
    throw new Error("invalid test token");
  }
}

const config = loadRuntimeConfig({
  NODE_ENV: "test",
  PHYTO_STORAGE_MODE: "memory",
  PHYTO_AUTH_MODE: "oidc",
  PHYTO_OIDC_ISSUER: "https://issuer.example.test/",
  PHYTO_OIDC_AUDIENCE: "api://phyto-test",
  PHYTO_OIDC_JWKS_URI: "https://issuer.example.test/.well-known/jwks.json",
});
const app = createApp(config, { tokenVerifier: new TestVerifier() });

function bearer(token: string): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
    "x-phyto-tenant-id": "tenant-a",
  };
}

describe("authenticated API boundary", () => {
  it("keeps liveness and readiness public and non-sensitive", async () => {
    await request(app).get("/health").expect(200);
    await request(app).get("/health/ready").expect(200);
  });

  it("rejects missing, malformed, and invalid bearer credentials", async () => {
    const missing = await request(app).get("/protocols").expect(401);
    expect(missing.headers["www-authenticate"]).toBe("Bearer");
    expect(missing.body.error.code).toBe("UNAUTHENTICATED");

    await request(app)
      .get("/protocols")
      .set("authorization", "Basic abc")
      .set("x-phyto-tenant-id", "tenant-a")
      .expect(401);

    await request(app)
      .get("/protocols")
      .set(bearer(TOKENS.invalid))
      .expect(401);
  });

  it("allows protocol reads only with protocols.read and a matching tenant", async () => {
    const allowed = await request(app)
      .get("/protocols")
      .set(bearer(TOKENS.protocols))
      .expect(200);
    expect(allowed.body.success).toBe(true);

    await request(app)
      .get("/protocols")
      .set(bearer(TOKENS.insufficient))
      .expect(403);

    await request(app)
      .get("/protocols")
      .set({
        authorization: `Bearer ${TOKENS.protocols}`,
        "x-phyto-tenant-id": "tenant-b",
      })
      .expect(403);
  });

  it("does not let protocol permission read analytics", async () => {
    await request(app)
      .get("/analytics/protocols")
      .set(bearer(TOKENS.protocols))
      .expect(403);

    const allowed = await request(app)
      .get("/analytics/protocols")
      .set(bearer(TOKENS.analytics))
      .expect(200);
    expect(allowed.body.success).toBe(true);
  });

  it("requires explicit tenant context", async () => {
    await request(app)
      .get("/protocols")
      .set("authorization", `Bearer ${TOKENS.protocols}`)
      .expect(403);
  });
});
