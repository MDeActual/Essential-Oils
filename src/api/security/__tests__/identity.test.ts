import {
  KeyObject,
  generateKeyPairSync,
  sign as signBytes,
} from "node:crypto";
import type { OidcRuntimeConfig } from "../../runtime";
import {
  JwksProvider,
  Rs256OidcTokenVerifier,
} from "../identity";

const NOW_MS = Date.parse("2026-08-03T07:00:00.000Z");
const NOW_SECONDS = Math.floor(NOW_MS / 1000);
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const attacker = generateKeyPairSync("rsa", { modulusLength: 2048 });

const config: Readonly<OidcRuntimeConfig> = Object.freeze({
  issuer: "https://issuer.example.test/",
  audience: "api://phyto-test",
  jwksUri: "https://issuer.example.test/.well-known/jwks.json",
  algorithms: Object.freeze(["RS256"] as const),
});

class StaticProvider implements JwksProvider {
  constructor(private readonly key: KeyObject) {}
  async getSigningKey(kid: string): Promise<KeyObject> {
    if (kid !== "test-key") throw new Error("unknown key");
    return this.key;
  }
}

function segment(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function token(
  payloadOverrides: Record<string, unknown> = {},
  headerOverrides: Record<string, unknown> = {},
  signer: KeyObject = privateKey
): string {
  const header = segment({
    alg: "RS256",
    kid: "test-key",
    typ: "JWT",
    ...headerOverrides,
  });
  const payload = segment({
    iss: config.issuer,
    aud: config.audience,
    sub: "user-123",
    tid: "tenant-a",
    scp: "protocols.read analytics.read",
    roles: ["researcher"],
    iat: NOW_SECONDS - 30,
    nbf: NOW_SECONDS - 30,
    exp: NOW_SECONDS + 300,
    ...payloadOverrides,
  });
  const signature = signBytes(
    "RSA-SHA256",
    Buffer.from(`${header}.${payload}`, "ascii"),
    signer
  ).toString("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifier(): Rs256OidcTokenVerifier {
  return new Rs256OidcTokenVerifier(
    config,
    new StaticProvider(publicKey),
    () => NOW_MS,
    0
  );
}

describe("Rs256OidcTokenVerifier", () => {
  it("constructs a typed principal only after complete verification", async () => {
    await expect(verifier().verify(token())).resolves.toEqual({
      subject: "user-123",
      tenantId: "tenant-a",
      permissions: ["analytics.read", "protocols.read", "researcher"],
      issuer: config.issuer,
      audience: config.audience,
      tokenExpiresAt: new Date((NOW_SECONDS + 300) * 1000).toISOString(),
    });
  });

  it("rejects malformed tokens and unsupported algorithms", async () => {
    await expect(verifier().verify("not-a-jwt")).rejects.toMatchObject({
      code: "malformed_token",
    });
    await expect(verifier().verify(token({}, { alg: "none" }))).rejects.toMatchObject({
      code: "unsupported_algorithm",
    });
  });

  it("rejects token-controlled signing key references", async () => {
    await expect(verifier().verify(token({}, {
      jku: "https://attacker.example.test/jwks",
    }))).rejects.toMatchObject({ code: "untrusted_key_reference" });
    await expect(verifier().verify(token({}, {
      jwk: { kty: "RSA", n: "attacker", e: "AQAB" },
    }))).rejects.toMatchObject({ code: "untrusted_key_reference" });
  });

  it("rejects an invalid signature", async () => {
    await expect(verifier().verify(token({}, {}, attacker.privateKey))).rejects.toMatchObject({
      code: "invalid_signature",
    });
  });

  it("rejects wrong issuer and audience", async () => {
    await expect(verifier().verify(token({
      iss: "https://other.example.test/",
    }))).rejects.toMatchObject({ code: "invalid_issuer" });
    await expect(verifier().verify(token({
      aud: "api://other",
    }))).rejects.toMatchObject({ code: "invalid_audience" });
  });

  it("rejects expired, not-yet-active, and future-issued tokens", async () => {
    await expect(verifier().verify(token({
      exp: NOW_SECONDS,
    }))).rejects.toMatchObject({ code: "expired_token" });
    await expect(verifier().verify(token({
      nbf: NOW_SECONDS + 1,
    }))).rejects.toMatchObject({ code: "token_not_active" });
    await expect(verifier().verify(token({
      iat: NOW_SECONDS + 1,
    }))).rejects.toMatchObject({ code: "invalid_claim" });
  });

  it("requires subject and tenant claims", async () => {
    await expect(verifier().verify(token({ sub: "" }))).rejects.toMatchObject({
      code: "invalid_claim",
    });
    await expect(verifier().verify(token({ tid: undefined }))).rejects.toMatchObject({
      code: "invalid_claim",
    });
  });

  it("rejects malformed permission claims", async () => {
    await expect(verifier().verify(token({ scp: ["protocols.read"] }))).rejects.toMatchObject({
      code: "invalid_claim",
    });
    await expect(verifier().verify(token({ roles: ["researcher", 42] }))).rejects.toMatchObject({
      code: "invalid_claim",
    });
  });
});
