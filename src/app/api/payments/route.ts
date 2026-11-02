import { and, desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import {
  jobRequests,
  jobs,
  payments,
  quotes,
  userProfiles,
} from "@/lib/server/schema";

export const dynamic = "force-dynamic";

const milestones = ["deposit", "balance"] as const;
const scenarios = ["success", "pending", "failed"] as const;

type Milestone = (typeof milestones)[number];
type Scenario = (typeof scenarios)[number];

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function splitMilestones(totalKobo: number) {
  const deposit = Math.floor(totalKobo / 2);
  return { deposit, balance: totalKobo - deposit };
}

function makeReference(milestone: Milestone) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${milestone === "deposit" ? "TST-PAY" : "TST-BAL"}-${suffix}`;
}

export async function GET() {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  try {
    const rows = await getDb()
      .select({
        id: payments.id,
        reference: payments.reference,
        milestone: payments.milestone,
        amount_kobo: payments.amount_kobo,
        status: payments.status,
        channel: payments.channel,
        failure_reason: payments.failure_reason,
        paid_at: payments.paid_at,
        created_at: payments.created_at,
        job_id: payments.job_id,
        job_status: jobs.status,
        job_title: jobRequests.title,
        job_category: jobRequests.category,
        service_area: jobRequests.service_area,
        worker_id: payments.worker_id,
        worker_name: userProfiles.display_name,
      })
      .from(payments)
      .innerJoin(jobs, eq(jobs.id, payments.job_id))
      .innerJoin(jobRequests, eq(jobRequests.id, jobs.request_id))
      .innerJoin(userProfiles, eq(userProfiles.user_id, payments.worker_id))
      .where(eq(payments.customer_id, session.user.id))
      .orderBy(desc(payments.created_at))
      .limit(200);

    return Response.json({ data: rows }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[payments] List failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load your payment records.");
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  if (!isRecord(body)) {
    return jsonError(400, "INVALID_INPUT", "Payment details are required.");
  }

  const { job_id, milestone, scenario } = body;
  if (
    typeof job_id !== "string" ||
    job_id.length < 10 ||
    !milestones.includes(milestone as Milestone) ||
    (scenario !== undefined && !scenarios.includes(scenario as Scenario))
  ) {
    return jsonError(400, "INVALID_INPUT", "Provide a job and a valid milestone.");
  }

  const selectedMilestone = milestone as Milestone;
  const selectedScenario = (scenario as Scenario | undefined) ?? "success";

  try {
    const [job] = await getDb()
      .select({
        id: jobs.id,
        status: jobs.status,
        worker_id: jobs.worker_id,
        customer_id: jobs.customer_id,
        total_quote_kobo: quotes.total_kobo,
      })
      .from(jobs)
      .innerJoin(quotes, eq(quotes.id, jobs.accepted_quote_id))
      .where(and(eq(jobs.id, job_id), eq(jobs.customer_id, session.user.id)))
      .limit(1);

    if (!job) return jsonError(404, "NOT_FOUND", "Booking not found.");
    if (job.status === "cancelled") {
      return jsonError(409, "INVALID_STATE", "This booking was cancelled, so nothing can be paid.");
    }

    const [alreadySettled] = await getDb()
      .select({ id: payments.id })
      .from(payments)
      .where(
        and(
          eq(payments.job_id, job.id),
          eq(payments.milestone, selectedMilestone),
          eq(payments.status, "confirmed"),
        ),
      )
      .limit(1);

    if (alreadySettled) {
      return jsonError(409, "ALREADY_SETTLED", "This milestone has already been recorded.");
    }

    if (selectedMilestone === "balance") {
      if (job.status !== "in_progress" && job.status !== "completed") {
        return jsonError(
          409,
          "MILESTONE_LOCKED",
          "The completion balance opens once work has started.",
        );
      }

      const [settledDeposit] = await getDb()
        .select({ id: payments.id })
        .from(payments)
        .where(
          and(
            eq(payments.job_id, job.id),
            eq(payments.milestone, "deposit"),
            eq(payments.status, "confirmed"),
          ),
        )
        .limit(1);

      if (!settledDeposit) {
        return jsonError(
          409,
          "DEPOSIT_REQUIRED",
          "Record the mobilisation deposit before the completion balance.",
        );
      }
    }

    const amountKobo = splitMilestones(job.total_quote_kobo)[selectedMilestone];
    const status =
      selectedScenario === "failed"
        ? "failed"
        : selectedScenario === "pending"
          ? "pending"
          : "confirmed";

    const [saved] = await getDb()
      .insert(payments)
      .values({
        job_id: job.id,
        customer_id: job.customer_id,
        worker_id: job.worker_id,
        milestone: selectedMilestone,
        amount_kobo: amountKobo,
        status,
        reference: makeReference(selectedMilestone),
        channel: "paystack_test",
        failure_reason:
          status === "failed" ? "Test gateway decline: insufficient funds." : null,
        paid_at: status === "confirmed" ? new Date() : null,
      })
      .returning({
        id: payments.id,
        reference: payments.reference,
        milestone: payments.milestone,
        amount_kobo: payments.amount_kobo,
        status: payments.status,
        failure_reason: payments.failure_reason,
        paid_at: payments.paid_at,
        created_at: payments.created_at,
        job_id: payments.job_id,
      });

    // A settled deposit is what moves an accepted booking into active work.
    if (status === "confirmed" && selectedMilestone === "deposit" && job.status === "accepted") {
      await getDb()
        .update(jobs)
        .set({ status: "in_progress", updated_at: new Date() })
        .where(eq(jobs.id, job.id));
    }

    return Response.json(
      { data: saved },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[payments] Create failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not record this payment.");
  }
}
