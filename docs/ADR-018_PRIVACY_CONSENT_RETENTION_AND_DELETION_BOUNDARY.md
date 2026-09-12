# ADR-018: Privacy, consent, retention, and deletion boundary

## Status

Proposed for `EU-PHY-019` validation.

## Context

Phyto.ai now verifies API identity, permissions, tenant context, and tenant-bound persistence. Those controls establish who may act, but they do not determine whether a particular use of user-owned wellness data is permitted, how long data may remain, whether deletion is authorized, or when a legal hold prevents destruction.

This unit is repository-only. It uses synthetic deterministic fixtures and creates no production identity, persistent environment, real-user data path, compliance certification, deployment, or spending authority.

## Decision

1. **Trusted context only.** Tenant and subject identifiers used for privacy decisions must come from verified application context. Caller-supplied identity objects are not authority.
2. **Purpose limitation.** Processing that requires consent is denied unless an active consent grant matches the exact tenant, subject, purpose, and notice version.
3. **Revocation and expiry.** Revoked or expired consent fails closed at decision time.
4. **Retention as executable policy.** Retention eligibility is calculated deterministically from a classified record, creation timestamp, policy duration, and explicit evaluation time.
5. **Deletion scope.** Deletion is tenant- and subject-bound, idempotent, transactionally bounded, and independently auditable.
6. **Legal hold precedence.** A validated active legal hold prevents destructive deletion and returns a non-destructive result.
7. **De-identification boundary.** Data may survive subject deletion only when direct subject identifiers are removed and the retained representation is explicitly classified as irreversibly de-identified.
8. **Bounded export.** Subject-access exports are tenant-scoped, purpose-authorized, size-bounded, and must not include credentials, bearer tokens, protected product logic, or unrelated subjects.
9. **Safe audit metadata.** Audit events record identifiers, decision codes, timestamps, and policy references—not raw tokens, unnecessary wellness text, secrets, or moat-protected internals.
10. **Health-claim boundary.** API responses remain non-diagnostic and may not assert unverified effectiveness, diagnosis, treatment, emergency guidance, or jurisdictional compliance.

## Initial decision vocabulary

- Purposes: `protocol_delivery`, `outcome_tracking`, `safety_monitoring`, `subject_export`, `subject_deletion`, `deidentified_analytics`.
- Classifications: `identity_reference`, `wellness_sensitive`, `protocol`, `outcome`, `consent`, `audit_metadata`.
- Denial codes include tenant mismatch, subject mismatch, missing consent, revoked consent, expired consent, active legal hold, and active retention.

## Consequences

- Repository and service APIs will require trusted tenant/subject context for user-owned operations.
- Prisma models and migrations must preserve tenant-matched ownership for consent, retention, hold, deletion, and export records.
- Negative tests become release gates for cross-tenant access, consent bypass, hold bypass, retry behavior, and sensitive-log leakage.
- This ADR does not claim HIPAA, GDPR, PIPEDA, medical-device, or other jurisdiction-specific compliance.

## Validation

Completion requires typecheck, the complete Jest suite, dependency and secret gates, fresh PostgreSQL migrations, clean Prisma schema parity, durable synthetic seeding, DB-backed negative privacy tests, and independent review with no reproducible P0/P1 privacy defect.
