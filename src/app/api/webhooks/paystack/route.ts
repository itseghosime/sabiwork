import { settleMilestone } from "@/lib/server/milestones";
import { paystackTestMode } from "@/lib/server/paystack";
import { paystackSignatureMatches } from "@/features/payments/deposit";
import { applyPaystackEvent, type PaystackChargeEvent } from "@/lib/server/deposits";
import { applyPaystackTransferEvent } from "@/lib/server/payouts";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !paystackTestMode()) {
    return Response.json(
      { error: "Paystack webhooks are not configured." },
      { status: 503 },
    );
  }

  const raw = await request.text();
  if (
    !paystackSignatureMatches({
      secret,
      body: raw,
      signature: request.headers.get("x-paystack-signature"),
    })
  ) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!isRecord(event)) return Response.json({ received: true });

  if (event.event === "charge.success" || event.event === "charge.failed") {
    try {
      const charge = event as PaystackChargeEvent;
      if (charge.data?.reference?.startsWith("SW-JOB-")) {
        await settleMilestone(charge.data.reference, {
          reference: charge.data.reference, status: charge.data.status ?? "unknown",
          amountKobo: charge.data.amount ?? 0, currency: charge.data.currency ?? "",
          paidAt: charge.data.paid_at ? new Date(charge.data.paid_at) : null,
          gatewayResponse: charge.data.gateway_response ?? null,
        });
      } else await applyPaystackEvent(charge);
    } catch (error) {
      console.error("[paystack] Webhook handling failed", error);
      return Response.json({ error: "Handler failed." }, { status: 500 });
    }
  }

  if (
    event.event === "transfer.success" ||
    event.event === "transfer.failed" ||
    event.event === "transfer.reversed"
  ) {
    try {
      await applyPaystackTransferEvent(event as { event?: string; data?: Record<string, unknown> });
    } catch (error) {
      console.error("[paystack] Transfer webhook handling failed", error);
      return Response.json({ error: "Handler failed." }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
