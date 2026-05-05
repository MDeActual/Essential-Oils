# swarm_rules.md — Data Integrity and Multi‑Agent Analytics Rules

## Purpose

This document defines the data integrity rules that govern contributor analytics and any workflow that produces population‑level insights. These rules are locked by `LOCK-003` in `docs/ARCHITECTURE_LOCK.md`.

## Contributor Analytics Eligibility (LOCK-003)

All analytics pipelines must enforce the following invariants for every `ContributorRecord`:

1. `data_origin` is required.
2. `exclusion_status` is required.
3. Only records with `data_origin: real_contributor` are analytics‑eligible.
4. Records with `adherence_score < 50` are excluded from scoring.
5. Synthetic simulation data must never be mixed into production analytics without explicit isolation flags.

## Required Fields

Any record that enters an analytics pipeline must include, at minimum:

- `record_id`
- `protocol_id`
- `data_origin`
- `exclusion_status`
- `adherence_score`
- `challenge_completion_rate`
- `recorded_at`

## Exclusion Semantics

- `exclusion_status: included` indicates the record is eligible for analytics scoring (subject to validation).
- `exclusion_status: excluded` indicates the record must not influence scoring.
- `exclusion_reason` must be populated when `exclusion_status: excluded` and should reflect the cause (e.g. adherence below threshold, synthetic data, manual exclusion).

## Synthetic Simulation Isolation

Records with `data_origin: synthetic_simulation` may be used in isolated simulation contexts only. They must not be included in production analytics outputs unless the pipeline explicitly segregates and labels synthetic data paths end‑to‑end.

