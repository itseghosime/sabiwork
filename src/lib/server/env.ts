import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export function getServerEnv() {
  const databaseUrl = required("DATABASE_URL");
  const database = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));

  if (!database) {
    throw new Error("DATABASE_URL must include a database name.");
  }

  return {
    databaseUrl,
    migrationDatabaseUrl: process.env.DATABASE_URL_UNPOOLED || databaseUrl,
    database,
    authBaseUrl: required("NEON_AUTH_BASE_URL"),
    authCookieSecret: required("NEON_AUTH_COOKIE_SECRET"),
    realtimeUrl: required("NEON_REALTIME_URL"),
    realtimeSecret: required("NEON_REALTIME_SECRET"),
  };
}
