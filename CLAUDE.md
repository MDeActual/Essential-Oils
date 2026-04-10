# CLAUDE.md — Phyto.ai Protocol Intelligence Platform

## Purpose

This file governs how Claude (and any AI coding agent) interacts with this repository. It defines behavioral constraints, reading order, and architectural authority rules for the Phyto.ai protocol intelligence platform.

---

## Mandatory Reading Order

Before generating any code, modifying any module, or proposing architectural changes, Claude **must** read the following documents in order:

1. `AGENTS.md` — agent roles and authority matrix
2. `docs/ARCHITECTURE_INDEX.md` — canonical file map
3. `docs/ARCHITECTURE_LOCK.md` — frozen decisions (do not override)
4. `docs/ARCHITECTURE_DECISION_LOG.md` — decision history and rationale
5. `docs/DOMAIN_MODEL.md` — core domain entities and relationships
6. `docs/MOAT_MODEL.md` — competitive differentiation and IP boundaries
7. `.claude/project_context.md` — current project state
8. `.claude/current_phase.md` — active development phase

---

## Behavioral Constraints

- **Never override locked architectural decisions** listed in `docs/ARCHITECTURE_LOCK.md`.
- **Never modify domain entity definitions** in `docs/DOMAIN_MODEL.md` without explicit human approval and a corresponding ADR in `docs/ARCHITECTURE_DECISION_LOG.md`.
- **Preserve moat boundaries** defined in `docs/MOAT_MODEL.md`. Do not expose proprietary scoring logic, blend intelligence, or protocol generation algorithms through public interfaces.
- **Follow swarm rules** documented in `docs/swarm_rules.md` when generating contributor analytics or simulation data.
- **Data integrity**: All analytics-eligible contributor records must include `data_origin` and `exclusion_status`. Only `real_contributor` data is permitted in production insights. Adherence below 50% must be excluded from scoring.

---

## Code Generation Rules

- Match the naming conventions and module boundaries in `docs/ARCHITECTURE_INDEX.md`.
- Prefer extending existing domain models over introducing new top-level entities.
- All new API endpoints must conform to the protocol layer schema defined in the canonical v11 package.
- Do not generate synthetic simulation data mixed with production analytics without explicit isolation flags.

---

## Commit and PR Standards

- Commits affecting locked architecture must reference the relevant ADR number.
- Branch names for architecture changes must use the prefix `arch/`.
- PRs modifying domain model or moat definitions require human review before merge.

---

## Contact

Architecture decisions escalate to the project lead. Agent autonomy is bounded by the protocols in `docs/autonomous_iteration_protocol.md`.
