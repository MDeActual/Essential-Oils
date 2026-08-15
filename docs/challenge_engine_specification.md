# challenge_engine_specification.md — Challenge Engine Specification

## Purpose

This document specifies the Challenge Engine: the subsystem responsible for determining when, how, and why challenges are presented to users within a Phyto.ai protocol. The Challenge Engine drives user adherence and is a moat-protected component of the platform (M-003, LOCK-002).

This specification defines the engine's behavioral rules, lifecycle, personalization logic, and integration contracts. It does **not** expose the proprietary rule evaluation algorithm — that remains internal to the moat-protected implementation layer.

---

## Scope

The Challenge Engine governs:

1. **Challenge selection** — which challenges are eligible for a given user and protocol phase.
2. **Challenge sequencing** — in what order and at what cadence challenges are presented.
3. **Challenge personalization** — how challenge prompts and timing adapt to user behavior.
4. **Lifecycle enforcement** — the valid state machine for challenge status transitions.
5. **Adherence signal generation** — how challenge outcomes feed the Contributor Analytics pipeline.

The Challenge Engine does **not** govern:
- The content of oil application instructions (owned by Protocol layer).
- Blend recommendation or synergy scoring (owned by Blend Intelligence layer).
- Analytics aggregation or protocol evolution signals (owned by Analytics layer).

---

## Core Concepts

### Challenge Types

Defined in `src/protocol/types.ts` as `ChallengeType`:

| Type | Description | Adherence Weight |
|------|-------------|-----------------|
| `adherence` | Confirms the user has performed a prescribed oil application. Primary adherence signal. | High |
| `educational` | Tests or reinforces protocol knowledge. Supports long-term engagement. | Medium |
| `experiential` | Captures qualitative user experience data. Feeds protocol evolution signals. | Low |

### Challenge Lifecycle States

Defined in `src/protocol/types.ts` as `ChallengeCompletionStatus`:

```
Pending → Completed  (user completes the challenge)
Pending → Skipped    (user explicitly skips)
```

Terminal states: `Completed`, `Skipped`. No transitions are permitted from terminal states.

The state machine is encoded in `src/challenge/schema.ts → VALID_TRANSITIONS`.

### Lifecycle Events

Each state change generates a `ChallengeParticipation` record (see `src/challenge/types.ts`) with event types:

| Event | Trigger |
|-------|---------|
| `presented` | Challenge surfaced to the user |
| `responded` | User submitted a partial or full response |
| `completed` | Challenge reached terminal `Completed` status |
| `skipped` | Challenge reached terminal `Skipped` status |
| `expired` | Challenge passed due day without user action |

---

## Engine Behavioral Rules

### Rule CE-001: One Active Challenge Per Protocol Phase

At any given time, a maximum of one `adherence`-type challenge may be in `Pending` status per active protocol phase. Educational and experiential challenges may queue.

**Rationale**: Prevents user overwhelm; maintains focus on the primary adherence signal.

### Rule CE-002: Due Day Enforcement

Every challenge must have a `due_day` set at creation. Due day is measured in calendar days from the protocol start date. Challenges not resolved by their due day receive an `expired` participation event and are excluded from the timeliness metric.

**Rationale**: Timeliness (`wasTimely` on `ChallengeCompletionRecord`) is a key input to the adherence score in Contributor Records.

### Rule CE-003: Completion Requires Non-Empty Response

A challenge may only reach `Completed` status if the user has submitted a non-empty response string. Skipped challenges may carry an optional `skipReason`.

**Enforced by**: `validateChallengeCompletionRecord()` in `src/challenge/validation.ts`.

### Rule CE-004: Adherence Score Contribution

Each challenge contributes to the protocol-level `adherence_score` on the `ContributorRecord` as follows:

| Outcome | Score Contribution |
|---------|-------------------|
| `Completed` + `wasTimely: true` | Full weight |
| `Completed` + `wasTimely: false` | Partial weight (50%) |
| `Skipped` | Zero weight |
| `Expired` (no terminal status reached) | Zero weight |

The exact weighting formula is moat-protected (M-003). The above represents the public behavioral contract only.

### Rule CE-005: Minimum Challenge Set Per Protocol

A valid protocol must contain at least one `adherence`-type challenge per phase. Protocols with no adherence challenges are invalid and will not be promoted to `active` status.

**Enforced by**: `validateProtocol()` in `src/protocol/validation.ts` (to be enforced in Phase 5 implementation).

### Rule CE-006: Skip Reason Length Constraint

Skip reasons must not exceed `CHALLENGE_SKIP_REASON_MAX_LENGTH` (1000 characters). Response strings must not exceed `CHALLENGE_RESPONSE_MAX_LENGTH` (5000 characters).

**Enforced by**: `validateChallengeParticipation()` and `validateChallengeCompletionRecord()`.

### Rule CE-007: No Retroactive Transition

A challenge that has reached a terminal state (`Completed` or `Skipped`) may not be transitioned to any other state. Any attempt to do so must be rejected by the validation layer.

**Enforced by**: `VALID_TRANSITIONS` map in `src/challenge/schema.ts`.

---

## Personalization Hooks (Moat-Protected)

The following behaviors are governed by the moat-protected challenge intelligence layer (M-003). Their existence is documented here as behavioral contracts; their implementation is not exposed.

### Hook P-001: Adaptive Sequencing

The engine adjusts challenge sequencing based on a user's historical completion rate and skip patterns. Users with lower completion rates receive simpler challenges earlier in a protocol phase.

### Hook P-002: Skip Pattern Detection

When a user skips three or more consecutive `adherence` challenges, the engine triggers a re-evaluation of protocol fit and may surface a protocol adjustment recommendation to the user.

### Hook P-003: Experiential Challenge Gating

`experiential`-type challenges are only surfaced after the user has completed at least two `adherence` challenges in the current phase. This prevents premature qualitative data collection.

---

## Integration Contracts

### Challenge Engine → Protocol Layer

- The engine reads `Challenge` entities from the Protocol layer.
- The engine never modifies Protocol entities directly; it writes only to the Challenge lifecycle records (`ChallengeParticipation`, `ChallengeCompletionRecord`).
- Protocol status (`active → completed`) may be updated by the engine when all phases have been completed, but only via the Protocol layer's own state transition functions.

### Challenge Engine → Analytics Layer

- `ChallengeCompletionRecord` collections are the primary input to the analytics pipeline for adherence scoring.
- The analytics layer accesses completion records via `ContributorRecord.challenge_completion_rate`, computed by the engine.
- The engine must only emit completion records for `real_contributor` sessions (LOCK-003).

### Challenge Engine → Persistence Layer

- Challenge lifecycle events are persisted via `IChallengeRepository` (defined in `src/db/repositories/challengeRepository.ts`).
- Tenant-bound: all challenge records include a tenant key and are queried tenant-locally (ADR-017).

---

## Moat Boundary Summary

| Component | Public? | Notes |
|-----------|---------|-------|
| Challenge lifecycle types and state machine | ✅ | Exposed in `src/challenge/` |
| Challenge completion and participation records | ✅ | Exposed in `src/challenge/` |
| Rule evaluation logic (CE-001 through CE-007 internal scoring) | ❌ | M-003 |
| Personalization hooks (P-001, P-002, P-003) algorithms | ❌ | M-003 |
| Adherence weighting formula | ❌ | M-003 |

---

## References

- Domain entity: `docs/DOMAIN_MODEL.md` → Challenge
- Moat protection: `docs/MOAT_MODEL.md` → M-003
- Architecture lock: `docs/ARCHITECTURE_LOCK.md` → LOCK-002
- Source module: `src/challenge/`
- Persistence interface: `src/db/repositories/challengeRepository.ts`
