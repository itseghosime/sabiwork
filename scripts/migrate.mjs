import { readdir, readFile } from "node:fs/promises";
import { Client } from "pg";

const source = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!source) {
  throw new Error("Set DATABASE_URL_UNPOOLED or DATABASE_URL before migrating.");
}

const connectionString = source.replace(
  "sslmode=require",
  "sslmode=verify-full",
);
const migrationsDirectory = new URL("../db/migrations/", import.meta.url);
const client = new Client({ connectionString });
let transactionOpen = false;

try {
  await client.connect();
  await client.query("BEGIN");
  transactionOpen = true;
  await client.query("SELECT pg_advisory_xact_lock(784313, 1)");
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(migrationsDirectory))
    .filter((name) => /^\d+_[a-z0-9_]+\.sql$/.test(name))
    .sort();
  const applied = await client.query("SELECT name FROM public.schema_migrations");
  const appliedNames = new Set(applied.rows.map((row) => row.name));

  for (const name of files) {
    if (appliedNames.has(name)) continue;
    const sql = await readFile(new URL(name, migrationsDirectory), "utf8");
    await client.query(sql);
    await client.query("INSERT INTO public.schema_migrations (name) VALUES ($1)", [
      name,
    ]);
    console.log(`Applied migration ${name}`);
  }

  await client.query("COMMIT");
  transactionOpen = false;
  console.log("Database migrations are up to date.");
} catch (error) {
  if (transactionOpen) await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
