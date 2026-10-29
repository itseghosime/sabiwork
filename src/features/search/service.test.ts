import { describe, expect, it } from "vitest";
import { artisans, formatNaira } from "./data";
import { parseFilters, searchArtisans, searchHref } from "./service";

describe("discovery search contract", () => {
  it("combines text, trade, area and minimum rating without losing filters", () => {
    const filters = parseFilters({
      q: " LEAK ",
      category: "plumbing",
      area: "GRA",
      rating: "4.8",
    });
    const result = searchArtisans(filters);
    expect(result.total).toBe(1);
    expect(result.items[0].name).toBe("Osaze Ighodaro");
    expect(searchArtisans({ ...filters, area: "Ugbowo" }).total).toBe(0);
  });
  it("searches service aliases and returns a clear empty result", () => {
    expect(
      searchArtisans(parseFilters({ q: "door fittings" })).items[0].category,
    ).toBe("carpentry");
    expect(
      searchArtisans(parseFilters({ q: "a-service-we-do-not-offer" })),
    ).toMatchObject({ items: [], total: 0, pages: 1 });
  });
  it("validates malformed, repeated and oversized URL parameters", () => {
    expect(
      parseFilters({
        category: "admin",
        area: "Unknown",
        rating: "NaN",
        sort: "sql",
        page: "-2",
      }),
    ).toEqual({
      q: "",
      category: "",
      area: "",
      rating: 0,
      sort: "recommended",
      page: 1,
    });
    expect(
      parseFilters({ q: ["  tap ", "other"], page: "Infinity" }),
    ).toMatchObject({ q: "tap", page: 1 });
    expect(parseFilters({ q: "a".repeat(200) }).q).toHaveLength(100);
  });
  it("sorts prices as integer kobo and ratings numerically", () => {
    for (const sort of ["price-asc", "price-desc", "rating"]) {
      const { items } = searchArtisans(parseFilters({ sort }));
      const values = items.map((item) =>
        sort === "rating" ? item.rating : item.startingPriceKobo,
      );
      const expected = [...values].sort((a, b) =>
        sort === "price-asc" ? a - b : b - a,
      );
      expect(values).toEqual(expected);
    }
    expect(
      artisans.every((item) => Number.isInteger(item.startingPriceKobo)),
    ).toBe(true);
    expect(formatNaira(1000000)).toContain("10,000");
  });
  it("paginates, clamps out-of-range pages and never mutates shared fixtures", () => {
    const before = artisans.map((item) => item.id);
    const first = searchArtisans(parseFilters({}));
    const last = searchArtisans(parseFilters({ page: "999" }));
    expect(first.items).toHaveLength(6);
    expect(last.page).toBe(2);
    expect(last.items).toHaveLength(3);
    expect(
      new Set([...first.items, ...last.items].map((item) => item.id)).size,
    ).toBe(9);
    expect(artisans.map((item) => item.id)).toEqual(before);
  });
  it("preserves search/sort on pagination and removes a single filter safely", () => {
    const filters = parseFilters({
      q: "tap & tank",
      category: "plumbing",
      area: "GRA",
      rating: "4.5",
      sort: "price-asc",
    });
    const url = new URL(
      searchHref(filters, { page: 2 }),
      "https://example.test",
    );
    expect(url.searchParams.get("q")).toBe("tap & tank");
    expect(url.searchParams.get("sort")).toBe("price-asc");
    expect(url.searchParams.get("page")).toBe("2");
    const cleared = new URL(
      searchHref(filters, { category: "", page: 1 }),
      "https://example.test",
    );
    expect(cleared.searchParams.has("category")).toBe(false);
    expect(cleared.searchParams.get("area")).toBe("GRA");
    expect(searchHref(parseFilters({}))).toBe("/artisans");
  });
});
