import { and, desc, eq, ne, sql } from "drizzle-orm";
import { authorizeMarketplaceUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobRequests, quotes } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET() {
  const session = await authorizeMarketplaceUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  if (session.kind === "profile-required") {
    return jsonError(403, "PROFILE_REQUIRED", "Complete your account profile to continue.");
  }
  if (session.kind === "forbidden") {
    return jsonError(403, "FORBIDDEN", "Admins cannot access hiring opportunities.");
  }

  try {
    const rows = await getDb()
      .select({
        id: jobRequests.id,
        title: jobRequests.title,
        category: jobRequests.category,
        service_area: jobRequests.service_area,
        description: jobRequests.description,
        budget_guidance_kobo: jobRequests.budget_guidance_kobo,
        status: jobRequests.status,
        created_at: jobRequests.created_at,
        quotes_count: sql<number>`(select count(*)::int from ${quotes} q where q.request_id = ${jobRequests.id})`,
      })
      .from(jobRequests)
      .where(
        and(
          eq(jobRequests.status, "submitted"),
          ne(jobRequests.customer_id, session.user.id),
        ),
      )
      .orderBy(desc(jobRequests.created_at))
      .limit(100);

    return Response.json({ data: rows }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[requests] Open list failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load open requests.");
  }
}
