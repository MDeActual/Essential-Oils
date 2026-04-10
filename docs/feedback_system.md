# Feedback System — Phyto.ai

Purpose:
Capture contributor feedback, challenge feedback, discovery feedback, feature requests, and product issues in a structured way.

---

# 1. Feedback Types

## Product Feedback
General feedback about the app experience.

## Challenge Feedback
Specific feedback about a challenge after completion.

## Protocol Feedback
Feedback about protocol clarity, effort, difficulty, and usefulness.

## Discovery Feedback
Whether a published discovery matches contributor experience.

## Feature Request
Structured requests for new product capabilities.

## Bug Report
Reports of something broken, confusing, or unsafe.

---

# 2. Feedback Surfaces

### Dashboard
General app feedback entry point.

### End of Challenge
Prompt after challenge completion.

### Protocol Detail Screen
“How clear was this protocol?”

### Discovery Feed
“Does this match your experience?”

### Settings / Help
Open feedback + bug reporting.

---

# 3. Core Questions

## Product Feedback Form
- What were you trying to do?
- What worked well?
- What was confusing?
- What feature would you like next?
- Allow follow-up? (yes/no)

## Challenge Feedback Form
- How helpful was this challenge?
- Which step helped the most?
- Which step was difficult?
- Would you recommend this challenge?

## Discovery Feedback Form
- Does this match your experience?
  - yes
  - no
  - not sure

## Feature Request Form
- What feature do you want?
- Why would it help you?
- Which part of the app is it related to?

---

# 4. Feedback Workflow

submitted
→ triaged
→ categorized
→ reviewed
→ accepted / rejected / planned
→ shipped (if implemented)

---

# 5. Feature Voting

Users can vote on feature requests.

Purpose:
- prioritize by demand
- avoid building low-value features
- show contributors they shape the platform

Recommended fields:
- request title
- request description
- vote count
- status
- category

---

# 6. AI-Assisted Feedback Processing

AI can:
- cluster similar requests
- identify recurring confusion points
- summarize top pain points
- detect safety concerns
- route urgent issues to the right team

---

# 7. Trust Rule

Feedback should never be mixed with health-outcome evidence.

Feedback is:
- product intelligence
- UX intelligence
- protocol clarity intelligence

It is not protocol effectiveness evidence.

---

# 8. Suggested Data Model

Tables:
- user_feedback
- feature_requests
- feature_request_votes
- protocol_feedback
- challenge_feedback
- discovery_feedback
- bug_reports

---

# 9. Suggested KPIs

- feedback submissions / week
- challenge feedback completion rate
- top requested features
- confusion points by protocol
- top bug categories
- % of feedback closed