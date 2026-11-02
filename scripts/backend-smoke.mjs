import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { createRealtime, rawSql } from "@neon/realtime/server";

const databaseUrl = (
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
)?.replace("sslmode=require", "sslmode=verify-full");
const realtimeUrl = process.env.NEON_REALTIME_URL;
const realtimeSecret = process.env.NEON_REALTIME_SECRET;
if (!databaseUrl || !realtimeUrl || !realtimeSecret) {
  throw new Error(
    "Set the isolated branch Postgres and Realtime variables before running the smoke test.",
  );
}

const database = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
const client = new Client({ connectionString: databaseUrl });
const userId = `backend-smoke-${randomUUID()}`;
const requestId = randomUUID();
const realtime = createRealtime({
  url: realtimeUrl,
  secret: realtimeSecret,
  db: database,
});
const query = rawSql(
  `SELECT id, title
   FROM public.job_requests
   WHERE customer_id = $1 AND status = 'draft'
   ORDER BY created_at DESC, id DESC
   LIMIT 50`,
  [userId],
);

function waitForLive(subscription, timeoutMs) {
  const current = subscription.getState();
  if (current.status === "live") return Promise.resolve();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      stopListening();
      if (error) reject(error);
      else resolve();
    };
    const stopListening = subscription.onStateChange((state) => {
      if (state.status === "live") finish();
      if (state.status === "error") finish(state.error);
    });
    const timer = setTimeout(
      () => finish(new Error("Realtime did not become live in time.")),
      timeoutMs,
    );
    const latest = subscription.getState();
    if (latest.status === "live") finish();
    if (latest.status === "error") finish(latest.error);
  });
}

let subscription;
let connected = false;
try {
  await client.connect();
  connected = true;
  const subscriptionPromise = realtime.subscribe(query);
  await client.query(
    `INSERT INTO public.user_profiles (user_id, role, display_name)
     VALUES ($1, 'customer', 'Backend smoke test')`,
    [userId],
  );
  subscription = await subscriptionPromise;
  await waitForLive(subscription, 20_000);

  await client.query(
    `INSERT INTO public.job_requests
      (id, customer_id, title, category, service_area, description, budget_guidance_kobo)
     VALUES ($1, $2, 'Smoke test request', 'Plumbing', 'Sample area',
       'A temporary request used only to verify database persistence and live updates.',
       1234500)`,
    [requestId, userId],
  );

  await subscription.awaitRows(
    (rows) => rows.some((row) => row.id === requestId),
    20_000,
  );
  const persisted = await client.query(
    "SELECT id FROM public.job_requests WHERE id = $1",
    [requestId],
  );
  if (persisted.rowCount !== 1) {
    throw new Error("The request was not persisted in Postgres.");
  }
  console.log("Postgres persistence passed; Realtime delivered the committed request.");
} finally {
  subscription?.unsubscribe();
  if (connected) {
    try {
      await client.query("DELETE FROM public.user_profiles WHERE user_id = $1", [
        userId,
      ]);
    } finally {
      await client.end();
    }
  }
}
