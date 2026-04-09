# Swarm Rules — Phyto.ai

Purpose:
Provide the fixed governance rules and operating constraints that make the agent swarm build smoother, safer, and more coherent.

---

# 1. Product Identity Rules

Build Phyto.ai as:
- a community-driven AI-native natural health discovery platform

Do not build it as:
- a generic wellness tracker
- a supplement-first storefront
- an open unmoderated community forum
- a thin AI wrapper with little product depth

Shopify is a convenience layer, not the core product.

---

# 2. Build Priority Rules

Always prioritize in this order:
1. trust and privacy
2. data integrity
3. protocol engine
4. challenge engine
5. contributor workflows
6. discovery outputs
7. reputation and quality systems
8. growth systems
9. monetization layers

Do not prioritize:
- advanced monetization before user value
- open social features before moderation and reputation
- external integrations before core workflows work
- protocol evolution before enough real data exists

---

# 3. Documentation Rules

- Mandatory first read: `00_START_HERE.md`
- Use latest version only
- Do not implement from mixed versions of the same file family
- Update authoritative docs when architecture-level changes are introduced
- Do not create duplicate canonical files for the same subsystem

---

# 4. Data Integrity Rules

Every analytics-eligible contributor-linked record must support:
- `data_origin`
- `exclusion_status`

Allowed `data_origin` values:
- `real_contributor`
- `synthetic`
- `internal_test`

Allowed `exclusion_status` values:
- `allowed_in_production_insights`
- `excluded_from_production_insights`

Only `real_contributor` data may appear in:
- production discovery feed
- public challenge result summaries
- public protocol scores
- research exports labeled as real-world evidence

Low-adherence handling:
- adherence < 50% → exclude from scoring
- adherence 50–70% → down-weight / low confidence
- adherence >= 70% → full weight

Use reputation weighting where supported.

---

# 5. Privacy Rules

Treat symptom, protocol, outcome, and location-related data as sensitive.

- collect the minimum necessary data
- use anonymized aggregated statistics for model learning and discovery outputs
- never persist raw GPS coordinates into discovery-facing analytics
- location must be opt-in
- clearly explain data use at challenge join and relevant product moments

Trust wins over speed.

---

# 6. Protocol Rules

Never show vague protocol steps to users.

Every user-facing step should resolve into:
- method
- timing
- quantity or intensity
- effort
- safety note if needed

Do not allow free-form protocol claims to bypass structured protocol review.

Protocol suggestions should flow through:
protocol definition
→ protocol engine
→ instruction layer
→ user display

---

# 7. Social Rules

Use structured social only:
- challenge rooms
- protocol Q&A
- discovery discussions

Do not launch an open forum by default.
Moderation and reputation must exist before broader social expansion.

---

# 8. Engineering Rules

- use typed contracts
- use migration-based schema evolution
- use feature flags for risky features
- provide deterministic fallbacks when AI is unavailable
- log critical actions
- no hidden production shortcuts
- no debug bypasses in production paths

Critical events to log:
- protocol generation
- challenge joins
- challenge completion
- outcome submission
- reputation recalculation
- geospatial resolution
- exclusion validation

---

# 9. Testing Rules

Before release, validate:
- synthetic data exclusion
- challenge result integrity
- protocol scoring integrity
- geospatial anonymization
- reputation weighting behavior
- founder dashboard correctness

Minimum acceptance journey:
- user joins challenge
- user follows protocol
- user logs daily signals
- completion is calculated
- result summary is generated safely

---

# 10. Product Decision Rules

When choosing between two valid options:
- choose lower friction
- choose higher clarity
- choose structured evidence over vague anecdotes
- choose repeatability
- choose trust over speed

A key KPI is:
- protocol runs per contributor

Favor decisions that improve it without harming trust.

---

# 11. Recommended Environment Variables / Flags

```text
APP_ENV=development|staging|production
ENABLE_SYNTHETIC_DATA=true|false
ALLOW_PRODUCTION_INSIGHTS_FROM_REAL_ONLY=true
ENABLE_CHALLENGES=true
ENABLE_PROTOCOL_EVOLUTION=false
ENABLE_SOCIAL_LAYER=false
ENABLE_GEOSPATIAL_COLLECTION=false
ENABLE_FOUNDER_DASHBOARD=true
ENABLE_PREMIUM_FEATURES=false
ENABLE_PRACTITIONER_TOOLS=false
ENABLE_RESEARCH_EXPORTS=false
ENABLE_EXTERNAL_HEALTH_INTEGRATIONS=false
ENABLE_AI_INSIGHT_CARDS=true
ENABLE_REPUTATION_WEIGHTING=true
MIN_REGION_SAMPLE_SIZE=30
MIN_ADHERENCE_FOR_VALID_RUN=50
FULL_WEIGHT_ADHERENCE_THRESHOLD=70
MIN_CHALLENGE_COMPLETION_SIGNAL_RATE=70
PRIVACY_MODE_STRICT=true
LOG_LEVEL=INFO
```

Suggested early staging defaults:
- ENABLE_SYNTHETIC_DATA=true
- ENABLE_CHALLENGES=true
- ENABLE_PROTOCOL_EVOLUTION=false
- ENABLE_SOCIAL_LAYER=false
- ENABLE_GEOSPATIAL_COLLECTION=false
- ENABLE_PREMIUM_FEATURES=false
- ENABLE_PRACTITIONER_TOOLS=false
- ENABLE_RESEARCH_EXPORTS=false
- ENABLE_EXTERNAL_HEALTH_INTEGRATIONS=false
- ENABLE_REPUTATION_WEIGHTING=true
- PRIVACY_MODE_STRICT=true

---

# 12. Meta-Rule

No implementation without dependency confirmation.

Before any subsystem work begins, verify:
- authoritative doc exists
- upstream dependencies exist
- schema impact is understood
- API impact is understood
- privacy/integrity impact is understood