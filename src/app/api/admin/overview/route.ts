import { desc } from "drizzle-orm";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { artisanProfiles, jobRequests, userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET() {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") {
    return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  if (access.kind === "forbidden" || access.kind === "profile-required") {
    return jsonError(403, "FORBIDDEN", "Admin access is required.");
  }
  if (access.kind === "unavailable") {
    return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  }

  try {
    const [users, workProfiles, requests] = await Promise.all([
      getDb()
        .select({
          user_id: userProfiles.user_id,
          role: userProfiles.role,
          display_name: userProfiles.display_name,
          created_at: userProfiles.created_at,
        })
        .from(userProfiles)
        .orderBy(desc(userProfiles.created_at))
        .limit(100),
      getDb()
        .select({
          user_id: artisanProfiles.user_id,
          primary_trade: artisanProfiles.primary_trade,
          coverage_areas: artisanProfiles.coverage_areas,
          is_listed: artisanProfiles.is_listed,
          verification_status: artisanProfiles.verification_status,
          created_at: artisanProfiles.created_at,
        })
        .from(artisanProfiles)
        .orderBy(desc(artisanProfiles.created_at))
        .limit(100),
      getDb()
        .select({
          id: jobRequests.id,
          customer_id: jobRequests.customer_id,
          title: jobRequests.title,
          category: jobRequests.category,
          status: jobRequests.status,
          created_at: jobRequests.created_at,
        })
        .from(jobRequests)
        .orderBy(desc(jobRequests.created_at))
        .limit(100),
    ]);

    return Response.json({ data: { users, workProfiles, requests } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[admin] Overview failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load admin data.");
  }
}
