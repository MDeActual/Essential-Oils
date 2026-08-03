# ADR-017: API Identity, Authorization, and Tenant Boundary

**Status**: ACCEPTED  
**Date**: 2026-08-03  
**Deciders**: DevOS Orchestrator under founder-authorized autonomous engineering execution

## Context

The read-only API has verified data-integrity, persistence, and fail-closed runtime controls, but it previously accepted protocol and analytics requests without an authenticated principal, permission check, or explicit tenant boundary. Network location and deployment configuration cannot substitute for application identity and resource authorization.

No production identity tenant, application registration, credential, or cloud resource currently exists. The application and persistence boundaries must therefore be implemented and tested independently before provider provisioning.

## Decision

1. Staging and production require `PHYTO_AUTH_MODE=oidc` and static trusted issuer, audience, and HTTPS JWKS configuration.
2. The application supports only pinned RS256 access tokens in this initial boundary.
3. The JWKS URI is configuration authority. Token-controlled `jku`, `x5u`, embedded `jwk`, and critical-header extensions are rejected.
4. JWT signature, issuer, audience, expiration, not-before, issued-at, subject, and tenant claims are validated before constructing a principal.
5. Permissions are derived only from verified `scp` and `roles` claims.
6. Protocol endpoints require `protocols.read`; analytics endpoints require `analytics.read`.
7. Protected requests require `X-Phyto-Tenant-ID`, which must exactly match the verified token tenant claim.
8. The validated tenant is propagated into the data-access layer. Protocol, contributor, challenge, and outcome-log rows carry `tenant_id`; repositories are tenant-bound at construction; user-owned relations use tenant-matched composite foreign keys.
9. Deterministic memory data belongs only to the explicit `tenant-local` development/test tenant. Other authenticated tenants cannot read those fixtures.
10. Liveness and readiness remain public and expose no protected product data.
11. Authentication failures return generic 401 responses; authorization and tenant mismatches return generic 403 responses.
12. Custom token verifiers may be injected only in test runtime. Staging and production always build the verifier from loader-produced static configuration.
13. Development and test may explicitly disable authentication. Staging and production fail before binding if authentication is disabled or incomplete.

## Security properties

- deny by default;
- no unsigned or symmetric JWT acceptance;
- no token-directed key retrieval;
- bounded JWT and streaming-bounded JWKS sizes;
- HTTPS-only JWKS endpoint without URL credentials or fragments;
- redirect rejection and request timeout for remote JWKS;
- bounded key count, duplicate-key rejection, cache TTL, and unknown-key refresh throttling;
- exact issuer, audience, permission, and tenant matching;
- tenant-bound repository instances created per request;
- tenant-matched relational constraints in PostgreSQL;
- no credential or token logging.

## Consequences

- Existing development and test workflows can continue in explicitly disabled-auth mode under `tenant-local`.
- External staging remains blocked until a real provider is separately approved and configured.
- User-owned persistence reads and writes are tenant-scoped. The global Blend catalog remains intentionally unscoped because it is curated product catalog data rather than tenant-owned data.
- New user-owned models must include tenant keys and tenant-matched repository filters before API exposure.
- Production identity-provider choice and provisioning remain separate approval boundaries.
