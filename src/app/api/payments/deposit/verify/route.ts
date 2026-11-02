import { settleDeposit } from "@/lib/server/deposits";
import { paystackConfigured } from "@/lib/server/paystack";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  if (!paystackConfigured()) {
    return jsonError(
      503,
      "PAYMENT_UNAVAILABLE",
      "Paystack test keys are not configured on this environment.",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  if (!isRecord(body) || typeof body.reference !== "string" || !body.reference) {
    return jsonError(400, "INVALID_INPUT", "A payment reference is required.");
  }

  try {
    const result = await settleDeposit(body.reference);

    if (result.kind === "not_found") {
      return jsonError(404, "NOT_FOUND", "We could not find that deposit.");
    }
    if (result.kind === "failed") {
      return jsonError(402, "PAYMENT_NOT_CONFIRMED", result.reason);
    }
    if (result.kind === "pending") {
      return Response.json(
        { data: { status: "pending", reference: result.reference } },
        { status: 202, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    return Response.json(
      {
        data: {
          status: "confirmed",
          reference: result.reference,
          amountKobo: result.amountKobo,
          paidAt: result.paidAt ? result.paidAt.toISOString() : null,
          artisanName: result.artisanName,
          email: result.email,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[payments] Deposit verify failed", error);
    return jsonError(
      500,
      "INTERNAL_ERROR",
      "Could not verify this deposit. Please try again.",
    );
  }
}
