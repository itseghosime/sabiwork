import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { artisanProfiles, jobReviews, userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [row] = await getDb()
    .select({
      id: artisanProfiles.user_id,
      name: userProfiles.display_name,
      contact_phone: artisanProfiles.contact_phone,
      primary_trade: artisanProfiles.primary_trade,
      experience_years: artisanProfiles.experience_years,
      skills: artisanProfiles.skills,
      coverage_areas: artisanProfiles.coverage_areas,
      workshop_area: artisanProfiles.workshop_area,
      bio: artisanProfiles.bio,
      rate_guidance_kobo: artisanProfiles.rate_guidance_kobo,
      availability_notes: artisanProfiles.availability_notes,
      verification_status: artisanProfiles.verification_status,
      reviews_count: sql<number>`(select count(*)::int from ${jobReviews} jr where jr.worker_id = ${artisanProfiles.user_id})`,
      average_rating: sql<number>`coalesce((select round(avg(jr.rating)::numeric, 2)::float8 from ${jobReviews} jr where jr.worker_id = ${artisanProfiles.user_id}), 0)`,
    })
    .from(artisanProfiles)
    .innerJoin(userProfiles, eq(userProfiles.user_id, artisanProfiles.user_id))
    .where(eq(artisanProfiles.user_id, id))
    .limit(1);

  if (!row || row.verification_status === "rejected") {
    return jsonError(404, "NOT_FOUND", "Artisan profile not found.");
  }

  return Response.json({ data: row }, { headers: { "Cache-Control": "public, max-age=30" } });
}
