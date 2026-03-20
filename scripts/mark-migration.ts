import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  // Mark migration 0000 as already applied so drizzle skips it
  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES ('0000_careful_lily_hollister', ${Date.now()})
    ON CONFLICT DO NOTHING
  `;
  console.log("Migration 0000 marked as applied.");
  await sql.end();
}

main().catch(console.error);
