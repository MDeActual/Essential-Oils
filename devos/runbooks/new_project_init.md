# RUNBOOK: New Project Bootstrap

**DevOS Runbook** | Trigger: Starting a new project from scratch
**Priority**: P0 — run before any code is written

---

## Objective

Bootstrap a new software project with the full DevOS governance layer, ensuring every project starts with consistent architecture control, agent authority rules, and phase tracking from day one.

---

## Steps

### 1. Repository Setup

- [ ] Create the new GitHub repository under the appropriate owner.
- [ ] Initialize with a README.
- [ ] Set up branch protection on `main` (require PR reviews, no direct push).
- [ ] Clone locally.

### 2. Copy DevOS Starter Kit

Copy the following files from the DevOS reference (this folder) into the new project root, then customize:

```
AGENTS.md                              ← define agent roles for this project's domain
CLAUDE.md                              ← set behavioral constraints for this project
docs/ARCHITECTURE_LOCK.md              ← start with empty lock, add decisions as made
docs/ARCHITECTURE_DECISION_LOG.md      ← start with Phase 0 entry
docs/ARCHITECTURE_INDEX.md             ← canonical file map (fill as modules are created)
docs/DOMAIN_MODEL.md                   ← define core domain entities for this project
docs/MOAT_MODEL.md                     ← define proprietary/competitive IP boundaries
.claude/current_phase.md               ← set Phase 0 as active
.claude/project_context.md             ← describe the platform, objectives, constraints
devos/README.md                        ← copy as-is
devos/prompts/SWARM_PROMPT_STAGED.md   ← copy as-is
devos/runbooks/                        ← copy all runbooks as-is
```

### 3. Customize Core Files

For each copied file, replace all Phyto.ai-specific content with content relevant to the new project:

- [ ] `AGENTS.md`: Update agent roles to match the new project's architecture.
- [ ] `CLAUDE.md`: Update behavioral constraints and reading order.
- [ ] `docs/DOMAIN_MODEL.md`: Define the new domain's core entities.
- [ ] `docs/MOAT_MODEL.md`: Identify proprietary components to protect.
- [ ] `.claude/project_context.md`: Describe the platform name, type, domain, and objectives.
- [ ] `.claude/current_phase.md`: Set Phase 0 as active with the correct start date.

### 4. Run Phase 0: Architecture Foundation

Phase 0 is complete when:

- [ ] All governance docs are present and customized (not copied verbatim).
- [ ] `docs/ARCHITECTURE_LOCK.md` contains at least the first architectural decisions.
- [ ] `docs/ARCHITECTURE_DECISION_LOG.md` has ADR-001 (Platform Architecture Foundation).
- [ ] `docs/ARCHITECTURE_INDEX.md` lists all current files.
- [ ] `docs/DOMAIN_MODEL.md` defines all core entities with relationships and cardinality.
- [ ] `docs/MOAT_MODEL.md` identifies all moat-protected components.
- [ ] Human project lead has reviewed and accepted Phase 0.

### 5. Commit Initial Governance Layer

- [ ] Commit message: `chore: Phase 0 — architecture foundation and DevOS governance layer (ADR-001)`
- [ ] Push and open PR for human review.
- [ ] Do not proceed to Phase 1 until Phase 0 PR is merged.

---

## Success Criteria

- All DevOS starter files are present and customized.
- No Phyto.ai-specific content remains in copied files.
- Phase 0 is marked active with correct start date.
- Human project lead has reviewed the governance layer.
- Repository is ready for Phase 1 (Core Domain Implementation).

---

## Output

Update `.claude/current_phase.md` to reflect Phase 0 complete and Phase 1 active.
Add ADR-001 to `docs/ARCHITECTURE_DECISION_LOG.md`.
