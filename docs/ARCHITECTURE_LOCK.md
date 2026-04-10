# ARCHITECTURE_LOCK.md — Phyto.ai Immutable Architecture Decisions

## Purpose

This file records architectural decisions that are **locked** and may not be changed without explicit human review and a new ADR entry in `ARCHITECTURE_DECISION_LOG.md`.

No agent, automated process, or code change may override a locked decision.

---

## How to Read This File

Each entry is a locked decision. The entry includes:
- **Decision**: What was decided
- **Rationale**: Why it is locked
- **Applies to**: Which subsystems or surfaces it governs

---

## Locked Decisions

---

### LOCK-001: Product Identity

**Decision:** Phyto.ai is a community-driven AI-native natural health discovery platform. It is not a generic wellness tracker, a supplement-first storefront, an unmoderated social forum, or a thin AI wrapper.

**Rationale:** Product identity determines every architectural trade-off. Changing identity invalidates the entire design.

**Applies to:** All subsystems, all agents, all implementation work.

---

### LOCK-002: Data Integrity Fields

**Decision:** Every analytics-eligible contributor-linked record must include:
- `data_origin` (values: `real_contributor`, `synthetic`, `internal_test`)
- `exclusion_status` (values: `allowed_in_production_insights`, `excluded_from_production_insights`)
- `adherence_percentage` (numeric 0–100)

**Rationale:** The evidentiary value of the platform depends entirely on clean separation of real vs. synthetic data and on adherence thresholds. These fields cannot be optional.

**Applies to:** Schema Agent, all data pipelines, all analytics surfaces.

---

### LOCK-003: Synthetic Data Exclusion

**Decision:** Synthetic data (`data_origin = synthetic`) and internal test data (`data_origin = internal_test`) must never appear in:
- production discovery feed
- public challenge result summaries
- public protocol scores
- research exports labeled as real-world evidence

**Rationale:** Contaminating production evidence with synthetic data would destroy the platform's scientific credibility and user trust.

**Applies to:** Integrity Validation Agent, all discovery output surfaces, research export pipeline.

---

### LOCK-004: Geospatial Privacy

**Decision:** Raw GPS coordinates must never be persisted in discovery-facing analytics. All geospatial data must be converted to a coarse region or grid cell before storage. Location capture is strictly opt-in.

**Rationale:** Location data is sensitive personal information. Persisting raw coordinates creates re-identification risk and regulatory exposure.

**Applies to:** Geospatial Agent, Schema Agent, all location-aware features.

---

### LOCK-005: Adherence Scoring Thresholds

**Decision:**
- `adherence_percentage < 50` → exclude from protocol scoring entirely
- `adherence_percentage 50–70` → include with down-weighting (low confidence)
- `adherence_percentage >= 70` → include with full weight

**Rationale:** Protocol scores must reflect genuine adherence to have scientific validity. Low-adherence runs contaminate scores.

**Applies to:** Protocol Intelligence System, Protocol Scoring pipeline, Reputation Agent.

---

### LOCK-006: No Implementation Before Dependency Confirmation

**Decision:** No subsystem may be implemented before its upstream dependencies (authoritative doc, schema impact, API impact, privacy/integrity impact) are confirmed.

**Rationale:** Out-of-order implementation creates structural debt that is difficult to reverse once contributors depend on the interfaces.

**Applies to:** All agents, all engineers.

---

### LOCK-007: Structured Social Only

**Decision:** The social layer must be structured (challenge rooms, protocol Q&A, discovery discussions) and must not launch as an open unmoderated forum. Moderation and reputation systems must exist before any broader social expansion.

**Rationale:** Unmoderated social layers attract low-quality content and manipulation that would corrupt protocol outcomes and user trust.

**Applies to:** Social Layer, Challenge Engine, Reputation Agent.

---

### LOCK-008: Six Required Subsystems

**Decision:** The following six subsystems are non-negotiable parts of the architecture and must all be present in any complete implementation:
1. Protocol Engine
2. Challenge Engine
3. Contributor Reputation System
4. Protocol Intelligence System
5. Natural Remedy Ontology
6. Geospatial Insight Layer

**Rationale:** These six systems form the minimum viable intelligence layer. Removing any one of them collapses the platform's core value proposition.

**Applies to:** All agents, all architecture changes.

---

### LOCK-009: Build Priority Order

**Decision:** Implementation priority must follow this sequence and must not be reordered:
1. Trust and privacy
2. Data integrity
3. Protocol engine
4. Challenge engine
5. Contributor workflows
6. Discovery outputs
7. Reputation and quality systems
8. Growth systems
9. Monetization layers

**Rationale:** Monetization and growth built on weak integrity foundations create structural risk that is extremely hard to remediate after launch.

**Applies to:** All agents, all sprint planning.

---

### LOCK-010: Natural Remedy Ontology Authority

**Decision:** `natural_remedy_ontology.md` is the authoritative source for remedy classes, mechanisms, routes, and roles. No remedy claim, protocol step, or discovery output may contradict the ontology.

**Rationale:** Contradictory remedy semantics in different subsystems produce inconsistent and potentially harmful user-facing content.

**Applies to:** Ontology Agent, Protocol Engine Agent, Protocol Library, Discovery Feed.

---

### LOCK-011: Minimum Region Sample Size

**Decision:** No regional protocol-response insight may be surfaced unless a minimum of 30 outcomes are available for that region.

**Rationale:** Small regional samples produce statistically unreliable and potentially re-identifiable insights.

**Applies to:** Geospatial Insight Layer, Founder Dashboard, any research export with regional breakdowns.

---

## Change Process

To modify a locked decision:
1. Create a new ADR in `ARCHITECTURE_DECISION_LOG.md` with rationale for the change
2. Mark the existing LOCK entry as superseded with reference to the new ADR
3. Obtain human approval before any implementation proceeds
4. Update all affected documents

Agents must not modify this file autonomously.
