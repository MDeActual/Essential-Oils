# autonomous_iteration_protocol.md — Protocol Evolution Workflow

## Purpose

This document defines the rules, gates, and workflow that govern how the Phyto.ai protocol intelligence platform autonomously surfaces, evaluates, and applies protocol iterations. All autonomous evolution activity must follow this protocol. Agents may not bypass these steps.

---

## Principles

1. **Human in the loop for structural changes**: Agents may identify and surface candidates for protocol evolution, but structural changes to protocol templates require human approval.
2. **Evidence threshold before action**: Evolution candidates must meet a minimum evidence threshold before being surfaced for review.
3. **Immutable audit trail**: Every proposed and accepted iteration must be logged.
4. **No silent changes**: Agents must never silently modify production protocols. All changes must be explicitly committed with an ADR reference.

---

## Evolution Trigger Conditions

The Protocol Evolution Agent may initiate an iteration review when **any** of the following conditions are met in the analytics layer:

| Trigger | Threshold | Description |
|---------|-----------|-------------|
| Low adherence signal | < 60% avg adherence over 30+ contributors | Protocol phase may be poorly designed or too demanding |
| High challenge skip rate | > 40% skip rate on a specific challenge | Challenge may be unclear, poorly timed, or irrelevant |
| Outcome plateau | < 5% improvement in outcome scores over 2 versions | Protocol may have reached effectiveness ceiling |
| Population size gate | ≥ 30 `real_contributor` records required | Minimum evidence threshold for any evolution signal |

---

## Workflow Stages

### Stage A: Signal Detection

The Contributor Analytics Agent monitors population metrics continuously. When a trigger condition is met:

1. The Analytics Agent emits an `EvolutionSignal` object:
   ```json
   {
     "signal_id": "sig-<uuid>",
     "trigger": "<trigger_name>",
     "protocol_id": "<id>",
     "protocol_version": "<semver>",
     "evidence_count": <int>,
     "metric": "<metric_name>",
     "metric_value": <float>,
     "timestamp": "<iso8601>"
   }
   ```
2. The signal is routed to the Swarm Orchestrator.

---

### Stage B: Candidate Generation

The Protocol Evolution Agent receives the signal and:

1. Analyzes the affected protocol phase or challenge.
2. Generates 1–3 iteration candidates with rationale.
3. Each candidate is typed as:
   ```json
   {
     "candidate_id": "cand-<uuid>",
     "signal_id": "<signal_id>",
     "type": "phase_modification | challenge_update | oil_substitution | duration_adjustment",
     "proposed_change": "<description>",
     "rationale": "<evidence-based rationale>",
     "risk_level": "low | medium | high",
     "requires_human_approval": <boolean>
   }
   ```
4. All `high` risk candidates and any candidates of type `phase_modification` automatically set `requires_human_approval: true`.

---

### Stage C: Review Gate

- **Low/medium risk, non-structural candidates**: Routed to Swarm Orchestrator for validation. May proceed to Stage D without human review if validation passes.
- **High risk or structural candidates**: Held in review queue. Human project lead must explicitly approve before Stage D.

The Swarm Orchestrator must not auto-approve more than one evolution cycle per protocol version without human review of the cumulative change set.

---

### Stage D: Controlled Application

Once approved:

1. The candidate is applied to a new protocol version (MINOR bump for phase/challenge changes, PATCH for metadata).
2. The new version is deployed to a shadow cohort (≥ 10 contributors) before full rollout.
3. Shadow cohort performance is monitored for 14 days.
4. If shadow cohort adherence ≥ baseline − 5%, full rollout proceeds.
5. If shadow cohort adherence < baseline − 5%, the iteration is rolled back and logged as `REJECTED`.

---

### Stage E: Logging and ADR

After every accepted or rejected iteration:

1. Append an entry to `docs/ARCHITECTURE_DECISION_LOG.md` if a structural decision was involved.
2. Update the protocol's version record.
3. Archive the `EvolutionSignal` and all candidates with final status (`ACCEPTED` / `REJECTED` / `PENDING`).

---

## Rollback Procedure

If a deployed iteration causes adherence regression > 10% relative to baseline:

1. Immediately revert to the previous protocol version.
2. Emit an `IterationRollback` event with the candidate ID, regression metric, and timestamp.
3. Flag the iteration as `REJECTED` in the log.
4. Alert the human project lead.

---

## Constraints

- Agents may never modify `docs/ARCHITECTURE_LOCK.md` or `docs/DOMAIN_MODEL.md` through this workflow.
- Simulation data must never be used as the evidence base for a real evolution signal.
- The minimum evidence count (30 `real_contributor` records) is a hard gate and may not be waived by any agent.
