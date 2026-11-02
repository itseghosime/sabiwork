import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "./db";
import {
  escrowHolds,
  disputes,
  jobRequests,
  jobs,
  payments,
  quotes,
  userProfiles,
} from "./schema";
import {
  initializePaystackTransaction,
  paystackTestMode,
  verifyPaystackTransaction,
  type PaystackVerification,
} from "./paystack";

export class MilestoneError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function startMilestone(input: {
  jobId: string;
  userId: string;
  email: string;
  milestone: "deposit" | "balance";
  origin: string;
}) {
  if (!paystackTestMode())
    throw new MilestoneError(
      503,
      "TEST_MODE_REQUIRED",
      "Configure Paystack test keys to pay this milestone.",
    );
  return getDb().transaction(async (tx) => {
    const [job] = await tx
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, input.jobId), eq(jobs.customer_id, input.userId)))
      .for("update");
    if (!job) throw new MilestoneError(404, "NOT_FOUND", "Booking not found.");
    if (job.status === "cancelled")
      throw new MilestoneError(
        409,
        "INVALID_STATE",
        "This booking was cancelled.",
      );
    const [confirmed] = await tx
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.job_id, job.id),
          eq(payments.milestone, input.milestone),
          eq(payments.status, "confirmed"),
          eq(payments.channel, "paystack_verified_test"),
        ),
      );
    if (confirmed)
      throw new MilestoneError(
        409,
        "ALREADY_SETTLED",
        "This milestone has already been paid.",
      );
    if (input.milestone === "balance" && !job.signed_off_at)
      throw new MilestoneError(
        409,
        "SIGNOFF_REQUIRED",
        "Inspect and sign off the work before paying the balance.",
      );
    const [pending] = await tx
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.job_id, job.id),
          eq(payments.milestone, input.milestone),
          eq(payments.status, "pending"),
          eq(payments.channel, "paystack_verified_test"),
        ),
      )
      .orderBy(desc(payments.created_at))
      .limit(1);
    if (pending?.checkout_url)
      return {
        reference: pending.reference,
        authorizationUrl: pending.checkout_url,
        amountKobo: pending.amount_kobo,
        jobId: job.id,
      };
    const [quote] = await tx
      .select()
      .from(quotes)
      .where(eq(quotes.id, job.accepted_quote_id));
    const deposit = Math.floor(quote.total_kobo / 2);
    const amount =
      input.milestone === "deposit" ? deposit : quote.total_kobo - deposit;
    if (amount < 10000)
      throw new MilestoneError(
        409,
        "AMOUNT_TOO_SMALL",
        "Each Paystack milestone must be at least ₦100. Agree a larger quote before checkout.",
      );
    const reference = `SW-JOB-${randomUUID()}`;
    const checkout = await initializePaystackTransaction({
      email: input.email,
      amountKobo: amount,
      reference,
      callbackUrl: `${input.origin}/payments/${reference}/verify`,
      metadata: { job_id: job.id, milestone: input.milestone },
    });
    await tx
      .insert(payments)
      .values({
        job_id: job.id,
        customer_id: job.customer_id,
        worker_id: job.worker_id,
        milestone: input.milestone,
        amount_kobo: amount,
        reference,
        channel: "paystack_verified_test",
        status: "pending",
        checkout_url: checkout.authorizationUrl,
        access_code: checkout.accessCode,
      });
    return {
      reference,
      authorizationUrl: checkout.authorizationUrl,
      amountKobo: amount,
      jobId: job.id,
    };
  });
}

/** Called only with a server-verified response or a signature-checked webhook.
 * All related changes commit together; replaying a callback cannot create holds twice. */
export async function settleMilestone(
  reference: string,
  verification?: PaystackVerification,
) {
  const [known] = await getDb()
    .select()
    .from(payments)
    .where(eq(payments.reference, reference))
    .limit(1);
  if (!known || known.channel !== "paystack_verified_test")
    throw new MilestoneError(404, "NOT_FOUND", "Payment reference not found.");
  if (known.status === "confirmed") return known;
  const observed = verification ?? (await verifyPaystackTransaction(reference));
  if (!observed)
    throw new MilestoneError(404, "NOT_FOUND", "Payment reference not found.");
  return getDb().transaction(async (tx) => {
    const [initial] = await tx
      .select()
      .from(payments)
      .where(eq(payments.reference, reference))
      .limit(1);
    if (!initial || initial.channel !== "paystack_verified_test")
      throw new MilestoneError(
        404,
        "NOT_FOUND",
        "Payment reference not found.",
      );
    const [job] = await tx
      .select()
      .from(jobs)
      .where(eq(jobs.id, initial.job_id))
      .for("update");
    const [payment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.id, initial.id));
    if (payment.status === "confirmed") return payment;
    if (
      observed.reference !== reference ||
      observed.currency !== "NGN" ||
      observed.amountKobo !== payment.amount_kobo
    ) {
      throw new MilestoneError(
        409,
        "PAYMENT_MISMATCH",
        "Provider reference, currency or amount does not match this milestone.",
      );
    }
    if (observed.status !== "success") {
      if (["failed", "abandoned", "reversed"].includes(observed.status)) {
        const [failed] = await tx
          .update(payments)
          .set({
            status: "failed",
            failure_reason:
              observed.gatewayResponse ?? "Payment was not completed.",
            updated_at: new Date(),
          })
          .where(eq(payments.id, payment.id))
          .returning();
        return failed;
      }
      return payment;
    }
    if (job.status === "cancelled")
      throw new MilestoneError(
        409,
        "INVALID_STATE",
        "This booking was cancelled. Contact support about this payment.",
      );
    const now = new Date();
    const [request] = await tx
      .select()
      .from(jobRequests)
      .where(eq(jobRequests.id, job.request_id));
    const people = await tx
      .select()
      .from(userProfiles)
      .where(inArray(userProfiles.user_id, [job.customer_id, job.worker_id]));
    const [saved] = await tx
      .update(payments)
      .set({
        status: "confirmed",
        paid_at: observed.paidAt ?? now,
        failure_reason: null,
        updated_at: now,
      })
      .where(eq(payments.id, payment.id))
      .returning();
    const [openIssue] = await tx
      .select()
      .from(disputes)
      .where(and(eq(disputes.job_id, job.id), ne(disputes.status, "resolved")))
      .limit(1);
    // The payment UUID is also the hold key: one payment always maps to one hold.
    await tx
      .insert(escrowHolds)
      .values({
        id: payment.id,
        job_ref: job.id,
        title: request.title,
        trade: request.category,
        area: request.service_area.slice(0, 80),
        customer_name: people.find((p) => p.user_id === job.customer_id)!
          .display_name,
        artisan_name: people.find((p) => p.user_id === job.worker_id)!
          .display_name,
        artisan_id: job.worker_id,
        payout_bank: "Not configured",
        amount_kobo: payment.amount_kobo,
        milestone: payment.milestone,
        status: openIssue ? "disputed" : "held",
        signed_off: false,
        release_due_at: now,
      })
      .onConflictDoNothing();
    if (payment.milestone === "deposit" && job.status === "accepted") {
      await tx
        .update(jobs)
        .set({ status: "in_progress", updated_at: now })
        .where(eq(jobs.id, job.id));
    }
    if (payment.milestone === "balance" && job.signed_off_at) {
      await tx
        .update(jobs)
        .set({ status: "completed", updated_at: now })
        .where(eq(jobs.id, job.id));
      await tx
        .update(escrowHolds)
        .set({
          status: "release_due",
          signed_off: true,
          release_due_at: now,
          updated_at: now,
        })
        .where(
          and(eq(escrowHolds.job_ref, job.id), eq(escrowHolds.status, "held")),
        );
    }
    // Once a milestone is paid, any older unverified attempts cannot be paid again.
    await tx
      .update(payments)
      .set({ status: "cancelled", updated_at: now })
      .where(
        and(
          eq(payments.job_id, job.id),
          eq(payments.milestone, payment.milestone),
          eq(payments.status, "pending"),
          ne(payments.id, payment.id),
        ),
      );
    return saved;
  });
}
