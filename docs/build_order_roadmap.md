# Phyto.ai — Build Order Roadmap

Purpose:
Define the correct implementation sequence so the platform is built in the right order, with the fewest dependencies, the least rework, and the highest probability of a successful MVP launch.

This roadmap is meant for:
- agent swarms
- engineering teams
- product coordination
- sprint planning

It is not just a task list.
It is the recommended build sequence.

---

# Guiding Principle

Build in this order:

```text
trust and data integrity
→ core protocol engine
→ contributor workflows
→ discovery outputs
→ growth systems
→ monetization layers
```

Do not start with:
- advanced monetization
- full social layer
- complex research tooling
- broad integrations

Those come later.

---

# Phase 0 — Project Setup & Control Layer

Purpose:
Create the baseline development environment, source control, deployment strategy, and documentation authority structure.

## Deliverables
- source repository structure
- environment separation (dev / staging / production)
- secrets management
- CI/CD baseline
- document authority map
- coding standards
- API naming conventions

## Why first
If this is not stable, every later step becomes fragile.

---

# Phase 1 — Security, Privacy, and Data Governance

Purpose:
Build the trust layer before product complexity.

## Deliverables
- authentication and authorization
- data origin rules (`synthetic`, `internal_test`, `real_contributor`)
- anonymization rules
- exclusion rules for production insights
- consent architecture
- privacy messaging framework
- geospatial consent + coarse region conversion rules
- audit logging
- anomaly framework baseline

## Why this must be early
Because the platform is health-related and data-sensitive.
Retrofitting trust later is dangerous.

## Exit criteria
- secure auth works
- consent is captured
- synthetic data is excluded from production pipelines
- geospatial storage is anonymized by design

---

# Phase 2 — Core Data Model & Persistence Layer

Purpose:
Implement the relational foundation and graph-compatible data structures.

## Deliverables
- users
- user profiles
- symptom categories
- symptoms
- symptom clusters
- protocol families
- protocols
- protocol steps
- remedies
- protocol/remedy mappings
- challenge tables
- outcome tables
- daily health signals
- lifestyle signals
- reputation objects
- feedback objects
- pricing / subscription objects
- geospatial objects

## Why here
The protocol engine, dashboards, feedback system, and AI all depend on stable persistence.

## Exit criteria
- schema migrated
- test data can be inserted
- API contracts can safely target real storage

---

# Phase 3 — Natural Remedy Ontology Layer

Purpose:
Give the system a shared semantic structure before protocol logic gets too deep.

## Deliverables
- remedy classes
- route types
- mechanism tags
- protocol roles
- remedy-to-ontology mappings
- scanner resolution rules
- ontology governance rules

## Why before protocol engine maturity
Because protocol generation, substitution, and future AI reasoning depend on it.

## Exit criteria
- key V1 remedies mapped to ontology
- protocol engine can reference ontology classes
- scanner can resolve to ontology entities

---

# Phase 4 — Protocol Library + Protocol DSL

Purpose:
Create the structured protocol source of truth.

## Deliverables
- V1 protocol families
- baseline protocol definitions
- challenge-ready protocol set
- protocol DSL spec
- protocol version naming
- protocol evolution compatibility

## Why now
You cannot build the protocol engine without a reliable protocol source.

## Exit criteria
- protocol library finalized for V1
- DSL parser/serializer requirements defined
- challenge engine has launch protocols to use

---

# Phase 5 — Protocol Generation Engine

Purpose:
Build the core AI-native heart of the platform.

## Deliverables
- symptom-to-protocol routing
- symptom cluster logic
- ontology-aware substitutions
- inventory-aware personalization
- archetype-ready inputs
- protocol rendering objects
- protocol instruction layer
- method definitions
- safety rule hooks

## Why this is the center
This is the primary value engine for contributors.

## Exit criteria
- symptom input generates protocol output
- outputs are human-readable
- protocols contain clear instructions, not vague shorthand

---

# Phase 6 — Protocol Timer, Check-ins, and Outcome Logging

Purpose:
Capture the data that powers the flywheel.

## Deliverables
- protocol timer
- daily health signal
- lifestyle signal capture
- step completion
- outcome reporting
- adherence calculation

## Why before discovery feed
No data, no discoveries.

## Exit criteria
- contributors can complete a full protocol journey
- adherence is calculated
- outcomes are recorded correctly

---

# Phase 7 — Challenge Engine

Purpose:
Turn protocols into growth and data-generation loops.

## Deliverables
- challenge objects
- join flow
- challenge progress tracking
- completion rules
- reward issuance
- result summary generation
- challenge-safe privacy messaging

## Why here
Challenges sit on top of the protocol system.
They should not be built before the underlying flows work.

## Exit criteria
- at least 3 launch challenges functional
- challenge completion works
- challenge results can be generated

---

# Phase 8 — Contributor Dashboard + Core Contributor UX

Purpose:
Give contributors a coherent home experience.

## Deliverables
- home dashboard
- current protocol card
- progress state
- community progress snapshot
- contributor profile
- personal trajectory
- challenge directory
- challenge detail
- challenge progress
- challenge results
- privacy / data promise screen

## Why now
By now the system can actually support a meaningful user experience.

## Exit criteria
- contributor can join and complete a challenge end to end
- dashboard reflects real status

---

# Phase 9 — Discovery Feed + Early Insight Surfaces

Purpose:
Make the platform feel alive.

## Deliverables
- discovery feed
- challenge result cards
- protocol result summaries
- insight cards
- sample size + confidence display
- production-safe filtering

## Why after challenge engine
Challenges provide the first clean data sources for feed content.

## Exit criteria
- discovery feed shows meaningful, safe, correctly filtered insight objects

---

# Phase 10 — Founder / Operator Dashboard

Purpose:
Give you control over the business and the flywheels.

## Deliverables
- overview dashboard
- growth dashboard
- engagement dashboard
- discovery engine dashboard
- reputation dashboard
- geospatial dashboard
- revenue dashboard
- feedback dashboard
- integrity validation surfaces

## Why here
Once contributors and data are flowing, operations visibility becomes essential.

## Exit criteria
- founder can assess platform health in under 1 minute

---

# Phase 11 — Reputation System

Purpose:
Protect data quality and reward reliable contributors.

## Deliverables
- contributor reputation scoring
- tiers
- weighting logic
- community helpfulness signals
- practitioner reputation
- anomaly penalties

## Why after contributor flows
Reputation should be based on real behavior, not guessed rules.

## Exit criteria
- outcome weighting can use reputation
- contributors see tier progression
- bad data can be down-weighted

---

# Phase 12 — Feedback System

Purpose:
Create a structured loop for product improvement and protocol clarity.

## Deliverables
- product feedback
- challenge feedback
- protocol feedback
- discovery validation feedback
- feature requests
- feature voting
- bug reporting
- feedback dashboard

## Why here
Once contributors are active, feedback becomes very high leverage.

## Exit criteria
- contributors can submit feedback
- founder can see prioritized product signals

---

# Phase 13 — Incentive System

Purpose:
Drive completion, referrals, and retention without cheapening the platform.

## Deliverables
- contributor points
- badges
- challenge rewards
- referral rewards
- reward redemption logic
- premium credit rewards
- bundle discount rewards

## Why after reputation system
You want to reward high-quality contribution, not just noise.

## Exit criteria
- incentives encourage completion and referrals
- rewards tie to high-value actions

---

# Phase 14 — Landing Page + Launch Funnel

Purpose:
Convert visitors into challenge participants.

## Deliverables
- public landing page
- challenge-first CTA
- privacy promise
- discovery proof section
- active challenge cards
- contributor story
- funnel analytics

## Why not earlier
Because the landing page should reflect a real system, not promises without substance.

## Exit criteria
- visitor can move from landing page to first challenge cleanly

---

# Phase 15 — Shopify Convenience Layer

Purpose:
Offer bundles without letting commerce dominate the platform.

## Deliverables
- bundle mapping
- cart permalink logic
- editable bundle structure
- protocol-to-bundle linking
- store content alignment

## Why later
The store is a convenience layer, not the core product.

## Exit criteria
- protocol pages can link to appropriate bundles
- store remains secondary to discovery

---

# Phase 16 — Social Layer (Structured, Not Open-Forum)

Purpose:
Increase engagement without destroying trust.

## Deliverables
- challenge rooms
- protocol Q&A
- discovery discussions
- moderation tools
- helpfulness signals
- anti-spam rules

## Why later
The wrong social layer too early can create chaos.
Structured interaction should come after reputation and moderation foundations exist.

## Exit criteria
- challenge participants can discuss safely
- helpfulness feeds reputation
- noise is controlled

---

# Phase 17 — Protocol Scoring + Protocol Intelligence

Purpose:
Allow the platform to objectively compare and improve protocols.

## Deliverables
- protocol scoring system
- protocol leaderboard
- archetype-specific scoring
- scoring API
- founder protocol ranking dashboard
- score-driven evolution triggers

## Why after enough data exists
Scoring before data volume exists is mostly cosmetic.
This becomes truly useful after challenges and protocol runs accumulate.

## Exit criteria
- top-performing protocols can be ranked reliably
- variants can be compared with confidence signals

---

# Phase 18 — Protocol Evolution System

Purpose:
Turn the platform into a learning engine.

## Deliverables
- protocol family trees
- versioning workflows
- variant generation rules
- evolution triggers
- protocol evolution monitor
- challenge-driven optimization loop

## Why after scoring
Evolution needs scoring to know what to improve.

## Exit criteria
- at least one protocol family can demonstrate version improvement logic

---

# Phase 19 — AI-Native Expansion Layer

Purpose:
Make the product feel substantially more intelligent.

## Deliverables
- health pattern detector
- personal pattern insights
- contributor archetype engine
- AI insight cards
- research insight generator
- advanced personalization
- ontology-aware AI reasoning

## Why here
Useful AI requires enough data and enough product surface to matter.

## Exit criteria
- AI features produce visible, useful outputs beyond static rules

---

# Phase 20 — Pricing & Access Controls

Purpose:
Monetize without damaging trust or participation.

## Deliverables
- contributor free/premium access
- practitioner plans
- research plans
- subscription controls
- reward-driven premium credits
- gated premium features

## Why after user value exists
You should charge for intelligence and convenience, not basic participation too early.

## Exit criteria
- plans are enforced
- premium features are real
- revenue can be tracked cleanly

---

# Phase 21 — Geospatial Analytics & Map Surfaces

Purpose:
Reveal regional patterns while preserving privacy.

## Deliverables
- region conversion pipeline
- protocol response maps
- founder geospatial dashboard
- geospatial discovery explorer
- minimum-sample gating
- climate / region analysis hooks

## Why later
This is powerful, but not required to validate core product-market fit.

## Exit criteria
- protocol results can be viewed by anonymized region safely

---

# Phase 22 — External Health Data Integrations

Purpose:
Expand the signal layer using external health sources.

## Deliverables
- Apple Health integration
- Google Health Connect / similar
- wearable connectors later
- data permission controls
- integration-specific privacy flows

## Why later
The core product should work without them first.

## Exit criteria
- one external integration works and is trustworthy

---

# Phase 23 — Research / Institutional Layer

Purpose:
Unlock B2B / research revenue.

## Deliverables
- research dashboards
- anonymized report generation
- institutional explorer access
- custom study workflows
- data-use controls
- export governance

## Why later
This should be built on top of a credible dataset, not before one exists.

## Exit criteria
- at least one research-grade report product can be generated safely

---

# Recommended MVP Cut Line

If you need a strict MVP cut, stop after:

- Phase 10 or 11

That gives you:
- secure platform
- protocol engine
- challenge engine
- contributor dashboard
- discovery feed
- founder dashboard
- basic reputation controls

That is enough for a serious beta.

---

# Recommended First 3 Launch Challenges

1. 7-Day Sleep Reset
2. 5-Day Calm Mind
3. Digestive Reset

Launch with 3, not 5, so participation concentrates.

---

# Critical Build Rules

1. Do not build monetization before core user value.
2. Do not build open social features before moderation and reputation.
3. Do not overbuild AI before enough protocol data exists.
4. Do not allow synthetic data into production insights.
5. Do not let Shopify become the center of the product.
6. Do not make the onboarding feel like homework.

---

# Success Definition for Early Build

A successful early build means:
- a new contributor can join a challenge in under 90 seconds
- they can complete a protocol with clear instructions
- they can log daily outcomes easily
- the system can generate clean discovery outputs
- you can see the key KPIs from the founder dashboard
- the dataset remains trustworthy

---

# Final Build Philosophy

This platform should feel like:

```text
a community-driven AI discovery engine for natural health
```

not:
- a supplement store
- a generic wellness tracker
- an open wellness forum
- a thin AI wrapper

The build order above protects that identity.