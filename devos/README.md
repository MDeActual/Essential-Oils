# DevOS — The Company OS for Building Software

DevOS is a reusable, project-agnostic operating system for bootstrapping and governing software platforms using AI agents and structured swarm workflows.

It provides:
- **Governance templates** (AGENTS.md, CLAUDE.md, ARCHITECTURE_LOCK.md)
- **Runbooks** — executable checklists for recurring engineering events
- **Swarm prompts** — staged multi-agent orchestration sequences
- **Phase tracking conventions** — lightweight project state management

DevOS is designed to be copied into any project's `devos/` directory at project init, then customized for that project's domain.

---

## Contents

- `prompts/SWARM_PROMPT_STAGED.md` — staged swarm orchestration prompt template (7 stages with exit gates)
- `runbooks/devos_execution_plan.md` — production-readiness runbook (pre-launch audit checklist)
- `runbooks/new_project_init.md` — new project bootstrap runbook
- `runbooks/phase_transition.md` — phase close/open runbook
- `runbooks/pr_review.md` — pre-merge PR review runbook

These artifacts are not part of the Phyto.ai runtime application code in `src/`.

---

## Core Primitives

| Primitive | What It Is | File |
|-----------|-----------|------|
| Agent roles + authority matrix | Defines what each AI agent can and cannot do | `AGENTS.md` (project root) |
| Behavioral constraints | Guards locked decisions, moat boundaries, analytics integrity | `CLAUDE.md` (project root) |
| Architecture lock | Frozen decisions that must never be overridden autonomously | `docs/ARCHITECTURE_LOCK.md` |
| Architecture Decision Log | Append-only history of architectural choices | `docs/ARCHITECTURE_DECISION_LOG.md` |
| Architecture Index | Canonical file map for the project | `docs/ARCHITECTURE_INDEX.md` |
| Domain Model | Core entities, relationships, and cardinality rules | `docs/DOMAIN_MODEL.md` |
| Moat Model | Competitive IP boundaries — what must never be exposed externally | `docs/MOAT_MODEL.md` |
| Phase tracker | Active phase, deliverables, exit criteria | `.claude/current_phase.md` |
| Project context | Running state snapshot for agent grounding | `.claude/project_context.md` |
| Swarm prompt sequence | Staged multi-agent execution with exit gates | `devos/prompts/SWARM_PROMPT_STAGED.md` |

---

## How to Bootstrap a New Project with DevOS

1. Create the new project repo.
2. Copy the DevOS starter files (see below) into the project root.
3. Customize `AGENTS.md`, `CLAUDE.md`, `docs/DOMAIN_MODEL.md`, and `docs/MOAT_MODEL.md` for the new domain.
4. Run the `new_project_init.md` runbook as your first agent task.
5. Start Phase 0: Architecture Foundation.

### Starter File Set

```
AGENTS.md
CLAUDE.md
docs/ARCHITECTURE_LOCK.md
docs/ARCHITECTURE_DECISION_LOG.md
docs/ARCHITECTURE_INDEX.md
docs/DOMAIN_MODEL.md
docs/MOAT_MODEL.md
.claude/current_phase.md
.claude/project_context.md
devos/README.md
devos/prompts/SWARM_PROMPT_STAGED.md
devos/runbooks/devos_execution_plan.md
devos/runbooks/new_project_init.md
devos/runbooks/phase_transition.md
devos/runbooks/pr_review.md
```

---

## Standard Phase Sequence

| Phase | Name | Purpose |
|-------|------|---------|
| 0 | Architecture Foundation | Governance docs, domain model, moat model, architecture lock |
| 1 | Core Domain Implementation | Entity types, schemas, validation, core business logic |
| 2 | Intelligence Layer | Analytics, scoring, proprietary algorithms |
| 3 | External API Layer | HTTP interface, auth, response shapes |
| 4 | Persistence Layer | Database schema, repositories, migrations |
| 5+ | Feature Phases | Domain-specific modules (challenge engine, protocol evolution, etc.) |

Each phase must define deliverables and exit criteria. The human project lead must review and accept each phase before it closes.

---

## Data Integrity Rules (Universal)

These rules apply to all DevOS projects handling user or contributor data:

- Only `real_contributor` records are analytics-eligible.
- Records with adherence < 50% are excluded from scoring.
- Simulation data must be tagged `isolation_flag: true` and must never mix with production analytics.
- All analytics-eligible records must carry `data_origin` and `exclusion_status` fields.

---

## Swarm Execution Summary

`SWARM_PROMPT_STAGED.md` defines a 7-stage workflow: Pre-flight → Domain grounding → Task decomposition → Execution → Integration/validation → Commit/log → Termination. Each stage has an explicit exit criterion before the next stage begins.

---

## Roadmap: Extracting DevOS as a Standalone Repo

The `devos/` folder in Essential-Oils is the reference implementation of DevOS v1. To make it reusable across all company projects:

1. Create `MDeActual/DevOS` repo.
2. Copy `devos/`, genericized `AGENTS.md`, `CLAUDE.md`, governance doc templates, and `.claude/` templates into it (remove Phyto.ai-specific content).
3. Tag `v1.0.0`.
4. Future projects bootstrap by copying the starter kit from that repo.

