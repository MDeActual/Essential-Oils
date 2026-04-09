# Phyto.ai — Protocol Library (v3 Final)

This document is the authoritative source for all baseline protocols used by the Protocol Generation Engine in V1.

Protocols are organized into Protocol Families.
Each protocol can be:
- used directly
- personalized
- deployed in experiments
- versioned with the Protocol DSL
- interpreted through the Natural Remedy Ontology
- evolved through the Protocol Evolution System

---

# How this file is used

This library feeds:
- the Protocol Generation Engine
- the Protocol DSL
- protocol experiments and discovery challenges
- ontology-aware substitutions
- the Protocol Intelligence Flywheel

Each protocol may reference:
- remedy classes
- route types
- protocol roles
- mechanism tags

---

# Protocol Families (V1)

1. Sleep Support
2. Stress & Calm
3. Digestive Comfort
4. Respiratory Support
5. Hormonal Balance

---

# 1. Sleep Support Family

## Target Symptoms
- difficulty falling asleep
- waking during the night
- early waking
- restless sleep
- non-restorative sleep
- hormonal sleep disruption

## Protocol: sleep_reset_v1
Duration: 7 days

Morning
- hydration
  class: hydration_support
  role: behavioral_support

Afternoon
- caffeine cutoff at 12:00
  class: behavioral_support
  role: routine_support

Evening
- magnesium glycinate (200mg)
  class: mineral_support
  route: oral
  role: primary_support
  mechanism_tags:
    - sleep_support
    - calming_support

Before Bed
- lavender essential oil
  class: aromatic_relaxant
  route: diffuser
  role: calming_modifier
  mechanism_tags:
    - calming_support
    - sleep_support

Optional
- chamomile tea
  class: calming_tea
  route: tea
  role: optional_enhancer
  mechanism_tags:
    - calming_support
    - routine_support

Signals Tracked
- sleep_quality
- stress_level
- caffeine_intake

---

## Protocol: sleep_reset_magnesium_only
Duration: 7 days

Evening
- magnesium glycinate
  class: mineral_support
  route: oral
  role: primary_support

Signals
- sleep_quality
- sleep_onset_time

---

## Protocol: sleep_reset_lavender_only
Duration: 7 days

Before Bed
- lavender diffuser
  class: aromatic_relaxant
  route: diffuser
  role: primary_support

Signals
- sleep_quality
- sleep_onset_time

---

## Protocol: night_waking_support_v1
Duration: 7 days

Evening
- magnesium glycinate
  class: mineral_support

Before Bed
- lavender diffuser
  class: aromatic_relaxant
- low-light wind-down routine
  class: behavioral_support

Signals
- waking_during_the_night
- sleep_quality

---

## Protocol: early_waking_support_v1
Duration: 7 days

Morning
- morning sunlight exposure
  class: behavioral_support

Afternoon
- caffeine cutoff at 11:00
  class: behavioral_support

Evening
- magnesium glycinate
  class: mineral_support

Signals
- early_waking
- energy_level

---

## Protocol: restorative_sleep_v1
Duration: 7 days

Morning
- hydration
  class: hydration_support

Evening
- magnesium glycinate
  class: mineral_support
- wind-down breathing routine
  class: behavioral_support

Before Bed
- chamomile tea
  class: calming_tea

Signals
- wake_up_energy
- sleep_quality

---

## Protocol: restless_sleep_calm_variant
Duration: 7 days

Evening
- lavender diffuser
  class: aromatic_relaxant
- magnesium glycinate
  class: mineral_support

Before Bed
- 5-minute breathing routine
  class: behavioral_support

Signals
- restlessness
- sleep_quality

---

## Protocol: hormonal_sleep_cooling_v1
Duration: 7 days

Evening
- magnesium glycinate
  class: mineral_support
- hydration
  class: hydration_support

Before Bed
- cooling essential oil diffusion
  class: cooling_support
  route: diffuser
  role: cooling_modifier

Signals
- sleep_quality
- night_sweats
- temperature_sensitivity

---

## Protocol: sleep_hygiene_core_v1
Duration: 7 days

Morning
- sunlight exposure
  class: behavioral_support

Evening
- screen reduction
  class: behavioral_support
- fixed bedtime window
  class: routine_support

Signals
- sleep_quality
- bedtime_consistency

---

## Protocol: sleep_reset_combo_v2
Duration: 7 days

Morning
- hydration
  class: hydration_support

Afternoon
- caffeine cutoff
  class: behavioral_support

Evening
- magnesium glycinate
  class: mineral_support

Before Bed
- lavender diffuser
  class: aromatic_relaxant
- chamomile tea
  class: calming_tea
- breathing routine
  class: behavioral_support

Signals
- sleep_quality
- stress_level
- wake_up_energy

---

# 2. Stress & Calm Family

## Target Symptoms
- anxiety
- nervousness
- feeling overwhelmed
- racing thoughts
- irritability
- low resilience

## Protocol: calm_mind_v1
Duration: 5 days

Morning
- breathing exercise (5 minutes)
  class: behavioral_support

Midday
- hydration
  class: hydration_support

Evening
- lavender diffusion
  class: aromatic_relaxant

Signals
- stress_level
- mood_score

---

## Protocol: calm_mind_magnesium_variant
Duration: 5 days

Morning
- breathing exercise
  class: behavioral_support

Evening
- magnesium glycinate
  class: mineral_support

Signals
- stress_level
- sleep_quality

---

## Protocol: overwhelm_reset_v1
Duration: 5 days

Morning
- hydration
  class: hydration_support
- sunlight exposure
  class: behavioral_support

Midday
- 3-minute reset breathing
  class: behavioral_support

Evening
- lavender diffuser
  class: aromatic_relaxant

Signals
- overwhelm_level
- focus_level

---

## Protocol: racing_thoughts_support_v1
Duration: 5 days

Evening
- magnesium glycinate
  class: mineral_support

Before Bed
- lavender diffuser
  class: aromatic_relaxant
- journaling prompt
  class: behavioral_support

Signals
- racing_thoughts
- sleep_quality

---

## Protocol: irritability_balance_v1
Duration: 5 days

Morning
- hydration
  class: hydration_support

Midday
- snack timing consistency
  class: routine_support

Evening
- calming aromatic routine
  class: aromatic_relaxant

Signals
- irritability
- energy_stability

---

## Protocol: stress_hydration_variant
Duration: 5 days

Morning
- hydration
  class: hydration_support

Midday
- hydration
  class: hydration_support

Evening
- breathing routine
  class: behavioral_support

Signals
- stress_level
- hydration_level

---

## Protocol: breathwork_only_stress_test
Duration: 5 days

Morning
- breathing exercise
  class: behavioral_support

Evening
- breathing exercise
  class: behavioral_support

Signals
- stress_level
- calm_score

---

## Protocol: calm_evening_stack_v1
Duration: 5 days

Evening
- magnesium glycinate
  class: mineral_support
- lavender diffuser
  class: aromatic_relaxant
- low-light environment
  class: routine_support

Signals
- stress_level
- sleep_quality

---

## Protocol: focus_recovery_variant
Duration: 5 days

Morning
- hydration
  class: hydration_support
- movement break
  class: behavioral_support

Afternoon
- caffeine boundary
  class: routine_support
- rosemary aromatic support
  class: aromatic_relaxant

Signals
- concentration
- mental_fatigue

---

## Protocol: anxiety_sleep_bridge_v1
Duration: 7 days

Evening
- magnesium glycinate
  class: mineral_support
- lavender diffuser
  class: aromatic_relaxant
- breathing routine
  class: behavioral_support

Signals
- anxiety
- sleep_quality

---

# 3. Digestive Comfort Family

## Target Symptoms
- bloating
- gas discomfort
- slow digestion
- heaviness after meals
- nausea tendencies
- irregular digestion

## Protocol: digestive_reset_v1
Duration: 5 days

Morning
- warm water hydration
  class: hydration_support

Before Meals
- peppermint oil capsule or tea
  class: digestive_aromatic
  route: oral or tea
  role: primary_support

Evening
- lighter meal window
  class: routine_support

Signals
- digestion_comfort
- bloating_level

---

## Protocol: digestive_reset_ginger_variant
Duration: 5 days

Morning
- ginger tea
  class: digestive_aromatic
  route: tea

Before Meals
- hydration
  class: hydration_support

Signals
- digestion_comfort
- nausea

---

## Protocol: bloating_support_v1
Duration: 5 days

Morning
- hydration
  class: hydration_support

After Meals
- 10-minute walk
  class: behavioral_support

Evening
- peppermint support
  class: digestive_aromatic

Signals
- bloating
- heaviness_after_meals

---

## Protocol: gas_comfort_v1
Duration: 5 days

Morning
- warm water hydration
  class: hydration_support

After Meals
- walking routine
  class: behavioral_support

Evening
- digestive tea
  class: digestive_aromatic

Signals
- gas_discomfort
- digestion_comfort

---

## Protocol: meal_timing_digestive_variant
Duration: 5 days

Morning
- consistent breakfast timing
  class: routine_support

Evening
- earlier dinner
  class: routine_support

Signals
- heaviness_after_meals
- digestion_comfort

---

## Protocol: peppermint_only_digestive_test
Duration: 5 days

Before Meals
- peppermint support
  class: digestive_aromatic

Signals
- bloating
- nausea

---

## Protocol: ginger_only_digestive_test
Duration: 5 days

Morning
- ginger tea
  class: digestive_aromatic

Signals
- nausea
- digestive_comfort

---

## Protocol: digestive_hydration_stack_v1
Duration: 5 days

Morning
- hydration
  class: hydration_support

Midday
- hydration
  class: hydration_support

After Meals
- 10-minute walk
  class: behavioral_support

Signals
- digestion_comfort
- hydration_level

---

# 4. Respiratory Support Family

## Target Symptoms
- congestion
- sinus pressure
- dry or irritated throat
- seasonal respiratory discomfort
- chest tightness during breathing
- cough or throat irritation

## Protocol: respiratory_support_v1
Duration: 5 days

Morning
- eucalyptus steam inhalation
  class: respiratory_aromatic
  route: steam

Midday
- hydration
  class: hydration_support

Evening
- eucalyptus diffuser
  class: respiratory_aromatic
  route: diffuser

Signals
- congestion_level
- breathing_comfort

---

## Protocol: sinus_comfort_v1
Duration: 5 days

Morning
- steam inhalation
  class: respiratory_aromatic

Evening
- cooling facial compress
  class: cooling_support

Signals
- sinus_pressure
- breathing_comfort

---

## Protocol: throat_comfort_v1
Duration: 5 days

Morning
- warm hydration
  class: hydration_support

Midday
- throat-soothing tea
  class: routine_support

Evening
- humidified room routine
  class: behavioral_support

Signals
- throat_irritation
- cough_frequency

---

## Protocol: seasonal_breathing_support_v1
Duration: 5 days

Morning
- air quality routine
  class: routine_support
- hydration
  class: hydration_support

Evening
- eucalyptus diffuser
  class: respiratory_aromatic

Signals
- seasonal_breathing_discomfort
- congestion

---

## Protocol: chest_comfort_variant
Duration: 5 days

Morning
- steam inhalation
  class: respiratory_aromatic

Evening
- breathing practice
  class: behavioral_support
- hydration
  class: hydration_support

Signals
- chest_tightness
- breathing_comfort

---

## Protocol: eucalyptus_only_test
Duration: 5 days

Morning
- eucalyptus steam inhalation
  class: respiratory_aromatic

Evening
- eucalyptus diffuser
  class: respiratory_aromatic

Signals
- congestion_level

---

# 5. Hormonal Balance Family

## Target Symptoms
- hot flashes
- night sweats
- mood swings
- hormonal sleep disruption
- low energy
- temperature sensitivity

## Protocol: hormonal_balance_v1
Duration: 7 days

Morning
- hydration
  class: hydration_support

Afternoon
- caffeine reduction
  class: routine_support

Evening
- magnesium glycinate
  class: mineral_support

Signals
- energy_level
- mood
- hot_flash_frequency

---

## Protocol: cooling_balance_variant
Duration: 7 days

Evening
- cooling essential oil diffusion
  class: cooling_support

Before Bed
- hydration
  class: hydration_support

Signals
- night_sweats
- sleep_quality

---

## Protocol: hot_flash_support_v1
Duration: 7 days

Morning
- hydration
  class: hydration_support

Afternoon
- cooling breath routine
  class: behavioral_support

Evening
- cooling aromatic support
  class: cooling_support

Signals
- hot_flash_frequency
- temperature_sensitivity

---

## Protocol: night_sweat_relief_v1
Duration: 7 days

Evening
- magnesium glycinate
  class: mineral_support
- hydration
  class: hydration_support

Before Bed
- cooling support routine
  class: cooling_support

Signals
- night_sweats
- sleep_quality

---

## Protocol: mood_balance_hormonal_v1
Duration: 7 days

Morning
- hydration
  class: hydration_support
- movement break
  class: behavioral_support

Evening
- magnesium glycinate
  class: mineral_support
- calming aromatic support
  class: aromatic_relaxant

Signals
- mood_swings
- stress_level

---

## Protocol: low_energy_hormonal_v1
Duration: 7 days

Morning
- hydration
  class: hydration_support
- morning sunlight
  class: behavioral_support

Afternoon
- caffeine boundary
  class: routine_support

Signals
- energy_level
- sleep_quality

---

## Protocol: temperature_sensitivity_support_v1
Duration: 7 days

Morning
- hydration
  class: hydration_support

Evening
- cooling aromatic support
  class: cooling_support
- room temperature optimization
  class: routine_support

Signals
- temperature_sensitivity
- sleep_quality

---

## Protocol: hormonal_sleep_bridge_v1
Duration: 7 days

Evening
- magnesium glycinate
  class: mineral_support

Before Bed
- cooling support
  class: cooling_support
- lavender diffuser
  class: aromatic_relaxant

Signals
- hormonal_sleep_disruption
- night_sweats

---

# Protocol Experiment Candidates

## Sleep
- sleep_reset_lavender_only vs sleep_reset_magnesium_only
- sleep_reset_v1 vs sleep_reset_combo_v2
- sleep_reset_v1 vs hormonal_sleep_cooling_v1

## Stress
- breathwork_only_stress_test vs calm_mind_v1
- calm_mind_v1 vs calm_evening_stack_v1

## Digestive
- peppermint_only_digestive_test vs ginger_only_digestive_test
- digestive_reset_v1 vs bloating_support_v1

## Respiratory
- respiratory_support_v1 vs eucalyptus_only_test
- sinus_comfort_v1 vs seasonal_breathing_support_v1

## Hormonal
- hormonal_balance_v1 vs cooling_balance_variant
- hot_flash_support_v1 vs night_sweat_relief_v1

---

# Protocol Selection Rules (Simplified)

The Protocol Generation Engine selects protocols based on:
1. symptom match
2. symptom cluster
3. lifestyle signals
4. remedy inventory
5. knowledge graph performance
6. contributor archetype
7. ontology class substitutions where needed

Example:
Symptom: sleep disruption
Default: sleep_reset_v1

If symptom cluster includes night sweats:
Return: hormonal_sleep_cooling_v1 or night_sweat_relief_v1

If user already owns lavender and magnesium:
Prioritize sleep_reset_combo_v2

If user lacks lavender but owns another aromatic_relaxant:
Use ontology-aware substitution

---

# Protocol Versioning Rules

Naming patterns:
- protocol_family_v1
- protocol_family_v2
- protocol_family_variant
- protocol_family_experiment

Examples:
- sleep_reset_v1
- sleep_reset_combo_v2
- cooling_balance_variant
- breathwork_only_stress_test

---

# Role of the Protocol Library

This library is the foundation of the discovery engine.

It provides:
- standardized starting protocols
- experiment-ready protocol definitions
- source material for the Protocol DSL
- symptom-to-protocol mappings
- baseline protocol families for AI personalization
- ontology-aware protocol definitions
- compatibility with protocol evolution