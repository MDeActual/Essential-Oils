# MOAT_MODEL.md — Phyto.ai Competitive Moat Analysis

## Purpose

This file defines Phyto.ai's defensibility strategy — the structural advantages that compound over time and make the platform increasingly difficult to replicate as it grows.

---

## Core Thesis

Phyto.ai's primary moat is **structured, protocol-linked, real-world contributor data on natural remedy effectiveness** — collected under rigorous integrity controls, semantically organized through a natural remedy ontology, and made progressively more intelligent through a self-reinforcing protocol intelligence loop.

This moat is data-structural, not technology-structural. A competitor can copy the UI and re-implement the AI features. They cannot copy the dataset, the ontology, or the protocol history.

---

## Moat Components

### 1. Protocol Intelligence Flywheel (Primary Moat)

**What it is:** A self-reinforcing loop in which more protocol runs produce better protocol scores, which surface better protocol recommendations, which attract more contributors, which generate more runs.

**Why it is defensible:**
- Each protocol run adds to a contributor-verified, adherence-weighted evidence base
- Protocol scores compound: a protocol with 500 verified runs is dramatically more credible than one with 10
- The scoring methodology (adherence-weighted, synthetic-excluded) ensures quality, not just volume
- Early mover advantage: the first platform with 10,000 verified lavender oil protocol runs for sleep owns that evidence space

**Growth vector:** Protocol run count × outcome quality × adherence rate

---

### 2. Natural Remedy Ontology (Semantic Moat)

**What it is:** A structured knowledge graph of natural remedies, their mechanisms, routes, roles, and relationships — built and maintained by the Ontology Agent and validated against contributor protocol data.

**Why it is defensible:**
- Building an accurate, validated ontology takes years of curation
- The ontology becomes more valuable as protocols reference it — remedy semantics are baked into thousands of data records
- Enables cross-protocol and cross-symptom reasoning that flat databases cannot replicate
- External researchers and practitioners depend on the ontology's definitions, creating adoption lock-in

**Growth vector:** Remedy count × mechanism depth × protocol linkages

---

### 3. Contributor Reputation System (Trust Moat)

**What it is:** A multi-dimensional reputation model that weights contributor data by adherence, completion quality, reporting consistency, and community behavior.

**Why it is defensible:**
- High-reputation contributors are identified over months or years of participation — they cannot be faked quickly
- Reputation-weighted evidence is more credible than unweighted community data
- Top contributors (Discovery Leaders) become advocates and brand assets
- A new platform starting with zero reputation history cannot compete on data quality even with equal technology

**Growth vector:** Discovery Leader count × average contributor reputation × data quality index

---

### 4. Geospatial Protocol-Response Map (Geographic Moat)

**What it is:** An anonymized map of how protocol effectiveness varies by region, climate zone, and environmental context.

**Why it is defensible:**
- Geospatial protocol-response data requires years and thousands of regionally diverse contributors to accumulate
- Regional insights are uniquely valuable to researchers and practitioners operating in specific geographies
- The minimum sample size rule (30 per region) ensures only high-confidence regional data is surfaced
- No competitor can reconstruct this map without starting the contributor acquisition process over

**Growth vector:** Region count with min sample × protocol-region combination count

---

### 5. Challenge Engine Community Layer (Engagement Moat)

**What it is:** Structured, time-bound community challenges that create shared commitment, peer accountability, and rich parallel datasets.

**Why it is defensible:**
- Challenge history becomes social proof — "10,000 contributors have run the Lavender Sleep Protocol challenge"
- Challenge rooms create community identity around specific protocols and symptom categories
- Challenge datasets are more controlled (shared timeline, shared protocol version) and thus more scientifically valuable
- Contributors who have completed multiple challenges develop platform loyalty and social capital

**Growth vector:** Challenge completions × challenge participant diversity × challenge room activity

---

### 6. Data Integrity Infrastructure (Credibility Moat)

**What it is:** The architecture of `data_origin`, `exclusion_status`, and `adherence_percentage` applied rigorously across all data pipelines — ensuring that every insight surface is provably free of synthetic contamination.

**Why it is defensible:**
- Credibility once established is hard to replicate and, once lost, nearly impossible to recover
- Research-grade evidence requires documented provenance; Phyto.ai's integrity infrastructure provides it
- As the platform pursues research partnerships and institutional buyers, the integrity audit trail becomes a contractual differentiator
- Competitors who skip this infrastructure cannot easily retrofit it into a live dataset

**Growth vector:** Verified real-contributor record count × research partnership count

---

## Moat Interaction Map

```
Contributors join challenges
    ↓
Protocol runs accumulate with adherence data
    ↓
Protocol Intelligence System scores and ranks protocols
    ↓ (better protocols recommended)
More contributors discover and join high-scoring protocols
    ↓
Ontology grows as new remedies and mechanisms are validated
    ↓
Reputation system identifies and elevates high-quality contributors
    ↓ (their data is weighted higher)
Protocol scores become more accurate and credible
    ↓
Research partners and practitioners begin citing Phyto.ai data
    ↓
Platform becomes the authoritative source for natural remedy evidence
```

---

## Moat Risks and Mitigations

| Risk | Description | Mitigation |
|------|-------------|-----------|
| Data quality degradation | Low-adherence or synthetic-contaminated data erodes protocol score credibility | Mandatory `adherence_percentage` thresholds; strict `exclusion_status` pipeline |
| Ontology staleness | Ontology falls out of sync with current protocol content | Ontology Agent runs on every protocol library update |
| Contributor churn | High-reputation contributors leave, degrading data quality | Challenge engine provides engagement structure; reputation tiers create status incentives |
| Geospatial re-identification | Regional data becomes identifiable in sparse areas | `MIN_REGION_SAMPLE_SIZE = 30` enforced at the pipeline level |
| Regulatory exposure | Health claims based on protocol data create regulatory risk | Discovery outputs framed as community evidence, not medical claims |
| Protocol gaming | Bad actors attempt to inflate protocol scores | Reputation weighting, anomaly flags, and integrity validation pipeline |

---

## Moat KPIs (Founder Dashboard)

| KPI | What it measures |
|-----|----------------|
| Protocol run count (real_contributor only) | Primary moat depth indicator |
| Average adherence rate across all runs | Data quality health |
| Discovery Leader count | High-value contributor base |
| Region count with min sample met | Geospatial moat depth |
| Ontology remedy count | Semantic moat depth |
| Challenges completed | Community engagement moat |
| % data from reputation_tier ≥ research_contributor | Data quality concentration |

---

## Business Model Alignment

The moat compounds into three revenue streams:

1. **Premium contributor features** — AI-powered personal insights derived from high-quality protocol data
2. **Practitioner memberships** — Access to the protocol intelligence layer for professional guidance
3. **Research exports** — Anonymized, integrity-validated datasets for institutional buyers

All three streams are more valuable the deeper the moat. Revenue incentivizes platform growth, which deepens the moat, which increases revenue.

Synthetic data is strictly operational infrastructure and must never appear in commercial evidence products.
