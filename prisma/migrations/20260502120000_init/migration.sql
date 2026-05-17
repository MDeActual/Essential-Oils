-- Manual initial migration for Phyto.ai persistence layer.
-- Generated to match prisma/schema.prisma models.

-- Enums
DO $$ BEGIN
  CREATE TYPE "DataOrigin" AS ENUM ('REAL_CONTRIBUTOR', 'SYNTHETIC_SIMULATION');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExclusionStatus" AS ENUM ('INCLUDED', 'EXCLUDED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExclusionReason" AS ENUM ('ADHERENCE_BELOW_THRESHOLD', 'USER_REQUEST', 'INVALID_DATA', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProtocolStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'DEPRECATED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ChallengeType" AS ENUM ('ADHERENCE', 'EDUCATIONAL', 'EXPERIENTIAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ChallengeCompletionStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BlendSafetyStatus" AS ENUM ('VALIDATED', 'PENDING', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ApplicationMethod" AS ENUM ('TOPICAL', 'AROMATIC', 'INTERNAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "contributors" (
  "id" TEXT NOT NULL,
  "record_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "protocol_id" TEXT NOT NULL,
  "data_origin" "DataOrigin" NOT NULL,
  "exclusion_status" "ExclusionStatus" NOT NULL,
  "exclusion_reason" "ExclusionReason",
  "adherence_score" DOUBLE PRECISION NOT NULL,
  "challenge_completion_rate" DOUBLE PRECISION NOT NULL,
  "outcome_notes" TEXT,
  "recorded_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "contributors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "contributors_record_id_key" ON "contributors"("record_id");
CREATE INDEX IF NOT EXISTS "contributors_protocol_id_idx" ON "contributors"("protocol_id");
CREATE INDEX IF NOT EXISTS "contributors_data_origin_exclusion_status_idx" ON "contributors"("data_origin", "exclusion_status");

CREATE TABLE IF NOT EXISTS "protocols" (
  "id" TEXT NOT NULL,
  "protocol_id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "user_profile_id" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "duration_days" INTEGER NOT NULL,
  "status" "ProtocolStatus" NOT NULL DEFAULT 'DRAFT',
  "phases" JSONB NOT NULL,
  "challenge_ids" TEXT[] NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL,
  "db_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "protocols_protocol_id_key" ON "protocols"("protocol_id");
CREATE INDEX IF NOT EXISTS "protocols_user_profile_id_idx" ON "protocols"("user_profile_id");
CREATE INDEX IF NOT EXISTS "protocols_status_idx" ON "protocols"("status");

CREATE TABLE IF NOT EXISTS "challenges" (
  "id" TEXT NOT NULL,
  "challenge_id" TEXT NOT NULL,
  "protocol_id" TEXT NOT NULL,
  "type" "ChallengeType" NOT NULL,
  "prompt" TEXT NOT NULL,
  "due_day" INTEGER NOT NULL,
  "completion_status" "ChallengeCompletionStatus" NOT NULL DEFAULT 'PENDING',
  "response" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "challenges_challenge_id_key" ON "challenges"("challenge_id");
CREATE INDEX IF NOT EXISTS "challenges_protocol_id_idx" ON "challenges"("protocol_id");
CREATE INDEX IF NOT EXISTS "challenges_type_idx" ON "challenges"("type");

ALTER TABLE "challenges"
  ADD CONSTRAINT IF NOT EXISTS "challenges_protocol_id_fkey"
  FOREIGN KEY ("protocol_id") REFERENCES "protocols"("protocol_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "blends" (
  "id" TEXT NOT NULL,
  "blend_id" TEXT NOT NULL,
  "oils" JSONB NOT NULL,
  "synergy_score" DOUBLE PRECISION NOT NULL,
  "application_method" "ApplicationMethod" NOT NULL,
  "intended_effect" TEXT NOT NULL,
  "safety_status" "BlendSafetyStatus" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL,
  "last_reviewed_at" TIMESTAMP(3) NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "blends_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "blends_blend_id_key" ON "blends"("blend_id");
CREATE INDEX IF NOT EXISTS "blends_safety_status_idx" ON "blends"("safety_status");

CREATE TABLE IF NOT EXISTS "outcome_logs" (
  "id" TEXT NOT NULL,
  "contributor_id" TEXT NOT NULL,
  "protocol_id" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "logged_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "outcome_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "outcome_logs_contributor_id_idx" ON "outcome_logs"("contributor_id");
CREATE INDEX IF NOT EXISTS "outcome_logs_protocol_id_idx" ON "outcome_logs"("protocol_id");

ALTER TABLE "outcome_logs"
  ADD CONSTRAINT IF NOT EXISTS "outcome_logs_contributor_id_fkey"
  FOREIGN KEY ("contributor_id") REFERENCES "contributors"("record_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "outcome_logs"
  ADD CONSTRAINT IF NOT EXISTS "outcome_logs_protocol_id_fkey"
  FOREIGN KEY ("protocol_id") REFERENCES "protocols"("protocol_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
