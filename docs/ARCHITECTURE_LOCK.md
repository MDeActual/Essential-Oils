# ARCHITECTURE_LOCK.md — Frozen Architectural Decisions

## Purpose

This document lists architectural decisions that are **permanently locked**. No agent, automated process, or developer may override these decisions without explicit written approval from the human project lead and a corresponding ADR in `docs/ARCHITECTURE_DECISION_LOG.md`.

Violations of locked decisions are a critical governance failure and must be surfaced immediately.

---

## Locked Decisions

### LOCK-001: Domain Model Immutability
**Decision**: The core domain entities defined in `docs/DOMAIN_MODEL.md` (Oil, Protocol, User Profile, Challenge, Blend, Contributor Record) may not be renamed, removed, or have their primary relationships changed without an ADR.

**Rationale**: These entities form the semantic foundation of the entire platform. Breaking changes propagate across protocol engine, analytics, API, and simulation layers.

**Locked by**: Architecture Control Layer v1.0
**Date**: 2026-04-10

---

### LOCK-002: Moat Boundary Enforcement
**Decision**: The components listed in `docs/MOAT_MODEL.md` as proprietary (synergy scoring matrix, protocol generation algorithm, challenge engine rules) must never be exposed through external-facing APIs, public documentation, or agent outputs visible outside the system boundary.

**Rationale**: These components represent the primary competitive differentiation of Phyto.ai. External exposure would eliminate the platform's moat.

**Locked by**: Architecture Control Layer v1.0
**Date**: 2026-04-10

---

### LOCK-003: Analytics Data Integrity Rules
**Decision**: The following rules are permanently enforced in all analytics pipelines:
- Only `real_contributor` records are analytics-eligible.
- Records with adherence below 50% are excluded from scoring.
- All contributor records used in production analytics must include `data_origin` and `exclusion_status` fields.
- Synthetic simulation data must never be mixed into production analytics without explicit isolation flags.

**Rationale**: Data integrity is foundational to the validity of protocol evolution signals and population-level insights.

**Locked by**: Architecture Control Layer v1.0
**Date**: 2026-04-10

---

### LOCK-004: Agent Authority Boundaries
**Decision**: The authority matrix defined in `AGENTS.md` is locked. No agent may expand its own authority level or bypass the Swarm Orchestrator routing requirement.

**Rationale**: Unconstrained agent authority creates compounding errors and unpredictable system state. Bounded authority is a safety requirement.

**Locked by**: Architecture Control Layer v1.0
**Date**: 2026-04-10

---

### LOCK-005: Protocol Versioning
**Decision**: Protocol versions must follow semantic versioning (MAJOR.MINOR.PATCH). Production protocol changes require a MINOR or MAJOR version bump. Patch versions are reserved for documentation and metadata corrections only.

**Rationale**: Consistent versioning enables reliable protocol evolution tracking and rollback capability.

**Locked by**: Architecture Control Layer v1.0
**Date**: 2026-04-10

---

## Amendment Process

To amend a locked decision:

1. Open a draft ADR in `docs/ARCHITECTURE_DECISION_LOG.md` with status `PROPOSED`.
2. Obtain explicit written approval from the human project lead.
3. Update the relevant locked entry with `AMENDED BY: ADR-XXX`.
4. Update any downstream documents affected by the amendment.

Agents must not interpret "proposed" ADRs as permission to act. Only `ACCEPTED` ADRs ratify changes.
