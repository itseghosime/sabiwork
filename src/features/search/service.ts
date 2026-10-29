import { areas, artisans, categories, type Artisan } from "./data";

export type SearchInput = Record<string, string | string[] | undefined>;
export interface SearchFilters {
  q: string;
  category: string;
  area: string;
  rating: number;
  sort: string;
  page: number;
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
    const category = categories.find((item) => item.id === person.category)!;
    const text = [
      person.name,
      person.headline,
      person.bio,
      category.name,
      ...category.services,
      person.area,
    ]
      .join(" ")
      .toLocaleLowerCase("en-NG");
    return (
      (!filters.category || person.category === filters.category) &&
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
export async function listArtisans(
  filters: SearchFilters,
): Promise<SearchResult> {
  return searchArtisans(filters);
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
  if (values.page > 1) params.set("page", String(values.page));
  return `/artisans${params.size ? `?${params}` : ""}`;
}
