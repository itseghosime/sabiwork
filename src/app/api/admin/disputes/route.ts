import { asc, desc, inArray } from "drizzle-orm";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toDisputeCase } from "@/lib/server/admin-dto";
import { disputeEvents, disputeEvidence, disputes } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET() {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in as an administrator.");
  if (access.kind === "forbidden" || access.kind === "profile-required") return jsonError(403, "FORBIDDEN", "Admin access is required.");
  if (access.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");

  try {
    const db = getDb();
    const rows = await db.select().from(disputes).orderBy(desc(disputes.opened_at));
    const ids = rows.map((row) => row.id);

    const [evidence, events] = ids.length
      ? await Promise.all([
          db.select().from(disputeEvidence).where(inArray(disputeEvidence.dispute_id, ids)),
          db
            .select()
            .from(disputeEvents)
            .where(inArray(disputeEvents.dispute_id, ids))
            .orderBy(asc(disputeEvents.occurred_at)),
        ])
      : [[], []];

    const now = Date.now();
    const cases = rows.map((row) =>
      toDisputeCase(
        row,
        evidence.filter((item) => item.dispute_id === row.id),
        events.filter((item) => item.dispute_id === row.id),
        now,
      ),
    );

    return Response.json({ data: { cases } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[admin] Dispute list failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load dispute cases.");
  }
}
