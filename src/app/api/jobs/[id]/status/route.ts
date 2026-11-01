import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobs } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
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
  if (typeof body !== "object" || !body || !("status" in body)) {
    return jsonError(400, "INVALID_INPUT", "New status is required.");
  }

  const nextStatus = body.status;
  if (nextStatus !== "in_progress" && nextStatus !== "completed") {
    return jsonError(400, "INVALID_INPUT", "Status must be in_progress or completed.");
  }

  try {
    const [job] = await getDb()
      .select({ id: jobs.id, status: jobs.status, customer_id: jobs.customer_id, worker_id: jobs.worker_id })
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (!job) return jsonError(404, "NOT_FOUND", "Job not found.");

    if (nextStatus === "in_progress") {
      if (job.worker_id !== session.user.id) {
        return jsonError(403, "FORBIDDEN", "Only the assigned worker can start this job.");
      }
      if (job.status !== "accepted") {
        return jsonError(409, "INVALID_STATE", "Only accepted jobs can be moved to in progress.");
      }
    }

    if (nextStatus === "completed") {
      if (job.customer_id !== session.user.id) {
        return jsonError(403, "FORBIDDEN", "Only the customer can complete this job.");
      }
      if (job.status !== "in_progress") {
        return jsonError(409, "INVALID_STATE", "Only in-progress jobs can be completed.");
      }
    }

    const [updated] = await getDb()
      .update(jobs)
      .set({ status: nextStatus, updated_at: new Date() })
      .where(eq(jobs.id, id))
      .returning({ id: jobs.id, status: jobs.status, updated_at: jobs.updated_at });

    return Response.json({ data: updated }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[jobs] Status update failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not update this job status.");
  }
}
