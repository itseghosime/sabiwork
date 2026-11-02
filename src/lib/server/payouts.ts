import "server-only";

import { eq, or } from "drizzle-orm";
import {
  isNuban,
  maskAccountNumber,
  normalizeTransferStatus,
  payoutWasReturned,
} from "@/features/payments/transfer";
import { recordAudit } from "./audit";
import { getDb } from "./db";
import { escrowHolds } from "./schema";
import {
  createPaystackTransferRecipient,
  finalizePaystackTransfer,
  initiatePaystackTransfer,
  PaystackError,
  resolvePaystackAccount,
  type PaystackTransfer,
} from "./paystack";

function payoutReference(holdId: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SW-ESC-${holdId}-${stamp}${suffix}`;
}

export type SavePayeeResult =
  | { kind: "ok"; accountName: string; accountNumberMasked: string; bankName: string }
  | { kind: "not_found" }
  | { kind: "invalid_account"; message: string }
  | { kind: "locked"; message: string }
  | { kind: "gateway_error"; message: string };

export async function savePayoutAccount(
  holdId: string,
  input: { accountNumber: string; bankCode: string; bankName: string },
): Promise<SavePayeeResult> {
  if (!isNuban(input.accountNumber)) {
    return { kind: "invalid_account", message: "Enter a 10-digit NUBAN account number." };
  }
  const bankCode = input.bankCode.trim();
  if (!bankCode) {
    return { kind: "invalid_account", message: "Choose the bank that holds this account." };
  }

  const db = getDb();
  const [hold] = await db.select().from(escrowHolds).where(eq(escrowHolds.id, holdId)).limit(1);
  if (!hold) return { kind: "not_found" };
  if (hold.transfer_status === "success") {
    return { kind: "locked", message: "This milestone has already been paid out." };
  }
  if (hold.transfer_status === "pending" || hold.transfer_status === "otp") {
    return { kind: "locked", message: "A payout for this milestone is already in flight." };
  }

  try {
    const resolved = await resolvePaystackAccount({
      accountNumber: input.accountNumber,
      bankCode,
    });
    const recipient = await createPaystackTransferRecipient({
      name: resolved.accountName,
      accountNumber: input.accountNumber,
      bankCode,
    });

    await db
      .update(escrowHolds)
      .set({
        payout_account_number: input.accountNumber,
        payout_bank_code: bankCode,
        payout_account_name: resolved.accountName,
        payout_bank: input.bankName.trim().slice(0, 120) || resolved.accountName,
        recipient_code: recipient.recipientCode,
        transfer_status: null,
        transfer_failure_reason: null,
        updated_at: new Date(),
      })
      .where(eq(escrowHolds.id, holdId));

    await recordAudit({
      actor: "Payout desk",
      actorRole: "Payout desk",
      action: "payout.recipient_registered",
      target: `Escrow hold ${holdId} → ${resolved.accountName}`,
      severity: "info",
    });

    return {
      kind: "ok",
      accountName: resolved.accountName,
      accountNumberMasked: maskAccountNumber(input.accountNumber) ?? "",
      bankName: input.bankName,
    };
  } catch (error) {
    const message =
      error instanceof PaystackError
        ? error.message
        : "The payout provider is unavailable right now.";
    return { kind: "gateway_error", message };
  }
}

export type ReleaseResult =
  | { kind: "paid"; amountKobo: number; reference: string; accountName: string | null }
  | { kind: "otp_required"; transferCode: string; reference: string }
  | { kind: "in_flight"; reference: string }
  | { kind: "needs_payee"; message: string }
  | { kind: "not_found" }
  | { kind: "not_payable"; message: string }
  | { kind: "gateway_error"; message: string };

type HoldRow = typeof escrowHolds.$inferSelect;

function assertPayable(hold: HoldRow): { ok: true } | { ok: false; result: ReleaseResult } {
  if (hold.transfer_status === "success") {
    return { ok: false, result: { kind: "not_payable", message: "This milestone has already been paid out." } };
  }
  if (hold.transfer_status === "pending" || hold.transfer_status === "otp") {
    return { ok: false, result: { kind: "in_flight", reference: hold.transfer_reference ?? "" } };
  }
  if (hold.status === "disputed") {
    return { ok: false, result: { kind: "not_payable", message: "This hold is frozen by an open dispute." } };
  }
  if (hold.status === "released") {
    return { ok: false, result: { kind: "not_payable", message: "This milestone is already released." } };
  }
  if (hold.status !== "release_due") {
    return { ok: false, result: { kind: "not_payable", message: "Only milestones due for release can be paid out." } };
  }
  if (!hold.signed_off) {
    return { ok: false, result: { kind: "not_payable", message: "The customer has not signed this milestone off." } };
  }
  if (hold.amount_kobo <= 0) {
    return { ok: false, result: { kind: "not_payable", message: "This hold has no amount to pay out." } };
  }
  if (!hold.recipient_code || !hold.payout_account_number) {
    return {
      ok: false,
      result: { kind: "needs_payee", message: "Add the artisan's payout account before releasing funds." },
    };
  }
  return { ok: true };
}

async function settleTransfer(hold: HoldRow, transfer: PaystackTransfer): Promise<ReleaseResult> {
  const db = getDb();
  const status = normalizeTransferStatus(transfer.status);
  const now = new Date();
  const reference = transfer.reference || hold.transfer_reference || payoutReference(hold.id);

  if (status === "otp") {
    await db
      .update(escrowHolds)
      .set({
        transfer_status: "otp",
        transfer_code: transfer.transferCode,
        transfer_reference: reference,
        updated_at: now,
      })
      .where(eq(escrowHolds.id, hold.id));
    return { kind: "otp_required", transferCode: transfer.transferCode ?? "", reference };
  }

  if (status === "success") {
    await db
      .update(escrowHolds)
      .set({
        status: "released",
        released_at: now,
        paid_out_at: now,
        transfer_status: "success",
        transfer_code: transfer.transferCode,
        transfer_reference: reference,
        transfer_failure_reason: null,
        updated_at: now,
      })
      .where(eq(escrowHolds.id, hold.id));

    await recordAudit({
      actor: "Payout desk",
      actorRole: "Payout desk",
      action: "payout.settled",
      target: `Escrow hold ${hold.id} · ${reference}`,
      severity: "warning",
    });

    return {
      kind: "paid",
      amountKobo: transfer.amountKobo || hold.amount_kobo,
      reference,
      accountName: hold.payout_account_name,
    };
  }

  const failed = payoutWasReturned(status);
  await db
    .update(escrowHolds)
    .set({
      transfer_status: status,
      transfer_code: transfer.transferCode,
      transfer_reference: reference,
      transfer_failure_reason: failed
        ? (transfer.failureReason ?? "The provider did not settle this payout.").slice(0, 400)
        : null,
      updated_at: now,
    })
    .where(eq(escrowHolds.id, hold.id));

  if (failed) {
    await recordAudit({
      actor: "Payout desk",
      actorRole: "Payout desk",
      action: "payout.failed",
      target: `Escrow hold ${hold.id} · ${reference} · ${status}`,
      severity: "critical",
    });
    return {
      kind: "gateway_error",
      message: transfer.failureReason ?? `The provider marked this payout as ${status}.`,
    };
  }

  return { kind: "in_flight", reference };
}

export async function releaseEscrowHold(holdId: string): Promise<ReleaseResult> {
  const db = getDb();
  const [hold] = await db.select().from(escrowHolds).where(eq(escrowHolds.id, holdId)).limit(1);
  if (!hold) return { kind: "not_found" };

  const payable = assertPayable(hold);
  if (!payable.ok) return payable.result;

  try {
    const transfer = await initiatePaystackTransfer({
      amountKobo: hold.amount_kobo,
      recipientCode: hold.recipient_code!,
      reason: `SabiWork escrow ${hold.id} · ${hold.title}`.slice(0, 100),
      reference: payoutReference(hold.id),
    });
    return await settleTransfer(hold, transfer);
  } catch (error) {
    const message =
      error instanceof PaystackError
        ? error.message
        : "The payout provider is unavailable right now.";

    // A rejected request means no transfer object exists, so the hold stays
    // payable and the admin can retry once the cause is fixed.
    await db
      .update(escrowHolds)
      .set({ transfer_status: "failed", transfer_failure_reason: message.slice(0, 400), updated_at: new Date() })
      .where(eq(escrowHolds.id, hold.id));

    return { kind: "gateway_error", message };
  }
}

export async function finalizeEscrowTransfer(
  holdId: string,
  otp: string,
): Promise<ReleaseResult> {
  if (!/^[0-9]{4,8}$/.test(otp.trim())) {
    return { kind: "not_payable", message: "Enter the OTP Paystack sent for this transfer." };
  }

  const db = getDb();
  const [hold] = await db.select().from(escrowHolds).where(eq(escrowHolds.id, holdId)).limit(1);
  if (!hold) return { kind: "not_found" };
  if (hold.transfer_status !== "otp" || !hold.transfer_code) {
    return { kind: "not_payable", message: "This payout is not waiting on an OTP." };
  }

  try {
    const transfer = await finalizePaystackTransfer({
      transferCode: hold.transfer_code,
      otp: otp.trim(),
    });
    return await settleTransfer(hold, transfer);
  } catch (error) {
    return {
      kind: "gateway_error",
      message:
        error instanceof PaystackError
          ? error.message
          : "Paystack rejected that transfer OTP.",
    };
  }
}

type PaystackTransferEvent = {
  event?: string;
  data?: {
    reference?: string;
    transfer_code?: string;
    status?: string;
    amount?: number;
    failure_reason?: string | null;
    gateway_response?: string | null;
  };
};

const transferEvents = new Set(["transfer.success", "transfer.failed", "transfer.reversed"]);

export async function applyPaystackTransferEvent(event: PaystackTransferEvent): Promise<boolean> {
  const name = event.event ?? "";
  if (!transferEvents.has(name)) return false;
  const data = event.data;
  const reference = data?.reference;
  const transferCode = data?.transfer_code;
  if (!reference && !transferCode) return false;

  const db = getDb();
  const conditions = [];
  if (reference) conditions.push(eq(escrowHolds.transfer_reference, reference));
  if (transferCode) conditions.push(eq(escrowHolds.transfer_code, transferCode));

  const [hold] = await db
    .select()
    .from(escrowHolds)
    .where(or(...conditions))
    .limit(1);
  if (!hold) return false;

  const status = normalizeTransferStatus(
    data?.status ?? (name === "transfer.success" ? "success" : name.replace("transfer.", "")),
  );
  const now = new Date();

  if (status === "success") {
    // A dispute opened while the transfer was in flight outranks the provider
    // callback; the funds moved, but the ledger stays frozen for review.
    const nextStatus = hold.status === "disputed" ? "disputed" : "released";
    await db
      .update(escrowHolds)
      .set({
        status: nextStatus,
        released_at: hold.released_at ?? now,
        paid_out_at: now,
        transfer_status: "success",
        transfer_failure_reason: null,
        updated_at: now,
      })
      .where(eq(escrowHolds.id, hold.id));
  } else {
    // Reversed and failed payouts return the money, so the milestone becomes
    // payable again instead of staying marked as released.
    const nextStatus = hold.status === "released" ? "release_due" : hold.status;
    await db
      .update(escrowHolds)
      .set({
        status: nextStatus,
        released_at: status === "reversed" ? null : hold.released_at,
        paid_out_at: status === "reversed" ? null : hold.paid_out_at,
        transfer_status: status,
        transfer_failure_reason:
          (data?.failure_reason ?? data?.gateway_response ?? `Provider reported ${status}.`).slice(0, 400),
        updated_at: now,
      })
      .where(eq(escrowHolds.id, hold.id));
  }

  await recordAudit({
    actor: "Paystack webhook",
    actorRole: "Payment provider",
    action: `payout.${status}`,
    target: `Escrow hold ${hold.id} · ${reference ?? transferCode}`,
    severity: status === "success" ? "warning" : "critical",
  });

  return true;
}
