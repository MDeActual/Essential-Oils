/**
 * tenant.ts — Persistence tenant scope
 *
 * Every user-owned repository is bound to one validated tenant at construction.
 * The local tenant exists only for deterministic development/test seed data.
 */

export const LOCAL_DEVELOPMENT_TENANT_ID = "tenant-local";

const TENANT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;

export function validateTenantId(tenantId: string): string {
  if (typeof tenantId !== "string" || !TENANT_ID_PATTERN.test(tenantId)) {
    throw new TypeError("A valid tenant identifier is required for data access.");
  }
  return tenantId;
}
