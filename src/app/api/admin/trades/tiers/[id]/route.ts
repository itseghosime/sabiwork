import { eq } from "drizzle-orm";
import { adminActor, recordAudit } from "@/lib/server/audit";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toTradeTier } from "@/lib/server/admin-dto";
import { commissionTiers } from "@/lib/server/schema";

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
  const commissionBps = typeof input.commissionBps === "number" ? Math.round(input.commissionBps) : undefined;
  const payoutWindowDays = typeof input.payoutWindowDays === "number" ? Math.round(input.payoutWindowDays) : undefined;

  if (commissionBps === undefined && payoutWindowDays === undefined) {
    return jsonError(400, "INVALID_INPUT", "Provide commissionBps and/or payoutWindowDays.");
  }
  if (commissionBps !== undefined && (commissionBps < 0 || commissionBps > 5000)) {
    return jsonError(400, "INVALID_INPUT", "Commission must be between 0 and 5000 basis points (0–50%).");
  }
  if (payoutWindowDays !== undefined && (payoutWindowDays < 0 || payoutWindowDays > 60)) {
    return jsonError(400, "INVALID_INPUT", "Payout window must be between 0 and 60 days.");
  }

  try {
    const db = getDb();
    const [existing] = await db.select().from(commissionTiers).where(eq(commissionTiers.id, id)).limit(1);
    if (!existing) return jsonError(404, "NOT_FOUND", "Commission tier not found.");

    const [updated] = await db
      .update(commissionTiers)
      .set({
        ...(commissionBps !== undefined ? { commission_bps: commissionBps } : {}),
        ...(payoutWindowDays !== undefined ? { payout_window_days: payoutWindowDays } : {}),
        updated_at: new Date(),
      })
      .where(eq(commissionTiers.id, id))
      .returning();

    const changes: string[] = [];
    if (commissionBps !== undefined && commissionBps !== existing.commission_bps) {
      changes.push(`commission ${existing.commission_bps} to ${commissionBps} bps`);
    }
    if (payoutWindowDays !== undefined && payoutWindowDays !== existing.payout_window_days) {
      changes.push(`payout window ${existing.payout_window_days} to ${payoutWindowDays} days`);
    }

    await recordAudit({
      actor: adminActor(user),
      actorRole: "Rates desk",
      action: "trade_tier.updated",
      target: `Tier "${existing.name}"${changes.length ? ` (${changes.join(", ")})` : ""}`,
      severity: "warning",
    });

    return Response.json(
      { data: { tier: toTradeTier(updated) } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Tier update failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save the commission tier.");
  }
}
