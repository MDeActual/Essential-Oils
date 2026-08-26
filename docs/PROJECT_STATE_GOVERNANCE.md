# Project State Governance

## Purpose

This is the canonical governance contract for preserving and advancing the accepted state of the Phyto.ai project across human and AI collaborators.

It prevents a new agent from treating proposed work, generated documentation, pull requests, or its own interpretation as accepted project truth.

## Authority Order

When project instructions appear to conflict, use this precedence order:

1. Explicit written instruction from the Human Project Lead in the current authorized task.
2. Accepted architecture decisions and locked decisions in the repository.
3. The accepted project state recorded in `.claude/project_context.md` and `.claude/current_phase.md`.
4. Accepted governance and execution protocols.
5. Proposed ADRs, open PRs, agent suggestions, issue text, drafts, experiments, and generated analyses.
6. Agent inference.

An agent must never resolve an ambiguity in its own favor merely because doing so would allow work to continue.

If two accepted sources conflict, the agent must stop and report the conflict to the Human Project Lead. It must not silently choose an interpretation.

## Accepted Project State

The accepted project state is the set of repository facts and decisions explicitly recognized as current and authoritative.

An item is **Accepted** only when one of the following is true:

- The Human Project Lead explicitly approves it in the governing workflow.
- An ADR has status `ACCEPTED` and its required downstream documentation/code updates have been completed as specified.
- A phase has passed its documented human-review exit gate and the accepted state files have been updated accordingly.
- A change is already present on the authoritative `main` branch and has not been explicitly rejected or superseded.

The following are **not** accepted project state merely because they exist:

- Open or draft pull requests.
- Agent-generated code on feature branches.
- Proposed ADRs.
- Issue descriptions or task plans.
- Agent-generated summaries.
- Test results from unaccepted branches.
- A phase checklist changed by an agent but not yet through its human acceptance gate.

When uncertain, treat an item as **Proposed**, not Accepted.

## Change Authorization

### Read-only work

Agents may inspect the repository, analyze artifacts, compare branches, review tests, and produce recommendations without additional authorization.

### Proposed work

An agent may create proposals, draft ADRs, draft PRs, or draft implementation plans when the task authorizes proposal work.

A proposal does not authorize implementation.

### Implementation work

Implementation requires an explicit authorized work item from the Human Project Lead or from an already accepted execution workflow that clearly delegates the specific scope.

Before implementation, the agent must identify:

- the exact accepted objective,
- the authorized scope,
- the files/modules allowed to change,
- the required approval gate,
- and the locked decisions that constrain the work.

If any of these are unclear, the agent must stop and ask for clarification rather than infer permission.

### Merge / acceptance

Creation of a PR is not acceptance.

Passing tests is not acceptance.

Being mergeable is not acceptance.

A phase document saying work is complete is not acceptance unless the documented human review gate has occurred.

The Human Project Lead controls final acceptance unless an explicitly accepted governance rule delegates a narrower approval authority.

## Rejected Work

When the Human Project Lead rejects a change set:

- The rejected code is not part of accepted project state.
- The rejected branch/PR may be retained as historical evidence.
- Rejected rationale should be preserved when it improves future continuity.
- No subsequent agent may revive rejected work as though it were accepted.
- A future agent may reconsider rejected work only when explicitly authorized to revisit it.

## Agent Preflight

Every new or returning agent must complete this preflight before proposing or implementing changes:

1. Identify the repository and authoritative branch.
2. Read `AGENTS.md`.
3. Read `CLAUDE.md`.
4. Read `docs/PROJECT_STATE_GOVERNANCE.md`.
5. Read `docs/ARCHITECTURE_INDEX.md`.
6. Read `docs/ARCHITECTURE_LOCK.md`.
7. Read `docs/ARCHITECTURE_DECISION_LOG.md`.
8. Read `docs/DOMAIN_MODEL.md`.
9. Read `docs/MOAT_MODEL.md`.
10. Read `.claude/project_context.md`.
11. Read `.claude/current_phase.md`.
12. Read the applicable execution protocol, including `docs/swarm_rules.md` and `docs/autonomous_iteration_protocol.md` when relevant.
13. Inspect the current `main` state and relevant open and closed PRs.
14. Identify the last accepted milestone and all explicitly rejected or superseded work relevant to the task.
15. Produce a concise **Project State Confirmation** containing:
   - Mission / objective
   - Current phase
   - Accepted architecture state
   - Locked constraints
   - Current authorized task
   - Explicitly rejected or unaccepted work
   - Open decisions
   - Stop conditions / approval gates

The agent must not begin implementation until the preflight is complete and the authorized scope is unambiguous.

## Project State Confirmation

The Project State Confirmation is an authorization-aware handoff, not a generic summary.

Every material item must be classified as one of:

- `ACCEPTED`
- `PROPOSED`
- `REJECTED`
- `SUPERSEDED`
- `UNKNOWN / CONFLICTED`

The confirmation must never elevate an item from Proposed to Accepted merely because an agent believes the proposal is technically correct.

## Conflict Handling

If repository documents disagree, the agent must:

1. Identify the conflicting statements.
2. Identify their authority levels under this document.
3. State what can be accepted without interpretation.
4. Mark unresolved points as `UNKNOWN / CONFLICTED`.
5. Stop before taking a consequential action that depends on the conflict.

## Phase Completion

A phase is not complete because its implementation exists.

A phase is complete only when all documented technical exit criteria are satisfied **and** the required Human Project Lead acceptance has occurred.

Phase-state documents may be updated to `COMPLETE` only as part of that accepted transition.

## Governance-Only Changes

Changes to governance documents that alter authority, acceptance, phase gates, or agent behavior must be made as discrete, reviewable governance changes.

Such a change must:

- avoid unrelated application-code changes,
- identify the affected governance documents,
- include an ADR when required by the repository's ADR process,
- preserve the prior accepted project state until the governance change itself is accepted,
- and clearly state whether it changes authority or only clarifies existing authority.

## Core Principle

> Agents must preserve project state before they advance project state.

The objective is not merely to continue from the last visible artifact. The objective is to restore the project's accepted understanding, constraints, rationale, authority, and unresolved decisions before acting.
