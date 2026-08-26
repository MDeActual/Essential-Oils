# CLAUDE.md — Phyto.ai Protocol Intelligence Platform

## Purpose

This file governs how Claude (and any AI coding agent) interacts with this repository. It defines behavioral constraints, reading order, and architectural authority rules for the Phyto.ai protocol intelligence platform.

The canonical rules for distinguishing accepted project state from proposed, rejected, or ambiguous work are defined in `docs/PROJECT_STATE_GOVERNANCE.md`.

---

## Mandatory Reading Order

Before generating any code, modifying any module, proposing architectural changes, or creating a PR, the agent **must** read the following documents in order:

1. `AGENTS.md` — agent roles and authority matrix
2. `CLAUDE.md` — this document
3. `docs/PROJECT_STATE_GOVERNANCE.md` — canonical accepted-state and authorization rules
4. `docs/ARCHITECTURE_INDEX.md` — canonical file map
5. `docs/ARCHITECTURE_LOCK.md` — frozen decisions (do not override)
6. `docs/ARCHITECTURE_DECISION_LOG.md` — decision history and rationale
7. `docs/DOMAIN_MODEL.md` — core domain entities and relationships
8. `docs/MOAT_MODEL.md` — competitive differentiation and IP boundaries
9. `.claude/project_context.md` — current project state
10. `.claude/current_phase.md` — active development phase

The agent must also inspect relevant open and closed PRs and applicable execution protocols before acting.

After reading, the agent must produce a **Project State Confirmation** as defined by `docs/PROJECT_STATE_GOVERNANCE.md` before any non-read-only work.

---

## Behavioral Constraints

- **Never override locked architectural decisions** listed in `docs/ARCHITECTURE_LOCK.md`.
- **Never modify domain entity definitions** in `docs/DOMAIN_MODEL.md` without explicit human approval and a corresponding ADR in `docs/ARCHITECTURE_DECISION_LOG.md`.
- **Preserve moat boundaries** defined in `docs/MOAT_MODEL.md`. Do not expose proprietary scoring logic, blend intelligence, or protocol generation algorithms through public interfaces.
- **Follow swarm rules** documented in `docs/swarm_rules.md` when generating contributor analytics or simulation data.
- **Data integrity**: All analytics-eligible contributor records must include `data_origin` and `exclusion_status`. Only `real_contributor` data is permitted in production insights. Adherence below 50% must be excluded from scoring.
- **Do not infer authorization.** Technical correctness, passing tests, mergeability, an open task, a phase checklist, an existing branch, or an agent's own recommendation does not authorize implementation or acceptance.
- **Do not promote proposed work to accepted state.** Open PRs, feature branches, proposed ADRs, issue text, generated summaries, and agent-produced project-state documents are proposed unless explicitly accepted under `docs/PROJECT_STATE_GOVERNANCE.md`.
- **If guidance conflicts, stop.** The agent must report the conflict and request resolution rather than selecting an interpretation that permits continued work.
- **Rejected work remains rejected** unless the Human Project Lead explicitly authorizes reconsideration.

---

## Code Generation Rules

- Match the naming conventions and module boundaries in `docs/ARCHITECTURE_INDEX.md`.
- Prefer extending existing domain models over introducing new top-level entities.
- All new API endpoints must conform to the protocol layer schema defined in the canonical v11 package.
- Do not generate synthetic simulation data mixed with production analytics without explicit isolation flags.
- Do not modify application code during a governance-only task.

---

## Commit and PR Standards

- Commits affecting locked architecture must reference the relevant ADR number.
- Branch names for architecture changes must use the prefix `arch/`.
- PRs modifying domain model or moat definitions require human review before merge.
- Creation of a PR is not acceptance.
- Passing CI is not acceptance.
- A phase may not be marked complete until its documented human acceptance gate has occurred.
- Governance changes affecting authority, acceptance, or agent behavior must be isolated in a discrete governance-only change and reviewed independently of application-code changes.

---

## Contact

Architecture decisions escalate to the project lead. Agent autonomy is bounded by the protocols in `docs/autonomous_iteration_protocol.md` and the canonical project-state rules in `docs/PROJECT_STATE_GOVERNANCE.md`.
