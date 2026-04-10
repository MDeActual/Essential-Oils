# project_context.md — Current Project State

## Platform

**Name**: Phyto.ai
**Type**: Protocol Intelligence Platform
**Domain**: Essential oil therapeutic protocols, blend intelligence, and population-level wellness analytics.

---

## Current State

**Architecture Package Version**: v11 CANONICAL
**Governance Layer**: Architecture Control Layer v1.0 (established 2026-04-10)
**Development Status**: Pre-implementation — architecture scaffolding established; source modules planned but not yet built.

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

## Planned Source Modules (Not Yet Built)

| Module | Purpose |
|--------|---------|
| `src/protocol/` | Protocol recommendation engine |
| `src/blend/` | Blend intelligence and synergy scoring |
| `src/analytics/` | Contributor analytics pipeline |
| `src/simulation/` | Synthetic simulation environment |
| `src/api/` | External API layer |
| `src/ontology/` | Oil and remedy ontology definitions |

---

## Known Gaps (from Architecture Review)

All documentation gaps identified in the initial architecture review have been resolved (ADR-004, 2026-04-10):

- ✅ `docs/natural_remedy_ontology.md` — created
- ✅ `docs/challenge_engine_specification.md` — created
- ✅ `docs/protocol_evolution_system.md` — created
- ✅ `docs/synthetic_simulation_specification.md` — created
- ✅ `docs/swarm_rules.md` — created
- ✅ `docs/orchestrator_reading_order.md` — created

Phase 0 documentation is complete. Phase 1 implementation requires human project lead review and authorization.

---

## References

- Canonical package: `phyto_ai_architecture_v11_CANONICAL.zip`
- Architecture lock: `docs/ARCHITECTURE_LOCK.md`
- Domain model: `docs/DOMAIN_MODEL.md`
- Decision log: `docs/ARCHITECTURE_DECISION_LOG.md`
