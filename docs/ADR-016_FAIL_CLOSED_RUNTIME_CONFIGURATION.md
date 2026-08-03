# ADR-016: Fail-Closed Runtime and Storage Configuration

**Status**: ACCEPTED  
**Date**: 2026-08-03  
**Deciders**: DevOS Orchestrator under founder-authorized autonomous engineering execution

## Context

The API selected PostgreSQL or deterministic in-memory seed stores by checking whether `DATABASE_URL` happened to be present during controller module initialization. That implicit fallback was useful for local tests but unsafe for staging and production because an absent or malformed deployment configuration could silently serve seed data while liveness remained green.

A separate top-level source module is not required. Runtime configuration belongs inside the existing `src/api/` application-boundary module because it governs server construction, route storage selection, and health/readiness behavior.

## Decision

1. Introduce an explicit runtime contract in `src/api/runtime.ts`.
2. Supported runtime modes are `development`, `test`, `staging`, and `production`.
3. Supported storage modes are `memory` and `database`.
4. Development and test may use deterministic memory storage.
5. Staging and production must use database storage and require a non-empty `DATABASE_URL`.
6. Unknown, contradictory, forged, or partially parsed configuration fails before route registration or port binding.
7. `createApp()` independently revalidates supplied runtime objects; callers cannot bypass the contract with a hand-built object.
8. `/health` reports process liveness and non-secret mode metadata.
9. `/health/ready` verifies the selected storage backend and returns a generic 503 on failure.
10. Startup and readiness diagnostics must never emit database credentials.

## Consequences

- Misconfigured staging or production processes fail closed instead of serving seed data.
- Existing development and test workflows retain deterministic in-memory operation.
- Database readiness is distinct from process liveness.
- Alternate entry points must use the same validated application factory.
- A real staging or production deployment still requires separately approved infrastructure and credentials.
