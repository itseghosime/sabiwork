import "server-only";

import { createRealtime } from "@neon/realtime/server";
import { drizzleAdapter } from "@neon/realtime-drizzle";
import { getServerEnv } from "./env";

export function createRealtimeServer() {
  const env = getServerEnv();
  return createRealtime({
    secret: env.realtimeSecret,
    db: env.database,
    adapter: drizzleAdapter(),
    debugMode: process.env.NODE_ENV === "development",
  });
}
