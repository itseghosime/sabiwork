import { eq } from "drizzle-orm";
import { adminActor, recordAudit } from "@/lib/server/audit";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toEscrowHold } from "@/lib/server/admin-dto";
import { savePayoutAccount } from "@/lib/server/payouts";
import { escrowHolds } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const accountNumber = typeof record.accountNumber === "string" ? record.accountNumber.trim() : "";
  const bankCode = typeof record.bankCode === "string" ? record.bankCode.trim() : "";
  const bankName = typeof record.bankName === "string" ? record.bankName.trim() : "";

  try {
    const result = await savePayoutAccount(id, { accountNumber, bankCode, bankName });

    switch (result.kind) {
      case "not_found":
        return jsonError(404, "NOT_FOUND", "Escrow hold not found.");
      case "invalid_account":
        return jsonError(400, "INVALID_ACCOUNT", result.message);
      case "locked":
        return jsonError(409, "PAYOUT_LOCKED", result.message);
      case "gateway_error":
        return jsonError(502, "PROVIDER_ERROR", result.message);
      case "ok": {
        const [row] = await getDb()
          .select()
          .from(escrowHolds)
          .where(eq(escrowHolds.id, id))
          .limit(1);
        await recordAudit({
          actor: adminActor(user),
          actorRole: "Payout desk",
          action: "payout.details_saved",
          target: `Escrow hold ${id} → ${result.accountName}`,
          severity: "info",
        });
        return Response.json(
          {
            data: {
              hold: row ? toEscrowHold(row) : null,
              payee: {
                accountName: result.accountName,
                accountNumberMasked: result.accountNumberMasked,
                bankName: result.bankName,
              },
            },
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      }
    }
  } catch (error) {
    console.error("[admin] Saving payout account failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save the payout account.");
  }
}
