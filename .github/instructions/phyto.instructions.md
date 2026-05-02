# PHYTO.AI Agent Instructions

This repository is the Phyto.ai protocol intelligence platform.

Agents must follow these rules before making any changes.

---

## 1. Required Reading Order

Before modifying code, you MUST read:

1. docs/ARCHITECTURE_INDEX.md

2. docs/ARCHITECTURE_LOCK.md

3. docs/DOMAIN_MODEL.md

---

## 2. Locked Constraints (Do Not Violate)

- Do NOT rename or remove core domain entities (LOCK-001)

- Do NOT expose moat-protected logic (LOCK-002)

- Do NOT break analytics integrity rules (LOCK-003)

- Do NOT bypass agent authority boundaries (LOCK-004)

- Do NOT modify protocol versioning rules (LOCK-005)

---

## 3. Development Rules

- Keep changes scoped to the current phase

- Do NOT introduce new top-level modules without updating ARCHITECTURE_INDEX.md

- Preserve existing API response structures unless explicitly required

- Prefer minimal, deployable changes over large refactors

---

## 4. Current Phase Context

Active phase:

→ Phase 4: Prisma persistence integration

Primary goal:

→ Replace in-memory stores with Prisma-backed repositories

→ Make backend deployable

---

## 5. Critical System Boundaries

- Protocol generation logic is proprietary

- Synergy scoring is proprietary

- Challenge engine rules are proprietary

These must NEVER be exposed externally.

---

## 6. Output Expectations

When completing tasks:

- Summarize changes

- List modified files

- Confirm constraints were respected

- State whether deployability improved
