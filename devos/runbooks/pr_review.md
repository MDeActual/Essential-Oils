# RUNBOOK: PR Review

**DevOS Runbook** | Trigger: Before merging any significant pull request
**Priority**: P1 — run for all PRs touching `src/`, `docs/`, `prisma/`, or governance files

---

## Objective

Verify that a pull request does not break the build, tests, architectural contracts, data integrity rules, or moat boundaries before it is merged.

---

## Steps

### 1. Pre-Merge Checks (Automated)

Confirm all CI checks pass:

- [ ] `npm ci` — clean dependency install
- [ ] `npm run build` — TypeScript compiles with no errors
- [ ] `npm test` — all tests pass, no regressions
- [ ] `npx prisma validate` — schema valid (if schema was modified)

### 2. Architecture Lock Check

- [ ] Read `docs/ARCHITECTURE_LOCK.md`.
- [ ] Confirm the PR does not override any locked decision.
- [ ] If it does, an ADR entry and explicit human approval are required before merge.

### 3. Moat Boundary Check

- [ ] Read `docs/MOAT_MODEL.md`.
- [ ] Confirm no moat-protected logic (synergy scoring, protocol generation, challenge engine rules, analytics signal model, oil ontology graph) is exposed through any new or modified API endpoint or public interface.
- [ ] Check new/modified route handlers and response types.

### 4. Analytics Integrity Check (if analytics code changed)

- [ ] Confirm only `real_contributor` records are used in analytics queries.
- [ ] Confirm adherence < 50% records are excluded from scoring.
- [ ] Confirm simulation data is tagged `isolation_flag: true` and isolated from production analytics.
- [ ] Confirm `dataOrigin` and `exclusionStatus` are present on all analytics-eligible records.

### 5. Domain Model Check (if domain entities changed)

- [ ] Confirm no core domain entity has been renamed or removed without an ADR entry (LOCK-001).
- [ ] Confirm any new entities extend existing domain models rather than introducing new top-level entities without approval.

### 6. API Response Shape Check (if API changed)

- [ ] Confirm existing API response shapes are preserved (no breaking changes without ADR).
- [ ] Confirm no new endpoints expose moat-protected fields.
- [ ] Confirm error response shapes match the canonical `ApiErrorResponse` type.

### 7. Secrets Check

- [ ] Scan changed files for committed secrets (API keys, tokens, credentials, real DATABASE_URL values).
- [ ] Confirm `.env` is git-ignored and not committed.
- [ ] Confirm `.env.example` contains only placeholder values.

### 8. Governance Doc Update Check

If the PR adds new files to `src/` or `docs/`:

- [ ] Confirm `docs/ARCHITECTURE_INDEX.md` has been updated to list new files.
- [ ] If architectural decisions were made, confirm `docs/ARCHITECTURE_DECISION_LOG.md` has a new ADR entry.
- [ ] Confirm `.claude/current_phase.md` deliverable statuses are updated.

### 9. Final Verdict

| Check | Result |
|-------|--------|
| CI passes | ✅ / ❌ |
| Architecture lock respected | ✅ / ❌ |
| Moat boundaries intact | ✅ / ❌ |
| Analytics integrity preserved | ✅ / N/A |
| Domain model intact | ✅ / N/A |
| API shapes preserved | ✅ / N/A |
| No secrets committed | ✅ / ❌ |
| Governance docs updated | ✅ / N/A |

---

## Merge Decision Rules

```
IF all applicable checks = ✅
THEN: APPROVED FOR MERGE

ELSE IF any check = ❌
THEN: BLOCKED — resolve failures before merge
```

---

## Output

Post review verdict to the PR as a comment. Reference the specific checks that passed or failed. If blocked, list the exact files and lines that need to be fixed.
