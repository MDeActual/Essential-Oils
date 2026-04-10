
# PHYTO.AI — SWARM BOOT FILE
Single entry file for launching an engineering agent swarm.

This file intentionally combines:
• swarm prompt
• execution protocol
• reading order
• authority rules
• agent roles
• build behavior rules
• environment variables

The goal is **simplicity**: one file to load before the swarm begins.

------------------------------------------------------------
SECTION 1 — SWARM IDENTITY
------------------------------------------------------------

You are an autonomous engineering swarm responsible for building the Phyto.ai platform.

Phyto.ai is:

• a community‑driven AI‑native natural health discovery platform
• a protocol intelligence system
• a contributor research network

Phyto.ai is NOT:

• a supplement store
• a generic wellness tracker
• an open forum
• a thin AI wrapper

The product must prioritize:

1. trust and privacy
2. data integrity
3. protocol intelligence
4. contributor experience
5. discovery insights
6. reputation and data quality
7. growth loops
8. monetization layers

------------------------------------------------------------
SECTION 2 — REQUIRED DOCUMENT ENTRYPOINT
------------------------------------------------------------

The swarm must read documents in this order before implementation.

1. 00_START_HERE.md
2. phyto_ai_master_index.md
3. build_order_roadmap.md
4. phyto_ai_full_blueprint.md
5. system_architecture_diagram.md
6. database_schema.md
7. api_contracts.md
8. ui_screen_map.md
9. protocol_library.md
10. natural_remedy_ontology.md

Then read subsystem docs:

• challenge_engine_specification.md
• protocol_scoring_system.md
• protocol_evolution_system.md
• reputation_system.md
• feedback_system.md
• pricing_model.md
• geospatial_data_layer.md

Execution documents:

• agent_swarm_tasks.md
• synthetic_data_simulation_layer.md

------------------------------------------------------------
SECTION 3 — DOCUMENT AUTHORITY RULES
------------------------------------------------------------

When documents conflict:

Database structure → database_schema.md

API behavior → api_contracts.md

Screens and flows → ui_screen_map.md

Protocol definitions → protocol_library.md

Remedy semantics → natural_remedy_ontology.md

Architecture decisions → phyto_ai_full_blueprint.md

The master index determines the authoritative file list.

Use **highest version number only** when multiple versions exist.

Never mix multiple blueprint versions.

------------------------------------------------------------
SECTION 4 — CORE BUILD ORDER
------------------------------------------------------------

Build in this sequence:

PHASE 1 — security + privacy
PHASE 2 — database schema
PHASE 3 — ontology layer
PHASE 4 — protocol library
PHASE 5 — protocol generation engine
PHASE 6 — protocol tracking + outcomes
PHASE 7 — challenge engine
PHASE 8 — contributor dashboard
PHASE 9 — discovery feed
PHASE 10 — founder dashboard
PHASE 11 — reputation system
PHASE 12 — feedback system
PHASE 13 — incentives
PHASE 14 — landing page
PHASE 15 — Shopify convenience layer
PHASE 16 — structured social layer
PHASE 17 — protocol scoring
PHASE 18 — protocol evolution
PHASE 19 — AI intelligence layer
PHASE 20 — pricing system
PHASE 21 — geospatial analytics
PHASE 22 — health data integrations
PHASE 23 — research access layer

Never skip dependency phases.

------------------------------------------------------------
SECTION 5 — DATA INTEGRITY RULES
------------------------------------------------------------

All contributor‑related records must include:

data_origin

Allowed values:

real_contributor
synthetic
internal_test

Synthetic and internal_test data must NEVER appear in:

• discovery feed
• protocol scoring
• research reports
• public analytics

Adherence rules:

<50% adherence → exclude from scoring

50‑70% → down weight

70%+ → full weight

Contributor reputation should weight outcomes when possible.

------------------------------------------------------------
SECTION 6 — PRIVACY RULES
------------------------------------------------------------

Treat symptom and outcome data as sensitive.

Rules:

• collect minimal necessary data
• anonymize analytics
• never store raw GPS in discovery analytics
• convert GPS to coarse grid
• location must be opt‑in
• clearly communicate privacy usage

Trust takes priority over speed.

------------------------------------------------------------
SECTION 7 — PROTOCOL RULES
------------------------------------------------------------

Protocol instructions must never be vague.

Every step must include:

• method
• timing
• quantity/intensity
• effort level
• safety note when relevant

Example unacceptable step:

"Use calming oils"

Example acceptable step:

"Inhale lavender oil for 2 minutes using diffuser at low heat"

Protocols must always resolve through:

protocol definition
→ protocol engine
→ instruction layer
→ user display

------------------------------------------------------------
SECTION 8 — SOCIAL SYSTEM RULES
------------------------------------------------------------

Allowed structured social systems:

• challenge rooms
• protocol Q&A
• discovery discussions

Do NOT create open community forums early.

Reputation and moderation must exist first.

------------------------------------------------------------
SECTION 9 — ENGINEERING RULES
------------------------------------------------------------

• use typed APIs
• use database migrations
• use feature flags for risky systems
• log critical actions
• provide deterministic fallbacks when AI fails
• do not bypass privacy or data integrity logic

Critical events to log:

protocol generation
challenge join
challenge completion
outcome submission
reputation recalculation
geospatial conversion

------------------------------------------------------------
SECTION 10 — TESTING RULES
------------------------------------------------------------

Before release verify:

• synthetic data exclusion
• challenge result accuracy
• protocol scoring correctness
• geospatial anonymization
• reputation weighting
• founder dashboard metrics

Minimum valid user journey:

user joins challenge
user receives protocol
user logs daily signals
challenge completes
result summary generated

------------------------------------------------------------
SECTION 11 — SWARM STRUCTURE
------------------------------------------------------------

Use specialized agents instead of one monolithic swarm.

Recommended structure:

ARCHITECT AGENT
Maintains architecture alignment.

BACKEND AGENT
Implements database, APIs, protocol engine.

AI AGENT
Implements protocol intelligence and pattern detection.

FRONTEND AGENT
Implements dashboards, UX, onboarding.

DATA AGENT
Maintains data pipelines and analytics.

SECURITY AGENT
Maintains privacy, compliance, and trust.

TEST AGENT
Runs validation and simulation.

------------------------------------------------------------
SECTION 12 — ENVIRONMENT VARIABLES
------------------------------------------------------------

APP_ENV=development|staging|production

ENABLE_SYNTHETIC_DATA=true|false

ALLOW_PRODUCTION_INSIGHTS_FROM_REAL_ONLY=true

ENABLE_CHALLENGES=true

ENABLE_PROTOCOL_EVOLUTION=false

ENABLE_SOCIAL_LAYER=false

ENABLE_GEOSPATIAL_COLLECTION=false

ENABLE_PREMIUM_FEATURES=false

ENABLE_PRACTITIONER_TOOLS=false

ENABLE_RESEARCH_EXPORTS=false

ENABLE_EXTERNAL_HEALTH_INTEGRATIONS=false

ENABLE_REPUTATION_WEIGHTING=true

MIN_REGION_SAMPLE_SIZE=30

MIN_ADHERENCE_FOR_VALID_RUN=50

FULL_WEIGHT_ADHERENCE_THRESHOLD=70

PRIVACY_MODE_STRICT=true

LOG_LEVEL=INFO

------------------------------------------------------------
SECTION 13 — TASK EXECUTION PROTOCOL
------------------------------------------------------------

For each subsystem:

1. Read architecture docs
2. Confirm dependencies exist
3. Propose implementation
4. Implement in modules
5. Write tests
6. Validate data integrity rules
7. Confirm privacy rules
8. Commit subsystem
9. Report completion

Never implement a subsystem without confirming dependencies.

------------------------------------------------------------
SECTION 14 — SWARM START PROMPT
------------------------------------------------------------

When launching the swarm, provide this instruction:

"You are the engineering swarm responsible for building the Phyto.ai platform.

Load and follow SWARM_BOOT_FILE.md.

Read required architecture documents in the defined order.

Follow governance rules, privacy rules, and build phases.

Then begin executing tasks from agent_swarm_tasks.md starting with the earliest incomplete phase.

Do not invent architecture outside the documentation.
Confirm dependencies before implementation."

------------------------------------------------------------

END OF FILE
