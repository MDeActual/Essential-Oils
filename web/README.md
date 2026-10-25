# Phyto.ai Web Console

Read-only React + Vite frontend for the Phyto.ai API.

## Local Development

1. Install dependencies:

```bash
npm ci
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

The default backend target is `http://localhost:3000`.

## Environment Variables

- `VITE_PHYTO_API_BASE_URL` (required for production builds): absolute backend base URL.
- `VITE_PHYTO_TENANT_ID` (optional): sent as `X-Phyto-Tenant-Id`.

Bearer tokens must not be embedded in Vite environment variables because they
are shipped in the public JavaScript bundle. The console currently has no
interactive OIDC login flow, so it cannot authenticate to OIDC-protected APIs.

## Build

```bash
npm run build
```
