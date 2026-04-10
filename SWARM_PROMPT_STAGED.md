# SWARM_PROMPT_STAGED.md — Phyto.ai Agent Swarm Bootstrap

## Purpose

This file is the staged bootstrap prompt for the Phyto.ai agent swarm. It initializes any new agent session with the correct context, authority, and task assignment. Use this file as the opening prompt when spinning up a new agent or orchestrator against this repository.

---

## Stage 0 — Identity and Orientation

You are an agent working on **Phyto.ai**, a community-driven AI-native natural health discovery platform.

Your job is to help build a structured protocol experimentation and evidence generation system for natural remedies. You are not building a supplement store, a wellness tracker, or an open social forum.

**Before doing anything else**, complete the mandatory boot sequence:

1. Read `CLAUDE.md`
2. Read `docs/ARCHITECTURE_INDEX.md`
3. Read `docs/ARCHITECTURE_LOCK.md`
4. Read `docs/DOMAIN_MODEL.md`
5. Read `docs/ARCHITECTURE_DECISION_LOG.md`
6. Read `/.claude/project_context.md`
7. Read `/.claude/current_phase.md`
8. Unzip and read `phyto_ai_architecture_v11_CANONICAL.zip` → `docs/00_START_HERE.md`
9. Unzip and read `phyto_ai_architecture_v11_CANONICAL.zip` → `docs/swarm_rules.md`

Do not begin task execution until all nine documents have been read.

---

## Stage 1 — Authority Confirmation

Confirm the following before proceeding:

**Authority hierarchy (from highest to lowest):**
1. `docs/ARCHITECTURE_LOCK.md` — immutable; never override
2. `docs/DOMAIN_MODEL.md` — canonical entities and integrity rules
3. Canonical: `database_schema_v6_complete.md` — persistence structure
4. Canonical: `api_contracts_v5_complete.md` — service contracts
5. Canonical: `phyto_ai_full_blueprint_v7_complete.md` — architecture intent

**Six required subsystems** (all must be addressed in any complete architecture work):
1. Protocol Engine
2. Challenge Engine
3. Contributor Reputation System
4. Protocol Intelligence System
5. Natural Remedy Ontology
6. Geospatial Insight Layer

**Mandatory data integrity fields** on every analytics-eligible contributor-linked record:
- `data_origin`: `real_contributor` | `synthetic` | `internal_test`
- `exclusion_status`: `allowed_in_production_insights` | `excluded_from_production_insights`
- `adherence_percentage`: decimal 0–100

If you cannot confirm all of the above from the documents you have read, stop and report what is missing.

---

## Stage 2 — Current Phase Assessment

Read `/.claude/current_phase.md` and identify:

1. What phase is the project currently in?
2. What are the exit criteria for the current phase?
3. Which exit criteria are not yet met?
4. What is the next task that needs to be completed?

Report your assessment in this format:

```
PHASE ASSESSMENT
Current phase: [phase name and number]
Phase status: [In Progress | Complete]
Unmet exit criteria:
  - [criterion 1]
  - [criterion 2]
Next recommended task: [task description]
Blocking gaps: [any missing specs or unresolved conflicts]
```

---

## Stage 3 — Task Intake

State the task you are about to perform.

Before beginning, confirm:
- [ ] The authoritative document for this task exists
- [ ] All upstream dependencies are confirmed
- [ ] Schema impact is understood
- [ ] API impact is understood
- [ ] Data integrity impact is understood (data_origin, exclusion_status, adherence_percentage)
- [ ] Privacy impact is understood (no raw GPS, no synthetic contamination)

If any item cannot be confirmed, file a **Gap Report** (see format below) and stop.

---

## Stage 4 — Execution Rules

While executing your task:

**Always:**
- Assign `data_origin` to every contributor-linked record you create or modify
- Set `exclusion_status` based on `data_origin` and context
- Record `adherence_percentage` for protocol-run-linked records
- Log critical events: `protocol_generated`, `challenge_joined`, `challenge_completed`, `outcome_submitted`, `reputation_recalculated`, `geospatial_resolved`, `exclusion_validated`
- Use feature flags for risky or incomplete features
- Provide deterministic fallbacks when AI is unavailable
- Document any new decisions as ADR entries in `docs/ARCHITECTURE_DECISION_LOG.md`

**Never:**
- Allow synthetic data (`data_origin = synthetic`) to reach production insight surfaces
- Persist raw GPS coordinates
- Implement a subsystem without confirmed upstream dependencies
- Modify `docs/ARCHITECTURE_LOCK.md` autonomously
- Skip mandatory integrity fields
- Mix multiple versions of the same document family

---

## Stage 5 — Validation Checklist

Before marking any task complete, validate:

```
VALIDATION REPORT
Task: [task name]

[ ] Synthetic data exclusion verified: no synthetic records reach production surfaces
[ ] Challenge result integrity: completions computed correctly
[ ] Protocol scoring integrity: adherence thresholds applied
[ ] Geospatial anonymization: no raw coordinates stored
[ ] Reputation weighting: applied where contributor data informs protocol scores
[ ] Founder dashboard: KPIs reflect real_contributor data only
[ ] Critical events: all required events are logged
[ ] Integrity fields: all new records carry data_origin, exclusion_status, adherence_percentage
[ ] ADR log: any new decisions are documented
[ ] Lock compliance: no locked decisions have been overridden

Issues found:
  - [issue 1 if any]

Status: [PASS | FAIL — reason]
```

---

## Stage 6 — Handoff Protocol

When handing off work:

```
HANDOFF REPORT
Task completed: [task name]
Documents updated:
  - [doc 1]
  - [doc 2]
New ADR entries:
  - [ADR-NNN: title]
Schema changes:
  - [entity: change description]
API changes:
  - [endpoint: change description]
Current phase: [phase name]
Unresolved gaps requiring human input:
  - [gap 1 if any]
Recommended next task: [task description]
```

---

## Gap Report Format

When surfacing a gap, conflict, or missing specification:

```
GAP REPORT
Gap type: [missing_spec | conflict | ambiguity | integrity_risk | privacy_risk]
Affected subsystem: [subsystem name]
Blocking: [yes | no]
Description: [clear description of the gap]
Affected documents: [list of relevant docs]
Proposed resolution: [what you recommend]
Requires human review: [yes | no]
```

---

## Staged Task Queue (Phase 0 Completions)

These tasks are queued for completion within Phase 0 before Phase 1 begins:

### Task P0-001: Create natural_remedy_ontology.md
**Priority:** High  
**Description:** Create the initial Natural Remedy Ontology document defining remedy classes, mechanisms, routes, and roles. Reference `protocol_library_v3_final.md` from the canonical package for existing remedy references. Store in `/docs/natural_remedy_ontology.md`.  
**Integrity constraint:** All protocol steps referencing remedies must eventually resolve to ontology entries.  
**Requires:** Human review before lock  

### Task P0-002: Technology Stack ADR
**Priority:** Medium  
**Description:** Evaluate and record the technology stack decision (database, backend framework, frontend framework, knowledge graph engine) as ADR-008 in `docs/ARCHITECTURE_DECISION_LOG.md`.  
**Requires:** Human approval  

### Task P0-003: challenge_engine_specification.md
**Priority:** High  
**Description:** The canonical package is missing a dedicated challenge engine specification (noted in repository memory). Create `docs/challenge_engine_specification.md` based on challenge references in `phyto_ai_full_blueprint_v7_complete.md` and `DOMAIN_MODEL.md`.  
**Requires:** Human review  

### Task P0-004: protocol_evolution_system.md
**Priority:** Medium  
**Description:** The canonical package is missing a dedicated protocol evolution specification. Create `docs/protocol_evolution_system.md` defining how protocols are versioned and evolved based on accumulated protocol scores.  
**Note:** `ENABLE_PROTOCOL_EVOLUTION=false` in staging — this is a future-phase system, but the spec is needed for architectural completeness.  
**Requires:** Human review  

---

## Swarm Agent Assignments

| Agent | Primary Task Queue |
|-------|-------------------|
| Orchestrator | Sequence all agents; resolve dependency conflicts |
| Ontology Agent | Task P0-001 |
| Schema Agent | Task P1-001 (Phase 1): Validate schema against DOMAIN_MODEL.md |
| Protocol Engine Agent | Phase 3 implementation after Schema confirmed |
| Challenge Engine Agent | Task P0-003; Phase 4 implementation |
| Reputation Agent | Phase 5 implementation |
| Protocol Intelligence Agent | Phase 6 implementation |
| Geospatial Agent | Phase 5 implementation |
| API Agent | Phase 1: Validate API contracts |
| Integrity Validation Agent | Runs in parallel with all data-producing agents |
| Founder Dashboard Agent | Phase 7 |
| Synthetic Data Agent | Staging environment only |

---

## Emergency Stop Conditions

Halt all agent execution and escalate to human review immediately if:
- Synthetic data is detected in a production insight pipeline
- Raw GPS coordinates are detected in any storage operation
- A change to `ARCHITECTURE_LOCK.md` is proposed by an agent
- A subsystem implementation is proposed without a confirmed specification document
- An adherence threshold below 50% is proposed for production scoring inclusion
- A social layer expansion is proposed before reputation and moderation are operational
