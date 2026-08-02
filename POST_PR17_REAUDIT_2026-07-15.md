# POST-PR17 Production Readiness Re-Audit — 2026-07-15

## Verdict

**Status: BLOCKED pending execution of the new automated PostgreSQL-backed audit workflow.**

This does **not** mean PR #17 is known to be broken. It means the remaining production-critical checks are not yet proven on the current repository state.

## Work Completed in This Re-Audit

- Recreated `devos_execution_plan.md` directly on `main`.
- Added `.github/workflows/post-pr17-audit.yml` directly on `main`.
- Configured the workflow for:
  - clean `npm ci`
  - TypeScript build
  - Jest tests
  - Prisma schema validation
  - no-DB API smoke tests
  - disposable PostgreSQL 16 service
  - Prisma migration status/deploy
  - Prisma seed
  - DB-backed API smoke tests
  - Gitleaks secret scan
- Created branch `audit/post-pr17-readiness`.
- Opened PR #30 to trigger the audit.

## Current Evidence

### Repository configuration

`package.json` currently defines:
- `generate`: `prisma generate`
- `build`: `tsc`
- `prebuild`: `prisma generate`
- `start`: `node dist/index.js`
- `dev`: `ts-node src/index.ts`
- `test`: `jest`
- `pretest`: `prisma generate`

`prisma.config.ts` reads `DATABASE_URL` and points to `prisma/schema.prisma` and `prisma/migrations`.

`src/index.ts` starts the API on `PORT` or port 3000 by default.

### Prior audit artifact found

An older `POST_PR17_AUDIT.md` already exists in the repository history/branch. It records:
- `npm ci`: PASS
- build: PASS
- tests: PASS (531 tests)
- Prisma validate: PASS
- no-DB behavior: PASS
- API endpoints covered by tests: PASS
- LOCK-003 analytics integrity: PASS

However, that older audit explicitly states that PostgreSQL-backed migration, seed, and DB-backed API behavior were **not tested**. Therefore its verdict of “LAUNCH READY (with staging DB verification pending)” is conditional and does not satisfy the stricter launch gate now defined in `devos_execution_plan.md`.

## New Automated Audit Status

PR #30 was opened for `audit/post-pr17-readiness`.

At the time of this report, GitHub exposes **no CI status checks** for the PR head commit through the connected API. Therefore the new workflow has not produced verifiable results yet.

## Check Matrix

| Check | Current status |
|---|---|
| Historical clean install | PASS (older audit) |
| Historical TypeScript build | PASS (older audit) |
| Historical Jest suite | PASS — 531 tests (older audit) |
| Historical Prisma validate | PASS (older audit) |
| No-DB API behavior | PASS (older audit) |
| Disposable PostgreSQL migration | UNVERIFIED |
| Disposable PostgreSQL seed | UNVERIFIED |
| DB-backed `/protocols` | UNVERIFIED |
| DB-backed `/analytics/protocols` | UNVERIFIED |
| Current secret scan | UNVERIFIED |
| Current full CI run | UNVERIFIED |

## Blockers

### P0

1. **Current automated audit has not returned CI status checks.**
   - Production migration, seed, DB-backed API behavior, and current secret scan remain unverified.
   - Confirm GitHub Actions is enabled and allow/dispatch `Post-PR17 Production Readiness Audit` for PR #30.

### P1

None confirmed until the PostgreSQL-backed workflow returns logs.

### P2

The workflow currently smoke-tests collection endpoints. After the seeded protocol IDs are confirmed at runtime, add explicit smoke tests for:
- `GET /protocols/:id`
- `GET /analytics/protocols/:id`

## Launch Decision

Under `devos_execution_plan.md`:

- build passes: historical PASS, current run UNVERIFIED
- tests pass: historical PASS, current run UNVERIFIED
- migration passes: UNVERIFIED
- seed passes: UNVERIFIED
- endpoints pass in DB-backed mode: UNVERIFIED

Therefore:

**Status = BLOCKED**

The next evidence required is the completed GitHub Actions run for PR #30. If all three workflow jobs pass, the project can advance to production deployment readiness.
