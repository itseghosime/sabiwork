import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobs, payments } from "@/lib/server/schema";

export const dynamic = "force-dynamic";
const fail = (status: number, code: string, message: string) =>
  Response.json({ error: { code, message } }, { status });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  if (session.kind !== "authenticated")
    return fail(
      session.kind === "unavailable" ? 503 : 401,
      "UNAUTHORIZED",
      "Sign in to continue.",
    );
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  if (
    !body ||
    !["in_progress", "awaiting_signoff", "completed"].includes(body.status)
  )
    return fail(400, "INVALID_INPUT", "Choose a valid job action.");
  try {
    return await getDb().transaction(async (tx) => {
      const [job] = await tx
        .select()
        .from(jobs)
        .where(eq(jobs.id, id))
        .for("update");
      if (
        !job ||
        (job.customer_id !== session.user.id &&
          job.worker_id !== session.user.id)
      )
        return fail(404, "NOT_FOUND", "Job not found.");
      const [deposit] = await tx
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.job_id, id),
            eq(payments.milestone, "deposit"),
            eq(payments.status, "confirmed"),
            eq(payments.channel, "paystack_verified_test"),
          ),
        );
      if (!deposit)
        return fail(
          409,
          "DEPOSIT_REQUIRED",
          "A verified deposit is required before work starts.",
        );
      const now = new Date();
      if (body.status === "in_progress") {
        if (job.worker_id !== session.user.id)
          return fail(
            403,
            "FORBIDDEN",
            "Only the assigned artisan can start work.",
          );
        // Verification already activates the booking; a repeated start is harmless.
        if (job.status !== "accepted" && job.status !== "in_progress")
          return fail(409, "INVALID_STATE", "This booking cannot be started.");
        const [updated] = await tx
          .update(jobs)
          .set({ status: "in_progress", updated_at: now })
          .where(eq(jobs.id, id))
          .returning();
        return Response.json({ data: updated });
      }
      if (body.status === "awaiting_signoff") {
        if (job.worker_id !== session.user.id)
          return fail(
            403,
            "FORBIDDEN",
            "Only the assigned artisan can request inspection.",
          );
        if (job.status !== "in_progress")
          return fail(
            409,
            "INVALID_STATE",
            "Only active work can be submitted for inspection.",
          );
        const [updated] = await tx
          .update(jobs)
          .set({ work_ready_at: job.work_ready_at ?? now, updated_at: now })
          .where(eq(jobs.id, id))
          .returning();
        return Response.json({ data: updated });
      }
      if (job.customer_id !== session.user.id)
        return fail(
          403,
          "FORBIDDEN",
          "Only the customer can sign off the work.",
        );
      if (job.status !== "in_progress" || !job.work_ready_at)
        return fail(
          409,
          "INSPECTION_REQUIRED",
          "Wait for the artisan to mark the work ready for inspection.",
        );
      const [updated] = await tx
        .update(jobs)
        .set({ signed_off_at: job.signed_off_at ?? now, updated_at: now })
        .where(eq(jobs.id, id))
        .returning();
      // Completion and payout eligibility follow verified balance settlement.
      return Response.json({ data: updated });
    });
  } catch (e) {
    console.error("[jobs] Status update failed", e);
    return fail(500, "INTERNAL_ERROR", "Could not update the job.");
  }
}
