# DependencyGraph.md — Phyto.ai

Purpose:
Show which systems depend on which others so agents and developers do not build subsystems in the wrong order.

This is the implementation dependency view, not just the conceptual architecture view.

---

# 1. Core Dependency Chain

```text
Security / Privacy / Data Governance
    ↓
Database Schema
    ↓
Natural Remedy Ontology
    ↓
Protocol Library + Protocol DSL
    ↓
Protocol Generation Engine
    ↓
Protocol Timer / Daily Signals / Outcomes
    ↓
Challenge Engine
    ↓
Contributor Dashboard
    ↓
Discovery Feed
    ↓
Founder Dashboard
    ↓
Reputation System
    ↓
Feedback System
    ↓
Incentive System
    ↓
Landing Page / Launch Funnel
    ↓
Shopify Convenience Layer
    ↓
Structured Social Layer
    ↓
Protocol Scoring
    ↓
Protocol Evolution
    ↓
AI-Native Intelligence Layer
    ↓
Pricing / Access Controls
    ↓
Geospatial Analytics
    ↓
External Health Integrations
    ↓
Research / Institutional Layer
```

---

# 2. Subsystem Dependency Map

## Security / Privacy / Governance
Depends on:
- none

Blocks:
- everything

Includes:
- auth
- consent
- anonymization
- data_origin rules
- exclusion rules
- audit logging
- geospatial privacy rules

---

## Database Schema
Depends on:
- security/privacy decisions

Blocks:
- API contracts
- protocol engine
- challenges
- dashboards
- reputation
- feedback
- pricing
- geospatial layer

---

## Natural Remedy Ontology
Depends on:
- database schema

Blocks:
- scanner resolution
- protocol substitutions
- ontology-aware AI reasoning
- geospatial semantic reporting
- discovery explorer filters

---

## Protocol Library + Protocol DSL
Depends on:
- database schema
- ontology

Blocks:
- protocol engine
- challenge engine
- protocol scoring
- protocol evolution

---

## Protocol Generation Engine
Depends on:
- schema
- ontology
- protocol library
- DSL

Blocks:
- contributor challenge experience
- protocol timer
- AI personalization
- protocol scoring inputs

---

## Protocol Timer / Signals / Outcomes
Depends on:
- protocol engine
- schema

Blocks:
- challenge completion
- discovery feed
- protocol scoring
- founder dashboard
- reputation system

---

## Challenge Engine
Depends on:
- protocol engine
- timer/signals/outcomes
- schema

Blocks:
- launch onboarding
- community growth flywheel
- first discovery outputs
- incentives
- challenge rooms

---

## Contributor Dashboard
Depends on:
- protocol engine
- challenge engine
- timer/signals/outcomes

Blocks:
- contributor UX coherence
- progress visibility
- retention loops

---

## Discovery Feed
Depends on:
- outcomes
- challenges
- production-safe filtering

Blocks:
- social proof
- public momentum
- contributor belief that the platform is alive

---

## Founder Dashboard
Depends on:
- schema
- challenge engine
- discovery feed
- metrics pipelines
- reputation
- pricing
- feedback
- geospatial summaries

Blocks:
- operational visibility
- KPI tracking
- growth tuning

---

## Reputation System
Depends on:
- outcomes
- adherence
- challenge completion
- social helpfulness signals later

Blocks:
- data quality weighting
- advanced contributor trust
- practitioner quality control
- safer social layer

---

## Feedback System
Depends on:
- contributor UX
- challenge UX
- founder dashboard

Blocks:
- product iteration loop
- protocol clarity improvements
- feature prioritization

---

## Incentive System
Depends on:
- challenge engine
- reputation system
- pricing model hooks

Blocks:
- referral loops
- retention rewards
- premium credit rewards
- bundle discount rewards

---

## Landing Page / Launch Funnel
Depends on:
- challenge engine
- privacy language
- discovery proof objects
- contributor dashboard existing conceptually

Blocks:
- acquisition
- challenge conversion
- launch narrative

---

## Shopify Convenience Layer
Depends on:
- protocol library
- bundle mapping
- pricing / rewards hooks later

Blocks:
- convenience commerce
- protocol-to-bundle linking

Must NOT block:
- core contributor experience

---

## Structured Social Layer
Depends on:
- reputation system
- moderation rules
- challenge engine
- contributor profiles

Blocks:
- challenge room engagement
- protocol Q&A
- discovery discussions

Must not launch before:
- moderation
- trust signals
- anti-spam controls

---

## Protocol Scoring
Depends on:
- real outcomes
- adherence
- completion
- sample size
- reputation weighting
- exclusion rules

Blocks:
- leaderboard
- high-confidence ranking
- protocol evolution logic

---

## Protocol Evolution
Depends on:
- protocol scoring
- protocol families
- challenge results
- protocol variant structure

Blocks:
- protocol intelligence flywheel
- version improvements
- optimization loops

---

## AI-Native Intelligence Layer
Depends on:
- enough real structured data
- ontology
- protocol scoring
- archetype logic
- discovery feed surfaces

Includes:
- health pattern detector
- personal pattern insights
- AI insight cards
- archetype detection
- research insight generation

---

## Pricing / Access Controls
Depends on:
- real user value
- founder dashboard
- plan model
- reward system hooks

Blocks:
- premium upsell
- practitioner monetization
- research monetization

Should not block:
- free participation

---

## Geospatial Analytics
Depends on:
- geospatial consent
- coarse region conversion
- enough regional sample size
- founder dashboard
- discovery explorer

Blocks:
- map views
- regional insight comparisons
- climate-linked analysis

Must obey:
- privacy rules
- minimum sample thresholds

---

## External Health Integrations
Depends on:
- stable core workflows
- consent framework
- protocol engine working
- value already proven without integrations

Blocks:
- wearable validation layer
- richer sleep/activity signal inputs

---

## Research / Institutional Layer
Depends on:
- enough real contributor data
- production-safe evidence rules
- pricing model
- anonymized report generation
- founder dashboard / data controls
- geospatial and scoring maturity

Blocks:
- B2B / B2Gov data products
- custom study workflows

---

# 3. Critical "Do Not Build Before" Rules

Do not build:
- discovery feed before outcomes exist
- protocol scoring before adherence + outcomes exist
- protocol evolution before scoring exists
- structured social before reputation + moderation exist
- pricing before clear user value exists
- geospatial maps before anonymization + minimum sample logic exist
- research layer before production-safe evidence rules are enforced

---

# 4. MVP Cut Dependency Set

A serious MVP / beta requires these minimum subsystems:

1. security / privacy / governance
2. database schema
3. ontology
4. protocol library + DSL
5. protocol engine
6. protocol timer / signals / outcomes
7. challenge engine
8. contributor dashboard
9. discovery feed
10. founder dashboard
11. reputation baseline

Everything after that is expansion.

---

# 5. Fastest Safe Launch Path

If speed matters most, build in this narrow order:

security
→ schema
→ ontology
→ protocols
→ protocol engine
→ timer / outcomes
→ challenge engine
→ contributor dashboard
→ discovery feed
→ founder dashboard
→ reputation
→ landing page

That sequence is the highest leverage launch path.

---

# 6. Orchestrator Rule

Before a swarm begins a subsystem, verify:
- its dependencies are complete
- authoritative docs are read
- privacy impact is understood
- schema/API effects are known

If not, do not start implementation.