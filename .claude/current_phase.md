# current_phase.md — Phyto.ai Build Phase Tracker

## Current Phase

**Phase 0 — Architecture Control Layer**  
**Status:** In Progress  
**Started:** 2026-04-10  

---

## Phase Definition

### Phase 0: Architecture Control Layer ← CURRENT

**Objective:** Establish the authoritative architecture documents, governance rules, domain model, and agent swarm infrastructure before any implementation begins.

**Deliverables:**
- [x] `CLAUDE.md` — AI agent operating instructions
- [x] `AGENTS.md` — Agent registry and task assignments
- [x] `docs/ARCHITECTURE_INDEX.md` — Master document map
- [x] `docs/ARCHITECTURE_LOCK.md` — Immutable decisions (11 locks established)
- [x] `docs/ARCHITECTURE_DECISION_LOG.md` — ADR history (7 ADRs logged)
- [x] `docs/DOMAIN_MODEL.md` — Canonical entity model with all 6 subsystems
- [x] `docs/MOAT_MODEL.md` — Defensibility strategy
- [x] `docs/autonomous_iteration_protocol.md` — Agent iteration rules
- [x] `/.claude/project_context.md` — Project context summary
- [x] `SWARM_PROMPT_STAGED.md` — Staged swarm bootstrap prompt
- [ ] `natural_remedy_ontology.md` — Natural remedy knowledge graph (pending)
- [ ] Technology stack decision recorded in ADR log (pending)

**Exit Criteria:**
- All architecture documents are in place
- All six subsystems have architectural specifications
- Domain model covers all required entities and integrity rules
- Agent swarm can boot from `CLAUDE.md` and execute against specs

---

### Phase 1: Schema and Contracts (Next)

**Objective:** Produce confirmed database schema, API contracts, and subsystem specifications from the canonical package.

**Key Tasks:**
- Extract and validate `database_schema_v6_complete.md` against `DOMAIN_MODEL.md`
- Reconcile `api_contracts_v5_complete.md` with current entity model
- Confirm `natural_remedy_ontology.md` coverage
- Complete `challenge_engine_specification.md` (currently missing from canonical package per memory)
- Technology stack decision ADR

**Exit Criteria:**
- Schema Agent has confirmed all entities with mandatory integrity fields
- API Agent has confirmed all service contracts
- No missing upstream specifications for any of the six subsystems

---

### Phase 2: Core Infrastructure

**Objective:** Implement foundational infrastructure — authentication, database, feature flags, logging.

**Priority:** Trust and privacy first; data integrity second.

**Key Tasks:**
- Authentication / Identity system
- Migration-based schema setup with integrity field enforcement
- Feature flag system
- Critical event logging infrastructure
- Synthetic data exclusion pipeline
- Environment variable configuration

**Exit Criteria:**
- A contributor can create an account
- Data integrity fields are enforced at the database level
- Critical events are logged
- Synthetic data is excluded from production surfaces

---

### Phase 3: Protocol Engine

**Objective:** Implement structured protocol generation, storage, and display.

**Key Tasks:**
- Protocol DSL implementation
- Protocol library integration
- Natural remedy ontology integration
- Protocol instruction layer (method, timing, quantity, effort, safety)
- Protocol timer

**Exit Criteria:**
- A contributor can view a structured protocol
- Every protocol step resolves to method + timing + quantity + effort + safety note

---

### Phase 4: Challenge Engine

**Objective:** Implement challenge lifecycle and participation flows.

**Key Tasks:**
- Challenge creation and management
- Challenge join flow with data integrity field assignment
- Daily signal collection during challenge
- Challenge completion computation
- Result summary generation (excluding synthetic data)

**Exit Criteria:**
- A contributor can join a challenge, follow the protocol, log daily signals, and complete with an outcome report
- Challenge result summaries contain only `real_contributor` data

---

### Phase 5: Contributor Workflows and Reputation

**Objective:** Implement contributor dashboard, reputation scoring, and geospatial consent.

**Key Tasks:**
- Contributor dashboard
- Reputation scoring pipeline (adherence, completion, reporting, consistency, community, integrity)
- Geospatial opt-in consent flow
- Geospatial coordinate → region conversion
- Minimum sample size enforcement

**Exit Criteria:**
- Reputation scores are computed and influence protocol scoring weights
- Geospatial data is collected, anonymized, and stored correctly

---

### Phase 6: Discovery and Protocol Intelligence

**Objective:** Implement discovery feed, protocol scoring, and protocol intelligence outputs.

**Key Tasks:**
- Protocol scoring pipeline with adherence thresholds
- Protocol leaderboard
- AI pattern detection on real-contributor data
- Discovery feed generation
- Regional insight surfaces (with minimum sample enforcement)

**Exit Criteria:**
- Discovery feed shows only real-contributor-derived insights
- Protocol scores are weighted by adherence and reputation
- Regional insights respect minimum sample size

---

### Phase 7: Reputation Quality Systems and Founder Dashboard

**Objective:** Implement advanced reputation features, anomaly detection, and the operator control panel.

**Key Tasks:**
- Reputation anomaly flagging
- Community helpfulness scoring
- Practitioner reputation
- Founder dashboard KPIs

---

### Phase 8–9: Growth and Monetization (Future)

**Objective:** Premium features, practitioner memberships, research exports.

**Gate:** Phases 1–7 must be complete and stable before beginning.

---

## Phase Change Protocol

To advance to the next phase:
1. Verify all exit criteria for the current phase are met
2. Add an ADR entry in `docs/ARCHITECTURE_DECISION_LOG.md` documenting the phase transition
3. Update this file with the new current phase and status
4. Human review required before advancing from Phase 0 → Phase 1
