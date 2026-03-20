import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS "generations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL,
    "destination" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  )
`;

console.log("generations table created (or already exists).");
await sql.end();
