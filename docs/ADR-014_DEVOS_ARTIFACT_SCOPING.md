# ADR-014: Scope Reusable DevOS Artifacts Under devos/

**Status**: ACCEPTED
**Date**: 2026-07-13
**Deciders**: Human Project Lead, Swarm Orchestrator

## Context

The repository contained reusable DevOS workflow artifacts at the repository root:

- `SWARM_PROMPT_STAGED.md`
- `devos_execution_plan.md`

These files are useful governance and execution templates, but they are not Phyto.ai runtime application code. Keeping them at the repository root made the boundary between product implementation, architecture governance, and reusable execution infrastructure less clear.

## Decision

Relocate reusable DevOS artifacts under a dedicated `devos/` namespace:

- `SWARM_PROMPT_STAGED.md` → `devos/prompts/SWARM_PROMPT_STAGED.md`
- `devos_execution_plan.md` → `devos/runbooks/devos_execution_plan.md`

Add `devos/README.md` to clarify that this folder contains cross-project DevOS workflow templates, not runtime code under `src/`.

Update active references in governance files so orchestrator and swarm rules point to the new paths.

## Consequences

- The repository root is cleaner and focused on project-level entry files.
- Reusable DevOS execution materials are separated from Phyto.ai runtime implementation.
- Agents must use the new `devos/` paths for active workflow references.
- Historical ADR entries may continue to mention the original root path when describing the original 2026-04-10 architecture control layer; this ADR records the current relocation decision.
