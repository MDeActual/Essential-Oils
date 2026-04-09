# Geospatial Data Layer — Phyto.ai

Purpose:
Allow the platform to analyze geographic variations in protocol responses while protecting contributor privacy.

---

# 1. Core Principle

Do not persist raw GPS coordinates as part of discovery-facing analytics.

Use this flow:
location permission
→ temporary coordinate capture
→ convert to coarse region / grid cell
→ discard raw coordinates
→ store anonymized geospatial unit

---

# 2. Recommended Storage Approach

Store:
- region_id
- grid_cell_id
- country
- province/state
- climate zone (derived later if useful)

Recommended grid systems:
- H3
- GeoHash
- postal region approximation

---

# 3. User Consent

Location must be opt-in.

Suggested copy:
Allow approximate location to improve anonymous geographic research insights?

Your exact coordinates are never stored.
Only anonymized regional statistics are used.

---

# 4. Use Cases

- protocol response map
- regional outcome variation
- climate-linked response patterns
- respiratory / pollen / seasonal analysis
- geospatial research summaries
- founder dashboard map views

---

# 5. Minimum Sample Rule

Do not display regional insight unless a minimum sample size is met.

Recommended minimum:
30 outcomes per region

---

# 6. Suggested Data Objects

- geospatial_regions
- user_geospatial_context
- protocol_geospatial_summary
- region_climate_context (optional later)

---

# 7. Dashboard Use

Founder dashboard should show:
- top regions by contributors
- top regions by protocol runs
- map of improvement rate by region
- protocol-specific response maps

---

# 8. Privacy Rule

Geospatial data is for anonymized aggregated analysis only.

It must not:
- expose individual contributor locations
- be displayed in a re-identifiable way
- be sold as personal location data