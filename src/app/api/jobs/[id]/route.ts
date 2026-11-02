import { and, asc, eq, or } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobProgressUpdates, jobRequests, jobReviews, jobs, quotes } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

async function loadAccessibleJob(jobId: string, userId: string) {
  const [job] = await getDb()
    .select({
      id: jobs.id,
      request_id: jobs.request_id,
      accepted_quote_id: jobs.accepted_quote_id,
      customer_id: jobs.customer_id,
      worker_id: jobs.worker_id,
      status: jobs.status,
      created_at: jobs.created_at,
      updated_at: jobs.updated_at,
      title: jobRequests.title,
      category: jobRequests.category,
      service_area: jobRequests.service_area,
      description: jobRequests.description,
      budget_guidance_kobo: jobRequests.budget_guidance_kobo,
      total_quote_kobo: quotes.total_kobo,
      quote_note: quotes.note,
    })
    .from(jobs)
    .innerJoin(jobRequests, eq(jobRequests.id, jobs.request_id))
    .innerJoin(quotes, eq(quotes.id, jobs.accepted_quote_id))
    .where(and(eq(jobs.id, jobId), or(eq(jobs.customer_id, userId), eq(jobs.worker_id, userId))))
    .limit(1);
  return job ?? null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  const { id } = await params;

  try {
    const job = await loadAccessibleJob(id, session.user.id);
    if (!job) return jsonError(404, "NOT_FOUND", "Job not found.");

    const [updates, reviews] = await Promise.all([
      getDb()
        .select({
          id: jobProgressUpdates.id,
          author_id: jobProgressUpdates.author_id,
          note: jobProgressUpdates.note,
          created_at: jobProgressUpdates.created_at,
        })
        .from(jobProgressUpdates)
        .where(eq(jobProgressUpdates.job_id, id))
        .orderBy(asc(jobProgressUpdates.created_at)),
      getDb()
        .select({
          id: jobReviews.id,
          reviewer_id: jobReviews.reviewer_id,
          worker_id: jobReviews.worker_id,
          rating: jobReviews.rating,
          comment: jobReviews.comment,
          created_at: jobReviews.created_at,
        })
        .from(jobReviews)
        .where(eq(jobReviews.job_id, id))
        .limit(1),
    ]);

    return Response.json({ data: { ...job, updates, review: reviews[0] ?? null } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[jobs] Detail failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load this job.");
  }
}
