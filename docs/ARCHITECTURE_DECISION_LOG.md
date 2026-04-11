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

### ADR-007: Implement src/challenge/ — Phase 1 Challenge Engine Foundation Layer
**Status**: ACCEPTED
**Date**: 2026-04-11
**Deciders**: Swarm Orchestrator (Phase 1 continuation authorized by Human Project Lead; Worker Agent B)

**Context**: Phase 1 `src/protocol/` is complete and provides the foundational Challenge entity types and structural validation. The next dependency-safe slice is a dedicated `src/challenge/` module that builds the challenge lifecycle layer on top of the protocol module. This layer adds lifecycle event types, state transition validation, participation records, and completion records — all without implementing the moat-protected challenge engine rules (M-003).

**Decision**: Implement `src/challenge/` in TypeScript with the following files:
- `types.ts` — ChallengeLifecycleEventType enum; ChallengeTransition, ChallengeParticipation, ChallengeCompletionRecord types; validation result types
- `schema.ts` — VALID_TRANSITIONS state machine map, field-level constraint schemas for participation and completion records, module constants
- `validation.ts` — `validateChallengeTransition()`, `validateChallengeParticipation()`, `validateChallengeCompletionRecord()`, `validateChallengeCompletionRecordCollection()` with business rules
- `index.ts` — public module interface
- `__tests__/challenge.test.ts` — comprehensive lifecycle and integrity tests

The challenge engine rule evaluation logic (M-003) — the proprietary system governing when, how, and why challenges are presented and sequenced — is intentionally excluded from this module. This module handles only lifecycle transitions, participation tracking, and completion record integrity.

**Consequences**:
- All consuming modules must import challenge lifecycle types through `src/challenge/index.ts`.
- Challenge entity types (Challenge, ChallengeId, ChallengeType, ChallengeCompletionStatus) continue to be imported from `src/protocol/index.ts`; `src/challenge/` imports and re-exports them for convenience.
- The VALID_TRANSITIONS map encodes the state machine rules for legal lifecycle transitions: only `pending → completed` and `pending → skipped` are valid; terminal states (completed, skipped) admit no further transitions.
- Completed challenges must carry a non-empty `response` field in their completion record.
- The challenge engine sequencing and personalization heuristics (M-003) must not be reconstructed in any public module.
- Analytics (`src/analytics/`) and simulation (`src/simulation/`) can now reference challenge lifecycle types from this module.

---

### ADR-008: Implement src/analytics/ — Phase 2 Contributor Analytics Pipeline
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

### ADR-010: Extend src/analytics/ — Protocol Cohort Segmentation Slice
**Status**: ACCEPTED
**Date**: 2026-04-11
**Deciders**: Swarm Orchestrator (Phase 2 continuation; Worker Agent)

**Context**: Phase 2 `src/analytics/` baseline (ADR-008) delivered structural validation and cohort aggregation across all records. The next dependency-safe slice adds per-protocol cohort segmentation: grouping analytics-eligible records by `protocolId` and producing per-protocol `CohortMetrics`. This enables the Contributor Analytics Agent to surface which protocols have higher adherence and challenge completion rates without exposing the M-004 signal extraction methodology.

**Decision**: Extend `src/analytics/` with the following additions:
- `types.ts` — add `ProtocolCohortSegment` (per-protocol metrics + protocolId) and `ProtocolSegmentReport` (full segmentation pipeline result) types
- `pipeline.ts` — add `segmentByProtocol()` (group eligible records by protocolId, produce sorted `ProtocolCohortSegment[]`) and `runProtocolSegmentPipeline()` (validates → filters → segments in one call)
- `index.ts` — export new types and functions
- `__tests__/analytics.test.ts` — 15 new tests covering segmentByProtocol() and runProtocolSegmentPipeline()
- `docs/ARCHITECTURE_INDEX.md` — updated analytics section to reflect new functions and types

**Consequences**:
- All existing analytics tests continue to pass (471 total: 456 prior + 15 new).
- Per-protocol segmentation is structural only; no protocol ranking, scoring, or comparative signaling is implemented (M-004 boundary maintained).
- Excluded records are tracked at the report level (`totalExcludedRecords`) rather than attributed to specific protocol segments — preventing any inference about which protocols generated low-adherence records.
- `segmentByProtocol()` output is deterministically sorted by `protocolId` to support stable downstream consumers.
- The Contributor Analytics Agent may now call `runProtocolSegmentPipeline()` to obtain per-protocol structural metrics for advisory reporting; signal extraction remains in the moat-protected layer.

---

### ADR-009: Implement src/simulation/ — Phase 1 Synthetic Simulation Layer
**Status**: ACCEPTED
**Date**: 2026-04-11
**Deciders**: Worker Agent C (Phase 1 continuation; Swarm Orchestrator authority)

**Context**: Phase 1 `src/ontology/`, `src/blend/`, and `src/protocol/` are complete. The next dependency-safe module is `src/simulation/`, which depends only on the finished protocol and ontology layers. The Contributor Record entity (defined in `docs/DOMAIN_MODEL.md`) requires a simulation layer that can generate synthetic records for testing and preview workflows without contaminating production analytics (LOCK-003).

**Decision**: Implement `src/simulation/` in TypeScript with the following files:
- `types.ts` — DataOrigin, ExclusionStatus, ExclusionReason enums; ContributorRecord, SyntheticContributorRecord, SimulationContext, and validation result types
- `schema.ts` — field-level constraint schema, ADHERENCE_EXCLUSION_THRESHOLD constant
- `generators.ts` — `generateSyntheticContributorRecord()` and `generateSyntheticContributorBatch()` with mandatory isolation flags
- `validation.ts` — `validateContributorRecord()`, `validateContributorRecordCollection()`, `assertSyntheticIsolation()`, `assertBatchIsolation()`, `filterAnalyticsEligible()`
- `index.ts` — public module interface
- `__tests__/simulation.test.ts` — comprehensive tests (89 tests)

The analytics signal model (M-004) is intentionally excluded. This module handles structural types, schema constraints, record generation, and isolation validation only.

**Consequences**:
- All synthetic records generated by this module carry `data_origin: synthetic_simulation` and `exclusion_status: excluded` — they cannot flow to production analytics (LOCK-003).
- `filterAnalyticsEligible()` enforces the LOCK-003 rule that only `real_contributor` records with `exclusion_status: included` are analytics-eligible.
- `assertSyntheticIsolation()` provides a guard callable by any consuming module to verify a batch contains no production-contaminating records.
- Records with `adherence_score < ADHERENCE_EXCLUSION_THRESHOLD` (50) are automatically assigned `exclusion_status: excluded`.
- Simulation data must never be passed to production analytics without calling `assertSyntheticIsolation()` first.

---
