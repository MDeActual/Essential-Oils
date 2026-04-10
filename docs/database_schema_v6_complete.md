# Database Schema — Phyto.ai (Updated with Feedback, Pricing, Reputation, and Geospatial Support)

---

# 1. Challenges
## challenges
- challenge_id (PK)
- title
- description
- challenge_type
- primary_protocol_id
- comparison_protocol_id
- symptom_id
- cluster_id
- duration_days
- start_date
- end_date
- max_participants
- status
- reward_points_join
- reward_points_complete
- reward_points_bonus
- data_origin
- environment_scope
- exclusion_status

## challenge_participants
- challenge_participant_id (PK)
- challenge_id
- user_id
- assigned_protocol_id
- joined_at
- completed_at
- completion_status
- completion_score
- adherence_score_at_close
- outcome_score_at_close
- data_origin
- exclusion_status

## challenge_results
- challenge_result_id (PK)
- challenge_id
- participant_count
- completed_count
- completion_rate
- adherence_adjusted_improvement_rate
- confidence_level
- summary_title
- summary_body
- generated_at
- data_origin
- exclusion_status

---

# 2. Reputation
## contributor_reputation
- user_id
- reputation_score
- reputation_tier
- adherence_component
- completion_component
- reporting_component
- consistency_component
- helpfulness_component
- integrity_penalty
- last_calculated_at

## practitioner_reputation
- practitioner_id
- reputation_score
- helpfulness_component
- verification_component
- compliance_component
- last_calculated_at

## community_helpfulness_events
- event_id
- user_id
- source_type
- source_id
- helpful_votes
- created_at

---

# 3. Feedback
## user_feedback
- feedback_id
- user_id
- feedback_type
- message
- created_at
- status

## challenge_feedback
- challenge_feedback_id
- user_id
- challenge_id
- helpfulness_rating
- difficult_step
- top_helpful_step
- would_recommend
- comments
- created_at

## protocol_feedback
- protocol_feedback_id
- user_id
- protocol_id
- clarity_rating
- effort_rating
- helpfulness_rating
- comments
- created_at

## discovery_feedback
- discovery_feedback_id
- user_id
- insight_id
- match_experience
- comments
- created_at

## feature_requests
- request_id
- user_id
- title
- description
- category
- status
- created_at

## feature_request_votes
- vote_id
- request_id
- user_id
- created_at

## bug_reports
- bug_id
- user_id
- title
- description
- severity
- status
- created_at

---

# 4. Pricing / Access
## plans
- plan_id
- audience_type
- name
- monthly_price
- annual_price
- features_json
- is_active

## subscriptions
- subscription_id
- user_id
- plan_id
- started_at
- ends_at
- status

## reward_redemptions
- redemption_id
- user_id
- reward_type
- points_used
- created_at

---

# 5. Geospatial
## geospatial_regions
- region_id
- region_name
- country
- province_state
- grid_cell_id
- minimum_sample_threshold

## user_geospatial_context
- context_id
- user_id
- region_id
- source_type
- consent_status
- created_at

## protocol_geospatial_summary
- summary_id
- protocol_id
- region_id
- participant_count
- improvement_rate
- completion_rate
- generated_at
- exclusion_status

---

# 6. Existing Core Objects
Retain previously defined tables for:
- users
- user_profile
- symptoms
- symptom_clusters
- protocol_families
- protocols
- protocol_steps
- remedies
- protocol_remedies
- protocol_usage
- daily_health_signal
- lifestyle_signals
- protocol_step_completion
- outcome_reports
- user_remedy_inventory
- anomaly_flags
- simulation_runs
- simulation_entities

---

# 7. Production Insight Rule
Any production-facing aggregate must filter:
- data_origin = real_contributor
- exclusion_status = allowed_in_production_insights