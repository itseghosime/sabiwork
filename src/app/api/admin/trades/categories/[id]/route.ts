import { eq } from "drizzle-orm";
import { adminActor, recordAudit } from "@/lib/server/audit";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toTradeCategory } from "@/lib/server/admin-dto";
import { commissionTiers, tradeCategories } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in as an administrator.");
  if (access.kind === "forbidden" || access.kind === "profile-required") return jsonError(403, "FORBIDDEN", "Admin access is required.");
  if (access.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  const user = access.user;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (typeof body !== "object" || !body) {
    return jsonError(400, "INVALID_INPUT", "Request body must be an object.");
  }

  const input = body as Record<string, unknown>;
  const active = typeof input.active === "boolean" ? input.active : undefined;
  const defaultTierId = typeof input.defaultTierId === "string" ? input.defaultTierId.trim() : undefined;
  const markReviewed = input.markReviewed === true;

  if (active === undefined && defaultTierId === undefined && !markReviewed) {
    return jsonError(400, "INVALID_INPUT", "Provide active, defaultTierId and/or markReviewed.");
  }

  try {
    const db = getDb();
    const [existing] = await db.select().from(tradeCategories).where(eq(tradeCategories.id, id)).limit(1);
    if (!existing) return jsonError(404, "NOT_FOUND", "Trade category not found.");

    if (defaultTierId !== undefined) {
      const [tier] = await db
        .select({ id: commissionTiers.id })
        .from(commissionTiers)
        .where(eq(commissionTiers.id, defaultTierId))
        .limit(1);
      if (!tier) return jsonError(400, "INVALID_INPUT", "That commission tier does not exist.");
    }

    const now = new Date();
    const [updated] = await db
      .update(tradeCategories)
      .set({
        ...(active !== undefined ? { active } : {}),
        ...(defaultTierId !== undefined ? { default_tier_id: defaultTierId } : {}),
        ...(markReviewed ? { last_reviewed_at: now } : {}),
        updated_at: now,
      })
      .where(eq(tradeCategories.id, id))
      .returning();

    await recordAudit({
      actor: adminActor(user),
      actorRole: "Rates desk",
      action: active === undefined ? "trade_category.updated" : active ? "trade_category.activated" : "trade_category.hidden",
      target: `Category ${existing.name}`,
      severity: active === false ? "warning" : "info",
    });

    return Response.json(
      { data: { category: toTradeCategory(updated) } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Category update failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save the trade category.");
  }
}
