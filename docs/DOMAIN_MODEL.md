# DOMAIN_MODEL.md — Phyto.ai Canonical Domain Model

## Purpose

This file defines the canonical domain entities, their relationships, and the data integrity rules that govern them. It is the authoritative reference for entity naming, field semantics, and relationship cardinality across all subsystems.

Schema implementations must match this model. API contracts must reflect these entities.

---

## Data Integrity Rules (All Entities)

The following fields are **mandatory** on every analytics-eligible contributor-linked record:

| Field | Type | Allowed Values | Notes |
|-------|------|---------------|-------|
| `data_origin` | enum | `real_contributor`, `synthetic`, `internal_test` | Set at record creation, immutable |
| `exclusion_status` | enum | `allowed_in_production_insights`, `excluded_from_production_insights` | Derived from `data_origin` and context |
| `adherence_percentage` | decimal (0–100) | 0.00–100.00 | Required for protocol-run-linked records |

Rules:
- `data_origin = real_contributor` AND `adherence_percentage >= 50` → eligible for production insights
- `data_origin = synthetic` OR `data_origin = internal_test` → `exclusion_status` must be `excluded_from_production_insights`
- `adherence_percentage < 50` → exclude from protocol scoring regardless of `data_origin`
- `adherence_percentage 50–70` → include with down-weighting
- `adherence_percentage >= 70` → full weight in scoring

---

## Core Domain Entities

---

### Contributor

A verified user who participates in protocol runs and challenges.

| Field | Type | Description |
|-------|------|-------------|
| `contributor_id` | uuid | Primary key |
| `handle` | string | Anonymized display identifier |
| `archetype` | enum | Contributor archetype (see Contributor Archetype below) |
| `reputation_score` | decimal | Computed reputation score (0–100) |
| `reputation_tier` | enum | `explorer`, `contributor`, `research_contributor`, `discovery_leader` |
| `joined_at` | timestamp | Account creation timestamp |
| `location_consent` | boolean | Whether contributor has opted into geospatial data collection |
| `geospatial_region_id` | uuid (nullable) | FK → GeospatialRegion; null if no consent |
| `data_origin` | enum | Always `real_contributor` for verified humans |

---

### Protocol

A structured natural health protocol defining remedy, method, timing, quantity, effort level, and safety considerations.

| Field | Type | Description |
|-------|------|-------------|
| `protocol_id` | uuid | Primary key |
| `title` | string | Human-readable protocol name |
| `symptom_category` | string | FK → SymptomCategory |
| `remedy_id` | uuid | FK → Remedy (from Natural Remedy Ontology) |
| `method` | string | Application or consumption method |
| `timing` | string | When/how often to apply |
| `quantity_or_intensity` | string | Dose or intensity specification |
| `effort_level` | enum | `low`, `medium`, `high` |
| `safety_note` | string (nullable) | Required safety warning if applicable |
| `protocol_score` | decimal (nullable) | Computed by Protocol Intelligence System |
| `version` | integer | Protocol version number |
| `status` | enum | `draft`, `active`, `deprecated` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### ProtocolRun

A single contributor's execution of a protocol, linked to a challenge or standalone.

| Field | Type | Description |
|-------|------|-------------|
| `run_id` | uuid | Primary key |
| `contributor_id` | uuid | FK → Contributor |
| `protocol_id` | uuid | FK → Protocol |
| `challenge_id` | uuid (nullable) | FK → Challenge if part of a challenge |
| `started_at` | timestamp | |
| `completed_at` | timestamp (nullable) | Null if incomplete |
| `adherence_percentage` | decimal | 0–100, computed from daily signal completions |
| `outcome_reported` | boolean | Whether the contributor submitted an outcome |
| `data_origin` | enum | Inherited from Contributor or set explicitly for synthetic runs |
| `exclusion_status` | enum | Derived from `data_origin` and `adherence_percentage` |

---

### DailySignal

A contributor's daily health signal submission during a protocol run.

| Field | Type | Description |
|-------|------|-------------|
| `signal_id` | uuid | Primary key |
| `run_id` | uuid | FK → ProtocolRun |
| `contributor_id` | uuid | FK → Contributor |
| `logged_at` | timestamp | |
| `symptom_severity` | integer (1–10) | Self-reported symptom intensity |
| `protocol_step_completed` | boolean | Whether today's protocol step was completed |
| `lifestyle_signals` | jsonb (nullable) | Optional contextual signals (sleep, stress, etc.) |
| `data_origin` | enum | |
| `exclusion_status` | enum | |

---

### Outcome

Final outcome report submitted at the end of a protocol run.

| Field | Type | Description |
|-------|------|-------------|
| `outcome_id` | uuid | Primary key |
| `run_id` | uuid | FK → ProtocolRun |
| `contributor_id` | uuid | FK → Contributor |
| `reported_at` | timestamp | |
| `improvement_reported` | boolean | Whether contributor reports improvement |
| `improvement_magnitude` | integer (1–5, nullable) | Self-rated improvement intensity |
| `notes` | text (nullable) | Free-form contributor notes |
| `data_origin` | enum | |
| `exclusion_status` | enum | |
| `adherence_percentage` | decimal | Copied from ProtocolRun at time of outcome submission |

---

### Challenge

A time-bound community protocol experiment.

| Field | Type | Description |
|-------|------|-------------|
| `challenge_id` | uuid | Primary key |
| `title` | string | |
| `protocol_id` | uuid | FK → Protocol |
| `symptom_category` | string | FK → SymptomCategory |
| `start_date` | date | |
| `end_date` | date | |
| `status` | enum | `upcoming`, `active`, `completed`, `archived` |
| `min_participants` | integer | Minimum to produce valid dataset |
| `participant_count` | integer | Current participant count |
| `completion_rate` | decimal (nullable) | Computed at challenge end |
| `result_summary_published` | boolean | Whether public summary has been published |

---

### ChallengeParticipation

A contributor's enrollment in a challenge.

| Field | Type | Description |
|-------|------|-------------|
| `participation_id` | uuid | Primary key |
| `challenge_id` | uuid | FK → Challenge |
| `contributor_id` | uuid | FK → Contributor |
| `run_id` | uuid (nullable) | FK → ProtocolRun once started |
| `joined_at` | timestamp | |
| `completed` | boolean | |
| `data_origin` | enum | |
| `exclusion_status` | enum | |

---

### ContributorReputation

Computed reputation record for a contributor.

| Field | Type | Description |
|-------|------|-------------|
| `reputation_id` | uuid | Primary key |
| `contributor_id` | uuid | FK → Contributor |
| `score` | decimal (0–100) | Aggregate reputation score |
| `adherence_component` | decimal | Weighted adherence sub-score (30%) |
| `completion_component` | decimal | Weighted completion sub-score (20%) |
| `reporting_quality_component` | decimal | Weighted reporting quality sub-score (20%) |
| `consistency_component` | decimal | Weighted consistency sub-score (15%) |
| `community_component` | decimal | Weighted community helpfulness sub-score (10%) |
| `integrity_penalty` | decimal | Deducted for anomaly flags (variable) |
| `tier` | enum | `explorer`, `contributor`, `research_contributor`, `discovery_leader` |
| `last_recalculated_at` | timestamp | |

---

### ProtocolScore

Computed intelligence score for a protocol.

| Field | Type | Description |
|-------|------|-------------|
| `score_id` | uuid | Primary key |
| `protocol_id` | uuid | FK → Protocol |
| `computed_at` | timestamp | |
| `improvement_rate` | decimal | % of participants reporting improvement (weight: 0.4) |
| `adherence_rate` | decimal | Average adherence across eligible runs (weight: 0.3) |
| `completion_rate` | decimal | % of participants finishing the protocol (weight: 0.2) |
| `sample_size_weight` | decimal | Confidence factor based on run count (weight: 0.1) |
| `aggregate_score` | decimal | Weighted sum |
| `eligible_run_count` | integer | Runs meeting `adherence_percentage >= 50` and `data_origin = real_contributor` |
| `excluded_run_count` | integer | Runs excluded from scoring |

---

### Remedy

A natural remedy entity from the Natural Remedy Ontology.

| Field | Type | Description |
|-------|------|-------------|
| `remedy_id` | uuid | Primary key |
| `canonical_name` | string | Authoritative name from ontology |
| `common_names` | array[string] | Aliases |
| `remedy_class` | enum | e.g., `essential_oil`, `herb`, `mineral`, `probiotic`, `adaptogen` |
| `mechanism` | string | Primary biological/chemical mechanism |
| `routes` | array[enum] | e.g., `topical`, `inhalation`, `oral`, `diffusion` |
| `roles` | array[string] | e.g., `anti-inflammatory`, `antimicrobial`, `adaptogenic` |
| `safety_notes` | text (nullable) | Known contraindications or safety considerations |
| `ontology_version` | string | Version of ontology this entry was last validated against |

---

### GeospatialRegion

An anonymized geographic unit used for regional analytics.

| Field | Type | Description |
|-------|------|-------------|
| `region_id` | uuid | Primary key |
| `grid_system` | enum | `h3`, `geohash`, `postal_region` |
| `grid_cell_id` | string | Grid cell identifier |
| `country` | string | ISO country code |
| `province_state` | string (nullable) | |
| `climate_zone` | string (nullable) | Derived classification |
| `min_sample_met` | boolean | Whether 30+ outcomes exist for this region |

---

### SymptomCategory

A structured symptom grouping used to organize protocols and challenges.

| Field | Type | Description |
|-------|------|-------------|
| `category_id` | uuid | Primary key |
| `name` | string | e.g., `respiratory`, `sleep`, `digestive`, `stress`, `immune` |
| `description` | string | |

---

## Entity Relationship Summary

```
Contributor
  ├── ContributorReputation (1:1)
  ├── ChallengeParticipation (1:many)
  └── ProtocolRun (1:many)
        ├── DailySignal (1:many)
        └── Outcome (1:1)

Challenge
  ├── ChallengeParticipation (1:many)
  └── Protocol (many:1)

Protocol
  ├── ProtocolRun (1:many)
  ├── ProtocolScore (1:many over time)
  └── Remedy (many:1)

Remedy → Natural Remedy Ontology (authoritative semantic source)

GeospatialRegion ← Contributor (opt-in, many:1)
```

---

## Critical Event Log

The following events must be logged with full context (actor, entity IDs, timestamp, data integrity fields):

- `protocol_generated`
- `challenge_joined`
- `challenge_completed`
- `outcome_submitted`
- `reputation_recalculated`
- `geospatial_resolved`
- `exclusion_validated`
- `synthetic_data_excluded`
