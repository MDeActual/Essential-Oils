# ADR-019: Canonical Project State and Agent Authorization Governance

**Status**: PROPOSED  
**Date**: 2026-08-26  
**Deciders**: Human Project Lead (pending acceptance)

## Context

The repository already contains agent roles, architecture locks, phase documents, execution protocols, and autonomous workflows. Those controls did not provide one unambiguous contract for distinguishing accepted project state from proposed work, nor did they require a new agent to reconstruct the project's accepted state and authorization boundary before acting.

This created a material continuity and governance risk: an agent could interpret an open PR, a phase checklist, passing tests, or technically correct proposed work as permission to advance the project. The project needs a durable handoff mechanism that preserves not only artifacts, but authority, rationale, rejected work, unresolved decisions, and acceptance gates.

## Decision

Establish `docs/PROJECT_STATE_GOVERNANCE.md` as the canonical contract for:

- accepted versus proposed, rejected, superseded, and conflicted project state;
- authority precedence and conflict handling;
- implementation authorization;
- merge and phase acceptance;
- treatment of rejected work;
- mandatory preflight for new and returning agents;
- Project State Confirmation before consequential work;
- governance-only change isolation.

Update `CLAUDE.md` and `AGENTS.md` to make this contract part of the mandatory agent workflow and to explicitly prohibit inference of authorization.

This ADR is **PROPOSED** until the Human Project Lead accepts the governance change. The governance branch must not be merged to `main` until that acceptance occurs.

## Acceptance Gate

The Human Project Lead must review the governance branch and confirm that:

1. The authority order is unambiguous.
2. Accepted state cannot be inferred from proposed artifacts.
3. Agents are required to reconstruct project state before acting.
4. Rejected work cannot silently re-enter accepted state.
5. Governance changes remain separate from application-code changes.

## Consequences

- New agents have an explicit state/authorization preflight.
- Technical correctness no longer implies permission to implement or accept a change.
- Open PRs and feature branches are explicitly non-authoritative until accepted.
- Conflicts must stop execution rather than being resolved by agent interpretation.
- Project continuity becomes an explicit repository concern rather than an implicit property of individual conversations.
- The governance layer becomes a durable handoff artifact for future human and AI collaborators.

## Scope

This ADR changes governance only. It intentionally does not change application code, domain entities, moat logic, protocol behavior, or the accepted implementation state of the project.
