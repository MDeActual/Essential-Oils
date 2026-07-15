# DevOS Alignment PR Checklist

**Status:** Draft / Living Template  
**Owner:** Cloud Matrix Business Solutions  
**System:** DevOS  
**Version:** 0.1  
**Last Updated:** 2026-07-15

---

## 1. Purpose

This checklist ensures that every pull request in a Cloud Matrix product repository is reviewed against DevOS principles.

The goal is not bureaucracy. The goal is to make sure every change supports clear execution, secure-by-default engineering, Microsoft-aligned practices, traceable decision-making, product momentum, and reusable methodology.

This checklist should be added to pull request templates for Cloud Matrix repositories, starting with `Essential-Oils`.

---

## 2. Pull Request DevOS Alignment Section

Add this section to every PR template.

```markdown
## DevOS Alignment Check

### Product / Workstream

- [ ] This PR supports the current product priority.
- [ ] This PR is scoped to one clear purpose.
- [ ] This PR does not introduce unrelated work.

### Cloud Matrix Principles

- [ ] This PR supports the Cloud Matrix principle of turning context into decisions and decisions into execution.
- [ ] This PR reduces confusion, rework, or operational friction.
- [ ] This PR keeps human approval boundaries clear.

### Microsoft Alignment

- [ ] This PR follows relevant Microsoft-aligned guidance where applicable.
- [ ] This PR does not conflict with security-by-default or responsible AI expectations.
- [ ] If Microsoft guidance was not relevant, that is stated below.

### Security and Governance

- [ ] This PR does not weaken security posture.
- [ ] This PR does not expose sensitive or proprietary information.
- [ ] This PR respects existing ADRs, architecture locks, and governance rules.
- [ ] Any new architectural decision is documented or linked.

### Agent / DevOS Impact

- [ ] This PR does not break agent bootstrap, governance, or command-center workflows.
- [ ] If this PR creates a reusable method, checklist, or operating pattern, it updates the Methodology Changelog.
- [ ] If this PR affects agent behavior, the relevant agent charter or template is updated.

### Human Review

- [ ] This PR does not require founder/operator approval.
- [ ] OR this PR requires founder/operator approval and the reason is documented below.

### Notes

Microsoft guidance considered:

```text
[Write relevant Microsoft guidance, or "Not applicable".]
```

Founder/operator approval needed:

```text
[Yes / No. If yes, explain why.]
```

DevOS methodology impact:

```text
[None / Changelog update needed / Agent charter update needed / Other.]
```
```

---

## 3. Required PR Summary Format

Every PR should include:

```markdown
## Summary

[What changed?]

## Why

[Why does this matter?]

## Scope

[What is included?]

## Out of Scope

[What is intentionally not included?]

## Testing / Verification

[How was this checked?]

## DevOS Alignment Check

[Use checklist above.]
```

---

## 4. Review Rule

A PR should not merge if the DevOS Alignment Check is empty, vague, or ignored.

Reviewer question:

```text
Does this PR move Cloud Matrix forward in a clear, secure, Microsoft-aligned, governable way?
```

If unclear, request revision.

---

## 5. One Feature, One PR Rule

```text
One feature = one PR to main.
```

Stacked PRs are allowed only when explicitly intentional.

If stacked PRs are used, document parent PR, child PR, merge order, and whether the child contains blocking fixes.

---

## 6. Founder Approval Triggers

Founder/operator approval is required before merging PRs that involve:

- product strategy changes
- pricing or packaging changes
- public messaging
- partner commitments
- major architecture changes
- security exceptions
- production deployment
- destructive repository operations
- customer-facing claims
- changes to Cloud Matrix core methodology
- changes to human approval boundaries

---

## 7. Microsoft Alignment Guidance

When Microsoft alignment is relevant, consider:

- Microsoft Learn guidance
- Azure Well-Architected Framework
- Azure security baseline
- Microsoft identity and access guidance
- Microsoft Responsible AI guidance
- Microsoft Partner Program requirements
- Microsoft marketplace / co-sell readiness
- enterprise trust expectations

Use Microsoft guidance as a real engineering input, not decoration.

---

## 8. Security-by-Default Review

Every PR should consider whether it affects authentication, authorization, data access, secrets, logging, auditability, dependency risk, infrastructure, deployment, external exposure, or user trust.

If none apply, say so briefly.

---

## 9. Documentation Review

A PR should update documentation when it changes architecture, folder structure, agent behavior, DevOS process, security posture, product workflow, release workflow, public-facing behavior, or methodology.

Documentation updates should be proportional.

Avoid documentation bloat.

---

## 10. Methodology Changelog Trigger

Update the Methodology Changelog when a PR changes how Cloud Matrix builds software.

Examples:

- new PR review standard
- new agent role
- new release process
- new security practice
- new Microsoft alignment practice
- new daily command-center habit
- new product factory pattern
- new reusable checklist
- retired workflow
- improved governance rule

Do not update the changelog for routine implementation details.

---

## 11. Agent Charter Trigger

Update or create an agent charter when a PR creates a new recurring agent role, changes responsibilities, changes escalation rules, changes output format, changes trusted sources, changes decision rights, or changes review cadence.

No recurring Cloud Matrix agent should operate without a charter.

---

## 12. Command Center Trigger

Update the DevOS Command Center when a PR changes current priority, active product focus, major blocker, current next action, workstream map, foundation checklist status, Essential-Oils pilot status, or founder decision required.

---

## 13. Architecture Decision Trigger

Create or update an ADR when a PR introduces a major architecture decision, security-sensitive design decision, top-level module/folder standard, product-wide policy, hard-to-reverse choice, significant DevOS methodology decision, change to Microsoft alignment posture, or change to human approval boundaries.

Accepted ADRs should not be casually rewritten. If a new decision supersedes old history, create a new ADR.

---

## 14. Definition of Done

A PR is DevOS-aligned when:

```text
- The purpose is clear.
- The scope is narrow.
- The security impact is considered.
- Microsoft alignment is considered when relevant.
- Documentation impact is considered.
- Agent or methodology impact is considered.
- Human approval needs are explicit.
- The next action after merge is clear.
```

---

## 15. Reviewer Prompt

```text
Review this PR for DevOS alignment.

Check whether it:
1. Supports the current Cloud Matrix priority.
2. Keeps scope tight.
3. Respects Microsoft-aligned engineering practices where relevant.
4. Preserves security-by-default.
5. Updates documentation, ADRs, command center, agent charters, or methodology changelog if needed.
6. Clearly identifies whether founder/operator approval is required.
7. Avoids unnecessary complexity or speculative platform expansion.

Return:
- approve / request changes / comment
- key concerns
- required fixes
- optional improvements
```

---

## 16. Final Rule

The DevOS Alignment Check exists to protect focus.

It should make the right work easier to merge and the wrong work easier to stop.
