import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { artisanProfiles, jobReviews, userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function asSingle(value: string | null) {
  return (value ?? "").trim();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = asSingle(url.searchParams.get("q"));
  const category = asSingle(url.searchParams.get("category"));
  const area = asSingle(url.searchParams.get("area"));

  const filters = [eq(artisanProfiles.is_listed, true)];
  if (category) {
    filters.push(
      or(
        ilike(artisanProfiles.primary_trade, `%${category}%`),
        sql<boolean>`${category} = ANY(${artisanProfiles.skills})`,
      )!,
    );
  }
  if (area) {
    filters.push(sql<boolean>`${area} = ANY(${artisanProfiles.coverage_areas})`);
  }
  if (q) {
    filters.push(
      or(
        ilike(userProfiles.display_name, `%${q}%`),
        ilike(artisanProfiles.primary_trade, `%${q}%`),
        ilike(artisanProfiles.bio, `%${q}%`),
      )!,
    );
  }

  const rows = await getDb()
    .select({
      id: artisanProfiles.user_id,
      name: userProfiles.display_name,
      primary_trade: artisanProfiles.primary_trade,
      skills: artisanProfiles.skills,
      coverage_areas: artisanProfiles.coverage_areas,
      bio: artisanProfiles.bio,
      rate_guidance_kobo: artisanProfiles.rate_guidance_kobo,
      verification_status: artisanProfiles.verification_status,
      reviews_count: sql<number>`(select count(*)::int from ${jobReviews} jr where jr.worker_id = ${artisanProfiles.user_id})`,
      average_rating: sql<number>`coalesce((select round(avg(jr.rating)::numeric, 2)::float8 from ${jobReviews} jr where jr.worker_id = ${artisanProfiles.user_id}), 0)`,
    })
    .from(artisanProfiles)
    .innerJoin(userProfiles, eq(userProfiles.user_id, artisanProfiles.user_id))
    .where(and(...filters))
    .orderBy(desc(artisanProfiles.updated_at))
    .limit(100);

  return Response.json({ data: rows }, { headers: { "Cache-Control": "public, max-age=30" } });
}
