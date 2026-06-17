# SWARM_PROMPT_STAGED.md — Staged Swarm Execution Prompts

## Purpose

This document contains the staged prompt sequences used to initialize, orchestrate, and terminate multi-agent swarm workflows within the Phyto.ai protocol intelligence platform. Each stage gates the next; agents must not advance without completing the prior stage's exit criteria.

---

## Stage 0: Pre-Flight Checks

**Prompt to Swarm Orchestrator:**

```
You are initializing a Phyto.ai swarm workflow. Before any agent takes action:

1. Confirm all agents have read CLAUDE.md and AGENTS.md.
2. Verify the current development phase in .claude/current_phase.md.
3. Confirm no locked architectural decisions in docs/ARCHITECTURE_LOCK.md conflict with the current task.
4. Report pre-flight status: GO / NO-GO with reason.

Do not proceed to Stage 1 until status is GO.
```

**Exit Criteria:** All checks pass; Swarm Orchestrator emits `{ "preflight": "GO" }`.

---

## Stage 1: Domain Grounding

**Prompt to all domain agents:**

```
You are operating within the Phyto.ai protocol intelligence platform.

Read docs/DOMAIN_MODEL.md and confirm your understanding of:
- The core domain entities (Oil, Protocol, User Profile, Challenge, Blend, Contributor Record).
- The relationships and cardinality rules between entities.
- The moat-protected components listed in docs/MOAT_MODEL.md.

Respond with: entity list confirmed, moat boundaries acknowledged, ready for task assignment.
```

**Exit Criteria:** All agents confirm domain grounding. Swarm Orchestrator logs confirmation.

---

## Stage 2: Task Assignment

**Prompt to Swarm Orchestrator:**

```
Based on the confirmed development phase (.claude/current_phase.md) and the architecture index (docs/ARCHITECTURE_INDEX.md):

1. Decompose the current task into agent-specific subtasks.
2. Assign subtasks to agents according to the authority matrix in AGENTS.md.
3. Emit a structured task queue as JSON: { "tasks": [ { "agent": "", "task": "", "inputs": [], "outputs": [] } ] }
4. Flag any subtask that touches a locked decision or moat boundary for human review before execution.
```

**Exit Criteria:** Task queue emitted; flagged items reviewed by human lead.

---

## Stage 3: Execution

**Prompt to assigned agents:**

```
Execute your assigned subtask within the following constraints:

- Do not modify locked architecture decisions.
- Do not expose moat-protected scoring logic externally.
- Contributor analytics must use only real_contributor records with adherence >= 50%.
- Tag all simulation outputs with isolation_flag: true.
- Emit a structured result: { "agent_id": "", "task_id": "", "status": "complete|blocked", "output": {}, "flags": [] }

If blocked, emit status: "blocked" with a reason and halt. Do not attempt workarounds.
```

**Exit Criteria:** All agents emit `status: complete` or escalate blocked tasks to Swarm Orchestrator.

---

## Stage 4: Integration and Validation

**Prompt to Swarm Orchestrator:**

```
Collect all agent outputs from Stage 3.

1. Validate that no output violates ARCHITECTURE_LOCK.md constraints.
2. Validate that no simulation data was mixed with production analytics.
3. Check that all contributor records used in analytics included data_origin and exclusion_status.
4. If validation passes, emit: { "integration": "PASS" }
5. If validation fails, emit: { "integration": "FAIL", "violations": [] } and halt for human review.
```

**Exit Criteria:** Integration status PASS. Violations reviewed and resolved before merge.

---

## Stage 5: Commit and Log

**Prompt to Swarm Orchestrator:**

```
All validations passed. Prepare the commit:

1. Reference the relevant ADR number from docs/ARCHITECTURE_DECISION_LOG.md if architecture was touched.
2. Use commit message format: "[stage] <summary> (ADR-XXX if applicable)"
3. Update .claude/current_phase.md if the phase has advanced.
4. Append a summary entry to docs/ARCHITECTURE_DECISION_LOG.md if a new decision was made.

Do not force-push. Do not skip ADR references for architecture changes.
```

**Exit Criteria:** Commit created, logs updated, phase file current.

---

## Stage 6: Swarm Termination

**Prompt to all agents:**

```
Swarm workflow complete. 

1. Clear your working context.
2. Do not retain user health data or contributor PII in memory.
3. Confirm termination: { "agent_id": "", "terminated": true }
```

**Exit Criteria:** All agents confirm termination. Swarm Orchestrator archives the run log.
