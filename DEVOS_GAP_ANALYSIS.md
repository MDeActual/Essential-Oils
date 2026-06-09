# DEVOS_GAP_ANALYSIS.md

## Scope

Reviewed:
- `AGENTS.md`
- `CLAUDE.md`
- `SWARM_PROMPT_STAGED.md`
- `devos_execution_plan.md`

Goal: identify overlap, contradictions, missing components, reusable agent architecture, and a recommended unified DevOS structure.

---

## Executive Summary

The repository already contains the building blocks of a DevOS system, but they are split across four artifacts with different abstraction levels:
- `AGENTS.md` defines roles, authority, and inter-agent contracts
- `CLAUDE.md` defines governance, reading order, and architectural constraints
- `SWARM_PROMPT_STAGED.md` defines lifecycle stages for orchestrated execution
- `devos_execution_plan.md` defines a single operational audit workflow

Together they form a partial DevOS, but they are not yet unified. The main issues are duplicated governance rules, inconsistent execution contracts, incomplete bootstrap requirements, and the absence of a canonical DevOS operating spec that connects policy, orchestration, task schemas, and operational runbooks.

---

## 1. Overlap

### Governance overlap
- `AGENTS.md` and `CLAUDE.md` both define agent authority and behavioral boundaries.
- `CLAUDE.md` and `SWARM_PROMPT_STAGED.md` both enforce pre-flight checks against locked architecture and current phase.
- `AGENTS.md`, `CLAUDE.md`, and `SWARM_PROMPT_STAGED.md` all reinforce moat protection and analytics integrity.

### Orchestration overlap
- `AGENTS.md` establishes the Swarm Orchestrator as the coordination hub.
- `SWARM_PROMPT_STAGED.md` operationalizes that orchestration model into stages.
- `devos_execution_plan.md` also describes a staged workflow, but as a manual execution checklist rather than an orchestrated agent flow.

### Execution overlap
- `SWARM_PROMPT_STAGED.md` Stage 5 and `devos_execution_plan.md` both define validation-before-completion behavior.
- `CLAUDE.md` and `devos_execution_plan.md` both assume architecture-aware execution, but only `CLAUDE.md` makes those constraints explicit.

---

## 2. Contradictions

### A. Reading-order mismatch
- `CLAUDE.md` requires reading eight documents in a fixed order before work starts.
- `SWARM_PROMPT_STAGED.md` Stage 0 checks only `CLAUDE.md`, `AGENTS.md`, `.claude/current_phase.md`, and `docs/ARCHITECTURE_LOCK.md`.

Result: the staged swarm bootstrap is weaker than the canonical governance bootstrap.

### B. Output contract mismatch
- `AGENTS.md` says all agent outputs must include `agent_id`, `timestamp`, `version`, and `payload`.
- `SWARM_PROMPT_STAGED.md` Stage 3 defines `{ "agent_id": "", "task_id": "", "status": "complete|blocked", "output": {}, "flags": [] }`.
- Stage 4 and Stage 6 also emit ad hoc payloads outside the `AGENTS.md` contract.

Result: there is no single canonical message schema.

### C. Authority/process mismatch
- `AGENTS.md` says agents must not directly invoke each other and must route through the Swarm Orchestrator.
- `devos_execution_plan.md` is written as a direct operator checklist with no orchestrator role, no assignment model, and no authority checks.

Result: the plan is executable, but not aligned with the defined swarm operating model.

### D. Governance depth mismatch
- `CLAUDE.md` requires decision-log awareness, moat awareness, and project-context awareness.
- `devos_execution_plan.md` contains no governance gates for ADRs, locked decisions, moat boundaries, or agent authority.

Result: the execution plan can bypass architectural safeguards if used as-is.

### E. Phase alignment mismatch
- `.claude/current_phase.md` says the repository is in Phase 4: Prisma persistence integration.
- `devos_execution_plan.md` is a post-PR production-readiness audit on `main`, which is an operational release activity, not a Phase 4 implementation slice.

Result: the plan is valuable, but it is not mapped to the repository's current phase model.

---

## 3. Missing Components

### Missing DevOS control plane artifacts
- No single `DEVOS.md` or equivalent canonical operating system document
- No canonical task schema shared by governance docs and execution plans
- No run manifest format for inputs, outputs, checkpoints, approvals, and escalation
- No standard artifact locations for run logs, audit reports, or execution traces

### Missing referenced architecture docs
These are referenced by the architecture layer but absent from the repository:
- `docs/swarm_rules.md`
- `docs/orchestrator_reading_order.md`

These gaps weaken the existing governance model because multiple documents depend on them.

### Missing execution-to-governance links
- `devos_execution_plan.md` does not specify which agent owns each step
- No human-review gate definition for blocked or high-risk tasks
- No explicit mapping from operational tasks to current phase, ADR impact, or locked-decision review
- No reusable approval model for release, audit, migration, or architecture-change workflows

### Missing reusable templates
- No reusable template for audit workflows like `devos_execution_plan.md`
- No reusable template for orchestrator task queues beyond the inline JSON example in `SWARM_PROMPT_STAGED.md`
- No standard result schema that covers status, evidence, violations, approvals, and next actions

---

## 4. Reusable Agent Architecture

The strongest reusable foundation already present is:

1. **Policy layer** — `CLAUDE.md`
   - global rules
   - reading order
   - architecture and moat protections

2. **Authority layer** — `AGENTS.md`
   - agent catalog
   - authority boundaries
   - escalation and routing model

3. **Execution lifecycle layer** — `SWARM_PROMPT_STAGED.md`
   - pre-flight
   - grounding
   - task assignment
   - execution
   - validation
   - completion
   - termination

4. **Runbook layer** — `devos_execution_plan.md`
   - concrete operational task steps
   - success criteria
   - launch/blocking rules

This is already a reusable DevOS pattern:

`Policy -> Authority -> Lifecycle -> Runbook`

What is missing is a canonical wrapper that makes these four layers operate as one system.

---

## 5. Recommended Unified DevOS Structure

### Recommended top-level structure

```text
DEVOS.md
AGENTS.md
CLAUDE.md
SWARM_PROMPT_STAGED.md
devos/
  schemas/
    task_queue.schema.json
    agent_result.schema.json
    run_manifest.schema.json
  runbooks/
    production_readiness_audit.md
    release_validation.md
    migration_validation.md
  prompts/
    swarm_bootstrap.md
    swarm_execution.md
  templates/
    audit_report.md
    gap_analysis.md
docs/
  ARCHITECTURE_INDEX.md
  ARCHITECTURE_LOCK.md
  ARCHITECTURE_DECISION_LOG.md
  DOMAIN_MODEL.md
  MOAT_MODEL.md
  swarm_rules.md
  orchestrator_reading_order.md
```

### Recommended responsibilities

#### `DEVOS.md`
Make this the canonical operating spec that:
- links to `CLAUDE.md`, `AGENTS.md`, and `SWARM_PROMPT_STAGED.md`
- defines the one true execution contract
- defines required bootstrap inputs
- defines standard message schemas
- defines approval and escalation rules
- classifies workflow types: architecture, implementation, audit, release, migration

#### `AGENTS.md`
Keep this focused on:
- agent definitions
- authority matrix
- routing and escalation
- agent I/O responsibilities

#### `CLAUDE.md`
Keep this focused on:
- immutable governance constraints
- reading order
- repository-specific behavioral rules

#### `SWARM_PROMPT_STAGED.md`
Keep this focused on:
- lifecycle stages only
- stage entry/exit criteria
- references to canonical schemas instead of inline ad hoc JSON

#### `devos/runbooks/*.md`
Move task-specific plans here and convert them into reusable runbooks with:
- owner agent
- prerequisites
- commands
- evidence to collect
- pass/fail rules
- escalation path

---

## 6. Recommended Normalization Work

1. Create a canonical DevOS document (`DEVOS.md`).
2. Standardize one output schema across `AGENTS.md` and `SWARM_PROMPT_STAGED.md`.
3. Expand Stage 0 bootstrap to match the full reading order in `CLAUDE.md`.
4. Convert `devos_execution_plan.md` into a reusable runbook instead of a one-off task file.
5. Add the missing referenced docs:
   - `docs/swarm_rules.md`
   - `docs/orchestrator_reading_order.md`
6. Add workflow typing so each run is explicitly classified as:
   - architecture
   - implementation
   - audit
   - release
   - migration
7. Add explicit human approval gates for:
   - locked architecture impacts
   - moat boundary risk
   - production data access
   - release blocking failures

---

## 7. Final Assessment

Current state: **partial DevOS foundation**

Strengths:
- strong governance language
- clear authority model
- staged orchestration model
- useful operational checklist example

Weaknesses:
- no canonical unifying spec
- inconsistent schemas and bootstrap rules
- missing referenced documents
- operational runbooks not yet integrated into the agent system

Recommended direction: **unify the existing artifacts into a layered DevOS model rather than replacing them**. The repository already has the right primitives; it needs normalization, schema standardization, and a single DevOS control-plane document to make them coherent.
