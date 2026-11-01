import { eq } from "drizzle-orm";
import { adminActor, recordAudit } from "@/lib/server/audit";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toEscrowHold } from "@/lib/server/admin-dto";
import { escrowHolds } from "@/lib/server/schema";

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

  const status =
    typeof body === "object" && body && "status" in body && typeof (body as { status: unknown }).status === "string"
      ? (body as { status: string }).status
      : undefined;

  if (status !== "released") {
    return jsonError(400, "INVALID_INPUT", "Only a release (status 'released') can be recorded here.");
  }

  try {
    const db = getDb();
    const [existing] = await db.select().from(escrowHolds).where(eq(escrowHolds.id, id)).limit(1);
    if (!existing) return jsonError(404, "NOT_FOUND", "Escrow hold not found.");

    if (existing.status === "released") {
      return jsonError(409, "ALREADY_RELEASED", "This milestone has already been released.");
    }
    if (existing.status !== "release_due") {
      return jsonError(409, "NOT_DUE", "Only milestones marked release due can be released.");
    }
    if (!existing.signed_off) {
      return jsonError(409, "NOT_SIGNED_OFF", "The customer has not signed this milestone off yet.");
    }

    const now = new Date();
    const [updated] = await db
      .update(escrowHolds)
      .set({ status: "released", released_at: now, updated_at: now })
      .where(eq(escrowHolds.id, id))
      .returning();

    await recordAudit({
      actor: adminActor(user),
      actorRole: "Payout desk",
      action: "payout.released",
      target: `Escrow release ${id}`,
      severity: "warning",
    });

    return Response.json(
      { data: { hold: toEscrowHold(updated) } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Escrow release failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not record the release.");
  }
}
