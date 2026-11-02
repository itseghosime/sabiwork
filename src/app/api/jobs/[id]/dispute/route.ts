import { and, asc, eq, inArray, ne, or } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import {
  disputeEvents,
  disputes,
  escrowHolds,
  jobRequests,
  jobs,
  quotes,
  userProfiles,
} from "@/lib/server/schema";
export const dynamic = "force-dynamic";
const fail = (status: number, message: string) =>
  Response.json({ error: { message } }, { status });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  if (session.kind !== "authenticated")
    return fail(
      session.kind === "unavailable" ? 503 : 401,
      "Sign in to continue.",
    );
  const { id } = await params;
  const [record] = await getDb()
    .select()
    .from(disputes)
    .where(
      and(
        eq(disputes.job_id, id),
        or(
          eq(disputes.customer_id, session.user.id),
          eq(disputes.worker_id, session.user.id),
        ),
      ),
    )
    .limit(1);
  if (!record) return fail(404, "Case not found.");
  const events = await getDb()
    .select()
    .from(disputeEvents)
    .where(eq(disputeEvents.dispute_id, record.id))
    .orderBy(asc(disputeEvents.occurred_at));
  return Response.json(
    { data: { ...record, events } },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  if (session.kind !== "authenticated")
    return fail(
      session.kind === "unavailable" ? 503 : 401,
      "Sign in to continue.",
    );
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }
  if (
    typeof body?.description !== "string" ||
    body.description.trim().length < 20 ||
    body.description.trim().length > 2000
  )
    return fail(400, "Describe the issue in 20–2000 characters.");
  return getDb().transaction(async (tx) => {
    const [job] = await tx
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.customer_id, session.user.id)))
      .for("update");
    if (!job) return fail(404, "Booking not found.");
    const [existing] = await tx
      .select()
      .from(disputes)
      .where(eq(disputes.job_id, id))
      .limit(1);
    if (existing) return Response.json({ data: existing });
    const [requestRow] = await tx
      .select()
      .from(jobRequests)
      .where(eq(jobRequests.id, job.request_id));
    const [quote] = await tx
      .select()
      .from(quotes)
      .where(eq(quotes.id, job.accepted_quote_id));
    const people = await tx
      .select()
      .from(userProfiles)
      .where(inArray(userProfiles.user_id, [job.customer_id, job.worker_id]));
    const [saved] = await tx
      .insert(disputes)
      .values({
        id: id,
        job_id: id,
        customer_id: job.customer_id,
        worker_id: job.worker_id,
        title: `Issue: ${requestRow.title}`.slice(0, 200),
        job_ref: id,
        trade: requestRow.category,
        area: requestRow.service_area.slice(0, 80),
        customer_name: people.find((p) => p.user_id === job.customer_id)!
          .display_name,
        artisan_name: people.find((p) => p.user_id === job.worker_id)!
          .display_name,
        amount_kobo: quote.total_kobo,
        summary: body.description.trim(),
        customer_statement: body.description.trim(),
        artisan_statement: "No artisan response recorded.",
        sla_due_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
      })
      .returning();
    await tx
      .update(escrowHolds)
      .set({ status: "disputed", updated_at: new Date() })
      .where(
        and(eq(escrowHolds.job_ref, id), ne(escrowHolds.status, "released")),
      );
    await tx
      .insert(disputeEvents)
      .values({
        dispute_id: saved.id,
        label: "Issue reported",
        detail:
          "The customer reported an issue. Unreleased milestones are frozen for administrator review; a transfer already sent cannot be recalled here.",
      });
    return Response.json({ data: saved }, { status: 201 });
  });
}
