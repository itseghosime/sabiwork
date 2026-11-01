import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobReviews, jobs } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (!isRecord(body) || typeof body.rating !== "number" || typeof body.comment !== "string") {
    return jsonError(400, "INVALID_INPUT", "Review rating and comment are required.");
  }

  const rating = Math.trunc(body.rating);
  const comment = body.comment.trim();
  if (rating < 1 || rating > 5 || comment.length < 10 || comment.length > 2000) {
    return jsonError(400, "INVALID_INPUT", "Rating must be 1-5 and comment 10-2000 characters.");
  }

  try {
    const [job] = await getDb()
      .select({ id: jobs.id, status: jobs.status, customer_id: jobs.customer_id, worker_id: jobs.worker_id })
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.customer_id, session.user.id)))
      .limit(1);

    if (!job) return jsonError(403, "FORBIDDEN", "Only the customer can review this job.");
    if (job.status !== "completed") {
      return jsonError(409, "INVALID_STATE", "Reviews can only be added after completion.");
    }

    const [review] = await getDb()
      .insert(jobReviews)
      .values({
        job_id: id,
        reviewer_id: session.user.id,
        worker_id: job.worker_id,
        rating,
        comment,
      })
      .onConflictDoUpdate({
        target: jobReviews.job_id,
        set: {
          rating,
          comment,
        },
      })
      .returning({
        id: jobReviews.id,
        job_id: jobReviews.job_id,
        rating: jobReviews.rating,
        comment: jobReviews.comment,
        created_at: jobReviews.created_at,
      });

    return Response.json({ data: review }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[jobs] Review save failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save this review.");
  }
}
