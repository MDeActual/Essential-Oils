# autonomous_iteration_protocol.md — Phyto.ai

## Purpose

This document defines the rules, reading order, and operational constraints for any autonomous agent or agent swarm working on the Phyto.ai platform. It governs how agents boot, iterate, validate, and hand off work.

---

## Mandatory Boot Sequence

Every agent or orchestrator must execute this sequence before performing any task:

1. Read `CLAUDE.md` (agent operating rules)
2. Read `docs/ARCHITECTURE_INDEX.md` (document map)
3. Read `docs/ARCHITECTURE_LOCK.md` (immutable decisions)
4. Read `docs/DOMAIN_MODEL.md` (canonical entities and data integrity rules)
5. Read `docs/ARCHITECTURE_DECISION_LOG.md` (decision rationale)
6. Read canonical package → `docs/00_START_HERE.md`
7. Read canonical package → `docs/swarm_rules.md`
8. Read canonical package → `docs/authority_rules.md`
9. Read canonical package → `docs/orchestrator_reading_order.md`
10. Read canonical package → `docs/build_order_roadmap.md`

Only after completing this sequence may an agent begin task execution.

---

## Iteration Protocol

### Phase 0: Dependency Confirmation

Before beginning any subsystem task, confirm:
- [ ] Authoritative specification document exists for this subsystem
- [ ] All upstream dependencies have confirmed specifications
- [ ] Schema impact is understood and Schema Agent has been consulted
- [ ] API impact is understood and API Agent has been consulted
- [ ] Data integrity impact is understood (data_origin, exclusion_status, adherence_percentage)
- [ ] Privacy impact is understood (no raw GPS, no synthetic data in production surfaces)

If any confirmation is missing, **stop and surface the gap** — do not invent missing behavior.

---

### Phase 1: Specification

1. Identify the authoritative document(s) for the task
2. Resolve any conflicts using the authority hierarchy in `docs/ARCHITECTURE_INDEX.md`
3. Confirm all six required subsystems are addressed if the task touches core architecture
4. Document any new decisions as ADR entries in `docs/ARCHITECTURE_DECISION_LOG.md`
5. If a decision should be locked, add to `docs/ARCHITECTURE_LOCK.md` and flag for human review

---

### Phase 2: Design

1. Define entity changes against `docs/DOMAIN_MODEL.md`
2. Verify all new entities include mandatory integrity fields where applicable
3. Define API contract changes — defer to `api_contracts_v5_complete.md` for existing contracts
4. Define UI changes — defer to `ui_screen_map_v5_complete.md` for existing screens
5. Map the critical events that must be logged
6. Confirm privacy rules are satisfied (geospatial anonymization, opt-in consent)

---

### Phase 3: Implementation (When Authorized)

1. Implement in build priority order (trust/privacy → data integrity → protocol → challenge → reputation → discovery → growth → monetization)
2. Apply `data_origin`, `exclusion_status`, and `adherence_percentage` to every record created
3. Log all critical events
4. Use feature flags for risky or incomplete features
5. Provide deterministic fallbacks when AI components are unavailable
6. No debug bypasses in production code paths

---

### Phase 4: Validation

Before marking any task complete, validate:
- [ ] Synthetic data exclusion: synthetic records cannot reach production insight surfaces
- [ ] Challenge result integrity: challenge completions are correctly computed
- [ ] Protocol scoring integrity: adherence thresholds are applied
- [ ] Geospatial anonymization: no raw coordinates stored
- [ ] Reputation weighting: applied where protocol scores reference contributor data
- [ ] Founder dashboard correctness: KPIs reflect real_contributor data only
- [ ] Critical events are logged

---

### Phase 5: Handoff

When handing off to another agent or human reviewer:
1. List all documents updated (including any ADR entries added)
2. List all locked decisions added or modified
3. List all schema changes
4. List all API contract changes
5. State current build phase (see `/.claude/current_phase.md`)
6. Flag any unresolved gaps or ambiguities that require human input

---

## Agent Communication Protocol

When agents surface a gap (missing spec, conflict, or ambiguity):

```
GAP REPORT
- Gap type: [missing_spec | conflict | ambiguity | integrity_risk]
- Affected subsystem: [subsystem name]
- Blocking: [yes | no]
- Description: [what is missing or conflicting]
- Proposed resolution: [what the agent recommends]
- Requires human review: [yes | no]
```

Do not silently resolve product-critical gaps. Always surface them.

---

## Iteration Constraints

### Hard Constraints (Never Violate)

- Never allow synthetic data to reach production insight surfaces
- Never persist raw GPS coordinates
- Never implement a subsystem without confirmed upstream dependencies
- Never modify `ARCHITECTURE_LOCK.md` autonomously
- Never override the six required subsystems requirement
- Never skip mandatory integrity fields on contributor-linked records

### Soft Constraints (Use Judgment)

- Prefer lower friction over higher friction when two implementations are equivalent
- Prefer higher clarity for user-facing surfaces
- Prefer structured evidence over vague anecdotes
- Prefer repeatability in protocol definitions
- Prefer trust over speed when there is a conflict

---

## Feature Flag Rules

Use feature flags for:
- Any feature in stages 7–9 of the build priority (reputation+, growth, monetization)
- Any social layer expansion beyond challenge rooms, protocol Q&A, and discovery discussions
- External health integrations
- Research export surfaces
- Protocol evolution automation

Default feature flag states for staging:
```
ENABLE_SYNTHETIC_DATA=true
ENABLE_CHALLENGES=true
ENABLE_PROTOCOL_EVOLUTION=false
ENABLE_SOCIAL_LAYER=false
ENABLE_GEOSPATIAL_COLLECTION=false
ENABLE_PREMIUM_FEATURES=false
ENABLE_PRACTITIONER_TOOLS=false
ENABLE_RESEARCH_EXPORTS=false
ENABLE_EXTERNAL_HEALTH_INTEGRATIONS=false
ENABLE_REPUTATION_WEIGHTING=true
PRIVACY_MODE_STRICT=true
MIN_REGION_SAMPLE_SIZE=30
MIN_ADHERENCE_FOR_VALID_RUN=50
FULL_WEIGHT_ADHERENCE_THRESHOLD=70
```

---

## Document Reading Order (Full Sequence)

For complete context, agents working on complex cross-cutting tasks should read in this order:

**Tier 1 — Governance (required)**
1. `CLAUDE.md`
2. `docs/ARCHITECTURE_LOCK.md`
3. `docs/ARCHITECTURE_INDEX.md`
4. `docs/DOMAIN_MODEL.md`

**Tier 2 — Architecture Intent (required)**
5. Canonical: `docs/00_START_HERE.md`
6. Canonical: `docs/phyto_ai_master_index_v7_complete.md`
7. Canonical: `docs/build_order_roadmap.md`
8. Canonical: `docs/phyto_ai_full_blueprint_v7_complete.md`
9. Canonical: `docs/system_architecture_diagram.md`

**Tier 3 — Data and Contracts (required for implementation)**
10. Canonical: `docs/database_schema_v6_complete.md`
11. Canonical: `docs/api_contracts_v5_complete.md`

**Tier 4 — Subsystem Specs (read relevant ones)**
12. Canonical: `docs/protocol_library_v3_final.md`
13. `docs/DOMAIN_MODEL.md` → Remedy section + Ontology refs
14. Canonical: `docs/protocol_scoring_system.md`
15. Canonical: `docs/reputation_system.md`
16. Canonical: `docs/geospatial_data_layer.md`
17. Canonical: `docs/feedback_system.md`

**Tier 5 — Decision Context (for architecture-level work)**
18. `docs/ARCHITECTURE_DECISION_LOG.md`
19. `docs/MOAT_MODEL.md`

---

## Escalation Triggers

Immediately escalate to human review when:
- A proposed change would modify a LOCK entry
- A gap in specifications affects a data integrity rule
- Synthetic data risks reaching a production surface
- A geospatial change risks exposing individual contributor locations
- A protocol scoring change would alter the adherence threshold rules
- A social layer expansion is proposed before reputation and moderation are operational
