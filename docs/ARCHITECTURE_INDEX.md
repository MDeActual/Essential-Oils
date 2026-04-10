# ARCHITECTURE_INDEX.md — Phyto.ai Architecture Control Layer

## Purpose

This file is the master index of the Phyto.ai architecture control layer. It defines which documents are authoritative, how to read them, and how they relate to each other.

---

## Authority Hierarchy

Documents are listed in descending authority order. When conflicts arise, the higher-ranked document wins for its domain.

| Priority | Document | Domain Authority |
|----------|----------|-----------------|
| 1 | `ARCHITECTURE_LOCK.md` | Immutable decisions |
| 2 | `DOMAIN_MODEL.md` | Entity definitions and relationships |
| 3 | `ARCHITECTURE_DECISION_LOG.md` | Architecture decision rationale |
| 4 | Canonical package: `database_schema_v6_complete.md` | Persistence structure |
| 5 | Canonical package: `api_contracts_v5_complete.md` | Service contracts |
| 6 | Canonical package: `ui_screen_map_v5_complete.md` | Screen scope and flow |
| 7 | Canonical package: `protocol_library_v3_final.md` | Protocol content and variants |
| 8 | `natural_remedy_ontology.md` | Remedy semantics |
| 9 | Canonical package: `phyto_ai_full_blueprint_v7_complete.md` | Architecture intent |
| 10 | `MOAT_MODEL.md` | Competitive positioning |
| 11 | Subsystem docs (reputation, geospatial, scoring, etc.) | Subsystem behavior |

---

## Architecture Control Layer Files (this repository `/docs`)

| File | Purpose |
|------|---------|
| `ARCHITECTURE_INDEX.md` | This file — master map of all architecture documents |
| `ARCHITECTURE_LOCK.md` | Immutable architectural decisions |
| `ARCHITECTURE_DECISION_LOG.md` | Log of all significant architecture decisions (ADRs) |
| `DOMAIN_MODEL.md` | Canonical domain entities, relationships, and data integrity rules |
| `MOAT_MODEL.md` | Platform moat analysis and defensibility strategy |
| `autonomous_iteration_protocol.md` | Rules for autonomous agent iteration and swarm execution |

---

## Canonical Package Documents (in `phyto_ai_architecture_v11_CANONICAL.zip`)

| File | Purpose |
|------|---------|
| `docs/00_START_HERE.md` | Mandatory swarm entrypoint |
| `docs/SWARM_BOOT_FILE.md` | Full swarm boot sequence |
| `docs/orchestrator_reading_order.md` | Document reading sequence for orchestrators |
| `docs/authority_rules.md` | Conflict resolution rules |
| `docs/swarm_rules.md` | Governance and operating constraints |
| `docs/DependencyGraph.md` | Subsystem dependency graph |
| `docs/build_order_roadmap.md` | Phased build roadmap |
| `docs/system_architecture_diagram.md` | Mermaid system diagrams |
| `docs/phyto_ai_full_blueprint_v7_complete.md` | Full platform blueprint |
| `docs/phyto_ai_master_index_v7_complete.md` | Master document index |
| `docs/database_schema_v6_complete.md` | Database schema |
| `docs/api_contracts_v5_complete.md` | API contracts |
| `docs/ui_screen_map_v5_complete.md` | UI screen map |
| `docs/protocol_library_v3_final.md` | Protocol library |
| `docs/protocol_scoring_system.md` | Protocol scoring logic |
| `docs/ai_native_features.md` | AI feature specifications |
| `docs/reputation_system.md` | Contributor reputation system |
| `docs/feedback_system.md` | Feedback system |
| `docs/pricing_model.md` | Pricing and monetization model |
| `docs/geospatial_data_layer.md` | Geospatial privacy and analytics |
| `docs/founder_dashboard_spec_v2.md` | Founder dashboard specification |
| `docs/agent_swarm_tasks_v6_complete.md` | Agent task assignments |
| `docs/iac_swarm_instruction.md` | Infrastructure-as-code swarm instructions |
| `docs/secrets_and_env_spec.md` | Environment variable and secrets specification |

---

## Six Core Subsystems

All implementation work must address these six subsystems:

| # | Subsystem | Key Document(s) |
|---|-----------|----------------|
| 1 | Protocol Engine | `protocol_library_v3_final.md`, `DOMAIN_MODEL.md` |
| 2 | Challenge Engine | `phyto_ai_full_blueprint_v7_complete.md`, `DOMAIN_MODEL.md` |
| 3 | Contributor Reputation System | `reputation_system.md`, `DOMAIN_MODEL.md` |
| 4 | Protocol Intelligence System | `protocol_scoring_system.md`, `DOMAIN_MODEL.md` |
| 5 | Natural Remedy Ontology | `natural_remedy_ontology.md`, `protocol_library_v3_final.md` |
| 6 | Geospatial Insight Layer | `geospatial_data_layer.md`, `DOMAIN_MODEL.md` |

---

## Data Integrity Mandatory Fields

Every analytics-eligible contributor-linked record must carry:

| Field | Type | Required Values |
|-------|------|----------------|
| `data_origin` | enum | `real_contributor`, `synthetic`, `internal_test` |
| `exclusion_status` | enum | `allowed_in_production_insights`, `excluded_from_production_insights` |
| `adherence_percentage` | number 0–100 | Determines scoring weight |

---

## Version Rule

Always use the highest-versioned document in a family. Do not mix versions.

---

## Change Rule

Changes to any document in this index require:
1. An entry in `ARCHITECTURE_DECISION_LOG.md`
2. If the change locks a decision, an entry in `ARCHITECTURE_LOCK.md`
3. Human review before merge if the change affects a locked decision
