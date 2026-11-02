import { and, asc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobProgressUpdates, jobs } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  const { id } = await params;
  try {
    const [job] = await getDb()
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.customer_id, session.user.id)))
      .limit(1);

    const [workerJob] = job
      ? [job]
      : await getDb()
          .select({ id: jobs.id })
          .from(jobs)
          .where(and(eq(jobs.id, id), eq(jobs.worker_id, session.user.id)))
          .limit(1);

    if (!workerJob) return jsonError(404, "NOT_FOUND", "Job not found.");

    const updates = await getDb()
      .select({
        id: jobProgressUpdates.id,
        author_id: jobProgressUpdates.author_id,
        note: jobProgressUpdates.note,
        created_at: jobProgressUpdates.created_at,
      })
      .from(jobProgressUpdates)
      .where(eq(jobProgressUpdates.job_id, id))
      .orderBy(asc(jobProgressUpdates.created_at));

    return Response.json({ data: updates }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[jobs] Progress list failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load progress updates.");
  }
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
  if (!isRecord(body) || typeof body.note !== "string") {
    return jsonError(400, "INVALID_INPUT", "A progress note is required.");
  }

  const note = body.note.trim();
  if (note.length < 3 || note.length > 2000) {
    return jsonError(400, "INVALID_INPUT", "Progress note must be 3 to 2000 characters.");
  }

  try {
    const [job] = await getDb()
      .select({ id: jobs.id, status: jobs.status })
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.worker_id, session.user.id)))
      .limit(1);

    if (!job) return jsonError(403, "FORBIDDEN", "Only the assigned worker can add progress updates.");
    if (job.status === "completed" || job.status === "cancelled") {
      return jsonError(409, "INVALID_STATE", "Cannot update a completed or cancelled job.");
    }

    const [created] = await getDb()
      .insert(jobProgressUpdates)
      .values({ job_id: id, author_id: session.user.id, note })
      .returning({
        id: jobProgressUpdates.id,
        author_id: jobProgressUpdates.author_id,
        note: jobProgressUpdates.note,
        created_at: jobProgressUpdates.created_at,
      });

    return Response.json({ data: created }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[jobs] Progress create failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save this progress update.");
  }
}
