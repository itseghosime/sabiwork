import "server-only";

import { and, asc, desc, eq, notLike, sql, type SQL } from "drizzle-orm";
import {
  categories,
  tradeAliases,
  type Artisan,
  type CategoryId,
} from "@/features/search/data";
import type { SearchFilters, SearchResult } from "@/features/search/service";
import { getDb } from "./db";
import { demoArtisans } from "@/features/search/demo-artisans";
import { artisanProfiles, jobReviews, userProfiles } from "./schema";

const PAGE_SIZE = 6;

/** The public directory predates free-text trades, so map a trade onto the
 * closest existing category. The card shows the real trade as its headline.
 * The keywords drive both the JavaScript mapping and the SQL CASE below, so
 * the directory filter and the rendered badge cannot drift apart. */
const categoryMatchers: ReadonlyArray<{
  id: CategoryId;
  keywords: readonly string[];
}> = [
  { id: "plumbing", keywords: ["plumb", "pipe", "water"] },
  {
    id: "electrical",
    keywords: [
      "electric",
      "solar",
      "inverter",
      "wiring",
      "hvac",
      "air cond",
      "aircond",
      "cooling",
    ],
  },
  {
    id: "carpentry",
    keywords: [
      "carpent",
      "wood",
      "cabinet",
      "furniture",
      "tile",
      "tiling",
      "mason",
    ],
  },
  { id: "tailoring", keywords: ["tailor", "fashion", "sew", "garment"] },
  { id: "painting", keywords: ["paint", "decor"] },
];

const fallbackCategory: CategoryId = "cleaning";

const categorySearchTerms = Object.fromEntries(
  categories.map((category) => [
    category.id,
    [category.name, ...category.services, ...tradeAliases[category.id]]
      .join(" ")
      .toLowerCase(),
  ]),
) as Record<CategoryId, string>;

const tradeText = sql<string>`lower(${artisanProfiles.primary_trade} || ' ' || array_to_string(${artisanProfiles.skills}, ' '))`;

const categoryExpr = sql<string>`(case ${sql.join(
  categoryMatchers.map(
    ({ id, keywords }) =>
      sql`when ${sql.join(
        keywords.map((keyword) => sql`strpos(${tradeText}, ${keyword}) > 0`),
        sql` or `,
      )} then ${id}`,
  ),
  sql` `,
)} else ${fallbackCategory} end)::text`;

const categoryTermsExpr = sql<string>`(case ${sql.join(
  categoryMatchers.map(
    ({ id }) => sql`when ${categoryExpr} = ${id} then ${categorySearchTerms[id]}`,
  ),
  sql` `,
)} else ${categorySearchTerms[fallbackCategory]} end)::text`;

const searchText = sql<string>`lower(concat_ws(' ', ${userProfiles.display_name}, ${artisanProfiles.primary_trade}, ${artisanProfiles.bio}, ${artisanProfiles.workshop_area}, array_to_string(${artisanProfiles.coverage_areas}, ' '), array_to_string(${artisanProfiles.skills}, ' '), ${categoryTermsExpr}))`;

const averageRating = sql<number>`coalesce((select round(avg(jr.rating)::numeric, 2)::float8 from ${jobReviews} jr where jr.worker_id = ${artisanProfiles.user_id}), 0)`;
const reviewCount = sql<number>`(select count(*)::int from ${jobReviews} jr where jr.worker_id = ${artisanProfiles.user_id})`;
const startingPrice = sql<number>`coalesce(${artisanProfiles.rate_guidance_kobo}, 0)`;
const profileReviewed = sql<boolean>`(${artisanProfiles.verification_status} = 'approved')`;

function initialsFrom(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "SW"
  );
}

function tradeCategory(trade: string, skills: readonly string[]): CategoryId {
  const text = [trade, ...skills].join(" ").toLowerCase();
  return (
    categoryMatchers.find(({ keywords }) =>
      keywords.some((keyword) => text.includes(keyword)),
    )?.id ?? fallbackCategory
  );
}

function orderFor(sort: SearchFilters["sort"]): SQL[] {
  if (sort === "price-asc")
    return [asc(startingPrice), asc(artisanProfiles.user_id)];
  if (sort === "price-desc")
    return [desc(startingPrice), asc(artisanProfiles.user_id)];
  if (sort === "rating")
    return [
      desc(averageRating),
      desc(reviewCount),
      asc(artisanProfiles.user_id),
    ];
  return [
    desc(profileReviewed),
    desc(averageRating),
    desc(reviewCount),
    asc(artisanProfiles.user_id),
  ];
}

/** Listed artisan profiles filtered, sorted and paginated in Postgres. */
export async function searchPublicArtisans(
  filters: SearchFilters,
  requestedPageSize = PAGE_SIZE,
  includeSeedProfiles = false,
): Promise<SearchResult> {
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(100, Math.max(1, Math.floor(requestedPageSize)))
    : PAGE_SIZE;
  const db = getDb();
  const conditions: SQL[] = [eq(artisanProfiles.is_listed, true)];
  if (!includeSeedProfiles) {
    conditions.push(notLike(artisanProfiles.user_id, "seed-artisan-%"));
  }
  if (filters.category)
    conditions.push(sql`${categoryExpr} = ${filters.category}`);
  if (filters.area)
    conditions.push(sql`${filters.area} = any(${artisanProfiles.coverage_areas})`);
  if (filters.rating > 0)
    conditions.push(sql`${averageRating} >= ${filters.rating}`);
  if (filters.q)
    conditions.push(
      sql`strpos(${searchText}, ${filters.q.toLowerCase()}) > 0`,
    );
  const where = and(...conditions);

  // Keep the prototype useful before real artisans publish profiles.
  const rows = await db
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
      averageRating,
      reviewCount,
    })
    .from(artisanProfiles)
    .innerJoin(userProfiles, eq(userProfiles.user_id, artisanProfiles.user_id))
    .where(where)
    .orderBy(...orderFor(filters.sort))
    .limit(1000);

  const databaseItems: Artisan[] = rows.map((row) => {
    const category = tradeCategory(row.trade, row.skills);
    return {
      id: row.id,
      name: row.name,
      category,
      skills: [category],
      area: row.area.join(", ") || row.workshopArea,
      headline: row.trade,
      bio: row.bio,
      rating: row.averageRating || 0,
      reviewCount: row.reviewCount || 0,
      startingPriceKobo: row.rateGuidanceKobo ?? 0,
      profileReviewed:
        !row.id.startsWith("seed-artisan-") &&
        row.verificationStatus === "approved",
      portrait: null,
      initials: initialsFrom(row.name),
    };
  });

  const query = filters.q.toLocaleLowerCase("en-NG");
  const sampleItems = demoArtisans.filter((person) => {
    const text = [person.name, person.headline, person.bio, person.area, person.category]
      .join(" ")
      .toLocaleLowerCase("en-NG");
    return (
      (!filters.category || person.category === filters.category) &&
      (!filters.area || person.area.split(",").some((area) => area.trim() === filters.area)) &&
      person.rating >= filters.rating &&
      (!query || text.includes(query))
    );
  });
  const items = [...databaseItems, ...sampleItems];
  items.sort((a, b) => {
    if (filters.sort === "price-asc")
      return a.startingPriceKobo - b.startingPriceKobo || a.name.localeCompare(b.name);
    if (filters.sort === "price-desc")
      return b.startingPriceKobo - a.startingPriceKobo || a.name.localeCompare(b.name);
    if (filters.sort === "rating")
      return b.rating - a.rating || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name);
    return Number(b.profileReviewed) - Number(a.profileReviewed) ||
      b.rating - a.rating || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name);
  });
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(filters.page, 1), pages);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pages };
}

export async function getPublicArtisanProfile(
  userId: string,
  includeSeedProfile = false,
) {
  const demoProfile = demoArtisans.find((artisan) => artisan.id === userId);
  if (demoProfile) {
    const category = categories.find((item) => item.id === demoProfile.category);
    return {
      id: demoProfile.id,
      slug: demoProfile.id,
      name: demoProfile.name,
      headline: demoProfile.headline,
      category: demoProfile.category,
      trade: category?.name ?? demoProfile.headline,
      area: demoProfile.area,
      workshopAddress: `${demoProfile.area}, Benin City`,
      rating: 0,
      reviewCount: 0,
      startingPriceKobo: demoProfile.startingPriceKobo,
      experienceYears: 0,
      profileReviewed: false,
      bvnVerified: false,
      ninVerified: false,
      workshopVetted: false,
      initials: demoProfile.initials,
      portrait: demoProfile.portrait,
      bio: demoProfile.bio,
      skills: [demoProfile.headline, demoProfile.category],
      portfolio: [],
      reviews: [],
    };
  }

  const conditions = [
    eq(artisanProfiles.user_id, userId),
    eq(artisanProfiles.is_listed, true),
  ];
  if (!includeSeedProfile) {
    conditions.push(notLike(artisanProfiles.user_id, "seed-artisan-%"));
  }

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
    .where(and(...conditions))
    .limit(1);

  const area = row?.area[0] ?? row?.workshopArea;
  if (!row || !area) return null;

  const initials = initialsFrom(row.name);

  return {
    id: row.id,
    slug: row.id,
    name: row.name,
    headline: row.trade,
    category: row.trade.toLowerCase(),
    trade: row.trade,
    area,
    workshopAddress: row.workshopArea,
    rating: row.averageRating || 0,
    reviewCount: row.reviewsCount || 0,
    startingPriceKobo: row.rateGuidanceKobo ?? 0,
    experienceYears: row.experienceYears,
    profileReviewed: row.verificationStatus === "approved",
    bvnVerified: false,
    ninVerified: false,
    workshopVetted: false,
    initials,
    portrait: null,
    bio: row.bio,
    skills: row.skills.length ? row.skills : [row.trade],
    portfolio: [],
    reviews: [],
  };
}
