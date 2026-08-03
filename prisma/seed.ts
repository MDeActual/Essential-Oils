import "dotenv/config";

import { Client } from "pg";

import { getAllProtocols } from "../src/api/controllers/protocolStore";
import { getAllContributorRecords } from "../src/api/controllers/analyticsStore";
import { LOCAL_DEVELOPMENT_TENANT_ID } from "../src/db/tenant";

function requireConnectionString(): string {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");
  return connectionString;
}

async function seedDatabase(connectionString: string): Promise<void> {
  const protocols = [...getAllProtocols(LOCAL_DEVELOPMENT_TENANT_ID)];
  const contributorRecords = [...getAllContributorRecords(LOCAL_DEVELOPMENT_TENANT_ID)];
  if (protocols.length === 0 || contributorRecords.length === 0) {
    throw new Error(
      `Seed sources must be non-empty; received ${protocols.length} protocols and ${contributorRecords.length} contributor records.`
    );
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query('DELETE FROM "outcome_logs"');
    await client.query('DELETE FROM "challenges"');
    await client.query('DELETE FROM "contributors"');
    await client.query('DELETE FROM "blends"');
    await client.query('DELETE FROM "protocols"');

    for (const protocol of protocols) {
      await client.query(
        `INSERT INTO "protocols" (
          "id", "tenant_id", "protocol_id", "version", "user_profile_id",
          "goal", "duration_days", "status", "phases", "challenge_ids",
          "created_at", "updated_at"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::"ProtocolStatus", $9::jsonb, $10::text[], $11, $12)`,
        [
          `seed-protocol-${protocol.protocolId}`,
          LOCAL_DEVELOPMENT_TENANT_ID,
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
        `INSERT INTO "contributors" (
          "id", "tenant_id", "record_id", "user_id", "protocol_id",
          "data_origin", "exclusion_status", "exclusion_reason",
          "adherence_score", "challenge_completion_rate", "outcome_notes",
          "recorded_at", "updated_at"
        ) VALUES ($1, $2, $3, $4, $5, $6::"DataOrigin", $7::"ExclusionStatus", $8::"ExclusionReason", $9, $10, $11, $12, $13)`,
        [
          `seed-contributor-${record.recordId}`,
          LOCAL_DEVELOPMENT_TENANT_ID,
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
    try { await client.query("ROLLBACK"); } catch (rollbackError) {
      // eslint-disable-next-line no-console
      console.error("Seed rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    await client.end();
  }
}

async function verifyCommittedSeed(connectionString: string): Promise<void> {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const counts = await client.query<{ protocol_count: number; contributor_count: number }>(
      `SELECT
        (SELECT COUNT(*)::int FROM "protocols" WHERE "tenant_id" = $1) AS protocol_count,
        (SELECT COUNT(*)::int FROM "contributors" WHERE "tenant_id" = $1) AS contributor_count`,
      [LOCAL_DEVELOPMENT_TENANT_ID]
    );
    const canonicalProtocol = await client.query<{ protocol_id: string }>(
      'SELECT "protocol_id" FROM "protocols" WHERE "tenant_id" = $1 AND "protocol_id" = $2',
      [LOCAL_DEVELOPMENT_TENANT_ID, "protocol-001"]
    );
    const protocolCount = counts.rows[0]?.protocol_count ?? -1;
    const contributorCount = counts.rows[0]?.contributor_count ?? -1;
    const expectedProtocolCount = getAllProtocols(LOCAL_DEVELOPMENT_TENANT_ID).length;
    const expectedContributorCount = getAllContributorRecords(LOCAL_DEVELOPMENT_TENANT_ID).length;
    if (protocolCount !== expectedProtocolCount || contributorCount !== expectedContributorCount || canonicalProtocol.rowCount !== 1) {
      throw new Error([
        "Committed seed verification failed.",
        `protocol rows=${protocolCount}/${expectedProtocolCount}`,
        `contributor rows=${contributorCount}/${expectedContributorCount}`,
        `protocol-001=${canonicalProtocol.rowCount === 1 ? "present" : "missing"}`,
      ].join(" "));
    }
    // eslint-disable-next-line no-console
    console.log(`Committed seed verification passed for ${LOCAL_DEVELOPMENT_TENANT_ID}: ${protocolCount} protocols and ${contributorCount} contributor records persisted.`);
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
