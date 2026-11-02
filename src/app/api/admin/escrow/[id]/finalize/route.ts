import { eq } from "drizzle-orm";
import { adminActor, recordAudit } from "@/lib/server/audit";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toEscrowHold } from "@/lib/server/admin-dto";
import { finalizeEscrowTransfer } from "@/lib/server/payouts";
import { escrowHolds } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const otp = typeof record.otp === "string" ? record.otp.trim() : "";
  if (!otp) {
    return jsonError(400, "OTP_REQUIRED", "Enter the OTP Paystack sent for this transfer.");
  }

  try {
    const result = await finalizeEscrowTransfer(id, otp);

    switch (result.kind) {
      case "not_found":
        return jsonError(404, "NOT_FOUND", "Escrow hold not found.");
      case "not_payable":
        return jsonError(409, "NOT_PAYABLE", result.message);
      case "needs_payee":
        return jsonError(409, "NEEDS_PAYEE", result.message);
      case "gateway_error":
        return jsonError(502, "PAYOUT_FAILED", result.message);
      case "otp_required":
        return jsonError(409, "OTP_PENDING", "Paystack is still waiting on an OTP for this transfer.");
      case "in_flight": {
        const [row] = await getDb().select().from(escrowHolds).where(eq(escrowHolds.id, id)).limit(1);
        return Response.json(
          {
            data: {
              hold: row ? toEscrowHold(row) : null,
              transfer: { state: "in_flight", reference: result.reference },
            },
          },
          { status: 202, headers: { "Cache-Control": "private, no-store" } },
        );
      }
      case "paid": {
        const [row] = await getDb().select().from(escrowHolds).where(eq(escrowHolds.id, id)).limit(1);
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
              hold: row ? toEscrowHold(row) : null,
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
    }
  } catch (error) {
    console.error("[admin] Finalizing transfer failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not finalize this transfer.");
  }
}
