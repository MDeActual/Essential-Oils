# Reputation System — Phyto.ai

Purpose:
Improve data quality, reward reliable contributors, and protect the discovery engine from low-quality or manipulative inputs.

---

# 1. Reputation Components

## Adherence
How closely the contributor followed the protocol.

## Completion
Whether the contributor finished the challenge or protocol.

## Outcome Reporting Quality
Whether the contributor actually submitted structured outcomes.

## Participation Consistency
How often the contributor completes valid protocol runs.

## Community Contribution
Helpful answers, useful feedback, and constructive participation.

## Integrity Signals
Spam, suspicious patterns, or anomaly flags reduce trust.

---

# 2. Example Score Model

Weighted components:
- adherence: 30%
- completion: 20%
- outcome reporting quality: 20%
- participation consistency: 15%
- community helpfulness: 10%
- integrity penalties: -variable

---

# 3. Reputation Tiers

0–30 → Explorer
30–60 → Contributor
60–80 → Research Contributor
80–100 → Discovery Leader

---

# 4. What Reputation Affects

- weighting of outcome data in protocol scoring
- access to early challenges
- badges and recognition
- social trust signals
- practitioner / contributor visibility
- eligibility for advanced studies later

---

# 5. Low-Quality Data Rule

Data from contributors with:
- adherence below threshold
- incomplete reporting
- repeated anomaly flags

should be:
- excluded
or
- down-weighted

depending on severity.

---

# 6. Community Reputation Signals

Contributors can earn trust through:
- helpful challenge room responses
- well-rated answers
- useful protocol feedback
- consistent constructive participation

This should not override protocol adherence, but it should contribute.

---

# 7. Practitioner Reputation

Practitioners also need reputation scoring.

Inputs:
- verification status
- helpful answers
- protocol contribution quality
- community trust
- anti-promotion compliance

---

# 8. Suggested Data Objects

- contributor_reputation
- community_helpfulness_events
- practitioner_reputation
- reputation_audit_log

---

# 9. Founder Dashboard KPIs

- reputation distribution by tier
- % of data from high-reputation contributors
- anomaly-flagged contributors
- top challenge contributors
- practitioner reputation health