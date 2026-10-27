# project_context.md — Current Project State

## Platform

**Name**: Phyto.ai
**Type**: Protocol Intelligence Platform
**Domain**: Essential oil therapeutic protocols, blend intelligence, and population-level wellness analytics.

---

## Current State

**Architecture Package Version**: v11 CANONICAL
**Governance Layer**: Architecture Control Layer v1.0 (established 2026-04-10)
**Development Status**: Phase 4 complete (reviewed and accepted by human project lead 2026-08-14). Phase 5 active — CE-005 validation is implemented; Protocol Evolution integration remains pending authorization. Staging database verification is also pending a human-provisioned environment.

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
| `src/protocol/` | Protocol and Challenge entity types, schema, validation including CE-005 phase coverage | ✅ Complete |
| `src/challenge/` | Challenge lifecycle, state transitions, participation and completion records; no proprietary selection/sequencing logic | ✅ Complete (structural foundation) |
| `src/analytics/` | Contributor analytics pipeline | ✅ Complete (Phase 2) |
| `src/simulation/` | Synthetic simulation environment | ✅ Complete (Phase 1) |
| `src/api/` | External API layer | ✅ Complete (Phase 3) |
| `src/db/` | Prisma persistence layer (repositories, mappers, client) | ✅ Complete (Phase 4) |

---

## Phase 5 Status

The four governance documents required for Phase 5 exist and are complete:

| Deliverable | Status |
|-------------|--------|
| `docs/natural_remedy_ontology.md` | ✅ Complete |
| `docs/challenge_engine_specification.md` | ✅ Complete |
| `docs/protocol_evolution_system.md` | ✅ Complete |
| `docs/synthetic_simulation_specification.md` | ✅ Complete |

CE-005 is enforced by protocol validation with explicit associated challenge records. Protocol Evolution agent wiring is not implemented: ADR-013 remains proposed, and the M-004 signal methodology is restricted to the authorized Contributor Analytics layer. Do not implement or expose that methodology as part of this phase without human authorization. Phase 4 staging database verification remains an operational item requiring an approved database and credentials.

---

## References

- Canonical package: `phyto_ai_architecture_v11_CANONICAL.zip`
- Architecture lock: `docs/ARCHITECTURE_LOCK.md`
- Domain model: `docs/DOMAIN_MODEL.md`
- Decision log: `docs/ARCHITECTURE_DECISION_LOG.md`
