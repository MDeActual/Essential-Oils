# ADR-013: Extend src/analytics/ — Analytics Intelligence Signal Layer

**Status**: PROPOSED
**Date**: 2026-07-13
**Deciders**: Human Project Lead, Swarm Orchestrator

## Context

The stale branch `copilot/implement-analytics-intelligence-layer` contained a useful analytics intelligence slice, but its original ADR entry conflicted with the existing `ADR-010: Extend src/analytics/ — Protocol Cohort Segmentation Slice` entry on `main`.

The branch was also behind current `main`, so the analytics implementation was reconstructed onto a fresh branch from current `main` rather than merged directly.

## Decision

Introduce an analytics intelligence signal layer under `src/analytics/` that provides structural observables and scoring utilities without implementing moat-protected methodology.

The slice adds:

- `src/analytics/signals.ts` — structured observable signal extraction from analytics-eligible contributor records
- `src/analytics/scoring.ts` — structural scoring utilities for protocol effectiveness, blend synergy co-occurrence, and contributor reliability
- `src/analytics/aggregator.ts` — aggregation and normalization utilities
- extended analytics types and public exports
- unit tests for signals, scoring, and aggregation

## Governance boundaries

This slice must remain inside these constraints:

- LOCK-003: analytics processing is limited to eligible real contributor records.
- M-001: blend synergy methodology is not implemented.
- M-003: challenge engine sequencing and personalization rules are not implemented.
- M-004: proprietary population analytics methodology, weighting schemes, and recommendation logic are not implemented.

## Consequences

The analytics layer gains reusable structural signals and score primitives that can support downstream reporting and intelligence features.

The PR intentionally avoids stale `.claude` status/context edits from the original branch and resolves the ADR numbering collision by recording this decision as ADR-013 instead of reusing ADR-010.
