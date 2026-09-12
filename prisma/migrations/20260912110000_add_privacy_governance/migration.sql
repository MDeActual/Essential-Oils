CREATE TYPE "PrivacyPurpose" AS ENUM (
  'protocol_delivery',
  'outcome_tracking',
  'safety_monitoring',
  'subject_export',
  'subject_deletion',
  'deidentified_analytics'
);

CREATE TYPE "PrivacyDataClassification" AS ENUM (
  'identity_reference',
  'wellness_sensitive',
  'protocol',
  'outcome',
  'consent',
  'audit_metadata'
);

CREATE TYPE "PrivacyRequestStatus" AS ENUM (
  'requested',
  'blocked',
  'completed',
  'failed'
);

CREATE TYPE "PrivacyAuditAction" AS ENUM (
  'consent_granted',
  'consent_revoked',
  'purpose_denied',
  'deletion_requested',
  'deletion_blocked',
  'deletion_completed',
  'export_requested',
  'export_completed',
  'retention_evaluated',
  'legal_hold_applied',
  'legal_hold_released'
);

CREATE TABLE "consent_grants" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "subject_id" TEXT NOT NULL,
  "purpose" "PrivacyPurpose" NOT NULL,
  "notice_version" TEXT NOT NULL,
  "granted_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "consent_grants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "retention_policies" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "classification" "PrivacyDataClassification" NOT NULL,
  "retention_days" INTEGER NOT NULL,
  "policy_version" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "effective_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "retention_policies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "retention_policies_retention_days_nonnegative" CHECK ("retention_days" >= 0)
);

CREATE TABLE "legal_holds" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "subject_id" TEXT NOT NULL,
  "hold_ref" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "starts_at" TIMESTAMP(3) NOT NULL,
  "ends_at" TIMESTAMP(3),
  "reason_code" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "legal_holds_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "legal_holds_end_after_start" CHECK ("ends_at" IS NULL OR "ends_at" > "starts_at")
);

CREATE TABLE "deletion_requests" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "subject_id" TEXT NOT NULL,
  "request_id" TEXT NOT NULL,
  "status" "PrivacyRequestStatus" NOT NULL DEFAULT 'requested',
  "requested_at" TIMESTAMP(3) NOT NULL,
  "completed_at" TIMESTAMP(3),
  "decision_code" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "deletion_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "export_requests" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "subject_id" TEXT NOT NULL,
  "request_id" TEXT NOT NULL,
  "status" "PrivacyRequestStatus" NOT NULL DEFAULT 'requested',
  "requested_at" TIMESTAMP(3) NOT NULL,
  "completed_at" TIMESTAMP(3),
  "record_count" INTEGER,
  "payload_bytes" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "export_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "export_requests_record_count_nonnegative" CHECK ("record_count" IS NULL OR "record_count" >= 0),
  CONSTRAINT "export_requests_payload_bytes_nonnegative" CHECK ("payload_bytes" IS NULL OR "payload_bytes" >= 0)
);

CREATE TABLE "privacy_audit_events" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "subject_id" TEXT,
  "action" "PrivacyAuditAction" NOT NULL,
  "decision_code" TEXT NOT NULL,
  "policy_ref" TEXT,
  "request_ref" TEXT,
  "occurred_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "privacy_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "consent_grants_tenant_id_subject_id_purpose_notice_version_granted_at_key"
ON "consent_grants"("tenant_id", "subject_id", "purpose", "notice_version", "granted_at");
CREATE INDEX "consent_grants_tenant_id_subject_id_purpose_idx"
ON "consent_grants"("tenant_id", "subject_id", "purpose");
CREATE INDEX "consent_grants_tenant_id_subject_id_revoked_at_expires_at_idx"
ON "consent_grants"("tenant_id", "subject_id", "revoked_at", "expires_at");

CREATE UNIQUE INDEX "retention_policies_tenant_id_classification_policy_version_key"
ON "retention_policies"("tenant_id", "classification", "policy_version");
CREATE INDEX "retention_policies_tenant_id_classification_active_effective_at_idx"
ON "retention_policies"("tenant_id", "classification", "active", "effective_at");

CREATE UNIQUE INDEX "legal_holds_tenant_id_hold_ref_key"
ON "legal_holds"("tenant_id", "hold_ref");
CREATE INDEX "legal_holds_tenant_id_subject_id_active_starts_at_ends_at_idx"
ON "legal_holds"("tenant_id", "subject_id", "active", "starts_at", "ends_at");

CREATE UNIQUE INDEX "deletion_requests_tenant_id_request_id_key"
ON "deletion_requests"("tenant_id", "request_id");
CREATE INDEX "deletion_requests_tenant_id_subject_id_requested_at_idx"
ON "deletion_requests"("tenant_id", "subject_id", "requested_at");

CREATE UNIQUE INDEX "export_requests_tenant_id_request_id_key"
ON "export_requests"("tenant_id", "request_id");
CREATE INDEX "export_requests_tenant_id_subject_id_requested_at_idx"
ON "export_requests"("tenant_id", "subject_id", "requested_at");

CREATE INDEX "privacy_audit_events_tenant_id_subject_id_occurred_at_idx"
ON "privacy_audit_events"("tenant_id", "subject_id", "occurred_at");
CREATE INDEX "privacy_audit_events_tenant_id_action_occurred_at_idx"
ON "privacy_audit_events"("tenant_id", "action", "occurred_at");
