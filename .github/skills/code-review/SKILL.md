---
name: code-review
description: Performs an automated dual-axis or multi-axis code review on pull request diffs focusing on architecture, security, readability, and test coverage.
---

# Code Review Skill Instructions

When invoked or triggered for a code review, evaluate the diff against the following standards:

## 1. Core Review Axes
* **Correctness & Logic:** Verify edge cases, null handling, race conditions, and error-swallowing.
* **Security:** Flag unparameterized database queries, hardcoded secrets, or unvalidated input sanitization.
* **Architecture:** Ensure separation of concerns (e.g., business logic decoupled from API handlers/routes).
* **Readability & Style:** Avoid deep nested ternaries, long methods, or ambiguous variable names.
* **Testing:** Confirm that every changed or added public method has corresponding unit or integration test coverage.

## 2. Output Requirements
* **Exact Line Citations:** Every finding must reference the specific file, function, and line range in the diff.
* **Constructive Tone:** State the issue clearly, explain the risk or impact, and provide a concrete snippet showing the fix.
* **Reference Checklist:** Apply the secondary checks detailed in `checklist.md`.

## 3. Hard Constraints
* Do not block merges or rewrite code files automatically unless explicitly asked.
* Do not invent project-specific rules that contradict explicit repository files (`.github/copilot-instructions.md`).
