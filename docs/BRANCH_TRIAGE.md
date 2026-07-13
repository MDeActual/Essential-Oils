# BRANCH_TRIAGE.md — Remote Branch Status Matrix

**Generated**: 2026-07-13  
**Baseline**: `main` @ `423df11` (Phase 4 complete, POST_PR17_AUDIT pass)

---

## Summary

| Branch | Ahead | Behind | Open PR | Classification | Action |
|--------|------:|-------:|---------|----------------|--------|
| `main` | — | — | — | ✅ Baseline | Keep |
| `copilot/implement-analytics-intelligence-layer` | 2 | 21 | None | 🔶 Unmerged valuable work | Human review → merge or open PR |
| `copilot/devos-gap-analysis` | 2 | 2 | None | 🔶 Minor org work | Reconstruct as fresh PR from current `main` |
| `copilot/analyze-repo-and-suggest-next-move` | 1 | 1 | #21 open | ⚠️ No-op (Initial plan only) | Close PR, delete branch |
| `copilot/read-readme-file` | 1 | 1 | #22 open | ⚠️ No-op (triage only) | Close PR, delete branch |
| `copilot/suggest-next-mvp-deployment` | 2 | 1 | #23 open | ⚠️ Superseded (npm start landed in main via PR #20) | Close PR, delete branch |
| `copilot/fix-login-issues` | 1 | 1 | #24 open | ⚠️ No-op (triage only) | Close PR, delete branch |
| `codex/phase-4-wire-prisma-persistence` | 3 | 10 | #16 closed (unmerged) | 🗑️ Stale (superseded by PR #17) | Delete branch |
| `Auto-Swarm-Non-STOP` | 0 | 41 | None | 🗑️ Stale | Delete branch |
| `codex/analyze-test-coverage-and-add-tests` | 0 | 41 | None | 🗑️ Stale | Delete branch |
| `codex/load-swarm-boot-file` | 1 | 41 | None | 🗑️ Stale | Delete branch |
| `copilot/add-architecture-control-layer` | 1 | 41 | None | 🗑️ Stale (merged via PR #3) | Delete branch |
| `copilot/add-challenge-engine-foundation-slice` | 0 | 26 | None | 🗑️ Stale (merged via PR #9) | Delete branch |
| `copilot/create-readme-file-content` | 1 | 2 | None | 🗑️ Stale (merged via PR #19) | Delete branch |
| `copilot/initiate-phase-4-persistence-layer` | 0 | 15 | None | 🗑️ Stale (Phase 4 complete in main) | Delete branch |
| `copilot/mvp-production-deployment-plan` | 0 | 1 | None | 🗑️ Stale | Delete branch |
| `copilot/phase-1-core-domain-implementation` | 0 | 38 | None | 🗑️ Stale (merged via PR #5) | Delete branch |
| `copilot/phase-1-ontology-implementation` | 0 | 35 | None | 🗑️ Stale (merged via PR #6) | Delete branch |
| `copilot/phase-2-intelligence-layer-implementation` | 0 | 30 | None | 🗑️ Stale (merged via PR #8) | Delete branch |
| `copilot/plan-next-implementation-slices` | 0 | 31 | None | 🗑️ Stale | Delete branch |
| `copilot/repository-alignment-implementation` | 1 | 39 | None | 🗑️ Stale (work landed in main) | Delete branch |
| `copilot/review-codebase-progress` | 0 | 41 | None | 🗑️ Stale (same SHA as main) | Delete branch |
| `copilot/update-phase-one-status` | 0 | 32 | None | 🗑️ Stale | Delete branch |

---

## Branches Requiring Human Decision

### 🔶 `copilot/implement-analytics-intelligence-layer`

**What it adds** (not in `main`):
- `src/analytics/signals.ts` — structured observable signal extraction from eligible contributor records (adherence, protocol completion, oil usage frequency, challenge participation)
- `src/analytics/scoring.ts` — structural scoring (protocol effectiveness, blend synergy co-occurrence, contributor reliability)
- `src/analytics/aggregator.ts` — per-contributor and per-protocol aggregation + normalization utility
- `src/analytics/types.ts` — extended with new signal and score types
- `src/analytics/index.ts` — updated exports
- 3 new test files: `signals.test.ts`, `scoring.test.ts`, `aggregator.test.ts` (~69 tests)
- ADR-010 (analytics intelligence signal layer) added to decision log

**Governance check**: All files carry MOAT NOTICEs (M-001, M-003, M-004). No proprietary methodology is implemented — only structural observables. LOCK-003 filtering is applied throughout.

**Complication**: The branch is 21 commits behind `main`. `docs/ARCHITECTURE_DECISION_LOG.md` has an ADR-010 entry on both `main` (Protocol Cohort Segmentation) and this branch (Analytics Intelligence Signal Layer) — this numbering collision must be resolved before merging. Suggest renaming the signal layer to ADR-013.

**Recommended action**: Human project lead review → open a fresh PR rebased onto `main` with the numbering fix applied.

---

### 🔶 `copilot/devos-gap-analysis`

**What it adds** (not in original `main` at time of triage):
- `devos/README.md` — explains DevOS artifacts are cross-project templates, not runtime code
- Moves `SWARM_PROMPT_STAGED.md` → `devos/prompts/SWARM_PROMPT_STAGED.md`
- Moves `devos_execution_plan.md` → `devos/runbooks/devos_execution_plan.md`
- Updates `docs/ARCHITECTURE_INDEX.md` to reflect new paths

**Governance check**: No source code or test changes. Reorganizes DevOS cross-project artifacts that do not belong at the repo root.

**Complication**: The original branch became stale relative to current `main`, so the safe approach is a fresh reconstruction branch rather than a direct merge.

**Recommended action**: Reconstruct as a fresh governance PR from current `main`, update active references, and close/delete the stale `copilot/devos-gap-analysis` branch after the replacement lands.

---

## Open PRs to Close

The following PRs had open status but contained no actionable code changes. They were safe to close without data loss:

| PR | Branch | Reason |
|----|--------|--------|
| #24 | `copilot/fix-login-issues` | Issue was underspecified; no changes made; triage complete |
| #23 | `copilot/suggest-next-mvp-deployment` | Superseded — `npm start` and deploy guidance already landed via PR #20 |
| #22 | `copilot/read-readme-file` | Issue was malformed; no changes made; triage complete |
| #21 | `copilot/analyze-repo-and-suggest-next-move` | Recommendation delivered in PR body; no code changes |

---

## Governance Gaps Identified

These gaps should be resolved before starting Phase 5:

1. **Phase 4 human review** — `.claude/current_phase.md` exit criterion #8 (human project lead review) is still pending.
2. **Staging DB verification** — `POST_PR17_AUDIT.md` marks DB-backed mode as NOT TESTED. Must run `prisma migrate deploy` + seed + endpoint check against a live PostgreSQL instance before production launch.
3. **Analytics intelligence layer** — `signals.ts`, `scoring.ts`, `aggregator.ts` were built on a branch but never merged at time of triage. Replacement PR #27 later reconstructed and merged this work.
4. **Missing spec docs** — `docs/` still lacks `natural_remedy_ontology.md`, `challenge_engine_specification.md`, `protocol_evolution_system.md`, and the synthetic simulation specification, referenced by the orchestrator reading order.

---

## Branch Cleanup Instructions (for project lead)

**Close PRs** (GitHub UI → each PR → "Close pull request"):
- #21, #22, #23, #24

**Delete stale branches** (GitHub UI → Branches → Delete, or `git push origin --delete <branch>`):
All branches classified 🗑️ above.

**Do not delete** until replacement work lands:
- `copilot/devos-gap-analysis`
