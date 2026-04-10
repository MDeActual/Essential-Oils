# ARCHITECTURE_INDEX.md — Canonical File Map

## Purpose

This index is the authoritative map of all files, modules, and documents in the Phyto.ai protocol intelligence platform. Agents must consult this index before searching for or creating files.

---

## Repository Root

| File | Description | Locked |
|------|-------------|--------|
| `CLAUDE.md` | AI agent behavioral constraints and reading order | ✅ |
| `AGENTS.md` | Agent roles, authority matrix, and communication contracts | ✅ |
| `SWARM_PROMPT_STAGED.md` | Staged swarm execution prompts | ⬜ |
| `README.md` | Project overview | ⬜ |

---

## /docs — Architecture Governance

| File | Description | Locked |
|------|-------------|--------|
| `docs/ARCHITECTURE_INDEX.md` | This file — canonical file map | ✅ |
| `docs/ARCHITECTURE_LOCK.md` | Frozen architectural decisions | ✅ |
| `docs/ARCHITECTURE_DECISION_LOG.md` | ADR history and rationale | ⬜ |
| `docs/DOMAIN_MODEL.md` | Core domain entities and relationships | ✅ |
| `docs/MOAT_MODEL.md` | Competitive differentiation and IP boundaries | ✅ |
| `docs/autonomous_iteration_protocol.md` | Rules for autonomous protocol evolution | ⬜ |
| `docs/swarm_rules.md` | Data integrity and multi-agent execution rules | ⬜ |
| `docs/orchestrator_reading_order.md` | Canonical reading order for orchestrator bootstrap | ⬜ |
| `docs/natural_remedy_ontology.md` | Oil and remedy classification taxonomy and property encodings | ⬜ |
| `docs/challenge_engine_specification.md` | Challenge type system, sequencing rules, and behavioral logic | ⬜ |
| `docs/protocol_evolution_system.md` | Protocol versioning, evolution signal system, and shadow deployment | ⬜ |
| `docs/synthetic_simulation_specification.md` | Synthetic simulation infrastructure, archetypes, and isolation rules | ⬜ |

---

## /.claude — Agent Context

| File | Description |
|------|-------------|
| `.claude/project_context.md` | Current project state, goals, and constraints |
| `.claude/current_phase.md` | Active development phase and exit criteria |

---

## /src — Application Source (Planned)

| Module | Description | Status |
|--------|-------------|--------|
| `src/protocol/` | Protocol recommendation engine | Planned |
| `src/blend/` | Blend intelligence and synergy scoring | Planned |
| `src/analytics/` | Contributor analytics pipeline | Planned |
| `src/simulation/` | Synthetic simulation environment | Planned |
| `src/api/` | External API layer | Planned |
| `src/ontology/` | Oil and remedy ontology definitions | Planned |

---

## Canonical Package

| File | Description |
|------|-------------|
| `phyto_ai_architecture_v11_CANONICAL.zip` | v11 canonical architecture package (reference only) |

---

## Notes

- Files marked ✅ in the Locked column correspond to decisions in `docs/ARCHITECTURE_LOCK.md`.
- Agents must not create new top-level files or modules without updating this index.
- The `/src` module structure is planned; actual file creation requires an ADR.
