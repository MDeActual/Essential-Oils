# PR_BRANCHING_RULES.md

## Default rule

One feature = one PR to `main`.

## Exception

Stacked PRs are allowed only when explicitly intentional.

## If stacked PRs are used

Document:

- parent PR
- child PR
- merge order
- whether the child contains blocking fixes

## Operational intent

These rules prevent stale branch drift, accidental stacked work, unclear merge sequencing, and duplicate/conflicting cleanup PRs. When recovering valuable work from an old branch, prefer reconstructing a fresh branch from current `main` unless there is a deliberate reason to preserve the original branch history.
