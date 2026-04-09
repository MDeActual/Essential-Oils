# API Contracts — Phyto.ai (Updated with Feedback, Reputation, Pricing, and Geospatial Support)

---

# Challenge APIs
- GET /api/v1/challenges/active
- GET /api/v1/challenges/{challenge_id}
- POST /api/v1/challenges/{challenge_id}/join
- GET /api/v1/challenges/{challenge_id}/progress
- GET /api/v1/challenges/{challenge_id}/results

---

# Feedback APIs
- POST /api/v1/feedback/product
- POST /api/v1/feedback/challenge
- POST /api/v1/feedback/protocol
- POST /api/v1/feedback/discovery
- POST /api/v1/feature-requests
- POST /api/v1/feature-requests/{request_id}/vote
- POST /api/v1/bugs/report

---

# Reputation APIs
- GET /api/v1/profile/reputation
- GET /api/v1/practitioner/{id}/reputation
- POST /api/v1/community/helpful-vote

---

# Pricing / Access APIs
- GET /api/v1/plans
- GET /api/v1/subscription
- POST /api/v1/subscription/upgrade
- POST /api/v1/rewards/redeem

---

# Geospatial APIs
- POST /api/v1/location/consent
- POST /api/v1/location/resolve-region
- GET /api/v1/protocols/{protocol_id}/map-summary
- GET /api/v1/discoveries/geospatial

Contract rule:
Raw coordinates must not be persisted into production-facing discovery analytics.

---

# Dashboard APIs
- GET /api/v1/dashboard/founder/overview
- GET /api/v1/dashboard/founder/growth
- GET /api/v1/dashboard/founder/engagement
- GET /api/v1/dashboard/founder/discovery
- GET /api/v1/dashboard/founder/reputation
- GET /api/v1/dashboard/founder/geospatial
- GET /api/v1/dashboard/founder/revenue
- GET /api/v1/dashboard/founder/feedback

---

# Existing Core APIs
Retain previously defined endpoints for:
- symptom selection
- protocol generation
- protocol start
- daily signals
- lifestyle signals
- outcomes
- discovery feed
- scanner
- simulation