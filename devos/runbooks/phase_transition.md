# RUNBOOK: Phase Transition

**DevOS Runbook** | Trigger: Closing one phase and opening the next
**Priority**: P1 — run at every phase boundary

---

## Objective

Formally close the current development phase and open the next one, ensuring exit criteria are verified, governance docs are updated, and the next phase's deliverables and exit criteria are defined before work begins.

---

## Pre-Conditions

- [ ] All deliverables for the current phase are marked complete in `.claude/current_phase.md`.
- [ ] All automated tests pass (`npm test` or equivalent).
- [ ] Build is clean (`npm run build` or equivalent).
- [ ] Human project lead has reviewed the phase (exit criterion: human review).

---

## Steps

### 1. Verify Exit Criteria

- [ ] Open `.claude/current_phase.md`.
- [ ] Confirm every exit criterion has a ✅ status.
- [ ] If any criterion is ⬜, resolve it before proceeding.

### 2. Close the Current Phase

In `.claude/current_phase.md`:

- [ ] Update **Status** to `✅ COMPLETE — reviewed and accepted by human project lead (YYYY-MM-DD)`.
- [ ] Set **Completed** date in the Phase History table.
- [ ] Change the Phase History row status from `🟡 Active` to `✅ Complete`.

### 3. Define the Next Phase

In `.claude/current_phase.md`, add a new section for the next phase:

- [ ] Set **Phase** number and name.
- [ ] Set **Status** to `🟡 Active`.
- [ ] Set **Started** date.
- [ ] List all planned deliverables with `⬜ Pending` status.
- [ ] Define exit criteria (minimum 5, always include "human project lead review" as the final one).
- [ ] Add the new phase row to the Phase History table.

### 4. Update Project Context

In `.claude/project_context.md`:

- [ ] Update **Development Status** to reference the new active phase.
- [ ] Update **Source Modules Status** table if new modules are planned.
- [ ] Update **Known Gaps** table if any gaps are being addressed.

### 5. Architecture Index

- [ ] Review `docs/ARCHITECTURE_INDEX.md`.
- [ ] Add any files that were created during the closing phase that are not yet listed.
- [ ] Add placeholder entries for files planned in the new phase (mark as `⬜ Planned`).

### 6. ADR Entry (if architectural decisions were made)

If the closing phase introduced architectural decisions not yet in the log:

- [ ] Add entries to `docs/ARCHITECTURE_DECISION_LOG.md`.
- [ ] Format: Context → Decision → Consequences.
- [ ] Reference the ADR number in any related commit messages.

### 7. Commit Phase Transition

- [ ] Stage all modified governance files.
- [ ] Commit message: `chore: Phase N complete → Phase N+1 active (ADR-XXX if applicable)`
- [ ] Push and open PR for human review if the repo requires it.

---

## Success Criteria

- `.claude/current_phase.md` shows the closed phase as ✅ Complete with a completion date.
- `.claude/current_phase.md` shows the new phase as 🟡 Active with deliverables and exit criteria defined.
- Phase History table is current.
- `docs/ARCHITECTURE_INDEX.md` is up to date.
- All relevant ADRs are logged.

---

## Output

Updated `.claude/current_phase.md` and `.claude/project_context.md` committed and pushed.
