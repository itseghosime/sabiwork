import { desc, eq, or, sql } from "drizzle-orm";
import { authorizeMarketplaceUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobRequests, jobs, payments, quotes } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET(request: Request) {
  const session = await authorizeMarketplaceUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  if (session.kind === "profile-required") {
    return jsonError(403, "PROFILE_REQUIRED", "Complete your account profile to continue.");
  }
  if (session.kind === "forbidden") {
    return jsonError(403, "FORBIDDEN", "Admins cannot access marketplace jobs.");
  }
  const scope = new URL(request.url).searchParams.get("scope");

  try {
    const jobsScope =
      scope === "customer"
        ? eq(jobs.customer_id, session.user.id)
        : scope === "worker"
          ? eq(jobs.worker_id, session.user.id)
          : or(eq(jobs.customer_id, session.user.id), eq(jobs.worker_id, session.user.id));

    const rows = await getDb()
      .select({
        id: jobs.id,
        request_id: jobs.request_id,
        status: jobs.status,
      work_ready_at: jobs.work_ready_at,
      signed_off_at: jobs.signed_off_at,
        customer_id: jobs.customer_id,
        worker_id: jobs.worker_id,
        created_at: jobs.created_at,
        updated_at: jobs.updated_at,
        title: jobRequests.title,
        category: jobRequests.category,
        service_area: jobRequests.service_area,
        budget_guidance_kobo: jobRequests.budget_guidance_kobo,
        total_quote_kobo: quotes.total_kobo,
        paid_kobo: sql<number>`(select coalesce(sum(p.amount_kobo), 0)::int from ${payments} p where p.job_id = ${jobs.id} and p.status = 'confirmed' and p.channel = 'paystack_verified_test')`,
      })
      .from(jobs)
      .innerJoin(jobRequests, eq(jobRequests.id, jobs.request_id))
      .innerJoin(quotes, eq(quotes.id, jobs.accepted_quote_id))
      .where(jobsScope)
      .orderBy(desc(jobs.updated_at), desc(jobs.id));

    return Response.json({ data: rows }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[jobs] List failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load jobs.");
  }
}
