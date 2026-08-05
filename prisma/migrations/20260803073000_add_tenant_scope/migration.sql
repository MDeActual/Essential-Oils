-- ADR-017: add a fail-closed tenant boundary to every user-owned row.
-- Existing rows are deterministic local/test seed data and are assigned to the
-- explicit local tenant before the columns become NOT NULL.

ALTER TABLE "protocols" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "contributors" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "challenges" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "outcome_logs" ADD COLUMN "tenant_id" TEXT;

UPDATE "protocols" SET "tenant_id" = 'tenant-local' WHERE "tenant_id" IS NULL;
UPDATE "contributors" SET "tenant_id" = 'tenant-local' WHERE "tenant_id" IS NULL;
UPDATE "challenges" SET "tenant_id" = 'tenant-local' WHERE "tenant_id" IS NULL;
UPDATE "outcome_logs" SET "tenant_id" = 'tenant-local' WHERE "tenant_id" IS NULL;

ALTER TABLE "protocols" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "contributors" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "challenges" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "outcome_logs" ALTER COLUMN "tenant_id" SET NOT NULL;

ALTER TABLE "challenges" DROP CONSTRAINT "challenges_protocol_id_fkey";
ALTER TABLE "outcome_logs" DROP CONSTRAINT "outcome_logs_contributor_id_fkey";

-- User-owned identifiers are tenant-local. Remove their former global uniqueness
-- before creating the canonical compound tenant/entity keys.
DROP INDEX "protocols_protocol_id_key";
DROP INDEX "contributors_record_id_key";
DROP INDEX "challenges_challenge_id_key";

-- The original global lookup indexes are superseded by tenant-leading indexes.
DROP INDEX "protocols_user_profile_id_idx";
DROP INDEX "protocols_status_idx";
DROP INDEX "contributors_protocol_id_idx";
DROP INDEX "contributors_data_origin_exclusion_status_idx";
DROP INDEX "challenges_protocol_id_idx";
DROP INDEX "challenges_completion_status_idx";
DROP INDEX "outcome_logs_contributor_id_idx";
DROP INDEX "outcome_logs_protocol_id_idx";

CREATE UNIQUE INDEX "protocols_tenant_id_protocol_id_key"
  ON "protocols"("tenant_id", "protocol_id");
CREATE UNIQUE INDEX "contributors_tenant_id_record_id_key"
  ON "contributors"("tenant_id", "record_id");
CREATE UNIQUE INDEX "challenges_tenant_id_challenge_id_key"
  ON "challenges"("tenant_id", "challenge_id");

CREATE INDEX "protocols_tenant_id_user_profile_id_idx"
  ON "protocols"("tenant_id", "user_profile_id");
CREATE INDEX "protocols_tenant_id_status_idx"
  ON "protocols"("tenant_id", "status");
CREATE INDEX "contributors_tenant_id_protocol_id_idx"
  ON "contributors"("tenant_id", "protocol_id");
CREATE INDEX "contributors_tenant_id_data_origin_exclusion_status_idx"
  ON "contributors"("tenant_id", "data_origin", "exclusion_status");
CREATE INDEX "challenges_tenant_id_protocol_id_idx"
  ON "challenges"("tenant_id", "protocol_id");
CREATE INDEX "challenges_tenant_id_completion_status_idx"
  ON "challenges"("tenant_id", "completion_status");
CREATE INDEX "outcome_logs_tenant_id_contributor_id_idx"
  ON "outcome_logs"("tenant_id", "contributor_id");
CREATE INDEX "outcome_logs_tenant_id_protocol_id_idx"
  ON "outcome_logs"("tenant_id", "protocol_id");

ALTER TABLE "challenges"
  ADD CONSTRAINT "challenges_tenant_id_protocol_id_fkey"
  FOREIGN KEY ("tenant_id", "protocol_id")
  REFERENCES "protocols"("tenant_id", "protocol_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "outcome_logs"
  ADD CONSTRAINT "outcome_logs_tenant_id_contributor_id_fkey"
  FOREIGN KEY ("tenant_id", "contributor_id")
  REFERENCES "contributors"("tenant_id", "record_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
