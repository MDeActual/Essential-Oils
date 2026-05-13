-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DataOrigin" AS ENUM ('real_contributor', 'synthetic_simulation');

-- CreateEnum
CREATE TYPE "ExclusionStatus" AS ENUM ('included', 'excluded');

-- CreateEnum
CREATE TYPE "ExclusionReason" AS ENUM ('adherence_below_threshold', 'synthetic_data', 'manual_flag', 'incomplete_record');

-- CreateEnum
CREATE TYPE "ProtocolStatus" AS ENUM ('draft', 'active', 'completed', 'deprecated');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('adherence', 'educational', 'experiential');

-- CreateEnum
CREATE TYPE "ChallengeCompletionStatus" AS ENUM ('pending', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "ApplicationMethod" AS ENUM ('topical', 'aromatic', 'internal');

-- CreateEnum
CREATE TYPE "BlendSafetyStatus" AS ENUM ('validated', 'pending', 'rejected');

-- CreateTable
CREATE TABLE "contributors" (
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

-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "status" "ProtocolStatus" NOT NULL DEFAULT 'draft',
    "phases" JSONB NOT NULL,
    "challenge_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL,
    "db_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "due_day" INTEGER NOT NULL,
    "completion_status" "ChallengeCompletionStatus" NOT NULL DEFAULT 'pending',
    "response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blends" (
    "id" TEXT NOT NULL,
    "blend_id" TEXT NOT NULL,
    "oils" JSONB NOT NULL,
    "synergy_score" DOUBLE PRECISION NOT NULL,
    "application_method" "ApplicationMethod" NOT NULL,
    "intended_effect" TEXT NOT NULL,
    "safety_status" "BlendSafetyStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL,
    "last_reviewed_at" TIMESTAMP(3) NOT NULL,
    "db_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcome_logs" (
    "id" TEXT NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outcome_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contributors_record_id_key" ON "contributors"("record_id");

-- CreateIndex
CREATE INDEX "contributors_protocol_id_idx" ON "contributors"("protocol_id");

-- CreateIndex
CREATE INDEX "contributors_data_origin_exclusion_status_idx" ON "contributors"("data_origin", "exclusion_status");

-- CreateIndex
CREATE UNIQUE INDEX "protocols_protocol_id_key" ON "protocols"("protocol_id");

-- CreateIndex
CREATE INDEX "protocols_user_profile_id_idx" ON "protocols"("user_profile_id");

-- CreateIndex
CREATE INDEX "protocols_status_idx" ON "protocols"("status");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_challenge_id_key" ON "challenges"("challenge_id");

-- CreateIndex
CREATE INDEX "challenges_protocol_id_idx" ON "challenges"("protocol_id");

-- CreateIndex
CREATE INDEX "challenges_completion_status_idx" ON "challenges"("completion_status");

-- CreateIndex
CREATE UNIQUE INDEX "blends_blend_id_key" ON "blends"("blend_id");

-- CreateIndex
CREATE INDEX "blends_safety_status_idx" ON "blends"("safety_status");

-- CreateIndex
CREATE INDEX "outcome_logs_contributor_id_idx" ON "outcome_logs"("contributor_id");

-- CreateIndex
CREATE INDEX "outcome_logs_protocol_id_idx" ON "outcome_logs"("protocol_id");

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "protocols"("protocol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_logs" ADD CONSTRAINT "outcome_logs_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributors"("record_id") ON DELETE RESTRICT ON UPDATE CASCADE;
