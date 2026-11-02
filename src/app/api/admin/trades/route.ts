import { asc } from "drizzle-orm";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toTradeCategory, toTradeTier } from "@/lib/server/admin-dto";
import { commissionTiers, tradeCategories } from "@/lib/server/schema";

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
    const [tierRows, categoryRows] = await Promise.all([
      db.select().from(commissionTiers).orderBy(asc(commissionTiers.sort_order)),
      db.select().from(tradeCategories).orderBy(asc(tradeCategories.name)),
    ]);

    return Response.json(
      { data: { tiers: tierRows.map(toTradeTier), categories: categoryRows.map(toTradeCategory) } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Trades list failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load trade rates and tiers.");
  }
}
