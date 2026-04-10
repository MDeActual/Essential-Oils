# ARCHITECTURE_DECISION_LOG.md — ADR History

## Purpose

This log records all significant architectural decisions made for the Phyto.ai protocol intelligence platform. Each entry follows the Architecture Decision Record (ADR) format. New decisions are appended; existing records are immutable once status is `ACCEPTED`.

---

## ADR Template

```
### ADR-XXX: [Title]
**Status**: PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED BY ADR-XXX
**Date**: YYYY-MM-DD
**Deciders**: [Names or roles]

**Context**: [What situation or problem prompted this decision?]

**Decision**: [What was decided?]

**Consequences**: [What are the trade-offs, risks, or downstream effects?]
```

---

## Decision Log

### ADR-001: Establish Architecture Control Layer
**Status**: ACCEPTED
**Date**: 2026-04-10
**Deciders**: Human Project Lead

**Context**: The Phyto.ai v11 canonical package was created but lacked governance scaffolding to control agent behavior, lock critical decisions, and ensure data integrity across multi-agent workflows.

**Decision**: Establish an architecture control layer consisting of:
- `CLAUDE.md` — agent behavioral constraints
- `AGENTS.md` — authority matrix and role definitions
- `SWARM_PROMPT_STAGED.md` — staged swarm execution prompts
- `docs/ARCHITECTURE_INDEX.md` — canonical file map
- `docs/ARCHITECTURE_LOCK.md` — frozen decisions
- `docs/ARCHITECTURE_DECISION_LOG.md` — this log
- `docs/DOMAIN_MODEL.md` — domain entity definitions
- `docs/MOAT_MODEL.md` — IP boundary definitions
- `docs/autonomous_iteration_protocol.md` — evolution workflow
- `.claude/project_context.md` — current project state
- `.claude/current_phase.md` — active development phase

**Consequences**: All subsequent agent interactions are governed by this layer. Architectural changes require ADR entries. The initial locked decisions (LOCK-001 through LOCK-005) are established as part of this ADR.

---

### ADR-002: Define Core Domain Model
**Status**: ACCEPTED
**Date**: 2026-04-10
**Deciders**: Human Project Lead

**Context**: The platform requires a stable set of domain entities to anchor protocol generation, analytics, and blend intelligence. Without a canonical domain model, agents risk creating divergent entity representations.

**Decision**: Define six core domain entities in `docs/DOMAIN_MODEL.md`: Oil, Protocol, User Profile, Challenge, Blend, and Contributor Record, with their primary attributes and relationships. Lock the model per LOCK-001.

**Consequences**: All modules and agents must reference this model. Changes to entity definitions require an ADR and human approval.

---

### ADR-003: Define Competitive Moat Boundaries
**Status**: ACCEPTED
**Date**: 2026-04-10
**Deciders**: Human Project Lead

**Context**: Key algorithmic components (synergy scoring, protocol generation, challenge engine) constitute the platform's primary competitive advantage and must be protected from external exposure.

**Decision**: Document moat-protected components in `docs/MOAT_MODEL.md` and enforce boundaries via LOCK-002 and agent constraints in `CLAUDE.md` and `AGENTS.md`.

**Consequences**: Public API design must be reviewed against moat boundaries. Any interface that risks exposing protected logic must be rejected or restructured.

---

### ADR-004: Complete Phase 0 Architecture Documentation Gaps
**Status**: ACCEPTED
**Date**: 2026-04-10
**Deciders**: Swarm Orchestrator (autonomous, within Phase 0 authority)

**Context**: The `docs/` directory was missing four documents referenced by the orchestrator reading order and listed as pending in `.claude/current_phase.md`: `natural_remedy_ontology.md`, `challenge_engine_specification.md`, `protocol_evolution_system.md`, and a synthetic simulation specification. Additionally, `docs/swarm_rules.md` and `docs/orchestrator_reading_order.md` were listed in `docs/ARCHITECTURE_INDEX.md` but did not exist in the repository.

**Decision**: Create all six missing documents as Phase 0 completion work:
- `docs/swarm_rules.md` — Data integrity and multi-agent execution governance rules
- `docs/orchestrator_reading_order.md` — Deterministic boot sequence for orchestrator and agent initialization
- `docs/natural_remedy_ontology.md` — Oil and remedy classification taxonomy, property encodings, and V1 reference set
- `docs/challenge_engine_specification.md` — Challenge type system, sequencing rules, lifecycle state machine, and behavioral logic
- `docs/protocol_evolution_system.md` — Protocol versioning, evolution signal system, shadow deployment design, and rollback procedures
- `docs/synthetic_simulation_specification.md` — Synthetic simulation infrastructure, contributor archetypes, isolation rules, and validation gates

Update `docs/ARCHITECTURE_INDEX.md` to register all new files. Update `.claude/current_phase.md` to mark Phase 0 deliverables complete.

**Consequences**: Phase 0 exit criteria (items 1 and 2) are now met. Human project lead review and Phase 1 authorization remain required before implementation begins. All Phase 1 source module work may now reference these documents as authoritative specifications.

---
