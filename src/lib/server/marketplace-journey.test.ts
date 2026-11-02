// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const state = vi.hoisted(() => ({
  user: "customer",
  db: null as unknown,
  initialize: vi.fn(),
  transfer: vi.fn(),
  verify: vi.fn(),
  verifyTransfer: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("./db", () => ({ getDb: () => state.db }));
vi.mock("./authorization", () => ({
  getSessionUser: async () =>
    state.user === "anonymous"
      ? { kind: "unauthenticated" }
      : {
          kind: "authenticated",
          user: {
            id: state.user,
            name: `QA ${state.user}`,
            email: `${state.user}@example.test`,
          },
        },
  authorizeMarketplaceUser: async () =>
    state.user === "anonymous"
      ? { kind: "unauthenticated" }
      : state.user === "admin"
        ? { kind: "forbidden" }
        : {
            kind: "authorized",
            role: "customer",
            user: {
              id: state.user,
              name: `QA ${state.user}`,
              email: `${state.user}@example.test`,
            },
          },
  authorizeRole: async () =>
    state.user !== "admin"
      ? { kind: "forbidden" }
      : {
          kind: "authorized",
          user: { id: "admin", name: "QA admin" },
          role: "admin",
        },
}));
vi.mock("./paystack", () => ({
  paystackTestMode: () => true,
  initializePaystackTransaction: state.initialize,
  verifyPaystackTransaction: state.verify,
  initiatePaystackTransfer: state.transfer,
  verifyPaystackTransfer: state.verifyTransfer,
  finalizePaystackTransfer: vi.fn(),
  resolvePaystackAccount: async ({
    accountNumber,
  }: {
    accountNumber: string;
  }) => ({ accountNumber, accountName: "QA artisan test recipient" }),
  createPaystackTransferRecipient: async () => ({
    recipientCode: "RCP_QA_TEST",
    accountName: "QA artisan test recipient",
  }),
  PaystackError: class extends Error {},
}));

import {
  POST as reportIssue,
  GET as issueStatus,
} from "@/app/api/jobs/[id]/dispute/route";
import { PATCH as resolveIssue } from "@/app/api/admin/disputes/[id]/route";
import { POST as webhook } from "@/app/api/webhooks/paystack/route";
import { POST as createRequest } from "@/app/api/requests/route";
import {
  GET as requestDetail,
  PATCH as publishRequest,
} from "@/app/api/requests/[id]/route";
import { GET as opportunities } from "@/app/api/requests/open/route";
import {
  GET as listQuotes,
  POST as sendQuote,
} from "@/app/api/requests/[id]/quotes/route";
import { POST as decideQuote } from "@/app/api/quotes/[id]/decision/route";
import { GET as bookingDetail } from "@/app/api/jobs/[id]/route";
import { GET as bookings } from "@/app/api/jobs/route";
import { POST as jobStatus } from "@/app/api/jobs/[id]/status/route";
import { POST as progress } from "@/app/api/jobs/[id]/progress/route";
import { POST as review } from "@/app/api/jobs/[id]/review/route";
import { POST as fakePayment } from "@/app/api/payments/route";
import { POST as initializePayment } from "@/app/api/payments/deposit/initialize/route";
import { POST as verifyPayment } from "@/app/api/payments/deposit/verify/route";
import { GET as adminEscrow } from "@/app/api/admin/escrow/route";
import { PATCH as adminRelease } from "@/app/api/admin/escrow/[id]/route";
import { settleMilestone, startMilestone } from "./milestones";
import {
  applyPaystackTransferEvent,
  releaseEscrowHold,
  savePayoutAccount,
} from "./payouts";
import { loadArtisanDesk } from "./artisan-desk";

const pg = new PGlite();
const db = drizzle(pg, { schema });
const req = (body: unknown, method = "POST") =>
  new Request("https://sabiwork.example.test/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const params = (id: string) => ({ params: Promise.resolve({ id }) });
async function body(response: Response, status = 200) {
  const payload = await response.json();
  expect(response.status, JSON.stringify(payload)).toBe(status);
  return payload.data;
}
function observed(reference: string, amountKobo: number, status = "success") {
  return {
    reference,
    amountKobo,
    status,
    currency: "NGN",
    paidAt: new Date(),
    gatewayResponse: null,
  };
}
let jobId: string;
let depositReference: string;
beforeAll(async () => {
  for (const name of readdirSync("db/migrations")
    .filter((n) => n.endsWith(".sql"))
    .sort())
    await pg.exec(readFileSync(`db/migrations/${name}`, "utf8"));
  state.db = db;
  await db
    .insert(schema.userProfiles)
    .values(
      ["customer", "artisan", "competitor", "stranger", "admin"].map((id) => ({
        user_id: id,
        role: id === "admin" ? ("admin" as const) : ("customer" as const),
        display_name: `QA ${id}`,
      })),
    );
  await db
    .insert(schema.artisanProfiles)
    .values(
      ["artisan", "competitor"].map((id) => ({
        user_id: id,
        contact_phone: "08000000000",
        primary_trade: "Plumbing",
        experience_years: 5,
        coverage_areas: ["GRA"],
        workshop_area: "GRA",
        bio: "Fictional QA artisan for isolated tests only.",
        is_listed: true,
      })),
    );
  state.initialize.mockImplementation(
    async ({ reference }: { reference: string }) => ({
      reference,
      accessCode: "QA_ACCESS",
      authorizationUrl: `https://checkout.paystack.com/qa-${reference}`,
    }),
  );
  state.transfer.mockImplementation(
    async (input: {
      reference: string;
      amountKobo: number;
      recipientCode: string;
    }) => ({
      ...input,
      status: "success",
      transferCode: "TRF_QA",
      failureReason: null,
    }),
  );
}, 60000);
afterAll(async () => {
  await pg.close();
  vi.unstubAllEnvs();
});

describe("Customer → artisan → verified test payment → sign-off → admin payout (real isolated PostgreSQL; auth/provider boundaries stubbed)", () => {
  it("publishes a saved draft, allows first quotes, and keeps competitor quote details private", async () => {
    state.user = "customer";
    const request = await body(
      await createRequest(
        req({
          title: "QA tap repair",
          category: "Plumbing",
          service_area: "GRA",
          description:
            "Fictional leaking tap repair, no real service requested.",
          budget_guidance_kobo: 3000000,
          status: "draft",
        }),
      ),
      201,
    );
    state.user = "artisan";
    expect((await body(await opportunities())).length).toBe(0);
    expect((await requestDetail(req({}), params(request.id))).status).toBe(403);
    state.user = "customer";
    await body(
      await publishRequest(
        req({ action: "submit" }, "PATCH"),
        params(request.id),
      ),
    );
    state.user = "artisan";
    expect((await body(await opportunities()))[0].id).toBe(request.id);
    await body(await requestDetail(req({}), params(request.id)));
    const quote = await body(
      await sendQuote(
        req({
          total_kobo: 3000000,
          note: "QA materials 10000, labour 20000 NGN.",
        }),
        params(request.id),
      ),
      201,
    );
    state.user = "competitor";
    expect((await body(await opportunities()))[0].id).toBe(request.id);
    expect(
      await body(await listQuotes(req({}), params(request.id))),
    ).toHaveLength(0);
    const other = await body(
      await sendQuote(
        req({
          total_kobo: 3200000,
          note: "Competing fictional QA quote for the same repair.",
        }),
        params(request.id),
      ),
      201,
    );
    state.user = "customer";
    const accepted = await body(
      await decideQuote(req({ decision: "accept" }), params(quote.id)),
    );
    jobId = accepted.job.id;
    expect(accepted.job_id).toBe(jobId);
    expect(
      (await decideQuote(req({ decision: "accept" }), params(other.id))).status,
    ).toBe(409);
    expect(
      (
        await publishRequest(
          req({ action: "cancel" }, "PATCH"),
          params(request.id),
        )
      ).status,
    ).toBe(409);
    state.user = "artisan";
    expect(await body(await opportunities())).toHaveLength(0);
    expect(
      (
        await sendQuote(
          req({ total_kobo: 1, note: "Must not overwrite an accepted quote." }),
          params(request.id),
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await body(
          await bookings(new Request("https://test/api/jobs?scope=worker")),
        )
      )[0].id,
    ).toBe(jobId);
  });
  it("rejects payment spoofing, wrong-owner checkout and work before a verified deposit", async () => {
    state.user = "artisan";
    expect(
      (await jobStatus(req({ status: "in_progress" }), params(jobId))).status,
    ).toBe(409);
    expect(
      (await progress(req({ note: "No paid deposit yet." }), params(jobId)))
        .status,
    ).toBe(409);
    expect((await fakePayment()).status).toBe(410);
    expect(
      (await initializePayment(req({ jobId, milestone: "deposit" }))).status,
    ).toBe(404);
    state.user = "customer";
    expect(
      (await initializePayment(req({ artisanId: "artisan" }))).status,
    ).toBe(400);
    expect(
      (await initializePayment(req({ jobId, milestone: "balance" }))).status,
    ).toBe(409);
    const checkout = await body(
      await initializePayment(req({ jobId, milestone: "deposit" })),
    );
    depositReference = checkout.reference;
    const retry = await body(
      await initializePayment(req({ jobId, milestone: "deposit" })),
    );
    expect(retry.reference).toBe(depositReference);
    expect(state.initialize).toHaveBeenCalledTimes(1);
    await expect(
      settleMilestone(
        depositReference,
        observed("WRONG_REFERENCE", checkout.amountKobo),
      ),
    ).rejects.toMatchObject({ code: "PAYMENT_MISMATCH" });
    await expect(
      settleMilestone(depositReference, observed(depositReference, 100)),
    ).rejects.toMatchObject({ code: "PAYMENT_MISMATCH" });
    await expect(
      settleMilestone(depositReference, {
        ...observed(depositReference, checkout.amountKobo),
        currency: "USD",
      }),
    ).rejects.toMatchObject({ code: "PAYMENT_MISMATCH" });
    expect(
      (
        await settleMilestone(
          depositReference,
          observed(depositReference, checkout.amountKobo, "pending"),
        )
      ).status,
    ).toBe("pending");
    expect(await db.select().from(schema.escrowHolds)).toHaveLength(0);
    state.verify.mockResolvedValue(
      observed(depositReference, checkout.amountKobo),
    );
    state.user = "stranger";
    expect(
      (await verifyPayment(req({ reference: depositReference }))).status,
    ).toBe(404);
    state.user = "customer";
    expect(
      (await body(await verifyPayment(req({ reference: depositReference }))))
        .status,
    ).toBe("confirmed");
    const event = JSON.stringify({
      event: "charge.success",
      data: {
        reference: depositReference,
        amount: checkout.amountKobo,
        currency: "NGN",
        status: "success",
      },
    });
    vi.stubEnv("PAYSTACK_SECRET_KEY", "sk_test_qa_signature_only");
    const signature = createHmac("sha512", "sk_test_qa_signature_only")
      .update(event)
      .digest("hex");
    expect(
      (
        await webhook(
          new Request("https://test/api/webhooks/paystack", {
            method: "POST",
            body: event,
            headers: { "x-paystack-signature": "wrong" },
          }),
        )
      ).status,
    ).toBe(401);
    for (let replay = 0; replay < 2; replay++)
      expect(
        (
          await webhook(
            new Request("https://test/api/webhooks/paystack", {
              method: "POST",
              body: event,
              headers: { "x-paystack-signature": signature },
            }),
          )
        ).status,
      ).toBe(200);
    const holds = await db.select().from(schema.escrowHolds);
    expect(holds).toHaveLength(1);
    expect(holds[0]).toMatchObject({
      status: "held",
      signed_off: false,
      amount_kobo: 1500000,
      job_ref: jobId,
    });
    const detail = await body(await bookingDetail(req({}), params(jobId)));
    expect(detail.worker_name).toBe("QA artisan");
    expect(detail.payments[0].reference).toBe(depositReference);
    expect(detail.holds[0].status).toBe("held");
    const desk = await loadArtisanDesk("artisan");
    expect(desk.jobs[0]).toMatchObject({ id: jobId, status: "in_progress" });
    expect(desk.payments[0].reference).toBe(depositReference);
    expect((await releaseEscrowHold(holds[0].id)).kind).toBe("not_payable");
    expect(state.transfer).not.toHaveBeenCalled();
  });
  it("requires artisan readiness and customer sign-off, verifies balance, and releases only with admin authority", async () => {
    state.user = "customer";
    expect(
      (await jobStatus(req({ status: "completed" }), params(jobId))).status,
    ).toBe(409);
    state.user = "stranger";
    expect(
      (await jobStatus(req({ status: "awaiting_signoff" }), params(jobId)))
        .status,
    ).toBe(404);
    state.user = "artisan";
    await body(
      await progress(
        req({ note: "Replaced and tested the QA tap, ready for inspection." }),
        params(jobId),
      ),
      201,
    );
    await body(
      await jobStatus(req({ status: "awaiting_signoff" }), params(jobId)),
    );
    expect(
      (await jobStatus(req({ status: "completed" }), params(jobId))).status,
    ).toBe(403);
    state.user = "customer";
    expect(
      (await body(await jobStatus(req({ status: "completed" }), params(jobId))))
        .status,
    ).toBe("in_progress");
    expect(
      (
        await review(
          req({
            rating: 5,
            comment: "Must not review before paid completion.",
          }),
          params(jobId),
        )
      ).status,
    ).toBe(409);
    const checkout = await body(
      await initializePayment(req({ jobId, milestone: "balance" })),
    );
    await settleMilestone(
      checkout.reference,
      observed(checkout.reference, 1500000, "failed"),
    );
    expect(
      (await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId)))[0]
        .status,
    ).toBe("in_progress");
    const retried = await body(
      await initializePayment(req({ jobId, milestone: "balance" })),
    );
    expect(retried.reference).not.toBe(checkout.reference);
    await settleMilestone(
      retried.reference,
      observed(retried.reference, 1500000),
    );
    expect(
      (await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId)))[0]
        .status,
    ).toBe("completed");
    const holds = await db.select().from(schema.escrowHolds);
    expect(holds).toHaveLength(2);
    expect(holds.every((h) => h.status === "release_due" && h.signed_off)).toBe(
      true,
    );
    expect(
      (
        await adminRelease(
          req({ action: "release" }, "PATCH"),
          params(holds[0].id),
        )
      ).status,
    ).toBe(403);
    const issue = await body(
      await reportIssue(
        req({
          description:
            "Fictional QA issue: customer needs an inspection before payout.",
        }),
        params(jobId),
      ),
      201,
    );
    expect((await releaseEscrowHold(holds[0].id)).kind).toBe("not_payable");
    state.user = "stranger";
    expect((await issueStatus(req({}), params(jobId))).status).toBe(404);
    state.user = "artisan";
    expect((await body(await issueStatus(req({}), params(jobId)))).id).toBe(
      issue.id,
    );
    state.user = "admin";
    expect((await body(await adminEscrow())).totals.disputed).toBe(3000000);
    await body(
      await resolveIssue(
        req(
          {
            status: "resolved",
            determination: "Release escrow to artisan",
            determinationNote:
              "Fictional inspection completed; customer agrees to release the test milestones.",
          },
          "PATCH",
        ),
        params(issue.id),
      ),
    );
    expect((await body(await adminEscrow())).totals.held).toBe(3000000);
    expect((await releaseEscrowHold(holds[0].id)).kind).toBe("needs_payee");
    await savePayoutAccount(holds[0].id, {
      accountNumber: "0000000000",
      bankCode: "TEST",
      bankName: "QA test bank",
    });
    const released = await body(
      await adminRelease(
        req({ action: "release" }, "PATCH"),
        params(holds[0].id),
      ),
    );
    expect(released.transfer.state).toBe("paid");
    expect((await releaseEscrowHold(holds[0].id)).kind).toBe("not_payable");
    expect(state.transfer).toHaveBeenCalledTimes(1);
    state.user = "customer";
    await body(
      await review(
        req({
          rating: 5,
          comment: "Fictional QA tap repair completed successfully.",
        }),
        params(jobId),
      ),
      201,
    );
    await body(
      await review(
        req({
          rating: 5,
          comment: "Updated review must not create duplicate ratings.",
        }),
        params(jobId),
      ),
      201,
    );
    expect(
      await db
        .select()
        .from(schema.jobReviews)
        .where(eq(schema.jobReviews.job_id, jobId)),
    ).toHaveLength(1);
  });
  it("reconciles payout timeouts without a second transfer, rejects wrong amounts and handles reversal", async () => {
    const holds = await db.select().from(schema.escrowHolds);
    const hold = holds.find((h) => h.transfer_status !== "success")!;
    await savePayoutAccount(hold.id, {
      accountNumber: "0000000000",
      bankCode: "TEST",
      bankName: "QA test bank",
    });
    const callsBeforeRetry = state.transfer.mock.calls.length;
    state.transfer.mockRejectedValueOnce(
      new Error("Connection lost after provider accepted the transfer"),
    );
    const result = await releaseEscrowHold(hold.id);
    expect(result.kind).toBe("in_flight");
    const [pending] = await db
      .select()
      .from(schema.escrowHolds)
      .where(eq(schema.escrowHolds.id, hold.id));
    state.verifyTransfer.mockResolvedValue({
      reference: pending.transfer_reference,
      status: "pending",
      amountKobo: hold.amount_kobo,
      recipientCode: "RCP_QA_TEST",
      transferCode: "TRF_PENDING",
      failureReason: null,
    });
    await releaseEscrowHold(hold.id);
    expect(state.transfer).toHaveBeenCalledTimes(callsBeforeRetry + 1);
    expect(
      await applyPaystackTransferEvent({
        event: "transfer.success",
        data: { reference: pending.transfer_reference!, amount: 1 },
      }),
    ).toBe(false);
    expect(
      await applyPaystackTransferEvent({
        event: "transfer.success",
        data: {
          reference: pending.transfer_reference!,
          amount: hold.amount_kobo,
        },
      }),
    ).toBe(true);
    expect(
      await applyPaystackTransferEvent({
        event: "transfer.reversed",
        data: {
          reference: pending.transfer_reference!,
          amount: hold.amount_kobo,
        },
      }),
    ).toBe(true);
    await applyPaystackTransferEvent({
      event: "transfer.success",
      data: {
        reference: pending.transfer_reference!,
        amount: hold.amount_kobo,
      },
    });
    const [reversed] = await db
      .select()
      .from(schema.escrowHolds)
      .where(eq(schema.escrowHolds.id, hold.id));
    expect(reversed).toMatchObject({
      status: "release_due",
      transfer_status: "reversed",
      released_at: null,
      paid_out_at: null,
    });
  });
  it("rejects settled checkout attempts and does not expose admin ledgers to marketplace accounts", async () => {
    state.user = "customer";
    expect((await adminEscrow()).status).toBe(403);
    const [payment] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.reference, depositReference));
    await expect(
      startMilestone({
        jobId,
        userId: "customer",
        email: "customer@example.test",
        milestone: "deposit",
        origin: "https://test",
      }),
    ).rejects.toMatchObject({ code: "ALREADY_SETTLED" });
    expect(payment.status).toBe("confirmed");
    state.user = "anonymous";
    expect(
      (await initializePayment(req({ jobId, milestone: "deposit" }))).status,
    ).toBe(401);
  });
  it("serializes double quote acceptance and concurrent checkout requests", async () => {
    state.user = "customer";
    const request = await body(
      await createRequest(
        req({
          title: "Concurrent QA repair",
          category: "Plumbing",
          service_area: "GRA",
          description: "Isolated QA concurrent booking and checkout request.",
          budget_guidance_kobo: 4000000,
          status: "submitted",
        }),
      ),
      201,
    );
    state.user = "artisan";
    const first = await body(
      await sendQuote(
        req({
          total_kobo: 4000000,
          note: "First fictional quote for concurrent acceptance.",
        }),
        params(request.id),
      ),
      201,
    );
    state.user = "competitor";
    const second = await body(
      await sendQuote(
        req({
          total_kobo: 4500000,
          note: "Second fictional quote for concurrent acceptance.",
        }),
        params(request.id),
      ),
      201,
    );
    state.user = "customer";
    const decisions = await Promise.all([
      decideQuote(req({ decision: "accept" }), params(first.id)),
      decideQuote(req({ decision: "accept" }), params(second.id)),
    ]);
    expect(decisions.map((r) => r.status).sort()).toEqual([200, 409]);
    const [booking] = await db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.request_id, request.id));
    const calls = state.initialize.mock.calls.length;
    const attempts = await Promise.all([
      startMilestone({
        jobId: booking.id,
        userId: "customer",
        email: "customer@example.test",
        milestone: "deposit",
        origin: "https://test",
      }),
      startMilestone({
        jobId: booking.id,
        userId: "customer",
        email: "customer@example.test",
        milestone: "deposit",
        origin: "https://test",
      }),
    ]);
    expect(new Set(attempts.map((a) => a.reference)).size).toBe(1);
    expect(state.initialize).toHaveBeenCalledTimes(calls + 1);
  });
});
