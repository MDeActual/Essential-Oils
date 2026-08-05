# API Identity Threat Model

## Scope

This model covers bearer-token verification, principal construction, permission checks, tenant-context enforcement, and tenant-scoped access to protocol, contributor, challenge, and outcome-log persistence. It does not claim that a production identity tenant or deployment exists.

## Trust boundaries

1. **Untrusted client → Express API**: request headers, bearer token, path, and tenant selector are attacker-controlled.
2. **API → configured identity provider**: issuer, audience, and JWKS URI come only from loader-validated static configuration.
3. **JWKS response → verifier cache**: remote keys are accepted only from the configured HTTPS endpoint under streaming size, timeout, redirect, key-count, key-shape, cache, and refresh-throttling rules.
4. **Verified token → principal**: claims become trusted only after signature, issuer, audience, and lifetime validation.
5. **Principal → authorization policy**: endpoint permissions and tenant equality are checked independently of token parsing.
6. **Authorization context → data access**: the validated tenant is passed into a tenant-bound repository instance. User-owned queries and relations include the tenant key.
7. **Development/test fixtures → API**: deterministic seed data belongs only to `tenant-local`; other tenants receive no local fixture data.

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
| Cross-tenant request selector | `X-Phyto-Tenant-ID` must exactly equal the verified tenant claim. |
| Cross-tenant database read/write | Repositories are tenant-bound; every user-owned query includes `tenant_id`; composite foreign keys prevent cross-tenant child relations. |
| Cross-tenant memory-fixture access | Deterministic stores return data only for `tenant-local`. |
| Shared repository instance leaks tenant context | Database services and repositories are created per request from the verified tenant; no cross-request tenant singleton is retained. |
| Error-oracle leakage | Authentication and authorization responses are generic; tokens, claims, and provider errors are not returned. |
| Key-set denial of service | Token cap, streaming JWKS cap, five-second timeout, redirect rejection, maximum key count, cache TTL, and global unknown-key refresh cooldown. |
| Duplicate or malformed JWKS keys | Duplicate `kid`, non-RSA, non-signing, and non-RS256 keys are rejected. |
| Test verifier used in production | Custom verifier injection is accepted only in `test` runtime. |
| Authentication disabled in staging/production | Runtime loading fails before server binding. |
| Credential leakage in logs | Startup diagnostics report only booleans/modes; bearer tokens and provider values are not logged. |
| Tenant header trusted directly | Header is only a selector and must match the cryptographically verified tenant claim. |

## Residual risks

- Remote JWKS availability can temporarily prevent authentication; this is fail-closed by design.
- The current in-process key cache is not shared across instances.
- Token revocation before expiry is not implemented; short token lifetimes and provider controls are required in deployment architecture.
- PostgreSQL row-level security is not yet enabled; tenant isolation currently depends on application repository construction, query filters, schema keys, and relational constraints.
- The global Blend catalog is intentionally shared. Any future tenant-owned blend/customization model requires a separate tenant-keyed table rather than changing the global catalog implicitly.
- Authorization currently covers read permissions only. Write and administrative operations require separate policy design.
- Real Microsoft Entra configuration, managed identity, application registration, conditional access, and tenant provisioning remain outside this unit.
