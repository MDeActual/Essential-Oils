# POST_PR17_AUDIT.md — Production Readiness Audit

**Repo**: MDeActual/Essential-Oils  
**Branch**: main  
**Audit Date**: 2026-06-27  
**Audit Triggered By**: `devos/runbooks/devos_execution_plan.md` (Priority: P0, Blocking Launch: YES)

---

## Summary

| Check | Result |
|-------|--------|
| `npm ci` | ✅ PASS |
| `npm run build` | ✅ PASS |
| `npm test` | ✅ PASS (531 tests) |
| `npx prisma validate` | ✅ PASS |
| `npx prisma migrate status` (no DB) | ⚠️ EXPECTED FAIL — no `DATABASE_URL` set in CI |
| App behavior without `DATABASE_URL` | ✅ PASS — falls back to in-memory stores |
| App behavior with `DATABASE_URL` | ℹ️ NOT TESTED — no disposable Postgres available in audit env |
| Prisma migration against Postgres | ℹ️ NOT TESTED — no disposable Postgres available |
| Seed script | ℹ️ NOT TESTED — requires live database |
| Endpoint: `GET /health` | ✅ PASS (covered by test suite) |
| Endpoint: `GET /protocols` | ✅ PASS (covered by test suite) |
| Endpoint: `GET /protocols/:id` | ✅ PASS (covered by test suite) |
| Endpoint: `GET /analytics/protocols` | ✅ PASS (covered by test suite) |
| Endpoint: `GET /analytics/protocols/:id` | ✅ PASS (covered by test suite) |
| TypeScript errors | ✅ NONE |
| Secrets in committed files | ✅ NONE (`.env` is git-ignored; `.env.example` contains no real values) |
| Analytics excludes non-real-contributor data | ✅ PASS (enforced by LOCK-003; validated in analytics test suite) |
| API response shapes match pre-PR17 behavior | ✅ PASS (all 26 API integration tests pass) |

---

## Commands Run

```bash
npm ci
npm run build       # includes prisma generate (prebuild hook)
npm test            # includes prisma generate (pretest hook)
npx prisma validate
npx prisma migrate status   # expected to fail without DATABASE_URL
```

---

## Test Results

```
Test Suites: 8 passed, 8 total
Tests:       531 passed, 531 total
Snapshots:   0 total
Time:        ~6.5 s
```

Breakdown by suite:

| Suite | Tests |
|-------|-------|
| `src/ontology/__tests__/ontology.test.ts` | 115 |
| `src/blend/__tests__/blend.test.ts` | 44 |
| `src/protocol/__tests__/protocol.test.ts` | 68 |
| `src/challenge/__tests__/challenge.test.ts` | (included in total) |
| `src/analytics/__tests__/analytics.test.ts` | (included in total) |
| `src/simulation/__tests__/simulation.test.ts` | 89 |
| `src/db/__tests__/repositories.test.ts` | (included in total) |
| `src/api/__tests__/api.test.ts` | 26 |

---

## Errors Found

### P0

None.

### P1

**Missing `npm start` / `npm run dev` scripts** (fixed in this PR)  
Previously the README acknowledged that no `npm start` script existed and provided a manual `ts-node -e` workaround. A proper `src/index.ts` entry point and `start`/`dev` scripts have now been added.

### P2

**Missing governance docs referenced by `ARCHITECTURE_INDEX.md`**  
The following files are referenced in `docs/ARCHITECTURE_INDEX.md` but were absent from the repository:
- `docs/swarm_rules.md`
- `docs/orchestrator_reading_order.md`

Stub versions have been created. They should be expanded with full content before swarm orchestration is used in production.

**`npx prisma migrate status` requires `DATABASE_URL`**  
This is expected behavior — migration status cannot be determined without a connected database. The migration SQL file (`prisma/migrations/20260502120000_init/migration.sql`) exists and covers all five models. Applying it against a real Postgres instance is a deploy-time step.

---

## Files Implicated

| File | Change |
|------|--------|
| `src/index.ts` | **Added** — server entry point (`createApp().listen()`) |
| `package.json` | **Modified** — added `start` and `dev` scripts |
| `docs/swarm_rules.md` | **Added** — governance stub |
| `docs/orchestrator_reading_order.md` | **Added** — governance stub |
| `docs/ARCHITECTURE_INDEX.md` | **Modified** — added `src/index.ts` entry |

---

## Recommended Fixes

All P0 and P1 items are resolved in this audit commit.

Full database verification remains **pending**. A human must provision or identify an approved staging PostgreSQL environment and configure its credentials through the deployment secret manager; do not commit credentials or paste them into logs. Then run:

```bash
# 1. Configure DATABASE_URL in the approved staging environment's secret manager

# 2. Apply migrations to the approved staging database
npx prisma migrate deploy

# 3. Build and validate the generated client
npm run build

# 4. Seed only the isolated local/test tenant unless production-like seed data is explicitly approved
npx prisma db seed

# 5. Start the server with staging runtime configuration and trusted OIDC settings
npm start
```

Verify liveness and readiness, then smoke-test protected protocol and analytics endpoints using a valid staging OIDC token with the required permission and matching tenant context (ADR-017). Anonymous calls to these endpoints should fail closed. Do not use the pre-ADR-017 unauthenticated `curl` examples as acceptance checks.

Required checks:
```bash
curl http://localhost:3000/health
# Check GET /health/ready and protected endpoints with the approved staging identity provider.
# Verify tenant isolation and that analytics include eligible real_contributor records only.
```

**Free PostgreSQL options:**
- [Supabase](https://supabase.com) — free tier, instant provisioning, connection string under Settings → Database
- [Neon](https://neon.tech) — serverless Postgres, free tier
- [Railway](https://railway.app) — free trial with Postgres plugin
- [Render](https://render.com) — free Postgres (expires after 90 days on free tier)

---

## Launch Readiness Verdict

**Status: NOT VERIFIED FOR LAUNCH — staging DB and authenticated endpoint verification are pending**

Local build, TypeScript, test, and schema checks are covered by automated validation. Database migration, seeding, readiness, OIDC-authenticated endpoint behavior, and tenant isolation have not been verified against staging. Production launch must remain blocked until an authorized human completes and records those checks.

Phase 4 has been reviewed and accepted by the human project lead (2026-08-14). Phase 5 is active.
