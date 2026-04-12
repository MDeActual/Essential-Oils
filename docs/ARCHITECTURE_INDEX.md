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
| `src/protocol/` | Protocol and Challenge entity types, schema, and validation | **Complete (Phase 1)** |
| `src/challenge/` | Challenge lifecycle, state transitions, participation and completion records | **Complete (Phase 1)** |
| `src/analytics/` | Contributor analytics pipeline | **Complete (Phase 2)** |
| `src/simulation/` | Synthetic simulation environment | **Complete (Phase 1)** |
| `src/api/` | External API layer | **In Progress (Phase 3)** |

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

### /src/protocol — Files

| File | Description |
|------|-------------|
| `src/protocol/types.ts` | TypeScript types: ProtocolStatus, ChallengeType, ChallengeCompletionStatus enums; ProtocolPhase, Protocol, Challenge, validation result types |
| `src/protocol/schema.ts` | Field-level constraint schema; PROTOCOL_MIN_PHASES, PROTOCOL_MAX_PHASES, PROTOCOL_MIN/MAX_DURATION_DAYS, SEMVER_PATTERN constants |
| `src/protocol/validation.ts` | validateProtocol(), validateProtocolCollection(), validateChallenge(), validateChallengeCollection() with business rules |
| `src/protocol/index.ts` | Public module interface |
| `src/protocol/__tests__/protocol.test.ts` | Protocol and Challenge integrity tests (68 tests) |

### /src/challenge — Files

| File | Description |
|------|-------------|
| `src/challenge/types.ts` | TypeScript types: ChallengeLifecycleEventType enum; ChallengeTransition, ChallengeParticipation, ChallengeCompletionRecord types; validation result types |
| `src/challenge/schema.ts` | VALID_TRANSITIONS state machine map; field-level constraint schemas for participation and completion records; CHALLENGE_RESPONSE_MAX_LENGTH, CHALLENGE_SKIP_REASON_MAX_LENGTH constants |
| `src/challenge/validation.ts` | validateChallengeTransition(), validateChallengeParticipation(), validateChallengeCompletionRecord(), validateChallengeCompletionRecordCollection() with business rules |
| `src/challenge/index.ts` | Public module interface |
| `src/challenge/__tests__/challenge.test.ts` | Challenge lifecycle, participation, and completion integrity tests |

### /src/analytics — Files

| File | Description |
|------|-------------|
| `src/analytics/types.ts` | TypeScript types: DataOrigin, ExclusionStatus, ExclusionReason enums; ContributorRecord, CohortMetrics, AnalyticsPipelineResult, ProtocolCohortSegment, ProtocolSegmentReport, validation result types |
| `src/analytics/schema.ts` | Field-level constraint schema; ADHERENCE_EXCLUSION_THRESHOLD constant |
| `src/analytics/validation.ts` | validateContributorRecord() and validateContributorRecordCollection() enforcing LOCK-003 rules |
| `src/analytics/pipeline.ts` | filterAnalyticsEligible(), aggregateCohortMetrics(), runAnalyticsPipeline(), segmentByProtocol(), runProtocolSegmentPipeline() — structural aggregation and per-protocol segmentation (M-004 boundary respected) |
| `src/analytics/index.ts` | Public module interface |
| `src/analytics/__tests__/analytics.test.ts` | Contributor analytics validation, pipeline, and segmentation tests |

### /src/simulation — Files

| File | Description |
|------|-------------|
| `src/simulation/types.ts` | TypeScript types: DataOrigin, ExclusionStatus, ExclusionReason enums; ContributorRecord, SyntheticContributorRecord, SimulationContext, SimulationBatch, SyntheticRecordOptions, validation result types |
| `src/simulation/schema.ts` | Field-level constraint schema; ADHERENCE_EXCLUSION_THRESHOLD and score/rate range constants |
| `src/simulation/generators.ts` | generateSyntheticContributorRecord() and generateSyntheticContributorBatch() with mandatory isolation enforcement |
| `src/simulation/validation.ts` | validateContributorRecord(), validateContributorRecordCollection(), assertSyntheticIsolation(), assertBatchIsolation(), filterAnalyticsEligible() |
| `src/simulation/index.ts` | Public module interface |
| `src/simulation/__tests__/simulation.test.ts` | Simulation layer integrity tests (89 tests) |

### /src/api — Files

| File | Description |
|------|-------------|
| `src/api/server.ts` | Express application factory (createApp); mounts all routes and error handling middleware |
| `src/api/types.ts` | Shared API response envelope types: ApiSuccessResponse, ApiErrorResponse, HealthPayload, ProtocolSummary, ProtocolDetail, AnalyticsProtocolsPayload, AnalyticsProtocolDetailPayload |
| `src/api/index.ts` | Public module interface (exports createApp and all response types) |
| `src/api/routes/health.ts` | GET /health route definition |
| `src/api/routes/protocols.ts` | GET /protocols and GET /protocols/:id route definitions |
| `src/api/routes/analytics.ts` | GET /analytics/protocols and GET /analytics/protocols/:id route definitions |
| `src/api/controllers/healthController.ts` | GET /health handler — returns liveness status, version, uptime |
| `src/api/controllers/protocolController.ts` | GET /protocols and GET /protocols/:id handlers — delegates to protocolStore; shapes moat-safe response |
| `src/api/controllers/protocolStore.ts` | In-memory protocol data registry (read-only); seed data for integration tests |
| `src/api/controllers/analyticsController.ts` | GET /analytics/protocols and GET /analytics/protocols/:id handlers — delegates to analytics pipeline |
| `src/api/controllers/analyticsStore.ts` | In-memory contributor record registry (read-only); seed data satisfying LOCK-003 |
| `src/api/middleware/errorHandler.ts` | Global Express error-handling middleware; ValidationError (400), NotFoundError (404), fallback (500) |
| `src/api/middleware/validateId.ts` | Path parameter validation middleware — enforces canonical identifier format |
| `src/api/__tests__/api.test.ts` | Integration tests for all five endpoints (26 tests) |

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
