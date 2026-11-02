import { eq } from "drizzle-orm";
import { adminActor, recordAudit } from "@/lib/server/audit";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toEscrowHold } from "@/lib/server/admin-dto";
import { releaseEscrowHold } from "@/lib/server/payouts";
import { escrowHolds } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

async function currentHold(id: string) {
  const [row] = await getDb().select().from(escrowHolds).where(eq(escrowHolds.id, id)).limit(1);
  return row ?? null;
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

  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  if (record.action !== "release" && record.status !== "released") {
    return jsonError(400, "INVALID_INPUT", "Only a release can be requested here.");
  }

  try {
    const result = await releaseEscrowHold(id);

    switch (result.kind) {
      case "not_found":
        return jsonError(404, "NOT_FOUND", "Escrow hold not found.");

      case "needs_payee":
        return jsonError(409, "NEEDS_PAYEE", result.message);

      case "not_payable":
        return jsonError(409, "NOT_PAYABLE", result.message);

      case "gateway_error":
        return jsonError(502, "PAYOUT_FAILED", result.message);

      case "paid": {
        const hold = await currentHold(id);
        await recordAudit({
          actor: adminActor(user),
          actorRole: "Payout desk",
          action: "payout.released",
          target: `Escrow release ${id} · ${result.reference}`,
          severity: "warning",
        });
        return Response.json(
          {
            data: {
              hold: hold ? toEscrowHold(hold) : null,
              transfer: {
                state: "paid",
                reference: result.reference,
                amountKobo: result.amountKobo,
                accountName: result.accountName,
              },
            },
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      }

      case "otp_required":
      case "in_flight": {
        const hold = await currentHold(id);
        const otpRequired = result.kind === "otp_required";
        if (otpRequired) {
          await recordAudit({
            actor: adminActor(user),
            actorRole: "Payout desk",
            action: "payout.otp_pending",
            target: `Escrow release ${id} · ${result.reference}`,
            severity: "warning",
          });
        }
        return Response.json(
          {
            data: {
              hold: hold ? toEscrowHold(hold) : null,
              transfer: {
                state: otpRequired ? "otp_required" : "in_flight",
                reference: result.reference,
                transferCode: otpRequired ? result.transferCode : null,
              },
            },
          },
          { status: 202, headers: { "Cache-Control": "private, no-store" } },
        );
      }
    }
  } catch (error) {
    console.error("[admin] Escrow release failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not release this milestone.");
  }
}
