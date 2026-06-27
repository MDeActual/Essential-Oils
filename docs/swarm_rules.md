# swarm_rules.md — Multi-Agent Swarm Execution Rules

## Purpose

This document defines the data integrity and execution rules that govern multi-agent swarm workflows within the Phyto.ai protocol intelligence platform. All agents operating in a swarm context must follow these rules without exception.

---

## 1. Reading Order Enforcement

Before any agent takes action in a swarm workflow, the Swarm Orchestrator must confirm that:

1. All agents have acknowledged `CLAUDE.md` and `AGENTS.md`.
2. The active development phase is confirmed from `.claude/current_phase.md`.
3. No locked architectural decisions in `docs/ARCHITECTURE_LOCK.md` conflict with the current task.

Agents must not begin execution until the Swarm Orchestrator emits a `GO` pre-flight signal (see `SWARM_PROMPT_STAGED.md` Stage 0).

---

## 2. Analytics Data Integrity Rules

These rules implement LOCK-003 and apply to all agents that read, write, or process contributor records.

| Rule | Description |
|------|-------------|
| **RULE-A1** | Only records with `data_origin = real_contributor` are analytics-eligible. |
| **RULE-A2** | Records with `adherence_score < 50` must carry `exclusion_status = excluded`. |
| **RULE-A3** | All contributor records must include `data_origin` and `exclusion_status` fields. |
| **RULE-A4** | Synthetic simulation data must never be passed to production analytics without `assertSyntheticIsolation()` being called first. |
| **RULE-A5** | The Contributor Analytics Agent may only read from the analytics layer; it may not write to production records. |

---

## 3. Simulation Isolation Rules

These rules prevent synthetic data from contaminating production analytics.

| Rule | Description |
|------|-------------|
| **RULE-S1** | All synthetic records must carry `data_origin: synthetic_simulation` and `exclusion_status: excluded`. |
| **RULE-S2** | The Simulation Agent operates in an isolated context only; its outputs must never flow directly to `src/analytics/` without isolation validation. |
| **RULE-S3** | `assertSyntheticIsolation()` in `src/simulation/validation.ts` is the mandatory guard. Any agent routing simulation data to analytics must call it first. |
| **RULE-S4** | Simulation run reports are advisory only. The Protocol Evolution Agent may read them but may not autonomously modify protocols based on them. |

---

## 4. Moat Boundary Enforcement

All agents must respect the moat boundaries defined in `docs/MOAT_MODEL.md`.

| Rule | Description |
|------|-------------|
| **RULE-M1** | No agent may expose synergy scoring weights, matrices, or intermediate values through any external-facing interface. |
| **RULE-M2** | No agent may expose the protocol generation algorithm through any external-facing interface. |
| **RULE-M3** | Challenge engine rules and selection heuristics must not appear in API responses, agent outputs visible outside the system, or documentation accessible externally. |
| **RULE-M4** | The analytics signal model (M-004) must remain internal. Structural aggregations (counts, averages, segmentation) may be exposed; signal extraction logic must not. |

---

## 5. Agent Communication Rules

| Rule | Description |
|------|-------------|
| **RULE-C1** | Agents must not directly invoke each other. All coordination routes through the Swarm Orchestrator. |
| **RULE-C2** | All agent outputs are typed JSON objects with required fields: `agent_id`, `timestamp`, `version`, `payload`. |
| **RULE-C3** | Conflict resolution follows precedence: Human Lead > Swarm Orchestrator > Domain Agents. |
| **RULE-C4** | If a task is blocked by a locked decision, the agent must emit `status: blocked` and halt. It must not attempt workarounds. |

---

## 6. Commit and Structural Change Rules

| Rule | Description |
|------|-------------|
| **RULE-G1** | Commits affecting locked architecture must reference the relevant ADR number in the commit message. |
| **RULE-G2** | New top-level modules require an ADR and an update to `docs/ARCHITECTURE_INDEX.md` before any code is created. |
| **RULE-G3** | Domain model changes require explicit human approval and a corresponding ADR entry. |
| **RULE-G4** | The Swarm Orchestrator may commit with an ADR reference. All other agents may only propose; they may not commit. |

---

## References

- `AGENTS.md` — agent roles and authority matrix
- `docs/ARCHITECTURE_LOCK.md` — frozen decisions
- `docs/MOAT_MODEL.md` — IP boundaries
- `SWARM_PROMPT_STAGED.md` — staged execution prompts
- `src/analytics/validation.ts` — analytics integrity enforcement
- `src/simulation/validation.ts` — simulation isolation enforcement
