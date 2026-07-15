# ADR-015: Establish Cloud Matrix DevOS Foundation v0.1

**Status**: ACCEPTED  
**Date**: 2026-07-15  
**Deciders**: Human Project Lead, DevOS / Swarm Orchestrator

## Context

Cloud Matrix Business Solutions is being developed as a Microsoft-aligned AI-native product business.

DevOS is the intended development operating system for Cloud Matrix. It should standardize how Cloud Matrix plans, builds, reviews, secures, ships, and improves products.

The Essential-Oils repository, representing Phyto.ai, is the most mature current product codebase and is therefore the first practical pilot for DevOS.

Cloud Matrix also needs a daily operating model that reduces cognitive load and converts changing context into clear guidance rather than raw dashboards or news streams.

## Decision

Establish **Cloud Matrix DevOS Foundation v0.1** inside the Essential-Oils repository under:

```text
cloudmatrix/devos-foundation/
```

The foundation includes:

- `CLOUD_MATRIX_REFERENCE_ARCHITECTURE_v0.1.md`
- `CLOUD_MATRIX_CONSTITUTION.md`
- `DEVOS_COMMAND_CENTER.md`
- `AGENT_CHARTER_TEMPLATE.md`
- `DEVOS_ALIGNMENT_PR_CHECKLIST.md`
- `DECISION_ENGINE_CONTRACT.md`
- `METHODOLOGY_CHANGELOG.md`

Add a repository PR template at:

```text
.github/pull_request_template.md
```

The PR template embeds DevOS alignment checks so future work must consider Cloud Matrix principles, Microsoft alignment, security-by-default, governance impact, and human approval boundaries.

## Consequences

- Essential-Oils becomes the first DevOS pilot.
- Phyto.ai V1 should now be completed using DevOS Foundation v0.1 practices.
- Future Cloud Matrix products, including SecurePulse, can inherit patterns proven in Essential-Oils.
- Microsoft guidance becomes a first-class engineering input where relevant.
- DevOS methodology changes must be captured in the Methodology Changelog.
- Recurring Cloud Matrix agents should be defined through agent charters before operational use.

## Non-Goals

This ADR does not finalize DevOS as a standalone product.

This ADR does not define the complete SecurePulse roadmap.

This ADR does not replace product-specific architecture decisions inside Phyto.ai or SecurePulse.

## Follow-Up

1. Use the DevOS Command Center during daily project work.
2. Complete the shortest production path for Phyto.ai V1.
3. Capture reusable execution patterns into DevOS.
4. Apply the proven operating model to SecurePulse.
