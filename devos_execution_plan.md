# TASK: Post-PR17 Production Readiness Audit

Repo: MDeActual/Essential-Oils
Branch: main

## Objective
Verify that PR #17 did not break build, tests, Prisma configuration, API response shapes, analytics integrity, or deployment readiness.

## Steps
1. Pull latest `main`.
2. Run `npm ci`.
3. Run `npm run build`.
4. Run `npm test -- --runInBand`.
5. Run `npx prisma validate`.
6. Run `npx prisma migrate status`.
7. Test app behavior without `DATABASE_URL`.
8. Test app behavior with `DATABASE_URL`.
9. Run Prisma migration against a disposable PostgreSQL database.
10. Run the seed script against the disposable database.
11. Verify endpoints:
   - `GET /health`
   - `GET /protocols`
   - `GET /protocols/:id`
   - `GET /analytics/protocols`
   - `GET /analytics/protocols/:id`
12. Verify analytics excludes non-real-contributor data.
13. Verify no production secrets are committed.

## Success Criteria
- No TypeScript errors.
- No failing tests.
- Prisma schema validates.
- Migration applies cleanly.
- Seed completes safely in the disposable environment.
- API response shapes match pre-PR17 behavior.
- Analytics excludes non-real-contributor data.
- No production secrets are committed.

## Output
Create `POST_PR17_AUDIT.md` containing:
- pass/fail summary
- commands run
- errors found
- exact files implicated
- recommended fixes
- launch readiness verdict

Priority: P0

Blocking Launch: YES

## Launch Decision Rules

IF:
- build passes
- tests pass
- migration passes
- seed passes
- endpoints pass

THEN:
- `Status = LAUNCH READY`

ELSE:
- `Status = BLOCKED`

## Blocker Priority
List blockers in priority order:
- P0
- P1
- P2
