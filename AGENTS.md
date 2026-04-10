# AGENTS.md — Phyto.ai Agent Swarm Registry

## Purpose

This file defines all autonomous and semi-autonomous agents that operate within the Phyto.ai build swarm. Each agent has a declared scope, authority level, and dependency set.

---

## Governance Rules

- All agents must read `CLAUDE.md` before any task execution
- All agents must respect `docs/ARCHITECTURE_LOCK.md` — locked decisions are immutable
- No agent may implement a subsystem before its upstream dependencies are confirmed
- No agent may modify `ARCHITECTURE_LOCK.md` or `ARCHITECTURE_DECISION_LOG.md` without human approval
- Agents working on data pipelines must enforce `data_origin`, `exclusion_status`, and `adherence_percentage` on every record they produce or transform

---

## Agent Registry

### 1. Orchestrator Agent
**Role:** Coordinates swarm execution order and resolves inter-agent dependencies  
**Authority:** High — may pause, reprioritize, or reroute other agents  
**Reads:** All architecture docs in order defined by `docs/autonomous_iteration_protocol.md`  
**Must not:** Override `ARCHITECTURE_LOCK.md` entries  

---

### 2. Schema Agent
**Role:** Owns database schema design and migration files  
**Authority:** High for persistence structure  
**Reads:** `database_schema_v6_complete.md`, `DOMAIN_MODEL.md`  
**Produces:** Migration files, schema diff reports  
**Must not:** Add fields that bypass `data_origin` or `exclusion_status` requirements  

---

### 3. Protocol Engine Agent
**Role:** Designs and implements the protocol generation engine  
**Authority:** Medium — defers to Schema Agent for persistence  
**Reads:** `protocol_library_v3_final.md`, `protocol_scoring_system.md`, `DOMAIN_MODEL.md`  
**Produces:** Protocol DSL spec, protocol storage model, protocol generation logic  
**Depends on:** Schema Agent, Ontology Agent  

---

### 4. Challenge Engine Agent
**Role:** Implements the challenge lifecycle (creation, join, tracking, completion)  
**Authority:** Medium  
**Reads:** `phyto_ai_full_blueprint_v7_complete.md`, `DOMAIN_MODEL.md`, challenge specs  
**Produces:** Challenge data model, challenge state machine, challenge participation flows  
**Depends on:** Protocol Engine Agent, Schema Agent  

---

### 5. Reputation Agent
**Role:** Designs and implements contributor and practitioner reputation scoring  
**Authority:** Medium  
**Reads:** `reputation_system.md`, `swarm_rules.md`, `DOMAIN_MODEL.md`  
**Produces:** Reputation score model, scoring pipeline, reputation audit log  
**Depends on:** Schema Agent, Challenge Engine Agent  

---

### 6. Protocol Intelligence Agent
**Role:** Implements protocol scoring, ranking, and evolution  
**Authority:** Medium  
**Reads:** `protocol_scoring_system.md`, `DOMAIN_MODEL.md`  
**Produces:** Protocol scoring pipeline, leaderboard outputs, evolution trigger logic  
**Depends on:** Protocol Engine Agent, Reputation Agent, Schema Agent  
**Integrity constraint:** Must apply `adherence_percentage` and `exclusion_status` filters before scoring  

---

### 7. Ontology Agent
**Role:** Maintains and extends the Natural Remedy Ontology knowledge graph  
**Authority:** High for remedy semantics  
**Reads:** `natural_remedy_ontology.md`, `protocol_library_v3_final.md`  
**Produces:** Ontology definitions, graph node/edge specs, ontology diff reports  
**Must not:** Add remedy mechanisms without source citations  

---

### 8. Geospatial Agent
**Role:** Implements the geospatial insight layer  
**Authority:** Medium  
**Reads:** `geospatial_data_layer.md`, `swarm_rules.md`, `DOMAIN_MODEL.md`  
**Produces:** Region resolution logic, geospatial storage model, anonymized summary pipeline  
**Privacy constraint:** Must never persist raw GPS coordinates; must enforce opt-in consent  
**Depends on:** Schema Agent  

---

### 9. API Agent
**Role:** Designs and documents API contracts across all subsystems  
**Authority:** High for service contracts  
**Reads:** `api_contracts_v5_complete.md`, `DOMAIN_MODEL.md`  
**Produces:** OpenAPI specs, contract test stubs, API changelog  
**Depends on:** Schema Agent  

---

### 10. Integrity Validation Agent
**Role:** Enforces data integrity rules across all pipeline outputs  
**Authority:** High for data correctness  
**Reads:** `swarm_rules.md`, `ARCHITECTURE_LOCK.md`, `DOMAIN_MODEL.md`  
**Produces:** Validation reports, exclusion logs, integrity audit records  
**Must not:** Allow synthetic data to reach production surfaces  
**Depends on:** All data-producing agents  

---

### 11. Founder Dashboard Agent
**Role:** Implements the operator control panel and KPI surfaces  
**Authority:** Low — consumer of other subsystems  
**Reads:** `founder_dashboard_spec_v2.md`, `DOMAIN_MODEL.md`  
**Produces:** Dashboard data models, KPI pipeline specs  
**Depends on:** All subsystem agents  

---

### 12. Synthetic Data Agent
**Role:** Generates synthetic contributor and protocol data for testing  
**Authority:** Low — test infrastructure only  
**Reads:** `swarm_rules.md`, `DOMAIN_MODEL.md`  
**Produces:** Synthetic datasets with `data_origin = synthetic`, fixture generators  
**Must not:** Produce synthetic records that can reach production insights  

---

## Agent Execution Order

```
Orchestrator
  └─ Ontology Agent
  └─ Schema Agent
       └─ Protocol Engine Agent
            └─ Challenge Engine Agent
                 └─ Reputation Agent
                      └─ Protocol Intelligence Agent
       └─ Geospatial Agent
       └─ API Agent
  └─ Integrity Validation Agent (runs in parallel with all data-producing agents)
  └─ Synthetic Data Agent (test environment only)
  └─ Founder Dashboard Agent (last — depends on all others)
```

---

## Cross-Cutting Constraints (All Agents)

Every agent that touches contributor-linked data must:
1. Attach `data_origin` to every record produced
2. Set `exclusion_status` based on `data_origin` and context
3. Record `adherence_percentage` for any protocol-run-linked record
4. Log the action to the critical event log

Geospatial data:
- Convert coordinates to coarse region before storage
- Discard raw coordinates immediately after conversion
- Respect the `MIN_REGION_SAMPLE_SIZE=30` threshold before surfacing insights

---

## References

- Architecture authority: `docs/ARCHITECTURE_LOCK.md`
- Domain model: `docs/DOMAIN_MODEL.md`
- Swarm rules: canonical package → `docs/swarm_rules.md`
- Staged swarm prompt: `SWARM_PROMPT_STAGED.md`
