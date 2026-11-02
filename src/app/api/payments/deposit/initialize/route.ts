import { isEmail, startDeposit } from "@/lib/server/deposits";
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
  if (!isRecord(body)) {
    return jsonError(400, "INVALID_INPUT", "Choose an artisan and enter an email.");
  }

  const { artisanId, email } = body;
  if (
    typeof artisanId !== "string" ||
    !artisanId ||
    artisanId.length > 120 ||
    !isEmail(email)
  ) {
    return jsonError(
      400,
      "INVALID_INPUT",
      "A listed artisan and a valid email address are required.",
    );
  }

  try {
    const result = await startDeposit({
      artisanId,
      email: email.trim().toLowerCase(),
      origin: new URL(request.url).origin,
      customerWorkspace: body.customerWorkspace === true,
    });

    if (result.kind === "not_found") {
      return jsonError(404, "NOT_FOUND", "This artisan is not available for bookings.");
    }
    if (result.kind === "test_mode_required") {
      return jsonError(
        503,
        "TEST_MODE_REQUIRED",
        "Presentation profiles can only be booked with Paystack test keys.",
      );
    }
    if (result.kind === "gateway_error") {
      return jsonError(502, "PAYMENT_GATEWAY_ERROR", result.message);
    }

    return Response.json(
      {
        data: {
          reference: result.reference,
          amountKobo: result.amountKobo,
          publicKey: result.publicKey,
          accessCode: result.accessCode,
          authorizationUrl: result.authorizationUrl,
          artisanName: result.artisanName,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[payments] Deposit initialize failed", error);
    return jsonError(
      500,
      "INTERNAL_ERROR",
      "Could not start this deposit. Please try again.",
    );
  }
}
