# orchestrator_reading_order.md — Canonical Reading Order for Orchestrator Bootstrap

## Purpose

This document defines the mandatory reading order for the Swarm Orchestrator when bootstrapping a new swarm workflow. The reading order ensures the orchestrator has full architectural context before issuing task assignments or pre-flight signals.

---

## Mandatory Reading Sequence

The Swarm Orchestrator must read the following documents in the order listed. Each document builds on the prior; skipping steps is a governance violation.

| Step | Document | Purpose |
|------|----------|---------|
| 1 | `AGENTS.md` | Confirm agent roles, authority levels, and inter-agent communication contracts |
| 2 | `CLAUDE.md` | Confirm AI agent behavioral constraints and enforcement rules |
| 3 | `docs/ARCHITECTURE_INDEX.md` | Map all files and modules; identify what exists and what is in progress |
| 4 | `docs/ARCHITECTURE_LOCK.md` | Identify all frozen decisions; flag any task that would conflict |
| 5 | `docs/ARCHITECTURE_DECISION_LOG.md` | Review decision history; understand rationale for current system shape |
| 6 | `docs/DOMAIN_MODEL.md` | Confirm core domain entities and relationships |
| 7 | `docs/MOAT_MODEL.md` | Confirm IP boundaries; identify moat-protected components |
| 8 | `docs/swarm_rules.md` | Confirm data integrity and execution rules |
| 9 | `.claude/project_context.md` | Confirm current project state, completed modules, and known gaps |
| 10 | `.claude/current_phase.md` | Confirm active development phase, deliverables, and exit criteria |

---

## Pre-Flight Confirmation Checklist

After completing the reading sequence, the Swarm Orchestrator must confirm:

- [ ] All agents have acknowledged `CLAUDE.md` and `AGENTS.md`.
- [ ] Active development phase is identified from `.claude/current_phase.md`.
- [ ] No locked decisions in `docs/ARCHITECTURE_LOCK.md` conflict with the current task.
- [ ] All analytics-eligible data paths have been reviewed against LOCK-003 rules.
- [ ] Moat boundaries have been reviewed; no task output risks exposing proprietary components.
- [ ] A structured task queue can be emitted (see `SWARM_PROMPT_STAGED.md` Stage 2).

If any checklist item cannot be confirmed, emit `{ "preflight": "NO-GO", "reason": "..." }` and halt.

---

## Context Freshness Rules

- This reading order must be followed at the start of each swarm workflow, even if the orchestrator has prior context from a previous session. Project state can change between sessions.
- The orchestrator must not cache or assume prior phase status. Re-read `.claude/current_phase.md` at each bootstrap.
- If any referenced document is missing or unavailable, emit `{ "preflight": "NO-GO", "reason": "missing document: <path>" }` and halt.

---

## References

- `SWARM_PROMPT_STAGED.md` — staged swarm execution prompts (Stage 0 pre-flight, Stage 1 domain grounding, Stage 2 task assignment, Stage 3 execution)
- `docs/swarm_rules.md` — execution and data integrity rules
- `AGENTS.md` — authority matrix
