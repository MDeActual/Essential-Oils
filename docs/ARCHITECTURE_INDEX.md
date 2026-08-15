# ARCHITECTURE_INDEX.md — Canonical File Map

## Purpose

This index is the authoritative map of all files, modules, and documents in the Phyto.ai protocol intelligence platform. Agents must consult this index before searching for or creating files.

---

## Repository Root

| File | Description | Locked |
|------|-------------|--------|
| `CLAUDE.md` | AI agent behavioral constraints and reading order | ✅ |
| `AGENTS.md` | Agent roles, authority matrix, and communication contracts | ✅ |
| `README.md` | Project overview | ⬜ |

---

## /.github — Repository Workflow

| File | Description | Locked |
|------|-------------|--------|
| `.github/pull_request_template.md` | Pull request template with DevOS alignment checks | ⬜ |

---

## /devos — DevOS Workflow Templates

| File | Description | Locked |
|------|-------------|--------|
| `devos/README.md` | Scope note for reusable DevOS governance artifacts | ⬜ |
| `devos/prompts/SWARM_PROMPT_STAGED.md` | Staged swarm execution prompt template | ⬜ |
| `devos/runbooks/devos_execution_plan.md` | Production-readiness audit runbook template | ⬜ |

---

## /cloudmatrix — Cloud Matrix Operating System

| File | Description | Locked |
|------|-------------|--------|
| `cloudmatrix/devos-foundation/README.md` | DevOS Foundation v0.1 file map and operating intent | ⬜ |
| `cloudmatrix/devos-foundation/CLOUD_MATRIX_REFERENCE_ARCHITECTURE_v0.1.md` | Cloud Matrix / DevOS reference architecture | ⬜ |
| `cloudmatrix/devos-foundation/CLOUD_MATRIX_CONSTITUTION.md` | Cloud Matrix operating principles | ⬜ |
| `cloudmatrix/devos-foundation/DEVOS_COMMAND_CENTER.md` | Daily command center for priorities, decisions, blockers, and next actions | ⬜ |
| `cloudmatrix/devos-foundation/AGENT_CHARTER_TEMPLATE.md` | Template for defining specialized Cloud Matrix agents | ⬜ |
| `cloudmatrix/devos-foundation/DEVOS_ALIGNMENT_PR_CHECKLIST.md` | DevOS pull request alignment standard | ⬜ |
| `cloudmatrix/devos-foundation/DECISION_ENGINE_CONTRACT.md` | Contract for turning context into recommendations and decisions | ⬜ |
| `cloudmatrix/devos-foundation/METHODOLOGY_CHANGELOG.md` | Changelog for changes to Cloud Matrix operating methodology | ⬜ |

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
| `docs/swarm_rules.md` | Data integrity and multi-agent execution rules | ✅ |
| `docs/orchestrator_reading_order.md` | Canonical reading order for orchestrator bootstrap | ✅ |
| `docs/challenge_engine_specification.md` | Challenge Engine behavioral rules, lifecycle, personalization contracts, and moat boundaries | ✅ |
| `docs/natural_remedy_ontology.md` | Natural remedy ontology: classification taxonomy, safety tiers, substitution rules, oil registry extension guide | ✅ |
| `docs/protocol_evolution_system.md` | Protocol Evolution System: versioning rules, signal types, evolution candidate lifecycle, governance constraints | ✅ |
| `docs/synthetic_simulation_specification.md` | Synthetic Simulation: isolation rules, generation contracts, validation functions, simulation run report schema | ✅ |
| `docs/BRANCH_TRIAGE.md` | Remote branch triage matrix — classification and cleanup actions | ⬜ |
| `docs/PR_BRANCHING_RULES.md` | PR branching governance — one feature per PR, stacked PR exception rules, and merge-order documentation requirements | ⬜ |
| `docs/ADR-013_ANALYTICS_INTELLIGENCE_SIGNAL_LAYER.md` | ADR for analytics intelligence signal layer | ⬜ |
| `docs/ADR-014_DEVOS_ARTIFACT_SCOPING.md` | ADR for relocating reusable DevOS artifacts under `devos/` | ⬜ |
| `docs/ADR-015_CLOUD_MATRIX_DEVOS_FOUNDATION.md` | ADR for establishing Cloud Matrix DevOS Foundation v0.1 | ⬜ |
| `docs/ADR-016_FAIL_CLOSED_RUNTIME_CONFIGURATION.md` | ADR for fail-closed runtime, storage selection, and readiness behavior | ⬜ |
| `docs/ADR-017_API_IDENTITY_AND_TENANT_BOUNDARY.md` | Accepted ADR for OIDC identity, endpoint authorization, and tenant-isolated persistence | ⬜ |
| `docs/API_IDENTITY_THREAT_MODEL.md` | Threat model for JWT verification, authorization, JWKS retrieval, and tenant isolation | ⬜ |

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
| `src/index.ts` | Server entry point — starts the Express app on `PORT` (default 3000) | **Complete (Phase 4)** |
| `src/ontology/` | Oil and remedy ontology definitions | **Complete (Phase 1)** |
| `src/blend/` | Blend entity types, schema, and validation | **Complete (Phase 1)** |
| `src/protocol/` | Protocol and Challenge entity types, schema, and validation | **Complete (Phase 1)** |
| `src/challenge/` | Challenge lifecycle, state transitions, participation and completion records | **Complete (Phase 1)** |
| `src/analytics/` | Contributor analytics pipeline | **Complete (Phase 2)** |
| `src/simulation/` | Synthetic simulation environment | **Complete (Phase 1)** |
| `src/api/` | External API layer with fail-closed runtime and identity boundary | **Complete (Phase 4)** |
| `src/db/` | Tenant-isolated persistence layer — Prisma schema, repository interfaces, and implementations | **Complete (Phase 4)** |

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
| `src/analytics/types.ts` | TypeScript types: DataOrigin, ExclusionStatus, ExclusionReason enums; ContributorRecord, CohortMetrics, AnalyticsPipelineResult, ProtocolCohortSegment, ProtocolSegmentReport, validation result types plus structural signal/scoring/aggregation types |
| `src/analytics/schema.ts` | Field-level constraint schema; ADHERENCE_EXCLUSION_THRESHOLD constant |
| `src/analytics/validation.ts` | validateContributorRecord() and validateContributorRecordCollection() enforcing LOCK-003 rules |
| `src/analytics/pipeline.ts` | filterAnalyticsEligible(), aggregateCohortMetrics(), runAnalyticsPipeline(), segmentByProtocol(), runProtocolSegmentPipeline() — structural aggregation and per-protocol segmentation (M-004 boundary respected) |
| `src/analytics/signals.ts` | Structural observable signal extraction from analytics-eligible contributor records |
| `src/analytics/scoring.ts` | Structural scoring primitives for protocol effectiveness, blend co-occurrence, and contributor reliability |
| `src/analytics/aggregator.ts` | Contributor/protocol aggregation and normalization utilities |
| `src/analytics/index.ts` | Public module interface |
| `src/analytics/__tests__/analytics.test.ts` | Contributor analytics validation, pipeline, and segmentation tests |
| `src/analytics/__tests__/signals.test.ts` | Unit tests for structural signal extraction |
| `src/analytics/__tests__/scoring.test.ts` | Unit tests for structural scoring utilities |
| `src/analytics/__tests__/aggregator.test.ts` | Unit tests for aggregation utilities |

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
| `src/api/server.ts` | Express application factory (`createApp`); validates runtime config, constructs trusted identity dependencies, and mounts routes |
| `src/api/runtime.ts` | Explicit runtime/storage/authentication configuration with staging/production fail-closed invariants |
| `src/api/types.ts` | Shared API response envelope types: ApiSuccessResponse, ApiErrorResponse, HealthPayload, ProtocolSummary, ProtocolDetail, AnalyticsProtocolsPayload, AnalyticsProtocolDetailPayload |
| `src/api/index.ts` | Public module interface |
| `src/api/security/identity.ts` | RS256 JWT verification and bounded, throttled remote JWKS provider |
| `src/api/security/middleware.ts` | Authentication, permission, and verified tenant-context middleware |
| `src/api/routes/health.ts` | GET /health and GET /health/ready route definitions |
| `src/api/routes/protocols.ts` | Protected GET /protocols and GET /protocols/:id route definitions |
| `src/api/routes/analytics.ts` | Protected GET /analytics/protocols and GET /analytics/protocols/:id route definitions |
| `src/api/controllers/healthController.ts` | Liveness and readiness handlers |
| `src/api/controllers/protocolController.ts` | Tenant-aware protocol list and detail handlers |
| `src/api/controllers/protocolStore.ts` | Tenant-local in-memory protocol registry for development/test |
| `src/api/controllers/analyticsController.ts` | Tenant-aware analytics handlers |
| `src/api/controllers/analyticsStore.ts` | Tenant-local in-memory contributor registry satisfying LOCK-003 |
| `src/api/services/protocolService.ts` | Service layer for protocol read operations; maps repository domain objects to API payloads |
| `src/api/services/analyticsService.ts` | Service layer for analytics read operations; fetches tenant-scoped contributors and runs segmentation pipeline |
| `src/api/middleware/errorHandler.ts` | Global Express error-handling middleware; ValidationError (400), NotFoundError (404), fallback (500) |
| `src/api/middleware/validateId.ts` | Path parameter validation middleware — enforces canonical identifier format |
| `src/api/__tests__/api.test.ts` | Integration tests for public and product endpoints |
| `src/api/__tests__/authorization.test.ts` | Authentication, permission, tenant-matching, and memory-isolation integration tests |
| `src/api/__tests__/runtime.test.ts` | Runtime configuration and safe diagnostics tests |
| `src/api/__tests__/readiness.test.ts` | Liveness, readiness, and forged configuration tests |
| `src/api/security/__tests__/identity.test.ts` | Cryptographic JWT verification tests |
| `src/api/security/__tests__/jwksProvider.test.ts` | JWKS bounds, classification, and refresh-throttling tests |

---

### /src/db — Files (Phase 4)

| File | Description |
|------|-------------|
| `src/db/types.ts` | Shared persistence types: PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode |
| `src/db/tenant.ts` | Canonical tenant identifier validation and explicit local/test tenant constant |
| `src/db/client.ts` | Prisma client singleton factory (`getPrismaClient`) |
| `src/db/mappers.ts` | Bidirectional mappers between Prisma enum/model types and domain types |
| `src/db/repositories/contributorRepository.ts` | IContributorRepository interface; CreateContributorInput, UpdateContributorInput types |
| `src/db/repositories/protocolRepository.ts` | IProtocolRepository interface; CreateProtocolInput, UpdateProtocolInput types |
| `src/db/repositories/challengeRepository.ts` | IChallengeRepository interface; CreateChallengeInput, UpdateChallengeInput types |
| `src/db/repositories/blendRepository.ts` | IBlendRepository interface; CreateBlendInput, UpdateBlendInput types |
| `src/db/repositories/outcomeLogRepository.ts` | IOutcomeLogRepository interface; OutcomeLog, CreateOutcomeLogInput types |
| `src/db/implementations/PrismaContributorRepository.ts` | Tenant-bound Prisma implementation of IContributorRepository |
| `src/db/implementations/PrismaProtocolRepository.ts` | Tenant-bound Prisma implementation of IProtocolRepository |
| `src/db/implementations/PrismaChallengeRepository.ts` | Tenant-bound Prisma implementation of IChallengeRepository |
| `src/db/implementations/PrismaBlendRepository.ts` | Prisma implementation for the intentionally global curated Blend catalog |
| `src/db/implementations/PrismaOutcomeLogRepository.ts` | Tenant-bound Prisma implementation of IOutcomeLogRepository |
| `src/db/index.ts` | Public module interface for the persistence layer |
| `src/db/__tests__/repositories.test.ts` | Unit tests for Prisma repository implementations |

---

### /prisma — Files

| File | Description |
|------|-------------|
| `prisma/schema.prisma` | Canonical Prisma schema with tenant keys on user-owned models and tenant-matched relations |
| `prisma/migrations/20260502120000_init/migration.sql` | Initial PostgreSQL schema migration |
| `prisma/migrations/20260803073000_add_tenant_scope/migration.sql` | Tenant-boundary migration for user-owned data |
| `prisma/seed.ts` | Idempotent, tenant-scoped local/test seed and committed-state verification |
| `prisma.config.ts` | Prisma 7 configuration — datasource URL from `DATABASE_URL` |
| `.env.example` | Placeholder environment variable file; actual `.env` is git-ignored |

---

## Canonical Package

| File | Description |
|------|-------------|
| `phyto_ai_architecture_v11_CANONICAL.zip` | v11 canonical architecture package (reference only) |

---

## Notes

- Files marked ✅ in the Locked column correspond to decisions in `docs/ARCHITECTURE_LOCK.md`.
- Agents must not create new top-level files or modules without updating this index.
- Structural changes require an accepted ADR and corresponding index update.
