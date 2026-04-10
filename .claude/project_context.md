# project_context.md — Phyto.ai

## What This Project Is

**Phyto.ai** is a community-driven AI-native natural health discovery platform. It generates structured, integrity-validated evidence about natural remedy effectiveness through contributor protocol runs, challenge-based community engagement, and AI-powered pattern detection.

This is not:
- A supplement store
- A generic wellness tracker
- An open health forum
- A medical advice platform

---

## Repository Purpose

This repository is the **architecture control layer** for Phyto.ai. It does not contain implementation code yet. It contains:
- Governance documents for AI agents and human engineers
- The canonical domain model
- Locked architecture decisions
- The architecture decision log
- The platform moat model
- Agent swarm rules and iteration protocols

The canonical architecture package (`phyto_ai_architecture_v11_CANONICAL.zip`) contains the full v11 specification including database schema, API contracts, UI screen maps, and subsystem specs.

---

## Six Required Subsystems

| # | Subsystem | Status |
|---|-----------|--------|
| 1 | Protocol Engine | Architecture defined; implementation pending |
| 2 | Challenge Engine | Architecture defined; implementation pending |
| 3 | Contributor Reputation System | Architecture defined; implementation pending |
| 4 | Protocol Intelligence System | Architecture defined; implementation pending |
| 5 | Natural Remedy Ontology | Architecture defined; implementation pending |
| 6 | Geospatial Insight Layer | Architecture defined; implementation pending |

---

## Data Integrity Anchors

Every analytics-eligible contributor-linked record must carry:
- `data_origin`: `real_contributor` | `synthetic` | `internal_test`
- `exclusion_status`: `allowed_in_production_insights` | `excluded_from_production_insights`
- `adherence_percentage`: 0–100 (decimal)

These are non-negotiable. See `docs/ARCHITECTURE_LOCK.md` LOCK-002.

---

## Active Architecture Documents

| File | Role |
|------|------|
| `CLAUDE.md` | AI agent operating instructions |
| `AGENTS.md` | Agent registry and task assignments |
| `docs/ARCHITECTURE_INDEX.md` | Master document map |
| `docs/ARCHITECTURE_LOCK.md` | Immutable decisions |
| `docs/ARCHITECTURE_DECISION_LOG.md` | ADR history |
| `docs/DOMAIN_MODEL.md` | Canonical entity model |
| `docs/MOAT_MODEL.md` | Defensibility strategy |
| `docs/autonomous_iteration_protocol.md` | Agent iteration rules |
| `SWARM_PROMPT_STAGED.md` | Staged swarm bootstrap prompt |
| `/.claude/current_phase.md` | Current build phase |

---

## Canonical Package Contents

The `phyto_ai_architecture_v11_CANONICAL.zip` file contains 29 documents including:
- Full system blueprint (v7)
- Database schema (v6)
- API contracts (v5)
- UI screen map (v5)
- Protocol library (v3)
- Geospatial data layer spec
- Reputation system spec
- Founder dashboard spec (v2)
- Swarm boot file and agent task assignments (v6)
- Secrets and environment variable spec

---

## Key Platform Rules

1. No implementation without confirmed upstream dependencies
2. Synthetic data must never reach production surfaces — enforced at pipeline level
3. Geospatial data is opt-in; raw coordinates are never persisted
4. Protocol scoring requires `adherence_percentage >= 50` and `data_origin = real_contributor`
5. Social expansion requires reputation and moderation to be operational first
6. Build priority: trust → integrity → protocol → challenge → contributor → discovery → reputation → growth → monetization

---

## Technical Stack (TBD)

Technology choices are not locked at this phase. The architecture supports:
- Relational database with migration-based schema evolution
- Knowledge graph for ontology and protocol relationships
- Event logging for critical actions
- Feature flags for staged rollout
- AI pattern detection on contributor data

Stack decisions will be recorded in `docs/ARCHITECTURE_DECISION_LOG.md` when made.

---

## Project Owner

Phyto.ai — MDeActual  
Repository: `MDeActual/Essential-Oils`  
Architecture version: v11 CANONICAL (2026-04-08)
