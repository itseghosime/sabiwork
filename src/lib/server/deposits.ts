import "server-only";

import { and, eq } from "drizzle-orm";
import { bookingDepositKobo } from "@/features/payments/deposit";
import { getDb } from "./db";
import { artisanProfiles, bookingDeposits, userProfiles } from "./schema";
import {
  initializePaystackTransaction,
  PaystackError,
  paystackPublicKey,
  paystackTestMode,
  verifyPaystackTransaction,
  type PaystackVerification,
} from "./paystack";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    EMAIL_PATTERN.test(value)
  );
}

function newReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SW-DEP-${stamp}-${suffix}`;
}

export type StartDepositResult =
  | {
      kind: "ok";
      reference: string;
      amountKobo: number;
      publicKey: string;
      accessCode: string;
      authorizationUrl: string;
      artisanName: string;
    }
  | { kind: "not_found" }
  | { kind: "test_mode_required" }
  | { kind: "gateway_error"; message: string };

export async function startDeposit(input: {
  artisanId: string;
  email: string;
  origin: string;
  customerWorkspace: boolean;
}): Promise<StartDepositResult> {
  if (
    input.artisanId.startsWith("seed-artisan-") &&
    !paystackTestMode()
  ) {
    return { kind: "test_mode_required" };
  }

  const [artisan] = await getDb()
    .select({
      id: artisanProfiles.user_id,
      name: userProfiles.display_name,
      rate: artisanProfiles.rate_guidance_kobo,
    })
    .from(artisanProfiles)
    .innerJoin(userProfiles, eq(userProfiles.user_id, artisanProfiles.user_id))
    .where(
      and(
        eq(artisanProfiles.user_id, input.artisanId),
        eq(artisanProfiles.is_listed, true),
      ),
    )
    .limit(1);

  if (!artisan) return { kind: "not_found" };

  const amountKobo = bookingDepositKobo(artisan.rate ?? 0);
  const reference = newReference();
  const callbackPath = input.customerWorkspace
    ? `/explore/${encodeURIComponent(artisan.id)}/payment/callback`
    : `/artisans/${encodeURIComponent(artisan.id)}/payment/callback`;
  const [saved] = await getDb()
    .insert(bookingDeposits)
    .values({
      artisan_id: artisan.id,
      customer_email: input.email,
      amount_kobo: amountKobo,
      reference,
      status: "pending",
      channel: "paystack_test",
    })
    .returning({ id: bookingDeposits.id });

  try {
    const checkout = await initializePaystackTransaction({
      email: input.email,
      amountKobo,
      reference,
      callbackUrl: `${input.origin}${callbackPath}?reference=${encodeURIComponent(reference)}`,
      metadata: {
        deposit_reference: reference,
        artisan_id: artisan.id,
        artisan_name: artisan.name,
      },
    });
    return {
      kind: "ok",
      reference,
      amountKobo,
      publicKey: paystackPublicKey(),
      accessCode: checkout.accessCode,
      authorizationUrl: checkout.authorizationUrl,
      artisanName: artisan.name,
    };
  } catch (error) {
    const message =
      error instanceof PaystackError
        ? error.message
        : "Paystack is unavailable right now.";
    await getDb()
      .update(bookingDeposits)
      .set({ status: "failed", failure_reason: message, updated_at: new Date() })
      .where(eq(bookingDeposits.id, saved.id));
    return { kind: "gateway_error", message };
  }
}

export type SettleDepositResult =
  | {
      kind: "paid";
      reference: string;
      amountKobo: number;
      paidAt: Date | null;
      artisanName: string;
      email: string;
    }
  | { kind: "pending"; reference: string }
  | { kind: "failed"; reference: string; reason: string }
  | { kind: "not_found" };

const failedStatuses = new Set(["failed", "reversed", "abandoned"]);

export async function settleDeposit(
  reference: string,
  verification?: PaystackVerification,
): Promise<SettleDepositResult> {
  const [deposit] = await getDb()
    .select({
      id: bookingDeposits.id,
      status: bookingDeposits.status,
      amountKobo: bookingDeposits.amount_kobo,
      paidAt: bookingDeposits.paid_at,
      email: bookingDeposits.customer_email,
      artisanName: userProfiles.display_name,
    })
    .from(bookingDeposits)
    .innerJoin(
      userProfiles,
      eq(userProfiles.user_id, bookingDeposits.artisan_id),
    )
    .where(eq(bookingDeposits.reference, reference))
    .limit(1);

  if (!deposit) return { kind: "not_found" };

  if (deposit.status === "confirmed") {
    return {
      kind: "paid",
      reference,
      amountKobo: deposit.amountKobo,
      paidAt: deposit.paidAt,
      artisanName: deposit.artisanName,
      email: deposit.email,
    };
  }

  let observed = verification;
  if (!observed) {
    observed = (await verifyPaystackTransaction(reference)) ?? undefined;
    if (!observed) return { kind: "not_found" };
  }

  const matches =
    observed.status === "success" &&
    observed.currency === "NGN" &&
    observed.amountKobo === deposit.amountKobo;

  if (matches) {
    const paidAt = observed.paidAt ?? new Date();
    await getDb()
      .update(bookingDeposits)
      .set({
        status: "confirmed",
        paid_at: paidAt,
        failure_reason: null,
        updated_at: new Date(),
      })
      .where(eq(bookingDeposits.id, deposit.id));
    return {
      kind: "paid",
      reference,
      amountKobo: deposit.amountKobo,
      paidAt,
      artisanName: deposit.artisanName,
      email: deposit.email,
    };
  }

  if (observed.status === "success") {
    const reason = "The amount paid did not match the deposit requested.";
    await getDb()
      .update(bookingDeposits)
      .set({ status: "failed", failure_reason: reason, updated_at: new Date() })
      .where(eq(bookingDeposits.id, deposit.id));
    return { kind: "failed", reference, reason };
  }

  if (failedStatuses.has(observed.status)) {
    const reason = observed.gatewayResponse ?? "Paystack declined this deposit.";
    await getDb()
      .update(bookingDeposits)
      .set({ status: "failed", failure_reason: reason, updated_at: new Date() })
      .where(eq(bookingDeposits.id, deposit.id));
    return { kind: "failed", reference, reason };
  }

  return { kind: "pending", reference };
}

export interface PaystackChargeEvent {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    paid_at?: string | null;
    gateway_response?: string | null;
  };
}

/** Applies a signature-checked webhook payload to the matching deposit. */
export async function applyPaystackEvent(event: PaystackChargeEvent) {
  const reference = event.data?.reference;
  if (!reference || !reference.startsWith("SW-DEP-")) return;
  await settleDeposit(reference, {
    reference,
    status: event.data?.status ?? "unknown",
    amountKobo: event.data?.amount ?? 0,
    currency: event.data?.currency ?? "",
    paidAt: event.data?.paid_at ? new Date(event.data.paid_at) : null,
    gatewayResponse: event.data?.gateway_response ?? null,
  });
}
