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

### ADR-004: Implement src/ontology/ — Phase 1 Core Domain (Oil Ontology)
**Status**: ACCEPTED
**Date**: 2026-04-11
**Deciders**: Swarm Orchestrator (Phase 1 kickoff authorized by Human Project Lead)

**Context**: Phase 0 is complete. Phase 1 begins with the first dependency-safe module: `src/ontology/`. The oil ontology is the foundational layer that all other modules (protocol engine, blend intelligence, analytics) will depend on. No prior source code exists; this is the inaugural module.

**Decision**: Implement `src/ontology/` in TypeScript with the following files:
- `types.ts` — canonical type definitions aligned with DOMAIN_MODEL.md Oil entity
- `schema.ts` — field-level constraint schema and canonical OilId registry
- `oils.ts` — internal registry of 20 seed oils with accessor functions
- `validation.ts` — `validateOil()` and `validateOilRegistry()` with business rules
- `index.ts` — public module interface
- `__tests__/ontology.test.ts` — 115 integrity tests

Initialize Node.js/TypeScript project with `package.json`, `tsconfig.json`, and Jest test runner.

**Consequences**:
- All consuming modules must import oil entities through `src/ontology/index.ts`.
- The full oil registry (getAllOils) is for internal use only — must not be forwarded to external APIs (M-005).
- New oils require an OilId union update in `types.ts`, a registry entry in `oils.ts`, and passing tests.
- Blend synergy scoring and protocol generation are deliberately excluded from this module (LOCK-002).

---
