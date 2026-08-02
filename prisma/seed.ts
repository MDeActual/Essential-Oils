import "dotenv/config";

import { Client } from "pg";

import { getAllProtocols } from "../src/api/controllers/protocolStore";
import { getAllContributorRecords } from "../src/api/controllers/analyticsStore";

function requireConnectionString(): string {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }
  return connectionString;
}

async function seedDatabase(connectionString: string): Promise<void> {
  const protocols = [...getAllProtocols()];
  const contributorRecords = [...getAllContributorRecords()];

  if (protocols.length === 0 || contributorRecords.length === 0) {
    throw new Error(
      `Seed sources must be non-empty; received ${protocols.length} protocols and ${contributorRecords.length} contributor records.`
    );
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("BEGIN");

    // Clear existing rows in dependency order to keep the seed idempotent.
    await client.query('DELETE FROM "outcome_logs"');
    await client.query('DELETE FROM "challenges"');
    await client.query('DELETE FROM "contributors"');
    await client.query('DELETE FROM "blends"');
    await client.query('DELETE FROM "protocols"');

    for (const protocol of protocols) {
      await client.query(
        `
          INSERT INTO "protocols" (
            "id",
            "protocol_id",
            "version",
            "user_profile_id",
            "goal",
            "duration_days",
            "status",
            "phases",
            "challenge_ids",
            "created_at",
            "updated_at"
          ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7::"ProtocolStatus",
            $8::jsonb,
            $9::text[],
            $10,
            $11
          )
        `,
        [
          `seed-protocol-${protocol.protocolId}`,
          protocol.protocolId,
          protocol.version,
          protocol.userProfileId,
          protocol.goal,
          protocol.durationDays,
          protocol.status,
          JSON.stringify(protocol.phases),
          [...protocol.challengeIds],
          new Date(protocol.createdAt),
          new Date(),
        ]
      );
    }

    for (const record of contributorRecords) {
      await client.query(
        `
          INSERT INTO "contributors" (
            "id",
            "record_id",
            "user_id",
            "protocol_id",
            "data_origin",
            "exclusion_status",
            "exclusion_reason",
            "adherence_score",
            "challenge_completion_rate",
            "outcome_notes",
            "recorded_at",
            "updated_at"
          ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5::"DataOrigin",
            $6::"ExclusionStatus",
            $7::"ExclusionReason",
            $8,
            $9,
            $10,
            $11,
            $12
          )
        `,
        [
          `seed-contributor-${record.recordId}`,
          record.recordId,
          record.userId,
          record.protocolId,
          record.dataOrigin,
          record.exclusionStatus,
          record.exclusionReason ?? null,
          record.adherenceScore,
          record.challengeCompletionRate,
          record.outcomeNotes ?? null,
          new Date(record.recordedAt),
          new Date(),
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      // eslint-disable-next-line no-console
      console.error("Seed rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    await client.end();
  }
}

async function verifyCommittedSeed(connectionString: string): Promise<void> {
  // Use a second physical connection so verification cannot observe uncommitted
  // state from the writer connection.
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const counts = await client.query<{
      protocol_count: number;
      contributor_count: number;
    }>(
      `
        SELECT
          (SELECT COUNT(*)::int FROM "protocols") AS protocol_count,
          (SELECT COUNT(*)::int FROM "contributors") AS contributor_count
      `
    );

    const canonicalProtocol = await client.query<{ protocol_id: string }>(
      'SELECT "protocol_id" FROM "protocols" WHERE "protocol_id" = $1',
      ["protocol-001"]
    );

    const protocolCount = counts.rows[0]?.protocol_count ?? -1;
    const contributorCount = counts.rows[0]?.contributor_count ?? -1;
    const expectedProtocolCount = getAllProtocols().length;
    const expectedContributorCount = getAllContributorRecords().length;

    if (
      protocolCount !== expectedProtocolCount ||
      contributorCount !== expectedContributorCount ||
      canonicalProtocol.rowCount !== 1
    ) {
      throw new Error(
        [
          "Committed seed verification failed.",
          `protocol rows=${protocolCount}/${expectedProtocolCount}`,
          `contributor rows=${contributorCount}/${expectedContributorCount}`,
          `protocol-001=${canonicalProtocol.rowCount === 1 ? "present" : "missing"}`,
        ].join(" ")
      );
    }

    // eslint-disable-next-line no-console
    console.log(
      `Committed seed verification passed: ${protocolCount} protocols and ${contributorCount} contributor records persisted.`
    );
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const connectionString = requireConnectionString();
  await seedDatabase(connectionString);
  await verifyCommittedSeed(connectionString);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("PostgreSQL seed failed:", error);
  process.exit(1);
});
