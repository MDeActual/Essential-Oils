# DOMAIN_MODEL.md — Core Domain Entities and Relationships

## Purpose

This document defines the canonical domain model for the Phyto.ai protocol intelligence platform. These entities and relationships are locked per LOCK-001 in `docs/ARCHITECTURE_LOCK.md`. Changes require an ADR and human approval.

---

## Core Entities

### 1. Oil

The fundamental unit of the platform. Represents a single essential oil with its chemical profile, therapeutic properties, and safety parameters.

**Primary Attributes:**
- `oil_id` — unique identifier
- `common_name` — e.g., "Lavender"
- `latin_name` — e.g., "Lavandula angustifolia"
- `chemical_constituents` — array of primary chemical compounds
- `therapeutic_properties` — array (e.g., calming, anti-inflammatory, antimicrobial)
- `application_methods` — array (topical, aromatic, internal)
- `safety_notes` — contraindications, dilution requirements
- `ontology_tags` — classification tags from the oil ontology

---

### 2. Protocol

A structured, personalized sequence of oil application recommendations designed to address a user's health goals over time.

**Primary Attributes:**
- `protocol_id` — unique identifier
- `version` — semantic version (MAJOR.MINOR.PATCH)
- `user_profile_id` — reference to associated User Profile
- `goal` — primary health objective
- `phases` — ordered array of protocol phases, each containing oil references and instructions
- `duration_days` — total recommended duration
- `challenge_ids` — array of associated Challenge IDs
- `created_at` — timestamp
- `status` — draft | active | completed | deprecated

**Relationships:**
- Belongs to one User Profile
- Contains one or more Blends
- References one or more Challenges

---

### 3. User Profile

Represents an individual user's health context, preferences, and history within the platform.

**Primary Attributes:**
- `user_id` — unique identifier
- `health_goals` — array of stated health objectives
- `sensitivities` — known allergies or contraindications
- `experience_level` — beginner | intermediate | advanced
- `application_preferences` — preferred application methods
- `active_protocol_id` — reference to current Protocol
- `protocol_history` — array of past Protocol IDs
- `created_at` — timestamp

**Relationships:**
- Has zero or one active Protocol
- Has many historical Protocols
- Generates Contributor Records

---

### 4. Challenge

A structured milestone or behavioral prompt within a Protocol that drives adherence and tracks progress.

**Primary Attributes:**
- `challenge_id` — unique identifier
- `protocol_id` — reference to parent Protocol
- `type` — adherence | educational | experiential
- `prompt` — the challenge instruction or question
- `due_day` — day within protocol when challenge is presented
- `completion_status` — pending | completed | skipped
- `response` — user's recorded response or completion data

**Relationships:**
- Belongs to one Protocol
- Contributes to Contributor Record adherence metrics

---

### 5. Blend

A specific combination of two or more Oils, with defined ratios and application context.

**Primary Attributes:**
- `blend_id` — unique identifier
- `oils` — array of `{ oil_id, ratio, role }` objects
- `synergy_score` — computed blend compatibility score (moat-protected computation)
- `application_method` — topical | aromatic | internal
- `intended_effect` — primary therapeutic goal of the blend
- `safety_validated` — boolean

**Relationships:**
- Used within one or more Protocol phases
- References two or more Oils

---

### 6. Contributor Record

Represents a user's participation data used for population-level analytics and protocol evolution signals.

**Primary Attributes:**
- `record_id` — unique identifier
- `user_id` — reference to User Profile (anonymized for analytics)
- `protocol_id` — reference to Protocol
- `data_origin` — `real_contributor` | `synthetic_simulation`
- `exclusion_status` — `included` | `excluded`
- `exclusion_reason` — reason if excluded (e.g., adherence_below_threshold)
- `adherence_score` — percentage (0–100)
- `challenge_completion_rate` — percentage (0–100)
- `outcome_notes` — qualitative outcome data
- `recorded_at` — timestamp

**Constraints (LOCK-003):**
- Only records with `data_origin: real_contributor` are analytics-eligible.
- Records with `adherence_score < 50` must have `exclusion_status: excluded`.
- All records used in production analytics must have both `data_origin` and `exclusion_status` present.

**Relationships:**
- Belongs to one User Profile
- Associated with one Protocol

---

## Entity Relationship Summary

```
User Profile ──< Protocol ──< Challenge
                    │
                    └──< Blend ──< Oil
                    │
User Profile ──< Contributor Record
```

- One User Profile has many Protocols (one active).
- One Protocol has many Challenges and many Blends.
- One Blend references many Oils.
- One User Profile generates many Contributor Records (one per Protocol participation).

---

## Ontology Extension Points

The Oil entity supports `ontology_tags` for classification via a separate oil ontology layer. This layer is planned in `src/ontology/` and will extend (not replace) the Oil entity definition.
