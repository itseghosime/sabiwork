import { desc, eq, or } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobRequests, jobs, quotes } from "@/lib/server/schema";

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
        id: jobs.id,
        request_id: jobs.request_id,
        status: jobs.status,
        customer_id: jobs.customer_id,
        worker_id: jobs.worker_id,
        created_at: jobs.created_at,
        updated_at: jobs.updated_at,
        title: jobRequests.title,
        category: jobRequests.category,
        service_area: jobRequests.service_area,
        budget_guidance_kobo: jobRequests.budget_guidance_kobo,
        total_quote_kobo: quotes.total_kobo,
      })
      .from(jobs)
      .innerJoin(jobRequests, eq(jobRequests.id, jobs.request_id))
      .innerJoin(quotes, eq(quotes.id, jobs.accepted_quote_id))
      .where(or(eq(jobs.customer_id, session.user.id), eq(jobs.worker_id, session.user.id)))
      .orderBy(desc(jobs.updated_at), desc(jobs.id));

    return Response.json({ data: rows }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[jobs] List failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load jobs.");
  }
}
