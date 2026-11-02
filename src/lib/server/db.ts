import "server-only";

import { attachDatabasePool } from "@vercel/functions";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { getServerEnv } from "./env";

let pool: Pool | undefined;
let database: NodePgDatabase<typeof schema> | undefined;

function getPool() {
  if (!pool) {
    const connectionString = getServerEnv().databaseUrl.replace(
      "sslmode=require",
      "sslmode=verify-full",
    );
    pool = new Pool({ connectionString, max: 5 });
    pool.on("error", (error) => {
      console.error("[database] Idle connection error", error);
    });
    if (process.env.VERCEL) attachDatabasePool(pool);
  }
  return pool;
}

export function getDb() {
  database ??= drizzle(getPool(), { schema });
  return database;
}
