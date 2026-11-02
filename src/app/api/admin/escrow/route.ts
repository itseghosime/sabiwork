import { desc } from "drizzle-orm";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toEscrowHold } from "@/lib/server/admin-dto";
import { escrowHolds } from "@/lib/server/schema";

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
    const rows = await getDb().select().from(escrowHolds).orderBy(desc(escrowHolds.release_due_at));
    const holds = rows.map(toEscrowHold);

    const totals = holds.reduce(
      (acc, hold) => {
        if (hold.status === "released") acc.released += hold.amountKobo;
        else if (hold.status === "disputed") acc.disputed += hold.amountKobo;
        else {
          acc.held += hold.amountKobo;
          if (hold.status === "release_due") acc.releaseDue += hold.amountKobo;
        }
        if (hold.status === "release_due") acc.dueToday += 1;
        return acc;
      },
      { held: 0, releaseDue: 0, released: 0, disputed: 0, dueToday: 0 },
    );

    return Response.json({ data: { holds, totals } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[admin] Escrow list failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load the escrow ledger.");
  }
}
