# project_context.md — Current Project State

## Platform

**Name**: Phyto.ai
**Type**: Protocol Intelligence Platform
**Domain**: Essential oil therapeutic protocols, blend intelligence, and population-level wellness analytics.

---

## Current State

**Architecture Package Version**: v11 CANONICAL
**Governance Layer**: Architecture Control Layer v1.0 (established 2026-04-10)
**Development Status**: Phase 4 complete (reviewed and accepted by human project lead 2026-08-14). Phase 5 active — implementation and human review remain.

---

## Objectives

1. **Protocol Intelligence**: Generate personalized essential oil protocols that adapt to user health goals, preferences, and history.
2. **Blend Intelligence**: Score and recommend oil blends using a proprietary synergy model that accounts for chemical compatibility and therapeutic synergies.
3. **Challenge Engine**: Drive user adherence through structured, timely behavioral prompts embedded within protocols.
4. **Contributor Analytics**: Aggregate anonymized participant data to surface protocol evolution signals.
5. **Protocol Evolution**: Continuously improve protocol quality through evidence-based iteration governed by the autonomous iteration protocol.

---

## Key Constraints

- All analytics use only `real_contributor` records with adherence ≥ 50%.
- Moat-protected components (synergy scoring, protocol generation, challenge engine rules, analytics signal model, oil ontology graph) must not be exposed externally.
- Structural architecture changes require ADR entries in `docs/ARCHITECTURE_DECISION_LOG.md`.
- Agent authority is bounded by the matrix in `AGENTS.md`.

---

## Source Modules Status

| Module | Purpose | Status |
|--------|---------|--------|
| `src/ontology/` | Oil ontology structures, schema, validation | ✅ Complete (Phase 1) |
| `src/blend/` | Blend entity types, schema, validation | ✅ Complete (Phase 1) |
| `src/protocol/` | Protocol and Challenge entity types, schema, validation | ✅ Complete (Phase 1) |
| `src/challenge/` | Challenge lifecycle, state transitions, participation and completion records; internal rule evaluation | Phase 5 implementation pending human review |
| `src/evolution/` | Protocol Evolution advisory reports from aggregate signals | Phase 5 implementation pending human review |
| `src/analytics/` | Contributor analytics pipeline | ✅ Complete (Phase 2) |
| `src/simulation/` | Synthetic simulation environment | ✅ Complete (Phase 1) |
| `src/api/` | External API layer | ✅ Complete (Phase 3) |
| `src/db/` | Prisma persistence layer (repositories, mappers, client) | ✅ Complete (Phase 4) |

---

## Known Gaps (from Architecture Review) — Phase 5 Targets

The four governance documents below are complete. Phase 5 source implementation and human review remain:

| Gap | Phase 5 Target File | Status |
|-----|---------------------|--------|
| Natural remedy ontology | `docs/natural_remedy_ontology.md` | ✅ Complete |
| Challenge Engine specification | `docs/challenge_engine_specification.md` | ✅ Complete |
| Protocol evolution system | `docs/protocol_evolution_system.md` | ✅ Complete |
| Synthetic simulation specification | `docs/synthetic_simulation_specification.md` | ✅ Complete |

The separate Phase 4 staging-database verification is tracked in `.claude/current_phase.md`.

---

## References

- Canonical package: `phyto_ai_architecture_v11_CANONICAL.zip`
- Architecture lock: `docs/ARCHITECTURE_LOCK.md`
- Domain model: `docs/DOMAIN_MODEL.md`
- Decision log: `docs/ARCHITECTURE_DECISION_LOG.md`
