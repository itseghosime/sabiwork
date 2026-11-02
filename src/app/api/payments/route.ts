import { and, desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import {
  jobRequests,
  jobs,
  payments,
  userProfiles,
} from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
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
      .where(and(eq(payments.customer_id, session.user.id), eq(payments.channel, "paystack_verified_test")))
      .orderBy(desc(payments.created_at))
      .limit(200);

    return Response.json({ data: rows }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[payments] List failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load your payment records.");
  }
}

export async function POST() {
  // A browser-selected scenario must never create confirmed payment evidence.
  return jsonError(410, "CHECKOUT_REQUIRED", "Use the booking's Paystack test checkout. Payment status is verified on the server.");
}
