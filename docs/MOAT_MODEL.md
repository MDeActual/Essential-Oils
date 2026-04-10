# MOAT_MODEL.md — Competitive Differentiation and IP Boundaries

## Purpose

This document defines the proprietary components, algorithms, and data assets that constitute Phyto.ai's competitive moat. These boundaries are locked per LOCK-002 in `docs/ARCHITECTURE_LOCK.md`. Components listed here must not be exposed through external interfaces, public documentation, or agent outputs visible outside the system boundary.

---

## Moat Definition

A moat component is any element of the platform that:
1. Provides meaningful competitive differentiation that cannot easily be replicated.
2. Would lose value if exposed publicly or reverse-engineered.
3. Represents accumulated proprietary knowledge, training data, or algorithmic development.

---

## Protected Components

### M-001: Synergy Scoring Matrix
**Description**: The algorithm and learned weight matrix that scores oil blend compatibility, predicts synergistic effects, and ranks blend candidates for a given user profile and therapeutic goal.

**Why Protected**: This is the core IP of the blend intelligence layer. The scoring model encodes domain expertise and training data that would be immediately copyable if exposed.

**Enforcement**:
- The scoring matrix weights must never appear in API responses.
- Blend recommendations may surface a score value to the user, but not the computation method or contributing factors.
- Agent outputs must strip scoring internals before any external-facing payload.

---

### M-002: Protocol Generation Algorithm
**Description**: The multi-step logic that constructs personalized protocol phases, sequences oil applications, and adapts recommendations based on user history and population-level signal.

**Why Protected**: The protocol generation algorithm represents the platform's primary clinical intelligence. Its structure encodes treatment sequencing patterns derived from practitioner expertise.

**Enforcement**:
- Protocol generation code must not be included in public repositories or open-source releases.
- API endpoints may return generated protocols but must not expose the generation logic or intermediate states.
- Agent prompts must not reconstruct or describe the algorithm to external users.

---

### M-003: Challenge Engine Rules
**Description**: The rule system governing when, how, and why challenges are presented within protocols. Includes behavioral sequencing logic, personalization heuristics, and adherence optimization patterns.

**Why Protected**: The challenge engine drives adherence differentiation. Replicating the rule system would allow competitors to copy the behavioral engagement model.

**Enforcement**:
- Challenge engine configuration files must not be exposed through any public interface.
- The `type` and `prompt` fields on Challenge objects may be returned to users; the underlying rule evaluation logic must not.

---

### M-004: Population Analytics Signal Model
**Description**: The aggregation methodology, weighting scheme, and signal extraction logic used to translate population-level contributor data into protocol evolution recommendations.

**Why Protected**: This model represents the feedback loop that makes protocols improve over time. The methodology is a source of durable advantage as the contributor base grows.

**Enforcement**:
- Analytics outputs shared externally must be aggregate-only with no individual contributor data.
- The signal extraction methodology must not be described in public documentation.
- Only the Contributor Analytics Agent (as defined in `AGENTS.md`) may access this model.

---

### M-005: Proprietary Oil Ontology
**Description**: The classification taxonomy, relationship graph, and property encodings developed for essential oils within the platform. Extends standard botanical classifications with proprietary therapeutic relationship data.

**Why Protected**: The ontology is a curated knowledge asset that encodes domain expertise. It underpins search, recommendation, and protocol generation quality.

**Enforcement**:
- The full ontology graph must not be exported or exposed via API.
- Ontology lookups may return individual oil properties but not the full relational structure.

---

## Public Interface Boundaries

The following information **may** be exposed through public-facing interfaces:

| Data | Allowed? | Notes |
|------|----------|-------|
| Oil name and general properties | ✅ | |
| Protocol phase summary for the user's own protocol | ✅ | No generation logic |
| Blend recommendation (top result only) | ✅ | Score value OK; weights not OK |
| Challenge prompt text | ✅ | Evaluation logic not exposed |
| Aggregate adherence trends (anonymized) | ✅ | No individual data |
| Synergy score weights or matrix | ❌ | M-001 |
| Protocol generation intermediate states | ❌ | M-002 |
| Challenge engine rule configuration | ❌ | M-003 |
| Signal extraction methodology | ❌ | M-004 |
| Full ontology graph or relational structure | ❌ | M-005 |

---

## Review Process

Any new API endpoint or public documentation must be reviewed against this document before release. The review must confirm that no moat-protected component is exposed, directly or by inference.
