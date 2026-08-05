import request from "supertest";
import { LOCAL_DEVELOPMENT_TENANT_ID } from "../../db/tenant";
import { createApp } from "../server";
import { loadRuntimeConfig } from "../runtime";
import type { AuthenticatedPrincipal, TokenVerifier } from "../security/identity";

const TOKENS = {
  protocols: "aaa.bbb.ccc",
  analytics: "ddd.eee.fff",
  insufficient: "ggg.hhh.iii",
  invalid: "jjj.kkk.lll",
  otherTenant: "mmm.nnn.ooo",
};

function principal(
  permissions: string[],
  tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID
): Readonly<AuthenticatedPrincipal> {
  return Object.freeze({
    subject: "user-123",
    tenantId,
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
    if (token === TOKENS.otherTenant) return principal(["protocols.read", "analytics.read"], "tenant-other");
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

function bearer(token: string, tenantId = LOCAL_DEVELOPMENT_TENANT_ID): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
    "x-phyto-tenant-id": tenantId,
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
      .set("x-phyto-tenant-id", LOCAL_DEVELOPMENT_TENANT_ID)
      .expect(401);

    await request(app)
      .get("/protocols")
      .set(bearer(TOKENS.invalid))
      .expect(401);
  });

  it("accepts case-insensitive Bearer authentication scheme names", async () => {
    const response = await request(app)
      .get("/protocols")
      .set({
        authorization: `bearer ${TOKENS.protocols}`,
        "x-phyto-tenant-id": LOCAL_DEVELOPMENT_TENANT_ID,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it("allows protocol reads only with protocols.read and a matching tenant", async () => {
    const allowed = await request(app)
      .get("/protocols")
      .set(bearer(TOKENS.protocols))
      .expect(200);
    expect(allowed.body.success).toBe(true);
    expect(allowed.body.data).toHaveLength(2);

    await request(app)
      .get("/protocols")
      .set(bearer(TOKENS.insufficient))
      .expect(403);

    await request(app)
      .get("/protocols")
      .set(bearer(TOKENS.protocols, "tenant-other"))
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
    expect(allowed.body.data.totalEligibleRecords).toBe(3);
  });

  it("returns no local seed data to another authenticated tenant", async () => {
    const protocols = await request(app)
      .get("/protocols")
      .set(bearer(TOKENS.otherTenant, "tenant-other"))
      .expect(200);
    expect(protocols.body.data).toEqual([]);

    const analytics = await request(app)
      .get("/analytics/protocols")
      .set(bearer(TOKENS.otherTenant, "tenant-other"))
      .expect(200);
    expect(analytics.body.data.totalEligibleRecords).toBe(0);
    expect(analytics.body.data.segments).toEqual([]);
  });

  it("requires explicit tenant context", async () => {
    await request(app)
      .get("/protocols")
      .set("authorization", `Bearer ${TOKENS.protocols}`)
      .expect(403);
  });
});
