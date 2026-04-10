# orchestrator_reading_order.md — Canonical Reading Order for Orchestrator Bootstrap

## Purpose

This document defines the deterministic boot sequence that the Swarm Orchestrator (and any agent) must follow when initializing context for the Phyto.ai protocol intelligence platform. Agents must not begin implementation planning until the mandatory tiers are complete.

---

## Rule

> Do not begin implementation planning until Tier 1 and Tier 2 are complete.
> Do not begin subsystem implementation until the relevant Tier 3 and Tier 4 files are read.

---

## Tier 1 — Mandatory Orientation

Read first (in order):

| # | File | Purpose |
|---|------|---------|
| 1 | `CLAUDE.md` | Agent behavioral constraints and reading order |
| 2 | `AGENTS.md` | Agent roles, authority matrix, and communication contracts |
| 3 | `docs/ARCHITECTURE_INDEX.md` | Canonical file map |
| 4 | `docs/ARCHITECTURE_LOCK.md` | Frozen decisions — do not override |
| 5 | `docs/swarm_rules.md` | Data integrity and multi-agent governance rules |

**Purpose**: Understand governance boundaries, authority limits, and locked decisions before touching anything.

---

## Tier 2 — Project State

Read next:

| # | File | Purpose |
|---|------|---------|
| 6 | `.claude/project_context.md` | Current project state, goals, and constraints |
| 7 | `.claude/current_phase.md` | Active development phase and exit criteria |
| 8 | `docs/ARCHITECTURE_DECISION_LOG.md` | ADR history and rationale |

**Purpose**: Understand where the platform is in its lifecycle and what decisions have already been made.

---

## Tier 3 — Core Domain Architecture

Read next:

| # | File | Purpose |
|---|------|---------|
| 9 | `docs/DOMAIN_MODEL.md` | Core domain entities and relationships |
| 10 | `docs/MOAT_MODEL.md` | Competitive differentiation and IP boundaries |
| 11 | `docs/autonomous_iteration_protocol.md` | Protocol evolution governance workflow |

**Purpose**: Understand the semantic foundation, protected IP boundaries, and evolution constraints.

---

## Tier 4 — Domain Intelligence Specifications

Read before working on protocol, ontology, challenge, or analytics subsystems:

| # | File | Purpose |
|---|------|---------|
| 12 | `docs/natural_remedy_ontology.md` | Oil and remedy classification taxonomy |
| 13 | `docs/challenge_engine_specification.md` | Challenge type system and behavioral rules |
| 14 | `docs/protocol_evolution_system.md` | Protocol evolution system design |
| 15 | `docs/synthetic_simulation_specification.md` | Synthetic simulation infrastructure |

**Purpose**: Understand domain intelligence subsystem specs before implementing them.

---

## Tier 5 — Source Implementation (When Available)

Read when working within a source module:

| Module | Files |
|--------|-------|
| `src/ontology/` | `docs/natural_remedy_ontology.md` |
| `src/protocol/` | `docs/DOMAIN_MODEL.md`, `docs/protocol_evolution_system.md` |
| `src/blend/` | `docs/DOMAIN_MODEL.md`, `docs/MOAT_MODEL.md` |
| `src/analytics/` | `docs/swarm_rules.md`, `docs/DOMAIN_MODEL.md` |
| `src/simulation/` | `docs/synthetic_simulation_specification.md` |
| `src/api/` | `docs/MOAT_MODEL.md` |

---

## Canonical Reference Package

The `phyto_ai_architecture_v11_CANONICAL.zip` package contains supplemental architecture documents. For detailed implementation reference, the following canonical package documents are available:

- `build_order_roadmap.md` — phased build sequence
- `phyto_ai_full_blueprint_v7_complete.md` — full platform blueprint
- `database_schema_v6_complete.md` — database schema reference
- `api_contracts_v5_complete.md` — API contract reference
- `protocol_library_v3_final.md` — protocol library content

These are reference-only. The authoritative governance documents are those in `/docs` of this repository.
