# ADR-018 — Trust & Privacy Foundation

## Status

Accepted for implementation under DevOS execution unit `EU-PHY-019` and policy decision `PD-EU-PHY-019-20260805`.

## Context

Phyto.ai has verified authentication, authorization, tenant context, and tenant-bound persistence. It does not yet have executable controls governing consent, purpose limitation, retention, deletion, export, legal hold, or transparent AI use.

A privacy policy alone cannot enforce these boundaries. The product also needs plain-language trust messaging that users can understand without interpreting legal terminology.

## Decision

Phyto.ai will implement privacy as a reusable Trust & Privacy Foundation with these principles:

1. Purpose-specific processing authorization fails closed.
2. Consent is versioned, revocable, tenant-scoped, and subject-scoped.
3. User-facing explanations state what is collected, why it is used, how AI uses it, and what controls the user has.
4. Audit metadata excludes secrets, tokens, unnecessary wellness text, and protected product logic.
5. Health-related output remains non-diagnostic and avoids unverified effectiveness claims.
6. Azure is the canonical future hosting and trust platform, but this execution slice introduces no production cloud resources or real user data.

## Sequencing

This ADR intentionally starts with stable domain contracts and negative authorization tests. Later slices will add:

- Prisma consent and retention persistence;
- deterministic deletion and subject-access export;
- legal-hold behavior;
- Trust Center API and interface;
- Azure Entra, Key Vault, PostgreSQL, Monitor, and Application Insights integration;
- DevOS Context Platform registration and evidence linkage.

## Consequences

### Positive

- Privacy rules become testable application behavior.
- User trust messaging and backend policy share one conceptual model.
- The foundation can be reused by other CloudMatrix products.

### Tradeoffs

- More application paths will require explicit purpose and consent context.
- Data lifecycle features must be delivered in bounded, dependency-ordered slices.
- Legal compliance claims remain outside engineering scope until separately reviewed.
