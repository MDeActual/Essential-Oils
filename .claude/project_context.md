# project_context.md — Current Project State

## Platform

**Name**: Phyto.ai
**Type**: Protocol Intelligence Platform
**Domain**: Essential oil therapeutic protocols, blend intelligence, and population-level wellness analytics.

---

## Current State

**Architecture Package Version**: v11 CANONICAL
**Governance Layer**: Architecture Control Layer v1.0 (established 2026-04-10)
**Development Status**: Phase 1 in progress — `src/ontology/`, `src/blend/`, and `src/protocol/` complete; `src/analytics/`, `src/simulation/`, and `src/api/` planned.

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
| `src/analytics/` | Contributor analytics pipeline |
| `src/api/` | External API layer |

## Built Source Modules

| Module | Purpose | Status |
|--------|---------|--------|
| `src/simulation/` | Synthetic simulation environment | ✅ Complete (Phase 1) |

---

## Known Gaps (from Architecture Review)

- `docs/` lacks: `natural_remedy_ontology.md`, `challenge_engine_specification.md`, `protocol_evolution_system.md`, and synthetic simulation specification documents — even though the orchestrator reading order references them.
- These gaps should be addressed in the next architecture phase before source module implementation begins.

---

## References

- Canonical package: `phyto_ai_architecture_v11_CANONICAL.zip`
- Architecture lock: `docs/ARCHITECTURE_LOCK.md`
- Domain model: `docs/DOMAIN_MODEL.md`
- Decision log: `docs/ARCHITECTURE_DECISION_LOG.md`
