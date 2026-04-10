# Canonical Package Rules — Phyto.ai

Purpose:
Ensure every FULL package is a clean canonical snapshot.

Rules:
1. Only include the latest version of each document family in canonical docs.
2. Exclude superseded versions from `/docs`.
3. Keep synthetic data in `/synthetic_data`.
4. Optionally list superseded files in `archive_manifest.json` rather than including them.
5. The master index and canonical manifest define the current source-of-truth set.
6. Future full zips should prefer current files only, not the entire historical pile.

Document family examples:
- blueprint
- master index
- database schema
- api contracts
- ui screen map
- agent swarm tasks
- landing page architecture
- founder dashboard spec

If multiple versions exist, include only the highest versioned file in the canonical package.