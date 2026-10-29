import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { DemoNotice } from "@/components/discovery";
import { ResultsCollection } from "@/features/search/results-collection";
import { Icon } from "@/components/icon";
import { areas, categories } from "@/features/search/data";
import {
  listArtisans,
  parseFilters,
  searchHref,
  type SearchInput,
} from "@/features/search/service";
export const metadata: Metadata = { title: "Find an artisan" };

export default async function ArtisansPage({
  searchParams,
}: {
  searchParams: Promise<SearchInput>;
}) {
  const filters = parseFilters(await searchParams);
  const results = await listArtisans(filters);
  const selectedCategory = categories.find(
    (category) => category.id === filters.category,
  );
  const chips = [
    ...(filters.q
      ? [{ label: `Search: ${filters.q}`, clear: { q: "", page: 1 } }]
      : []),
    ...(selectedCategory
      ? [{ label: selectedCategory.short, clear: { category: "", page: 1 } }]
      : []),
    ...(filters.area
      ? [{ label: filters.area, clear: { area: "", page: 1 } }]
      : []),
    ...(filters.rating
      ? [{ label: `${filters.rating}+ stars`, clear: { rating: 0, page: 1 } }]
      : []),
  ];
  return (
    <>
      <section className="results-intro">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="next" size={14} />
            <span aria-current="page">Find an artisan</span>
          </nav>
          <div className="results-title">
            <div>
              <p className="eyebrow">LOCAL SKILLS. A GOOD PLACE TO START.</p>
              <h1>
                {selectedCategory
                  ? selectedCategory.name
                  : "Find your next helping hand."}
              </h1>
              <p>
                Explore skilled people around Benin City. Find the right fit for
                your job.
              </p>
            </div>
            <span className="location-label">
              <Icon name="pin" size={16} /> Benin City, Nigeria
            </span>
          </div>
        </div>
      </section>
      <section
        key={searchHref(filters)}
        className="container section results-section"
      >
        <Form action="/artisans" className="results-form">
          <div className="results-toolbar">
            <label className="results-search">
              <Icon name="search" size={19} />
              <input
                name="q"
                defaultValue={filters.q}
                placeholder="Search a name, trade or service"
                aria-label="Search artisans"
                maxLength={100}
              />
            </label>
            <button className="button button-primary" type="submit">
              Search <Icon name="arrow" size={17} />
            </button>
          </div>
          <div className="results-layout">
            <details className="filter-panel" open>
              <summary>
                <span>
                  <Icon name="filters" size={19} /> Filters
                </span>
                <Icon name="chevron" size={17} />
              </summary>
              <div className="filter-fields">
                <div className="filter-heading">
                  <h2>Refine your search</h2>
                  <Link href="/artisans" className="text-link">
                    Reset
                  </Link>
                </div>
                <label className="input-label">
                  Trade
                  <select name="category" defaultValue={filters.category}>
                    <option value="">All trades</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="input-label">
                  Area
                  <select name="area" defaultValue={filters.area}>
                    <option value="">All areas</option>
                    {areas.map((area) => (
                      <option key={area}>{area}</option>
                    ))}
                  </select>
                </label>
                <fieldset className="rating-field">
                  <legend>Minimum rating</legend>
                  {[
                    { value: 0, label: "Any rating" },
                    { value: 4, label: "4.0 & above" },
                    { value: 4.5, label: "4.5 & above" },
                    { value: 4.8, label: "4.8 & above" },
                  ].map((option) => (
                    <label key={option.value}>
                      <input
                        type="radio"
                        name="rating"
                        value={option.value}
                        defaultChecked={filters.rating === option.value}
                      />
                      <Icon name="star" size={15} /> {option.label}
                    </label>
                  ))}
                </fieldset>
                <label className="input-label">
                  Sort results
                  <select name="sort" defaultValue={filters.sort}>
                    <option value="recommended">Recommended</option>
                    <option value="rating">Highest rated</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                  </select>
                </label>
                <button
                  className="button button-primary apply-filters"
                  type="submit"
                >
                  Apply filters <Icon name="filters" size={17} />
                </button>
                <div className="filter-note">
                  <Icon name="shield" size={20} />
                  <p>
                    A reviewed profile means an admin has checked the submitted
                    details. It is not a work guarantee.
                  </p>
                </div>
              </div>
            </details>
            <div className="results-content">
              <div className="results-count" aria-live="polite">
                <h2>
                  {results.total} {results.total === 1 ? "artisan" : "artisans"}{" "}
                  found
                </h2>
                <span>
                  {results.total
                    ? `Showing ${(results.page - 1) * 6 + 1}–${Math.min(results.page * 6, results.total)} of ${results.total}`
                    : "Try broadening your search"}
                </span>
              </div>
              {chips.length > 0 && (
                <div className="active-filters" aria-label="Active filters">
                  {chips.map((chip) => (
                    <Link
                      key={chip.label}
                      href={searchHref(filters, chip.clear)}
                      aria-label={`Remove ${chip.label}`}
                      className="filter-chip"
                    >
                      {chip.label}
                      <Icon name="x" size={14} />
                    </Link>
                  ))}
                  <Link href="/artisans" className="text-link">
                    Clear all
                  </Link>
                </div>
              )}
              {results.total ? (
                <>
                  <ResultsCollection items={results.items} />
                  {results.pages > 1 && (
                    <nav aria-label="Results pages" className="pagination">
                      {results.page > 1 && (
                        <Link
                          className="button button-outline"
                          href={searchHref(filters, { page: results.page - 1 })}
                        >
                          <Icon name="back" size={16} /> Previous
                        </Link>
                      )}
                      <span>
                        Page {results.page} of {results.pages}
                      </span>
                      {results.page < results.pages && (
                        <Link
                          className="button button-outline"
                          href={searchHref(filters, { page: results.page + 1 })}
                        >
                          Next <Icon name="arrow" size={16} />
                        </Link>
                      )}
                    </nav>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">
                    <Icon name="search" size={30} />
                  </span>
                  <h2>No matches just yet.</h2>
                  <p>
                    Try another area, lower the minimum rating or use a more
                    general search.
                  </p>
                  <Link href="/artisans" className="button button-primary">
                    Clear filters <Icon name="arrow" size={17} />
                  </Link>
                </div>
              )}
              <DemoNotice />
            </div>
          </div>
        </Form>
      </section>
    </>
  );
}
