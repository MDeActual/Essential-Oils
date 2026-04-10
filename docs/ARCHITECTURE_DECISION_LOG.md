# ARCHITECTURE_DECISION_LOG.md — Phyto.ai

## Purpose

This file is the authoritative log of architecture decisions (ADRs) for Phyto.ai. Each entry records what was decided, why, what alternatives were considered, and what the consequences are.

Entries are append-only. Superseded decisions are marked but not deleted.

---

## ADR Template

```
### ADR-NNN: Title

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Superseded by ADR-NNN  
**Decider(s):** Human | Agent + Human Review  

**Context:**
What situation or question prompted this decision?

**Decision:**
What was decided?

**Rationale:**
Why was this the right choice?

**Alternatives Considered:**
What other options were evaluated and why were they rejected?

**Consequences:**
What does this decision enable or constrain?

**Locks:** References LOCK-NNN if this decision was promoted to a lock.
```

---

## Decision Log

---

### ADR-001: Platform Identity as Community-Driven Discovery Network

**Date:** 2026-04-08  
**Status:** Accepted  
**Decider(s):** Human  

**Context:**
Multiple possible product directions existed: supplement store, wellness tracker, social health forum, AI chatbot for health questions.

**Decision:**
Phyto.ai is a community-driven AI-native natural health discovery platform. The core product is structured protocol experimentation and evidence generation, not commerce or unstructured social.

**Rationale:**
The defensible moat lies in accumulating high-quality, structured contributor data that can be converted into protocol intelligence. This is not replicable by a storefront or a chatbot. Supplement-first commerce commoditizes quickly; protocol intelligence compounds.

**Alternatives Considered:**
- Supplement storefront: high competition, no data moat
- Generic wellness tracker: low differentiation, no protocol structure
- Open health forum: moderation risk, low data quality
- AI health chatbot: no proprietary data, easily replicated

**Consequences:**
- All architectural decisions must serve protocol intelligence and evidence quality
- Commerce (Shopify) is a convenience layer, never the core product
- Social features are gated behind reputation and moderation

**Locks:** LOCK-001

---

### ADR-002: Mandatory Data Integrity Fields

**Date:** 2026-04-08  
**Status:** Accepted  
**Decider(s):** Human  

**Context:**
The platform will produce synthetic data for testing and simulation alongside real contributor data. Without explicit field-level separation, synthetic data could contaminate production evidence surfaces.

**Decision:**
Every analytics-eligible contributor-linked record must carry three mandatory fields: `data_origin`, `exclusion_status`, and `adherence_percentage`. These fields must be set at record creation and enforced at all pipeline stages.

**Rationale:**
The platform's scientific credibility depends entirely on clean separation of real vs. synthetic data. A single synthetic record reaching a production discovery surface would invalidate the evidence presented to users and external researchers.

**Alternatives Considered:**
- Separate databases for synthetic vs. real: operationally complex, doesn't scale well for hybrid test/prod environments
- Application-layer filtering only: too fragile, no audit trail
- Feature flags only: doesn't produce a per-record audit trail

**Consequences:**
- Schema Agent must enforce these fields at the database level (non-nullable constraints)
- Every agent that writes contributor-linked data must set all three fields
- The integrity validation pipeline must check for missing or invalid values

**Locks:** LOCK-002, LOCK-003, LOCK-005

---

### ADR-003: Geospatial Privacy-First Architecture

**Date:** 2026-04-08  
**Status:** Accepted  
**Decider(s):** Human  

**Context:**
Protocol response patterns have meaningful geographic dimensions (climate, pollen, regional lifestyle). However, precise location data creates re-identification risk and regulatory liability.

**Decision:**
Location capture is opt-in. Raw GPS coordinates are converted immediately to a coarse region/grid cell (H3 or GeoHash) and discarded. Only the anonymized region ID is stored and used in analytics.

**Rationale:**
User trust is the platform's highest priority. Any data handling that creates re-identification risk or regulatory exposure undermines the trust foundation the platform depends on.

**Alternatives Considered:**
- Store precise coordinates with access controls: higher utility, but creates legal and trust risk
- No location data at all: forfeits a significant dimension of protocol intelligence
- Postal code only: inadequate for international markets, still potentially re-identifying in sparse regions

**Consequences:**
- Geospatial insight quality is limited to regional-level granularity (acceptable trade-off)
- No individual contributor location can ever be recovered from stored data
- A minimum sample size of 30 per region is required before surfacing regional insights

**Locks:** LOCK-004, LOCK-011

---

### ADR-004: Challenge Engine as First-Class V1 System

**Date:** 2026-04-08  
**Status:** Accepted  
**Decider(s):** Human  

**Context:**
Early versions of the platform design treated challenges as a secondary growth feature to be added after the protocol engine was stable.

**Decision:**
The Challenge Engine is a first-class V1 system, not a growth add-on. Challenges wrap protocols in time-bound community participation formats that improve contributor motivation and generate cleaner, more complete datasets.

**Rationale:**
Protocol data quality depends heavily on adherence and completion rates. Challenges create accountability structures (shared commitment, visible progress, peer engagement) that materially improve data quality. Treating challenges as optional creates a weaker evidence foundation.

**Alternatives Considered:**
- Launch with solo protocol tracking only: simpler, but produces lower-quality data
- Add challenges as Phase 2: delays the primary data-quality mechanism

**Consequences:**
- Challenge Engine must be designed before contributor-facing workflows
- Challenge completion events are critical log entries
- Protocol scoring weights challenge-sourced runs appropriately

**Locks:** LOCK-008, LOCK-009

---

### ADR-005: Structured Social Only — No Open Forum at Launch

**Date:** 2026-04-08  
**Status:** Accepted  
**Decider(s):** Human  

**Context:**
Social engagement drives retention and protocol adoption. However, open forums are susceptible to spam, misinformation, and manipulation that could corrupt protocol outcomes.

**Decision:**
Social interaction is limited to structured surfaces: challenge rooms, protocol Q&A, and discovery discussions. No open forum is launched until reputation and moderation systems are operational.

**Rationale:**
Unmoderated health-related discussion is a liability, not an asset. Misinformation about natural remedies could cause harm and regulatory exposure. The platform's evidence quality depends on community norms that only reputation and moderation can enforce.

**Alternatives Considered:**
- Open forum from day one: higher engagement risk, high moderation cost, misinformation risk
- No social layer at all: misses a significant engagement and data-quality mechanism

**Consequences:**
- Social layer scope is narrow in V1
- Reputation system must be functional before social expansion
- Challenge rooms are the primary social surface in V1

**Locks:** LOCK-007

---

### ADR-006: Natural Remedy Ontology as Semantic Authority

**Date:** 2026-04-08  
**Status:** Accepted  
**Decider(s):** Human  

**Context:**
Multiple subsystems (Protocol Engine, Discovery Feed, Research Exports) reference natural remedy names, mechanisms, and routes. Without a canonical semantic layer, terminology inconsistencies accumulate.

**Decision:**
`natural_remedy_ontology.md` is the single authoritative source for remedy classes, mechanisms, routes, and roles. All subsystems must derive remedy semantics from this source.

**Rationale:**
Semantic inconsistency in a health evidence platform creates scientific incoherence and user confusion. A single ontology allows consistent reasoning across all subsystems and enables knowledge graph queries.

**Alternatives Considered:**
- Free-text remedy names everywhere: no semantic consistency, no graph queries
- Multiple domain-specific ontologies: divergence over time, conflict resolution complexity

**Consequences:**
- Ontology Agent has high authority and must be involved in any protocol content changes
- Adding new remedy types requires ontology update before protocol library update
- Protocol Library is subordinate to Ontology for remedy semantics

**Locks:** LOCK-010

---

### ADR-007: Six Required Subsystems as Non-Negotiable Core

**Date:** 2026-04-08  
**Status:** Accepted  
**Decider(s):** Human  

**Context:**
Resource constraints create pressure to scope down the platform at launch. Various subsystems have been proposed as optional or Phase 2.

**Decision:**
Six subsystems are non-negotiable and must all be present in any complete implementation: Protocol Engine, Challenge Engine, Contributor Reputation System, Protocol Intelligence System, Natural Remedy Ontology, and Geospatial Insight Layer.

**Rationale:**
Each of these six systems is a component of the core value loop. Removing any one collapses a dimension of the platform's differentiation. Protocol intelligence without reputation produces low-quality scores. Geospatial without the ontology produces uninterpretable results. The six systems are interdependent.

**Alternatives Considered:**
- Minimum viable product without Reputation: protocol scores would be unweighted and easily gamed
- Minimum viable product without Geospatial: forfeits a significant insight dimension
- Minimum viable product without Protocol Intelligence: protocol library becomes static, no evolution

**Consequences:**
- All six subsystems must have architectural specifications before any implementation begins
- Implementation proceeds in the priority order defined in LOCK-009
- The architecture cannot be considered "complete" until all six subsystems have specifications

**Locks:** LOCK-008
