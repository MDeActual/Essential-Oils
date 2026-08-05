import { generateKeyPairSync } from "node:crypto";
import {
  AuthenticationError,
  RemoteJwksProvider,
} from "../identity";

function fetcherReturning(responseFactory: () => Response): jest.MockedFunction<typeof fetch> {
  const implementation = async (
    ..._arguments: Parameters<typeof fetch>
  ): Promise<Response> => responseFactory();
  return jest.fn(implementation) as jest.MockedFunction<typeof fetch>;
}

function trustedJwks(): Record<string, unknown> {
  const { publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return {
    keys: [{
      ...publicKey.export({ format: "jwk" }),
      kid: "known-key",
      use: "sig",
      alg: "RS256",
    }],
  };
}

describe("RemoteJwksProvider", () => {
  it("classifies malformed JSON as invalid_jwks", async () => {
    const fetcher = fetcherReturning(() => new Response("{not-json", {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    const provider = new RemoteJwksProvider(
      "https://issuer.example.test/jwks",
      300_000,
      60_000,
      fetcher
    );

    await expect(provider.getSigningKey("unknown")).rejects.toMatchObject({
      code: "invalid_jwks",
    } satisfies Partial<AuthenticationError>);
  });

  it("rejects an oversized content-length before buffering", async () => {
    const fetcher = fetcherReturning(() => new Response("{}", {
      status: 200,
      headers: { "content-length": "1048577" },
    }));
    const provider = new RemoteJwksProvider(
      "https://issuer.example.test/jwks",
      300_000,
      60_000,
      fetcher
    );

    await expect(provider.getSigningKey("unknown")).rejects.toMatchObject({
      code: "invalid_jwks",
    } satisfies Partial<AuthenticationError>);
  });

  it("aborts a streamed response when the byte cap is crossed", async () => {
    const fetcher = fetcherReturning(() => new Response("x".repeat(1_048_577), {
      status: 200,
    }));
    const provider = new RemoteJwksProvider(
      "https://issuer.example.test/jwks",
      300_000,
      60_000,
      fetcher
    );

    await expect(provider.getSigningKey("unknown")).rejects.toMatchObject({
      code: "invalid_jwks",
    } satisfies Partial<AuthenticationError>);
  });

  it("rate-limits refreshes caused by unknown signing keys", async () => {
    let now = 10_000;
    const fetcher = fetcherReturning(() => new Response(JSON.stringify(trustedJwks()), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    const provider = new RemoteJwksProvider(
      "https://issuer.example.test/jwks",
      300_000,
      60_000,
      fetcher,
      () => now
    );

    await expect(provider.getSigningKey("unknown-a")).rejects.toMatchObject({
      code: "unknown_signing_key",
    } satisfies Partial<AuthenticationError>);
    await expect(provider.getSigningKey("unknown-b")).rejects.toMatchObject({
      code: "unknown_signing_key",
    } satisfies Partial<AuthenticationError>);
    expect(fetcher).toHaveBeenCalledTimes(1);

    now += 60_001;
    await expect(provider.getSigningKey("unknown-c")).rejects.toMatchObject({
      code: "unknown_signing_key",
    } satisfies Partial<AuthenticationError>);
    expect(fetcher).toHaveBeenCalledTimes(2);

    await expect(provider.getSigningKey("known-key")).resolves.toBeDefined();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("backs off after failed JWKS refreshes", async () => {
    let now = 20_000;
    const fetcher = fetcherReturning(() => new Response("unavailable", {
      status: 503,
    }));
    const provider = new RemoteJwksProvider(
      "https://issuer.example.test/jwks",
      300_000,
      60_000,
      fetcher,
      () => now
    );

    await expect(provider.getSigningKey("unknown-a")).rejects.toMatchObject({
      code: "jwks_unavailable",
    } satisfies Partial<AuthenticationError>);
    await expect(provider.getSigningKey("unknown-b")).rejects.toMatchObject({
      code: "jwks_unavailable",
    } satisfies Partial<AuthenticationError>);
    expect(fetcher).toHaveBeenCalledTimes(1);

    now += 60_001;
    await expect(provider.getSigningKey("unknown-c")).rejects.toMatchObject({
      code: "jwks_unavailable",
    } satisfies Partial<AuthenticationError>);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("ignores unrelated valid keys while retaining compatible RS256 signing keys", async () => {
    const rsa = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const ec = generateKeyPairSync("ec", { namedCurve: "P-256" });
    const encryptionKey = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const document = {
      keys: [
        {
          ...ec.publicKey.export({ format: "jwk" }),
          kid: "ec-signing-key",
          use: "sig",
          alg: "ES256",
        },
        {
          ...encryptionKey.publicKey.export({ format: "jwk" }),
          kid: "rsa-encryption-key",
          use: "enc",
          alg: "RSA-OAEP",
        },
        {
          ...rsa.publicKey.export({ format: "jwk" }),
          kid: "known-key",
          use: "sig",
          alg: "RS256",
        },
      ],
    };
    const fetcher = fetcherReturning(() => new Response(JSON.stringify(document), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    const provider = new RemoteJwksProvider(
      "https://issuer.example.test/jwks",
      300_000,
      60_000,
      fetcher
    );

    await expect(provider.getSigningKey("known-key")).resolves.toBeDefined();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
