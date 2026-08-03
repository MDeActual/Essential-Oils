# API Identity Threat Model

## Scope

This model covers bearer-token verification, principal construction, permission checks, and tenant-context enforcement for the read-only protocol and analytics API. It does not claim that a production identity tenant or deployment exists.

## Trust boundaries

1. **Untrusted client → Express API**: request headers, bearer token, path, and tenant selector are attacker-controlled.
2. **API → configured identity provider**: issuer, audience, and JWKS URI come only from loader-validated static configuration.
3. **JWKS response → verifier cache**: remote keys are accepted only from the configured HTTPS endpoint under bounded size, timeout, redirect, key-count, and key-shape rules.
4. **Verified token → principal**: claims become trusted only after signature, issuer, audience, and lifetime validation.
5. **Principal → authorization policy**: endpoint permissions and tenant equality are checked independently of token parsing.
6. **Authorization context → data access**: current endpoints expose product-level read data. Future tenant-owned persistence queries must consume the verified tenant context rather than client input.

## Threats and controls

| Threat | Control |
|---|---|
| Unsigned or algorithm-confusion token | Only RS256 is accepted; `alg=none` and all other algorithms fail closed. |
| Attacker-selected key endpoint | Token `jku`, `x5u`, embedded `jwk`, and critical extensions are rejected. JWKS URI is static configuration. |
| Forged signature | Signature verified with an imported RSA public key selected by trusted `kid`. |
| Wrong issuer or confused deputy | Exact configured issuer and audience checks are mandatory. |
| Expired or premature token | Required `exp`; validated `nbf` and `iat`; bounded clock tolerance. |
| Missing principal identity | Non-empty `sub` and tenant claim are mandatory. |
| Scope escalation | Permissions come only from verified `scp` and `roles`; each endpoint requires an explicit permission. |
| Cross-tenant request | `X-Phyto-Tenant-ID` must exactly equal the verified tenant claim. |
| Error-oracle leakage | Authentication and authorization responses are generic; tokens, claims, and provider errors are not returned. |
| Key-set denial of service | Token/JWKS size caps, five-second timeout, redirect rejection, maximum key count, and cache TTL. |
| Duplicate or malformed JWKS keys | Duplicate `kid`, non-RSA, non-signing, and non-RS256 keys are rejected. |
| Test verifier used in production | Custom verifier injection is accepted only in `test` runtime. |
| Authentication disabled in staging/production | Runtime loading fails before server binding. |
| Credential leakage in logs | Startup diagnostics report only booleans/modes; bearer tokens and provider values are not logged. |
| Tenant header trusted directly | Header is only a selector and must match the cryptographically verified tenant claim. |

## Residual risks

- Remote JWKS availability can temporarily prevent authentication; this is fail-closed by design.
- The current in-process key cache is not shared across instances.
- Token revocation before expiry is not implemented; short token lifetimes and provider controls are required in deployment architecture.
- Current product data is not yet physically partitioned by tenant. Future user-owned models must add tenant keys and repository-level filters.
- Authorization currently covers read permissions only. Write and administrative operations require separate policy design.
- Real Microsoft Entra configuration, managed identity, application registration, conditional access, and tenant provisioning remain outside this unit.
