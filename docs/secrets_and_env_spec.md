# secrets_and_env_spec.md — Phyto.ai

Purpose:
Define all environment variables, credentials, and secret locations required to run the Phyto.ai platform.

This file ensures:
- the swarm knows what variables must exist
- secrets are never stored in the architecture package
- deployment systems know where values should be injected

Real values MUST be provided through:
- Azure Key Vault
- CI/CD secret store
- local secure environment variables

Never commit real credentials to source control.

---

# 1. Azure Authentication (Terraform / Deployment)

Used by Terraform or deployment pipeline.

Environment Variables:

ARM_CLIENT_ID=REPLACE_ME
ARM_CLIENT_SECRET=REPLACE_ME
ARM_SUBSCRIPTION_ID=REPLACE_ME
ARM_TENANT_ID=REPLACE_ME

Purpose:
Authenticate Terraform with Azure.

Recommended:
Service principal or federated identity.

---

# 2. Azure Infrastructure Variables

Non‑secret configuration.

AZURE_LOCATION=canadacentral
AZURE_RESOURCE_GROUP_NAME=phyto-dev-rg
AZURE_APP_SERVICE_NAME=phyto-app
AZURE_POSTGRES_SERVER_NAME=phyto-postgres
AZURE_STORAGE_ACCOUNT_NAME=phytostorage
AZURE_KEY_VAULT_NAME=phyto-keyvault

---

# 3. Application Core Variables

APP_ENV=dev
APP_BASE_URL=https://example.com
LOG_LEVEL=info

---

# 4. Database

DATABASE_URL=REPLACE_ME
DATABASE_HOST=REPLACE_ME
DATABASE_PORT=5432
DATABASE_NAME=phyto
DATABASE_USER=REPLACE_ME
DATABASE_PASSWORD=REPLACE_ME

Store credentials in Azure Key Vault.

---

# 5. Security / Encryption

APP_ENCRYPTION_KEY=REPLACE_ME
JWT_SECRET=REPLACE_ME
SESSION_SECRET=REPLACE_ME

These MUST be stored in Key Vault.

---

# 6. Feature Flags

ENABLE_SYNTHETIC_DATA=true
ENABLE_CHALLENGES=true
ENABLE_PROTOCOL_EVOLUTION=true
ENABLE_SOCIAL_LAYER=true
ENABLE_FOUNDER_DASHBOARD=true
ENABLE_GEOSPATIAL_COLLECTION=true

---

# 7. Commerce Integration

SHOPIFY_STORE_URL=https://example.myshopify.com
SHOPIFY_API_KEY=REPLACE_ME
SHOPIFY_API_SECRET=REPLACE_ME

Secrets should be stored in Key Vault.

---

# 8. AI / External Integrations

OPENAI_API_KEY=REPLACE_ME
HEALTH_APP_INTEGRATION_KEYS=REPLACE_ME

---

# 9. Privacy / Governance Controls

PRIVACY_MODE_STRICT=true
ALLOW_PRODUCTION_INSIGHTS_FROM_REAL_ONLY=true

---

# 10. Deployment Notes

Real secret values should be injected through:

Azure App Service → Application Settings  
Azure Key Vault → Secret references  
CI/CD pipelines → environment variables

The swarm should generate infrastructure and configuration wiring, but the operator provides real values.