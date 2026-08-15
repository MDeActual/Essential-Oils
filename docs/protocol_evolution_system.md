# protocol_evolution_system.md — Protocol Evolution System Specification

## Purpose

This document specifies the Protocol Evolution System: the feedback-driven mechanism by which Phyto.ai protocols improve over time based on real-world contributor data. The system surfaces protocol iteration candidates for human review and governs the evidence-based amendment process.

The Protocol Evolution Agent (as defined in `AGENTS.md`) has advisory-only authority — it cannot autonomously modify protocols. All recommended changes must be reviewed and approved by the human project lead.

---

## Governing Rules

- **LOCK-005**: Protocol versions must follow semantic versioning (MAJOR.MINOR.PATCH).
- **LOCK-003**: Only `real_contributor` records with `adherence_score ≥ 50` are eligible inputs to evolution signals.
- **LOCK-004**: The Protocol Evolution Agent has LOW authority — advisory only. No autonomous protocol modification is permitted.
- **M-004**: The population analytics signal model (the methodology that translates contributor data into evolution signals) is moat-protected and must not be described in public documentation.

---

## System Overview

```
Contributor Records (real, adherence ≥ 50%)
        ↓
Contributor Analytics Pipeline (src/analytics/)
        ↓
Analytics Signal Layer (ADR-013)
        ↓
Protocol Evolution Agent (advisory output)
        ↓
Human Project Lead Review
        ↓
Protocol Amendment (version bump + ADR entry)
```

---

## Protocol Versioning

### Version Schema

All protocols follow **semantic versioning**: `MAJOR.MINOR.PATCH`

| Version Component | Trigger | Examples |
|-------------------|---------|---------|
| `MAJOR` | Structural redesign of protocol phases or goals | Phase reordering, goal change |
| `MINOR` | Evidence-driven amendment to oil selections, challenge sequencing, or timing | New challenge added, oil swapped |
| `PATCH` | Documentation correction, metadata update, no behavioral change | Typo fix, tag update |

**Rule EV-001**: Any change to a protocol's `phases`, `challenge_ids`, or `goal` field requires a MINOR or MAJOR version bump. PATCH versions are reserved for non-behavioral changes only.

### Version Lifecycle

```
draft → active → deprecated
```

| Status | Description |
|--------|-------------|
| `draft` | Under construction; not eligible for deployment or contributor data collection |
| `active` | Deployed and collecting contributor data |
| `deprecated` | Superseded by a newer version; no new participants assigned; historical data retained |

**Rule EV-002**: Only one version of a given protocol (by base `protocol_id` slug) may be in `active` status at a time.

**Rule EV-003**: Deprecating an `active` protocol requires a corresponding new `active` version to exist before the deprecation is applied.

---

## Evolution Signal Types

The Analytics Signal Layer (ADR-013) produces the following signal types. These are the public behavioral contracts; the underlying methodology is moat-protected (M-004).

| Signal | Description | Action Trigger |
|--------|-------------|----------------|
| `low_adherence_alert` | Protocol-level adherence below threshold across ≥ 3 contributors | Flag for review |
| `high_skip_rate` | A specific challenge has skip rate > 40% across eligible contributors | Challenge revision candidate |
| `phase_drop_off` | Significant reduction in completion rate at a specific phase boundary | Phase structure review |
| `positive_outcome_cluster` | High adherence + positive outcome notes cluster around specific oil combination | Blend reinforcement candidate |
| `regression_alert` | A protocol version shows lower adherence than its predecessor | Immediate human review required |

**Rule EV-004**: A `regression_alert` signal must be surfaced to the human project lead within one analytics cycle and blocks the affected protocol from being used as a base for further evolution until resolved.

---

## Evolution Candidate Lifecycle

### Step 1: Signal Generation

The Contributor Analytics Agent runs the analytics pipeline against the current eligible contributor record set. The Analytics Signal Layer emits a set of typed signals.

### Step 2: Evolution Report

The Protocol Evolution Agent (advisory) consumes the signals and produces an **Evolution Candidate Report**. This report contains:

```json
{
  "report_id": "evol-YYYY-MM-DD-NNN",
  "generated_at": "ISO 8601 timestamp",
  "protocol_id": "target protocol id",
  "current_version": "MAJOR.MINOR.PATCH",
  "signals": [ { "type": "...", "severity": "info|warning|critical", "detail": "..." } ],
  "candidates": [
    {
      "candidate_id": "...",
      "recommended_change": "human-readable description",
      "change_type": "challenge_revision | oil_substitution | phase_restructure | deprecation",
      "evidence_summary": "aggregate metrics only — no individual contributor data",
      "proposed_version_bump": "minor | major",
      "status": "proposed"
    }
  ]
}
```

**Rule EV-005**: Evolution Candidate Reports must contain only aggregate metrics. No individual contributor data may appear in any report field.

### Step 3: Human Review

The human project lead reviews each candidate. For each:
- **Accepted** → proceed to Step 4
- **Rejected** → candidate marked `rejected`; no change
- **Deferred** → candidate marked `deferred`; re-evaluated in the next cycle

### Step 4: Protocol Amendment

For each accepted candidate:

1. Create a new protocol entity with the amended content.
2. Apply the appropriate version bump per LOCK-005.
3. Add an ADR entry to `docs/ARCHITECTURE_DECISION_LOG.md` documenting:
   - The evolution signal that triggered the candidate
   - The change made
   - The evidence basis (aggregate metrics)
   - The new version number
4. Set the amended protocol to `draft` status for validation.
5. Run the simulation layer to validate predicted adherence curves (see `docs/synthetic_simulation_specification.md`).
6. Promote to `active` after validation and human sign-off.
7. Deprecate the prior version.

**Rule EV-006**: Every protocol amendment must reference an ADR. Amendments without an ADR entry are invalid.

---

## Governance Constraints

### What the Protocol Evolution Agent CAN do

- Read `docs/ARCHITECTURE_DECISION_LOG.md`, `docs/ARCHITECTURE_INDEX.md`, `.claude/current_phase.md`.
- Consume Analytics Signal Layer outputs.
- Generate Evolution Candidate Reports.
- Propose recommended changes with evidence.

### What the Protocol Evolution Agent CANNOT do

- Directly modify any protocol entity.
- Directly modify any source file.
- Approve or accept its own candidates.
- Bypass the ADR process.
- Act on `proposed` ADRs (only `ACCEPTED` ADRs authorize action — `docs/ARCHITECTURE_LOCK.md`).

---

## Integration with Autonomous Iteration Protocol

Full workflow details for multi-cycle protocol evolution are documented in `docs/autonomous_iteration_protocol.md`. This document defines the signal contracts and governance rules; that document defines the execution workflow.

---

## Moat Boundary Summary

| Component | Public? | Notes |
|-----------|---------|-------|
| Protocol versioning rules (LOCK-005) | ✅ | Documented above |
| Protocol version lifecycle states | ✅ | Documented above |
| Evolution signal types and triggers | ✅ | Behavioral contracts only |
| Evolution Candidate Report schema | ✅ | Documented above |
| Evolution governance constraints | ✅ | Documented above |
| Population analytics signal methodology | ❌ | M-004 |
| Signal extraction weighting scheme | ❌ | M-004 |

---

## References

- Domain entity: `docs/DOMAIN_MODEL.md` → Protocol, Contributor Record
- Moat protection: `docs/MOAT_MODEL.md` → M-004
- Architecture lock: `docs/ARCHITECTURE_LOCK.md` → LOCK-003, LOCK-004, LOCK-005
- Agent authority: `AGENTS.md` → Protocol Evolution Agent
- Analytics layer: `src/analytics/`
- Autonomous iteration workflow: `docs/autonomous_iteration_protocol.md`
- ADR: `docs/ARCHITECTURE_DECISION_LOG.md` → ADR-013
