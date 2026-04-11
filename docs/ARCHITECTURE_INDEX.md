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

---

## /.claude — Agent Context

| File | Description |
|------|-------------|
| `.claude/project_context.md` | Current project state, goals, and constraints |
| `.claude/current_phase.md` | Active development phase and exit criteria |

---

## /src — Application Source

| Module | Description | Status |
|--------|-------------|--------|
| `src/ontology/` | Oil and remedy ontology definitions | **Complete (Phase 1)** |
| `src/blend/` | Blend entity types, schema, and validation | **Complete (Phase 1)** |
| `src/protocol/` | Protocol recommendation engine | Planned |
| `src/analytics/` | Contributor analytics pipeline | Planned |
| `src/simulation/` | Synthetic simulation environment | Planned |
| `src/api/` | External API layer | Planned |

### /src/ontology — Files

| File | Description |
|------|-------------|
| `src/ontology/types.ts` | TypeScript types: Oil, OilId, enums, ChemicalConstituent, SafetyProfile, OntologyTags |
| `src/ontology/schema.ts` | Field-level constraint schema for validation; canonical OilId set |
| `src/ontology/oils.ts` | Canonical oil registry with 20 seed oils and accessor functions |
| `src/ontology/validation.ts` | validateOil() and validateOilRegistry() with business rules |
| `src/ontology/index.ts` | Public module interface |
| `src/ontology/__tests__/ontology.test.ts` | Ontology integrity tests (115 tests) |

### /src/blend — Files

| File | Description |
|------|-------------|
| `src/blend/types.ts` | TypeScript types: BlendId, BlendOilEntry, BlendRole, BlendSafetyStatus, Blend, validation result types |
| `src/blend/schema.ts` | Field-level constraint schema; VALID_BLEND_ROLES, BLEND_MIN_OILS, BLEND_MAX_OILS constants |
| `src/blend/validation.ts` | validateBlend() and validateBlendCollection() with business rules |
| `src/blend/index.ts` | Public module interface |
| `src/blend/__tests__/blend.test.ts` | Blend integrity and validation tests (44 tests) |

---

| File | Description |
|------|-------------|
| `phyto_ai_architecture_v11_CANONICAL.zip` | v11 canonical architecture package (reference only) |

---

## Notes

- Files marked ✅ in the Locked column correspond to decisions in `docs/ARCHITECTURE_LOCK.md`.
- Agents must not create new top-level files or modules without updating this index.
- The `/src` module structure is planned; actual file creation requires an ADR.
