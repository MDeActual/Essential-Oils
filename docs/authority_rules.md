# Authority Rules — Phyto.ai

Purpose:
Resolve ambiguity about which files are authoritative and what to do when documents overlap or conflict.

---

# 1. Authority Hierarchy

Use this hierarchy in order:

1. `00_START_HERE.md`
2. `phyto_ai_master_index_v7_complete.md`
3. `build_order_roadmap.md`
4. `phyto_ai_full_blueprint_v7_complete.md`
5. `system_architecture_diagram.md`
6. `database_schema_v6_complete.md`
7. `api_contracts_v5_complete.md`
8. `ui_screen_map_v5_complete.md`
9. `protocol_library_v3_final.md`
10. `natural_remedy_ontology.md`
11. subsystem docs (challenge, scoring, reputation, feedback, pricing, geospatial, etc.)

---

# 2. Conflict Resolution Rules

If two files conflict:
- `database_schema_*` wins for database fields and persistence structure
- `api_contracts_*` wins for endpoint shape and service contracts
- `ui_screen_map_*` wins for screen scope and flow
- `protocol_library_*` wins for protocol content and variants
- `natural_remedy_ontology.md` wins for remedy classes, mechanisms, roles, and routes
- `phyto_ai_full_blueprint_*` wins for architecture intent and product identity

---

# 3. Latest Version Rule

If multiple versions of the same file family exist:
- use the highest version number only
- ignore lower versions
- do not merge multiple versions unless explicitly instructed

---

# 4. Canonical Snapshot Rule

Treat the latest FULL package as the canonical architecture snapshot.

Inside a canonical package:
- prefer latest docs only
- ignore historical duplicates if present
- use the master index to identify authoritative files

---

# 5. Missing Information Rule

If a needed detail is missing:
- do not silently invent product-critical behavior
- propose a documented addition
- update the affected authoritative file(s)
- then implement

---

# 6. Architecture Change Rule

If a change affects:
- architecture → update blueprint
- data model → update schema
- service contracts → update API contracts
- UX → update UI screen map
- protocols → update protocol library
- remedy semantics → update ontology
- execution ownership → update agent swarm tasks

---

# 7. Integrity Rule

No file may override:
- synthetic-data exclusion rules
- geospatial anonymization rules
- trust and privacy rules
- production-safe evidence rules