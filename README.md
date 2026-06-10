# Essential Oils — Phyto.ai Protocol Intelligence Platform

TypeScript backend for Phyto.ai’s protocol intelligence platform, including:
- core domain modules (ontology, blend, protocol, challenge)
- contributor analytics + simulation modules
- read-only Express API layer
- Prisma-backed persistence repositories (with in-memory fallback for dev/test)

## Tech Stack

- Node.js + TypeScript
- Express 5
- Prisma 7
- Jest + ts-jest

## Repository Structure

- `/src/ontology` — oil ontology types, schemas, validation
- `/src/blend` — blend entities and validation
- `/src/protocol` — protocol/challenge entities and validation
- `/src/challenge` — challenge lifecycle and completion validation
- `/src/analytics` — contributor analytics pipeline
- `/src/simulation` — synthetic simulation layer
- `/src/api` — external API (read-only routes)
- `/src/db` — repository interfaces + Prisma implementations
- `/prisma` — schema, migrations, seed script
- `/docs` — architecture governance documents

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (optional for DB-backed mode)

## Setup

1. Install dependencies:

```bash
npm ci
```

2. Configure environment:

```bash
cp .env.example .env
```

Set `DATABASE_URL` in `.env` for Prisma-backed data access.  
If `DATABASE_URL` is not set, API services automatically fall back to in-memory seed stores.

3. (Optional) Prepare database and seed data:

```bash
npx prisma migrate deploy
npm run generate
npx prisma db seed
```

## Build and Test

```bash
npm run build
npm test
```

> `prisma generate` runs automatically before both build and test.

## Running the API Locally

This repository currently exposes `createApp()` (Express factory) rather than a dedicated `npm start` script.

### Dev run (ts-node)

```bash
npx ts-node -e "const { createApp } = require('./src/api'); const app = createApp(); app.listen(3000, () => console.log('API running at http://localhost:3000'));"
```

### Built run (after `npm run build`)

```bash
node -e "const { createApp } = require('./dist/api'); const app = createApp(); app.listen(3000, () => console.log('API running at http://localhost:3000'));"
```

## API Endpoints

All endpoints are read-only and return a consistent envelope.

- `GET /health`
- `GET /protocols`
- `GET /protocols/:id`
- `GET /analytics/protocols`
- `GET /analytics/protocols/:id`

### Success response shape

```json
{
  "success": true,
  "data": {},
  "generatedAt": "2026-01-01T00:00:00.000Z"
}
```

### Error response shape

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found."
  },
  "generatedAt": "2026-01-01T00:00:00.000Z"
}
```

## Security and IP Boundaries

The platform contains moat-protected logic (e.g., blend scoring internals, protocol generation strategy, challenge rule engine).  
External interfaces intentionally expose only safe structural outputs.

## Notes

- Architecture constraints and locked decisions are documented in `/docs`.
- Use the existing test suite before submitting changes (`npm test`).
