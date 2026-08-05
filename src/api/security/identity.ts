import {
  KeyObject,
  createPublicKey,
  timingSafeEqual,
  verify as verifySignature,
} from "node:crypto";
import type { OidcRuntimeConfig } from "../runtime";

const MAX_TOKEN_BYTES = 16_384;
const MAX_JWKS_BYTES = 1_048_576;
const MAX_JWKS_KEYS = 32;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_UNKNOWN_KEY_REFRESH_INTERVAL_MS = 60 * 1000;
const DEFAULT_CLOCK_TOLERANCE_SECONDS = 60;

export type PrincipalPermission = "protocols.read" | "analytics.read" | string;

export interface AuthenticatedPrincipal {
  subject: string;
  tenantId: string;
  permissions: readonly PrincipalPermission[];
  issuer: string;
  audience: string;
  tokenExpiresAt: string;
}

export interface TokenVerifier {
  verify(token: string): Promise<Readonly<AuthenticatedPrincipal>>;
}

export class AuthenticationError extends Error {
  readonly code: string;

  constructor(code: string, message = "Authentication failed.") {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
  }
}

interface JwtHeader {
  alg?: unknown;
  kid?: unknown;
  typ?: unknown;
  crit?: unknown;
  jku?: unknown;
  x5u?: unknown;
  jwk?: unknown;
}

interface JwtPayload {
  iss?: unknown;
  aud?: unknown;
  sub?: unknown;
  exp?: unknown;
  nbf?: unknown;
  iat?: unknown;
  tid?: unknown;
  tenant_id?: unknown;
  scp?: unknown;
  roles?: unknown;
}

interface JwkRecord {
  kty?: unknown;
  kid?: unknown;
  use?: unknown;
  alg?: unknown;
  n?: unknown;
  e?: unknown;
}

interface RsaPublicJwk {
  kty: "RSA";
  n: string;
  e: string;
  use: "sig";
  alg: "RS256";
}

export interface JwksProvider {
  getSigningKey(kid: string): Promise<KeyObject>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function decodeJsonSegment<T>(segment: string, label: string): T {
  try {
    const decoded = Buffer.from(segment, "base64url").toString("utf8");
    const value: unknown = JSON.parse(decoded);
    if (!isObject(value)) throw new Error("not an object");
    return value as T;
  } catch {
    throw new AuthenticationError("malformed_token", `JWT ${label} is malformed.`);
  }
}

function exactString(value: unknown, claim: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AuthenticationError("invalid_claim", `JWT ${claim} claim is missing or invalid.`);
  }
  return value;
}

function numericDate(value: unknown, claim: string, required: boolean): number | null {
  if (value === undefined && !required) return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new AuthenticationError("invalid_claim", `JWT ${claim} claim is missing or invalid.`);
  }
  return value;
}

function audienceMatches(value: unknown, expected: string): boolean {
  if (typeof value === "string") {
    const left = Buffer.from(value);
    const right = Buffer.from(expected);
    return left.length === right.length && timingSafeEqual(left, right);
  }
  if (Array.isArray(value)) {
    return value.some((item) => typeof item === "string" && audienceMatches(item, expected));
  }
  return false;
}

function normalizedPermissions(payload: JwtPayload): readonly string[] {
  const permissions = new Set<string>();
  if (typeof payload.scp === "string") {
    for (const scope of payload.scp.split(/\s+/u)) {
      if (scope.length > 0) permissions.add(scope);
    }
  } else if (payload.scp !== undefined) {
    throw new AuthenticationError("invalid_claim", "JWT scp claim is invalid.");
  }

  if (payload.roles !== undefined) {
    if (!Array.isArray(payload.roles)
        || payload.roles.some((role) => typeof role !== "string" || role.length === 0)) {
      throw new AuthenticationError("invalid_claim", "JWT roles claim is invalid.");
    }
    for (const role of payload.roles as string[]) permissions.add(role);
  }

  return Object.freeze([...permissions].sort());
}

function validateHeader(header: JwtHeader): { algorithm: "RS256"; kid: string } {
  if (header.alg !== "RS256") {
    throw new AuthenticationError("unsupported_algorithm", "JWT algorithm is not allowed.");
  }
  const kid = exactString(header.kid, "kid");
  if (header.crit !== undefined
      || header.jku !== undefined
      || header.x5u !== undefined
      || header.jwk !== undefined) {
    throw new AuthenticationError(
      "untrusted_key_reference",
      "JWT contains an untrusted key-selection header."
    );
  }
  if (header.typ !== undefined && header.typ !== "JWT" && header.typ !== "at+jwt") {
    throw new AuthenticationError("invalid_header", "JWT typ header is invalid.");
  }
  return { algorithm: "RS256", kid };
}

function isRs256SigningCandidate(jwk: JwkRecord): boolean {
  if (jwk.kty !== "RSA") return false;
  if (jwk.use !== undefined && jwk.use !== "sig") return false;
  if (jwk.alg !== undefined && jwk.alg !== "RS256") return false;
  return true;
}

function rsaPublicKey(jwk: JwkRecord): KeyObject {
  if (jwk.kty !== "RSA"
      || typeof jwk.kid !== "string"
      || typeof jwk.n !== "string"
      || typeof jwk.e !== "string") {
    throw new AuthenticationError("invalid_jwks", "JWKS contains an invalid RSA key.");
  }
  if (jwk.use !== undefined && jwk.use !== "sig") {
    throw new AuthenticationError("invalid_jwks", "JWKS key is not designated for signatures.");
  }
  if (jwk.alg !== undefined && jwk.alg !== "RS256") {
    throw new AuthenticationError("invalid_jwks", "JWKS key algorithm is not allowed.");
  }
  try {
    const publicJwk: RsaPublicJwk = {
      kty: "RSA",
      n: jwk.n,
      e: jwk.e,
      use: "sig",
      alg: "RS256",
    };
    return createPublicKey({ key: publicJwk, format: "jwk" });
  } catch {
    throw new AuthenticationError("invalid_jwks", "JWKS public key could not be imported.");
  }
}

async function boundedResponseBody(
  response: Response,
  controller: AbortController
): Promise<string> {
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^[0-9]+$/u.test(contentLength)
        || Number(contentLength) > MAX_JWKS_BYTES) {
      controller.abort();
      throw new AuthenticationError("invalid_jwks", "JWKS response exceeds the allowed size.");
    }
  }
  if (!response.body) {
    throw new AuthenticationError("invalid_jwks", "JWKS response has no body.");
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_JWKS_BYTES) {
        controller.abort();
        throw new AuthenticationError("invalid_jwks", "JWKS response exceeds the allowed size.");
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, totalBytes).toString("utf8");
}

function copyAuthenticationError(error: AuthenticationError): AuthenticationError {
  return new AuthenticationError(error.code, error.message);
}

export class RemoteJwksProvider implements JwksProvider {
  private readonly keys = new Map<string, KeyObject>();
  private cacheExpiresAt = 0;
  private nextUnknownKeyRefreshAt = 0;
  private refreshRetryAt = 0;
  private lastRefreshFailure: AuthenticationError | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(
    private readonly jwksUri: string,
    private readonly cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    private readonly unknownKeyRefreshIntervalMs = DEFAULT_UNKNOWN_KEY_REFRESH_INTERVAL_MS,
    private readonly fetcher: typeof fetch = fetch,
    private readonly now: () => number = () => Date.now()
  ) {}

  private throwIfRefreshBackoffActive(at: number): void {
    if (at < this.refreshRetryAt && this.lastRefreshFailure) {
      throw copyAuthenticationError(this.lastRefreshFailure);
    }
  }

  private async refresh(): Promise<void> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);
      try {
        const response = await this.fetcher(this.jwksUri, {
          method: "GET",
          redirect: "error",
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          throw new AuthenticationError("jwks_unavailable", "Trusted JWKS endpoint is unavailable.");
        }
        const text = await boundedResponseBody(response, controller);
        let document: unknown;
        try {
          document = JSON.parse(text);
        } catch {
          throw new AuthenticationError("invalid_jwks", "JWKS response is not valid JSON.");
        }
        if (!isObject(document)
            || !Array.isArray(document.keys)
            || document.keys.length === 0
            || document.keys.length > MAX_JWKS_KEYS) {
          throw new AuthenticationError("invalid_jwks", "JWKS response is malformed.");
        }

        const refreshed = new Map<string, KeyObject>();
        for (const candidate of document.keys) {
          if (!isObject(candidate)) {
            throw new AuthenticationError("invalid_jwks", "JWKS contains a malformed key.");
          }
          const key = candidate as JwkRecord;
          if (!isRs256SigningCandidate(key)) continue;
          const kid = exactString(key.kid, "JWKS kid");
          if (refreshed.has(kid)) {
            throw new AuthenticationError("invalid_jwks", "JWKS contains duplicate RS256 signing key identifiers.");
          }
          refreshed.set(kid, rsaPublicKey(key));
        }
        if (refreshed.size === 0) {
          throw new AuthenticationError("invalid_jwks", "JWKS contains no compatible RS256 signing keys.");
        }

        this.keys.clear();
        for (const [kid, key] of refreshed) this.keys.set(kid, key);
        const refreshedAt = this.now();
        this.cacheExpiresAt = refreshedAt + this.cacheTtlMs;
        this.nextUnknownKeyRefreshAt = refreshedAt + this.unknownKeyRefreshIntervalMs;
        this.refreshRetryAt = 0;
        this.lastRefreshFailure = null;
      } catch (error) {
        const failure = error instanceof AuthenticationError
          ? error
          : new AuthenticationError("jwks_unavailable", "Trusted JWKS endpoint is unavailable.");
        this.lastRefreshFailure = failure;
        this.refreshRetryAt = this.now() + this.unknownKeyRefreshIntervalMs;
        throw failure;
      } finally {
        clearTimeout(timeout);
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  async getSigningKey(kid: string): Promise<KeyObject> {
    const lookupAt = this.now();
    if (lookupAt >= this.cacheExpiresAt) {
      this.throwIfRefreshBackoffActive(lookupAt);
      await this.refresh();
    }

    const cached = this.keys.get(kid);
    if (cached) return cached;

    const unknownLookupAt = this.now();
    if (unknownLookupAt < this.nextUnknownKeyRefreshAt) {
      throw new AuthenticationError("unknown_signing_key", "JWT signing key is not trusted.");
    }

    this.throwIfRefreshBackoffActive(unknownLookupAt);
    await this.refresh();
    const refreshed = this.keys.get(kid);
    if (!refreshed) {
      throw new AuthenticationError("unknown_signing_key", "JWT signing key is not trusted.");
    }
    return refreshed;
  }
}

export class Rs256OidcTokenVerifier implements TokenVerifier {
  constructor(
    private readonly config: Readonly<OidcRuntimeConfig>,
    private readonly jwks: JwksProvider = new RemoteJwksProvider(config.jwksUri),
    private readonly now: () => number = () => Date.now(),
    private readonly clockToleranceSeconds = DEFAULT_CLOCK_TOLERANCE_SECONDS
  ) {}

  async verify(token: string): Promise<Readonly<AuthenticatedPrincipal>> {
    if (typeof token !== "string"
        || token.length === 0
        || Buffer.byteLength(token, "utf8") > MAX_TOKEN_BYTES) {
      throw new AuthenticationError("malformed_token");
    }
    const segments = token.split(".");
    if (segments.length !== 3 || segments.some((segment) => segment.length === 0)) {
      throw new AuthenticationError("malformed_token");
    }

    const header = decodeJsonSegment<JwtHeader>(segments[0], "header");
    const payload = decodeJsonSegment<JwtPayload>(segments[1], "payload");
    const { kid } = validateHeader(header);
    const signature = Buffer.from(segments[2], "base64url");
    if (signature.length === 0) throw new AuthenticationError("malformed_token");

    const key = await this.jwks.getSigningKey(kid);
    const signingInput = Buffer.from(`${segments[0]}.${segments[1]}`, "ascii");
    if (!verifySignature("RSA-SHA256", signingInput, key, signature)) {
      throw new AuthenticationError("invalid_signature");
    }

    const issuer = exactString(payload.iss, "iss");
    if (issuer !== this.config.issuer) {
      throw new AuthenticationError("invalid_issuer");
    }
    if (!audienceMatches(payload.aud, this.config.audience)) {
      throw new AuthenticationError("invalid_audience");
    }

    const nowSeconds = Math.floor(this.now() / 1000);
    const expiresAt = numericDate(payload.exp, "exp", true)!;
    const notBefore = numericDate(payload.nbf, "nbf", false);
    const issuedAt = numericDate(payload.iat, "iat", false);
    if (expiresAt <= nowSeconds - this.clockToleranceSeconds) {
      throw new AuthenticationError("expired_token");
    }
    if (notBefore !== null && notBefore > nowSeconds + this.clockToleranceSeconds) {
      throw new AuthenticationError("token_not_active");
    }
    if (issuedAt !== null && issuedAt > nowSeconds + this.clockToleranceSeconds) {
      throw new AuthenticationError("invalid_claim", "JWT iat claim is in the future.");
    }

    const subject = exactString(payload.sub, "sub");
    const tenantId = exactString(payload.tid ?? payload.tenant_id, "tid");
    const principal: AuthenticatedPrincipal = {
      subject,
      tenantId,
      permissions: normalizedPermissions(payload),
      issuer,
      audience: this.config.audience,
      tokenExpiresAt: new Date(expiresAt * 1000).toISOString(),
    };
    Object.freeze(principal);
    return principal;
  }
}

export function createOidcTokenVerifier(
  config: Readonly<OidcRuntimeConfig>
): TokenVerifier {
  return new Rs256OidcTokenVerifier(config);
}
