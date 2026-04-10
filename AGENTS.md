# AGENTS.md — Agent Roles and Authority Matrix

## Overview

This document defines all agent roles operating within the Phyto.ai protocol intelligence platform, their responsibilities, authority levels, and inter-agent communication contracts.

---

## Agent Taxonomy

### 1. Protocol Architect Agent
- **Role**: Owns the structural design of oil protocol recommendations, sequencing logic, and challenge engine rules.
- **Authority Level**: HIGH — may propose architectural changes; cannot commit without human review.
- **Inputs**: Domain model, user health profile, MOAT constraints.
- **Outputs**: Protocol recommendation objects, challenge engine configuration.
- **Constraints**: Must not expose raw scoring weights in any external-facing payload.

### 2. Blend Intelligence Agent
- **Role**: Manages oil combination logic, synergy scoring, and contraindication detection.
- **Authority Level**: HIGH — core IP component; changes require ADR.
- **Inputs**: Oil ontology, user profile, session context.
- **Outputs**: Ranked blend recommendations with confidence scores.
- **Constraints**: Synergy model is a moat asset. No external exposure of the scoring matrix.

### 3. Contributor Analytics Agent
- **Role**: Processes adherence data, generates population-level insights, and feeds protocol evolution signals.
- **Authority Level**: MEDIUM — reads production data; writes only to analytics layer.
- **Inputs**: Contributor records with `data_origin` and `exclusion_status` fields.
- **Outputs**: Aggregated adherence metrics, cohort performance reports.
- **Constraints**:
  - Only `real_contributor` records are analytics-eligible.
  - Records with adherence < 50% are excluded from scoring.
  - Synthetic data must be flagged and isolated.

### 4. Protocol Evolution Agent
- **Role**: Monitors protocol performance signals and surfaces iteration candidates for human review.
- **Authority Level**: LOW — advisory only; cannot modify protocols autonomously.
- **Inputs**: Contributor analytics outputs, protocol version history.
- **Outputs**: Evolution candidate reports, regression alerts.
- **Constraints**: All recommended changes must go through the `docs/autonomous_iteration_protocol.md` workflow.

### 5. Simulation Agent
- **Role**: Runs synthetic user simulations for protocol validation prior to live deployment.
- **Authority Level**: MEDIUM — operates in isolated simulation context only.
- **Inputs**: Protocol specs, synthetic user profiles.
- **Outputs**: Simulation run reports, predicted adherence curves.
- **Constraints**: Simulation data must never be mixed into production analytics without explicit isolation flags.

### 6. Swarm Orchestrator
- **Role**: Coordinates multi-agent workflows, manages reading order enforcement, and resolves agent conflicts.
- **Authority Level**: HIGH — governs agent sequencing; reports to human project lead.
- **Inputs**: All agent outputs, architecture index, current phase.
- **Outputs**: Unified task queue, conflict resolution logs.
- **Constraints**: Must enforce `CLAUDE.md` behavioral constraints across all sub-agents.

---

## Authority Matrix

| Agent                       | Read Arch Docs | Propose Changes | Commit Changes | Modify Domain Model |
|-----------------------------|:--------------:|:---------------:|:--------------:|:-------------------:|
| Protocol Architect Agent    | ✅             | ✅              | ❌             | ❌                  |
| Blend Intelligence Agent    | ✅             | ✅              | ❌             | ❌                  |
| Contributor Analytics Agent | ✅             | ❌              | ❌             | ❌                  |
| Protocol Evolution Agent    | ✅             | ✅ (advisory)   | ❌             | ❌                  |
| Simulation Agent            | ✅             | ❌              | ❌             | ❌                  |
| Swarm Orchestrator          | ✅             | ✅              | ✅ (with ADR)  | ❌                  |
| Human Project Lead          | ✅             | ✅              | ✅             | ✅                  |

---

## Inter-Agent Communication Contract

- All agent outputs are typed JSON objects with a required `agent_id`, `timestamp`, `version`, and `payload` field.
- Agents must not directly invoke each other; all coordination routes through the Swarm Orchestrator.
- Conflict resolution follows the precedence order: Human Lead > Swarm Orchestrator > Domain Agents.

---

## Swarm Execution Rules

See `docs/swarm_rules.md` for full data integrity and execution rules governing multi-agent analytics workflows.
