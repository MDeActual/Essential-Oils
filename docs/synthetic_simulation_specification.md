# synthetic_simulation_specification.md — Synthetic Simulation Infrastructure

## Purpose

This document specifies the design, rules, and data contracts for the Phyto.ai synthetic simulation layer. Synthetic simulation is used for protocol validation, system testing, and pre-launch readiness verification. It must operate in strict isolation from production analytics.

**Critical constraint (LOCK-003)**: Synthetic simulation data must never be mixed into production analytics without explicit isolation flags. All synthetic records must carry `data_origin: synthetic_simulation`.

---

## Design Principles

1. **Hard isolation**: Synthetic data is structurally separated from real contributor data at the record level and at the pipeline level.
2. **Realistic enough to validate**: Simulated contributors must exhibit realistic adherence distributions, challenge completion patterns, and outcome variability.
3. **Controlled by feature flag**: The simulation layer is disabled in production (`ENABLE_SYNTHETIC_DATA=false`). It may be enabled in development and staging.
4. **Deterministic replay**: Simulations must be reproducible given the same seed parameters.

---

## Synthetic Contributor Record

All synthetic contributor records extend the `ContributorRecord` domain entity with mandatory isolation markers.

```json
{
  "record_id": "syn-<uuid>",
  "user_id": "sim-user-<uuid>",
  "protocol_id": "<protocol_id>",
  "data_origin": "synthetic_simulation",
  "exclusion_status": "excluded",
  "exclusion_reason": "synthetic_data",
  "adherence_score": "<float 0-100>",
  "challenge_completion_rate": "<float 0-100>",
  "outcome_notes": "<simulated outcome string>",
  "simulation_run_id": "simrun-<uuid>",
  "simulation_seed": "<integer>",
  "archetype": "<archetype_id>",
  "recorded_at": "<iso8601>"
}
```

**Required fields for all synthetic records**:
- `data_origin: synthetic_simulation` — mandatory, non-negotiable
- `exclusion_status: excluded` — all synthetic records are excluded from production scoring
- `simulation_run_id` — links all records from a single simulation run
- `simulation_seed` — enables deterministic replay

---

## Contributor Archetypes

Synthetic contributor generation uses archetypes to model realistic population diversity.

### Archetype: `high_adherent`

| Parameter | Value |
|-----------|-------|
| Adherence range | 80–100% |
| Challenge completion rate | 85–100% |
| Outcome improvement rate | 65–80% |
| Protocol completion rate | 90–100% |
| Population share (default) | 25% |

### Archetype: `moderate_adherent`

| Parameter | Value |
|-----------|-------|
| Adherence range | 55–79% |
| Challenge completion rate | 50–75% |
| Outcome improvement rate | 40–60% |
| Protocol completion rate | 60–80% |
| Population share (default) | 40% |

### Archetype: `low_adherent`

| Parameter | Value |
|-----------|-------|
| Adherence range | 20–54% |
| Challenge completion rate | 15–45% |
| Outcome improvement rate | 20–40% |
| Protocol completion rate | 30–55% |
| Population share (default) | 25% |

### Archetype: `dropout`

| Parameter | Value |
|-----------|-------|
| Adherence range | 0–29% |
| Challenge completion rate | 0–20% |
| Outcome improvement rate | 0–25% |
| Protocol completion rate | 0–30% |
| Population share (default) | 10% |

**Note**: The `low_adherent` and `dropout` archetypes generate records that must have `exclusion_status: excluded` per LOCK-003 rules (adherence < 50%).

---

## Simulation Run Object

A simulation run represents a full synthetic cohort execution against a specific protocol version.

```json
{
  "simulation_run_id": "simrun-<uuid>",
  "protocol_id": "<uuid>",
  "protocol_version": "<semver>",
  "contributor_count": "<integer>",
  "archetype_distribution": {
    "high_adherent": 0.25,
    "moderate_adherent": 0.40,
    "low_adherent": 0.25,
    "dropout": 0.10
  },
  "simulation_seed": "<integer>",
  "started_at": "<iso8601>",
  "completed_at": "<iso8601>",
  "status": "running | completed | failed",
  "output_summary": {
    "avg_adherence": "<float>",
    "avg_challenge_completion_rate": "<float>",
    "outcome_improvement_rate": "<float>",
    "protocol_completion_rate": "<float>",
    "records_generated": "<integer>",
    "records_excluded": "<integer>"
  }
}
```

---

## Simulation Validation Gates

Before a simulation run can be used for protocol validation, it must pass these checks:

| Gate | Requirement |
|------|-------------|
| Isolation check | All records have `data_origin: synthetic_simulation` |
| Exclusion check | All records with `adherence_score < 50` have `exclusion_status: excluded` |
| Seed recorded | `simulation_seed` is present and non-null |
| Run ID linked | All records reference a valid `simulation_run_id` |
| Count match | `records_generated` matches the actual record count in the run |

Any simulation run that fails a gate must be marked `status: failed` and must not be used for protocol scoring or evolution signal generation.

---

## Use Cases

### Use Case 1: Protocol V1 Validation

Before deploying a new protocol to real contributors, run a simulation to verify:
- Challenge sequencing produces expected completion rate patterns
- Adherence distribution aligns with archetype profiles
- No structural errors in phase timing or challenge `due_day` assignments

### Use Case 2: Challenge Engine Testing

Use simulation to validate challenge presentation logic:
- Confirm challenges surface on the correct `due_day`
- Confirm skip-rate triggers are detectable at expected thresholds
- Confirm state transitions (PENDING → PRESENTED → COMPLETED/SKIPPED) are correct

### Use Case 3: Analytics Pipeline Testing

Use simulation to verify the analytics pipeline:
- Confirm that synthetic records are excluded from production scoring
- Confirm that adherence filters are applied correctly
- Confirm that evolution signal thresholds are only triggerable with `real_contributor` data

### Use Case 4: Shadow Cohort Baseline Generation

Use simulation to establish pre-deployment baseline metrics when insufficient real contributor data exists. **Important**: Simulated baselines must never substitute for real-contributor baselines in actual protocol evolution decisions.

---

## Isolation Enforcement

The analytics pipeline must enforce simulation isolation at two layers:

### Layer 1 — Record Filter

Before any analytics computation, apply:

```
WHERE data_origin = 'real_contributor'
  AND exclusion_status = 'included'
```

### Layer 2 — Pipeline Flag

The `ALLOW_PRODUCTION_INSIGHTS_FROM_REAL_ONLY=true` environment flag must be set in all production and staging environments. When `true`, the analytics pipeline rejects any record not matching Layer 1 criteria with a logged error.

---

## V1 Simulation Target

The V1 launch simulation should generate a minimum cohort of 100 synthetic contributors distributed across all archetypes with:
- At least 3 protocols represented
- At least 2 full 30-day protocol runs completed per protocol
- All validation gates passing before launch sign-off

Output of the V1 simulation must be reviewed by the human project lead before any protocol is moved to active contributor deployment.

---

## File Naming Convention

Simulation output files (for archival and replay):

```
simrun-<uuid>-<protocol_id>-<semver>-seed<seed>.json
```

Example:
```
simrun-f3a2b1c0-sleep-reset-1.0.0-seed42.json
```

These files must be stored in the `synthetic_data/` directory and must never be committed to version control unless explicitly required for reproducibility testing.
