Phyto.ai Architecture Package (v11 CANONICAL)
Includes environment variable spec and example configuration files.

## Quickstart

```bash
npm install
npm run dev   # start TypeScript service with live transpilation
```

To run the compiled build:

```bash
npm run build
npm start
```

## API scaffold

- `GET /health` – service status
- `GET /protocols` – view available protocols and steps (method, timing, quantity, effort, safety)
- `GET /challenges` – available challenges with linked protocol
- `POST /challenges/:id/join` – join a challenge (body: `{ contributorId }`)
- `POST /outcomes` – log outcomes and adherence  
  Body example:
  ```json
  {
    "contributorId": "c-real-001",
    "challengeId": "ch-rest-7",
    "protocolId": "p-lavender-calm",
    "adherence": 80,
    "signals": { "sleep_quality": "better", "hrv": 68 },
    "dataOrigin": "real_contributor"
  }
  ```

## Configuration

Environment variables align with `docs/secrets_and_env_spec.md` and `docs/SWARM_BOOT_FILE.md`. Defaults are set in code; override via `.env`.

Key flags:

- `APP_ENV` (`development|staging|production`)
- `ENABLE_SYNTHETIC_DATA` (default `false`)
- `ALLOW_PRODUCTION_INSIGHTS_FROM_REAL_ONLY` (default `true`)
- `ENABLE_CHALLENGES` (default `true`)
- `ENABLE_REPUTATION_WEIGHTING` (default `true`)
- `MIN_ADHERENCE_FOR_VALID_RUN` (default `50`)
- `FULL_WEIGHT_ADHERENCE_THRESHOLD` (default `70`)
- `REPUTATION_FULL_WEIGHT_THRESHOLD` (default `0.8`)
- `REPUTATION_STANDARD_WEIGHT_THRESHOLD` (default `0.6`)
- `REPUTATION_DOWN_WEIGHT_THRESHOLD` (default `0.4`)
- `REPUTATION_FULL_WEIGHT` (default `1.2`)
- `REPUTATION_STANDARD_WEIGHT` (default `1`)
- `REPUTATION_DOWN_WEIGHT` (default `0.8`)
- `REPUTATION_MIN_WEIGHT` (default `0.5`)
- `PRIVACY_MODE_STRICT` (default `true`)

## Data integrity + privacy rules encoded

- Contributor records require `dataOrigin`; synthetic/internal_test are blocked when synthetic data is disabled.
- Outcomes below `MIN_ADHERENCE_FOR_VALID_RUN` are rejected; adherence between 50–70% is down-weighted; 70%+ full weight.
- Reputation weighting applied when enabled.
- Discovery eligibility limited to real contributors unless synthetic data is explicitly enabled.
