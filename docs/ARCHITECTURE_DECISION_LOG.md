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

### ADR-005: Implement src/blend/ — Phase 1 Blend Entity Layer
**Status**: ACCEPTED
**Date**: 2026-04-11
**Deciders**: Swarm Orchestrator (Phase 1 continuation authorized by Human Project Lead)

**Context**: Phase 1 `src/ontology/` is complete. The next dependency-safe module is `src/blend/`, which depends only on the finished ontology layer. The Blend entity is required by the Protocol engine (planned next) and is defined in `docs/DOMAIN_MODEL.md`.

**Decision**: Implement `src/blend/` in TypeScript with the following files:
- `types.ts` — BlendId, BlendOilEntry, BlendRole, BlendSafetyStatus, Blend, validation result types
- `schema.ts` — field-level constraint schema, VALID_BLEND_ROLES, BLEND_MIN_OILS, BLEND_MAX_OILS
- `validation.ts` — `validateBlend()` and `validateBlendCollection()` with business rules
- `index.ts` — public module interface
- `__tests__/blend.test.ts` — comprehensive tests (44 tests)

The synergy scoring algorithm (M-001) is intentionally excluded. The `synergyScore` field accepts a pre-computed value produced by the moat-protected blend intelligence layer.

**Consequences**:
- All consuming modules must import blend entities through `src/blend/index.ts`.
- The `synergyScore` field is validated for range only; the computation method is not implemented here.
- Blend records require at least 2 oil entries with distinct oilIds, each referencing the canonical ontology.
- Exactly one oil entry per blend must carry the `primary` role.
- Protocol engine (`src/protocol/`) can now reference Blend types from this module.

---

### ADR-006: Implement src/protocol/ — Phase 1 Protocol Entity Layer
**Status**: ACCEPTED
**Date**: 2026-04-11
**Deciders**: Swarm Orchestrator (Phase 1 continuation authorized by Human Project Lead)

**Context**: Phase 1 `src/ontology/` and `src/blend/` are complete. The next dependency-safe module is `src/protocol/`, which depends on the finished ontology and blend layers. The Protocol and Challenge entities are defined in `docs/DOMAIN_MODEL.md` and are foundational to the analytics, simulation, and API layers planned for later Phase 1 work.

**Decision**: Implement `src/protocol/` in TypeScript with the following files:
- `types.ts` — ProtocolStatus, ChallengeType, ChallengeCompletionStatus enums; ProtocolPhase, Protocol, Challenge, and validation result types
- `schema.ts` — field-level constraint schema, constants (PROTOCOL_MIN_PHASES, PROTOCOL_MAX_PHASES, PROTOCOL_MIN_DURATION_DAYS, PROTOCOL_MAX_DURATION_DAYS, SEMVER_PATTERN)
- `validation.ts` — `validateProtocol()`, `validateProtocolCollection()`, `validateChallenge()`, `validateChallengeCollection()` with business rules
- `index.ts` — public module interface
- `__tests__/protocol.test.ts` — comprehensive tests

The protocol generation algorithm (M-002) and challenge engine rules (M-003) are intentionally excluded. This module handles only structural types, schema constraints, and validation.

**Consequences**:
- All consuming modules must import protocol entities through `src/protocol/index.ts`.
- The protocol generation algorithm (M-002) must remain in the moat-protected layer and must not be reconstructed here.
- The challenge engine rule evaluation logic (M-003) must not be exposed here; only the Challenge entity type and structural validation are permitted.
- Protocol versions must follow semantic versioning per LOCK-005.
- Analytics (`src/analytics/`) and simulation (`src/simulation/`) modules can now reference Protocol and Challenge types from this module.

---

### ADR-007: Implement src/analytics/ — Phase 2 Contributor Analytics Pipeline
**Status**: ACCEPTED
**Date**: 2026-04-11
**Deciders**: Swarm Orchestrator (Phase 2 kickoff; Phase 1 complete)

**Context**: Phase 1 is complete (`src/ontology/`, `src/blend/`, `src/protocol/` all implemented with passing tests). Phase 2 begins with `src/analytics/`, the next dependency-safe module. This module depends on the finished domain layer (Protocol, Blend, ontology types) and implements the Contributor Record entity with LOCK-003 data integrity enforcement. The Population Analytics Signal Model (M-004) is moat-protected and must not be implemented here.

**Decision**: Implement `src/analytics/` in TypeScript with the following files:
- `types.ts` — ContributorRecord, DataOrigin, ExclusionStatus, ExclusionReason enums; aggregation result types (CohortMetrics, AnalyticsPipelineResult)
- `schema.ts` — field-level constraint schema, ADHERENCE_EXCLUSION_THRESHOLD constant (50)
- `validation.ts` — `validateContributorRecord()` and `validateContributorRecordCollection()` enforcing LOCK-003 rules
- `pipeline.ts` — `filterAnalyticsEligible()`, `aggregateCohortMetrics()`, `runAnalyticsPipeline()` — structural aggregation without signal extraction methodology (M-004)
- `index.ts` — public module interface with M-004 moat notice
- `__tests__/analytics.test.ts` — comprehensive tests covering validation and pipeline logic

**Consequences**:
- All analytics data flows must pass through `validateContributorRecord()` before processing.
- Only `real_contributor` records with `adherence_score >= 50` and `exclusion_status: included` are pipeline-eligible (LOCK-003).
- The signal extraction methodology (M-004) must remain in the moat-protected layer; this module provides only structural aggregation (count, averages, breakdowns).
- Simulation module (`src/simulation/`) can now reference ContributorRecord types and the pipeline to produce isolated test runs.

---
