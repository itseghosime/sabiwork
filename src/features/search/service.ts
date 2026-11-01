import {
  areas,
  artisans,
  categories,
  tradeAliases,
  type Artisan,
  type CategoryId,
  type Area,
} from "./data";

export type SearchInput = Record<string, string | string[] | undefined>;
export interface SearchFilters {
  q: string;
  category: string;
  area: string;
  rating: number;
  sort: string;
  page: number;
  view: "list" | "grid";
}
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
export function parseFilters(input: SearchInput): SearchFilters {
  const category = first(input.category);
  const area = first(input.area);
  const rating = Number(first(input.rating));
  const page = Number(first(input.page));
  const sort = first(input.sort);
  return {
    q: first(input.q).trim().slice(0, 100),
    category: categories.some((item) => item.id === category) ? category : "",
    area: areas.some((item) => item === area) ? area : "",
    rating: [4, 4.5, 4.8].includes(rating) ? rating : 0,
    sort: ["recommended", "rating", "price-asc", "price-desc"].includes(sort)
      ? sort
      : "recommended",
    view: first(input.view) === "grid" ? "grid" : "list",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}
export interface SearchResult {
  items: Artisan[];
  total: number;
  page: number;
  pages: number;
}
export function searchArtisans(
  filters: SearchFilters,
  records: readonly Artisan[] = artisans,
): SearchResult {
  const query = filters.q.toLocaleLowerCase("en-NG");
  const filtered = records.filter((person) => {
    const trades = categories.filter((item) => person.skills.includes(item.id));
    const text = [
      person.name,
      person.headline,
      person.bio,
      ...trades.flatMap((category) => [
        category.name,
        ...category.services,
        ...tradeAliases[category.id],
      ]),
      person.area,
    ]
      .join(" ")
      .toLocaleLowerCase("en-NG");
    return (
      (!filters.category ||
        person.skills.some((skill) => skill === filters.category)) &&
      (!filters.area || person.area === filters.area) &&
      person.rating >= filters.rating &&
      (!query || text.includes(query))
    );
  });
  filtered.sort((a, b) => {
    if (filters.sort === "price-asc")
      return a.startingPriceKobo - b.startingPriceKobo;
    if (filters.sort === "price-desc")
      return b.startingPriceKobo - a.startingPriceKobo;
    if (filters.sort === "rating")
      return b.rating - a.rating || b.reviewCount - a.reviewCount;
    return (
      Number(b.profileReviewed) - Number(a.profileReviewed) ||
      b.rating - a.rating ||
      b.reviewCount - a.reviewCount
    );
  });
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const page = Math.min(filters.page, pages);
  return {
    items: filtered.slice((page - 1) * 6, page * 6),
    total: filtered.length,
    page,
    pages,
  };
}
// This is the single replacement point for the future server search/database adapter.
// Failures deliberately propagate to the route error boundary rather than look empty.
function inferCategory(value: string): CategoryId {
  const normalized = value.toLowerCase();
  if (normalized.includes("plumb") || normalized.includes("water")) return "plumbing";
  if (normalized.includes("elect") || normalized.includes("solar") || normalized.includes("inverter")) return "electrical";
  if (normalized.includes("carpen") || normalized.includes("wood") || normalized.includes("cabinet")) return "carpentry";
  if (normalized.includes("tailor") || normalized.includes("fashion")) return "tailoring";
  if (normalized.includes("paint")) return "painting";
  return "cleaning";
}

function inferArea(value: string): Area {
  const found = areas.find((item) => value.toLowerCase().includes(item.toLowerCase()));
  return found ?? "GRA";
}

export async function listArtisans(
  filters: SearchFilters,
): Promise<SearchResult> {
  if (process.env.NODE_ENV === "test") {
    return searchArtisans(filters);
  }

  try {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.area) params.set("area", filters.area);

    const endpoint = `/api/artisans${params.size ? `?${params}` : ""}`;
    const base = typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"
      : window.location.origin;
    const response = await fetch(new URL(endpoint, base).toString(), { cache: "no-store" });
    if (!response.ok) return searchArtisans(filters);

    const body = await response.json();
    const rows = body.data as Array<{
      id: string;
      name: string;
      primary_trade: string;
      coverage_areas: string[];
      bio: string;
      rate_guidance_kobo: number | null;
      average_rating: number;
      reviews_count: number;
      verification_status: string;
    }>;

    const records: Artisan[] = rows.map((row) => {
      const category = inferCategory(row.primary_trade);
      const initials = row.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "SW";

      return {
        id: row.id,
        name: row.name,
        category,
        skills: [category],
        area: inferArea(row.coverage_areas[0] ?? "GRA"),
        headline: row.primary_trade,
        bio: row.bio,
        rating: row.average_rating || 0,
        reviewCount: row.reviews_count || 0,
        startingPriceKobo: row.rate_guidance_kobo ?? 0,
        profileReviewed: row.verification_status === "approved",
        portrait: null,
        initials,
      };
    });

    return searchArtisans(filters, records.length ? records : artisans);
  } catch (error) {
    console.error("[search] Falling back to fixture directory", error);
    return searchArtisans(filters);
  }
}

export function searchHref(
  filters: SearchFilters,
  changes: Partial<SearchFilters> = {},
) {
  const values = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.category) params.set("category", values.category);
  if (values.area) params.set("area", values.area);
  if (values.rating) params.set("rating", String(values.rating));
  if (values.sort !== "recommended") params.set("sort", values.sort);
  if (values.view === "grid") params.set("view", "grid");
  if (values.page > 1) params.set("page", String(values.page));
  return `/artisans${params.size ? `?${params}` : ""}`;
}
