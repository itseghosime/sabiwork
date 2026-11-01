import "server-only";

import { eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { artisanProfiles, jobReviews, userProfiles } from "./schema";

export async function getPublicArtisanProfile(userId: string) {
  const [row] = await getDb()
    .select({
      id: artisanProfiles.user_id,
      name: userProfiles.display_name,
      trade: artisanProfiles.primary_trade,
      area: artisanProfiles.coverage_areas,
      workshopArea: artisanProfiles.workshop_area,
      bio: artisanProfiles.bio,
      skills: artisanProfiles.skills,
      rateGuidanceKobo: artisanProfiles.rate_guidance_kobo,
      verificationStatus: artisanProfiles.verification_status,
      experienceYears: artisanProfiles.experience_years,
      reviewsCount: sql<number>`(select count(*)::int from ${jobReviews} jr where jr.worker_id = ${artisanProfiles.user_id})`,
      averageRating: sql<number>`coalesce((select round(avg(jr.rating)::numeric, 2)::float8 from ${jobReviews} jr where jr.worker_id = ${artisanProfiles.user_id}), 0)`,
    })
    .from(artisanProfiles)
    .innerJoin(userProfiles, eq(userProfiles.user_id, artisanProfiles.user_id))
    .where(eq(artisanProfiles.user_id, userId))
    .limit(1);

  if (!row || !row.area.length || !row.skills.length) return null;

  const initials = row.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "SW";

  return {
    id: row.id,
    slug: row.id,
    name: row.name,
    headline: row.trade,
    category: row.trade.toLowerCase(),
    trade: row.trade,
    area: row.area[0],
    workshopAddress: row.workshopArea,
    rating: row.averageRating || 0,
    reviewCount: row.reviewsCount || 0,
    completedJobsCount: row.reviewsCount || 0,
    startingPriceKobo: row.rateGuidanceKobo ?? 0,
    experienceYears: row.experienceYears,
    profileReviewed: row.verificationStatus === "approved",
    bvnVerified: false,
    ninVerified: false,
    workshopVetted: false,
    initials,
    bio: row.bio,
    skills: row.skills,
    portfolio: [],
    reviews: [],
  };
}
