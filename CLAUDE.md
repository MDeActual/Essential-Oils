# CLAUDE.md — Phyto.ai AI Agent Instructions

## Project Identity

**Phyto.ai** is a community-driven AI-native natural health discovery platform.

Build it as:
- a structured protocol experimentation and discovery network
- a contributor-powered evidence engine for natural remedies
- a challenge-driven community with strong data integrity

Do **not** build it as:
- a generic wellness tracker
- a supplement-first storefront
- an unmoderated social forum
- a thin AI wrapper

---

## Mandatory First-Read Sequence

Before any implementation work, read in order:
1. `docs/ARCHITECTURE_INDEX.md`
2. `docs/DOMAIN_MODEL.md`
3. `docs/ARCHITECTURE_LOCK.md`
4. The canonical package at `phyto_ai_architecture_v11_CANONICAL.zip` → `docs/00_START_HERE.md`

---

## Build Priority Order

Always implement in this order:
1. Trust and privacy
2. Data integrity
3. Protocol engine
4. Challenge engine
5. Contributor workflows
6. Discovery outputs
7. Reputation and quality systems
8. Growth systems
9. Monetization layers

---

## Architecture Authority

The `/docs` folder in this repository is the **architecture control layer**. Files here are authoritative.

When conflicts arise between files:
- `ARCHITECTURE_LOCK.md` is absolute — locked decisions cannot be overridden
- `DOMAIN_MODEL.md` governs entity definitions and relationships
- `database_schema_v6_complete.md` wins for persistence structure
- `api_contracts_v5_complete.md` wins for service contracts
- `natural_remedy_ontology.md` wins for remedy semantics
- `phyto_ai_full_blueprint_v7_complete.md` wins for overall architecture intent

---

## Data Integrity — Non-Negotiable Rules

Every analytics-eligible contributor-linked record **must** include:
- `data_origin`: one of `real_contributor`, `synthetic`, `internal_test`
- `exclusion_status`: one of `allowed_in_production_insights`, `excluded_from_production_insights`
- `adherence_percentage`: numeric 0–100

Enforcement:
- Only `data_origin = real_contributor` may appear in production discovery surfaces
- `adherence_percentage < 50` → exclude from scoring entirely
- `adherence_percentage 50–70` → down-weight (low confidence)
- `adherence_percentage >= 70` → full weight

Never allow synthetic or test data to reach:
- production discovery feed
- public challenge result summaries
- public protocol scores
- research exports labeled as real-world evidence

---

## Required System Components

All six subsystems must be accounted for in any architecture-level work:
1. **Protocol Engine** — generates, stores, and evolves structured protocols
2. **Challenge Engine** — wraps protocols in time-bound community participation
3. **Contributor Reputation System** — scores contributors based on adherence, completion, and community behavior
4. **Protocol Intelligence System** — scores, ranks, and evolves protocols based on real-world outcomes
5. **Natural Remedy Ontology** — canonical knowledge graph of remedies, mechanisms, routes, and roles
6. **Geospatial Insight Layer** — anonymized regional protocol-response analytics

---

## Engineering Rules

- Use typed contracts
- Use migration-based schema evolution
- Use feature flags for risky or incomplete features
- Provide deterministic fallbacks when AI is unavailable
- Log all critical events: protocol generation, challenge joins, challenge completions, outcome submissions, reputation recalculations, geospatial resolutions, exclusion validations
- No debug bypasses in production code paths
- No hidden production shortcuts

---

## What NOT To Do

- Do not implement a subsystem before its upstream dependencies are confirmed
- Do not invent product-critical behavior when a spec is missing — propose an addition and update the authoritative doc first
- Do not mix multiple versions of the same document family — always use the latest version
- Do not write implementation code before architecture docs are settled
- Do not allow any synthetic data to bypass the exclusion pipeline
- Do not persist raw GPS coordinates in discovery-facing analytics

---

## Commit Convention

- Architecture-only changes: prefix `docs: `
- Schema changes: prefix `schema: `
- Feature work: prefix `feat(<subsystem>): `
- Fixes: prefix `fix(<subsystem>): `

## References

- Canonical architecture package: `phyto_ai_architecture_v11_CANONICAL.zip`
- Architecture control layer: `/docs/`
- Agent swarm instructions: `AGENTS.md`
- Swarm staged prompt: `SWARM_PROMPT_STAGED.md`
