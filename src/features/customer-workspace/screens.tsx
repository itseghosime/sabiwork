"use client";

import Link from "next/link";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  areas,
  formatNaira,
  type Area,
  type CategoryId,
} from "@/features/search/data";
import { searchArtisans, type SearchFilters } from "@/features/search/service";
import { useScreenData } from "./hooks";
import {
  exploreTrades,
  featuredArtisans,
  supportFaqs,
  supportQuickLinks,
  supportTopics,
  tradeRequestLabels,
} from "./data";
import {
  agreedAmountKobo,
  balanceKobo,
  customerService,
  depositKobo,
  formatMoney,
  formatWat,
  formatWatDate,
  getWatGreeting,
  jobStatusLabel,
  jobStatusTone,
  requestStatusLabel,
  requestStatusTone,
  type ArtisanSummary,
  type CustomerJob,
  type CustomerRequest,
  type JobReview,
  type JobStatus,
  type SupportTicketResult,
} from "./service";

function Status({ label, tone }: { label: string; tone: string }) {
  return <span className={`cb-status ${tone}`}>{label}</span>;
}

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span
      className={`cb-stars ${className}`.trim()}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={14}
          className={star <= rounded ? "" : "cb-star-off"}
        />
      ))}
    </span>
  );
}

function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="cb-loading" aria-label="Loading">
      <div className="cb-skeleton short" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="cb-skeleton" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="cb-error-state" role="alert">
      <span className="cb-empty-icon">
        <Icon name="alertCircle" size={22} />
      </span>
      <h3>We could not load this page</h3>
      <p>{message}</p>
      <div className="cb-inline-actions">
        <button type="button" className="button button-outline" onClick={onRetry}>
          <Icon name="refresh" size={16} /> Try again
        </button>
        <Link className="button button-subtle" href="/support">
          Get help
        </Link>
      </div>
    </div>
  );
}

const noJobs: CustomerJob[] = [];
const noRequests: CustomerRequest[] = [];
const noReviewEntries: Array<{ job: CustomerJob; review: JobReview }> = [];
const noArtisans: Record<string, ArtisanSummary> = {};

function milestoneState(job: CustomerJob, milestone: "deposit" | "work" | "signoff") {
  if (milestone === "deposit") {
    return job.status === "accepted" ? "active" : "done";
  }
  if (milestone === "work") {
    if (job.status === "in_progress") return "active";
    if (job.status === "completed") return "done";
    return "";
  }
  return job.status === "completed" ? "done" : "";
}

// ============================================================================
// Customer dashboard (/dashboard)
// ============================================================================
export function CustomerDashboardScreen({ displayName }: { displayName: string }) {
  const fetchDashboard = useCallback(
    () =>
      Promise.all([
        customerService.listJobs(),
        customerService.listRequests(),
      ]).then(([jobs, requests]) => ({ jobs, requests })),
    [],
  );
  const { data, loading, error, retry } = useScreenData(
    fetchDashboard,
    "Could not load your dashboard.",
  );

  const jobs = data?.jobs ?? noJobs;
  const requests = data?.requests ?? noRequests;

  const firstName = displayName.trim().split(/\s+/)[0] || "there";
  const greeting = getWatGreeting();

  const activeJobs = useMemo(
    () =>
      jobs.filter(
        (job) => job.status === "accepted" || job.status === "in_progress",
      ),
    [jobs],
  );
  const currentBooking = useMemo(
    () =>
      jobs.find((job) => job.status === "in_progress") ??
      jobs.find((job) => job.status === "accepted") ??
      null,
    [jobs],
  );
  const completedCount = jobs.filter((job) => job.status === "completed").length;
  const contractedKobo = jobs.reduce(
    (sum, job) => sum + agreedAmountKobo(job),
    0,
  );
  const openRequestCount = requests.filter(
    (request) => request.status === "submitted" || request.status === "matching",
  ).length;
  const recentRequests = requests.slice(0, 3);

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>Customer board</span>
            <span>Benin City · WAT</span>
          </p>
          <h1>
            {greeting}, {firstName}
          </h1>
          <p>
            Track your bookings and milestones, follow incoming quotes and keep
            every conversation in one place.
          </p>
        </div>
        <div className="cb-actions">
          <Link className="button button-outline" href="/explore">
            <Icon name="compass" size={17} /> Explore services
          </Link>
          <Link className="button button-primary" href="/requests/new">
            <Icon name="plus" size={17} /> Post a request
          </Link>
        </div>
      </header>

      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      <div className="cb-kpi-grid" aria-label="Account summary">
        <div className="cb-kpi">
          <div className="cb-kpi-top">
            <span className="cb-kpi-label">Active bookings</span>
            <span className="cb-kpi-icon">
              <Icon name="briefcase" size={17} />
            </span>
          </div>
          <span className="cb-kpi-value">{loading ? "—" : activeJobs.length}</span>
          <span className="cb-kpi-sub">Accepted and in-progress work</span>
        </div>
        <div className="cb-kpi">
          <div className="cb-kpi-top">
            <span className="cb-kpi-label">Open requests</span>
            <span className="cb-kpi-icon pending">
              <Icon name="clipboard" size={17} />
            </span>
          </div>
          <span className="cb-kpi-value">{loading ? "—" : openRequestCount}</span>
          <span className="cb-kpi-sub">Waiting for or comparing quotes</span>
        </div>
        <div className="cb-kpi">
          <div className="cb-kpi-top">
            <span className="cb-kpi-label">Completed</span>
            <span className="cb-kpi-icon done">
              <Icon name="checkCircle" size={17} />
            </span>
          </div>
          <span className="cb-kpi-value">{loading ? "—" : completedCount}</span>
          <span className="cb-kpi-sub">Signed off and closed</span>
        </div>
        <div className="cb-kpi">
          <div className="cb-kpi-top">
            <span className="cb-kpi-label">Contracted value</span>
            <span className="cb-kpi-icon">
              <Icon name="wallet" size={17} />
            </span>
          </div>
          <span className="cb-kpi-value">
            {loading ? "—" : formatMoney(contractedKobo)}
          </span>
          <span className="cb-kpi-sub">Quote totals on your bookings</span>
        </div>
      </div>

      <div className="cb-dashboard-grid">
        <div className="cb-stack">
          <div className="cb-panel">
            <div className="cb-panel-head">
              <h2>
                {currentBooking ? "Current booking" : "Your next booking"}
              </h2>
              {currentBooking ? (
                <Status
                  label={jobStatusLabel[currentBooking.status]}
                  tone={jobStatusTone[currentBooking.status]}
                />
              ) : null}
            </div>

            {loading ? (
              <LoadingBlock rows={2} />
            ) : currentBooking ? (
              <div className="cb-active-booking">
                <div className="cb-booking-head">
                  <div className="cb-booking-title">
                    <h3>
                      <Link href={`/jobs/${currentBooking.id}`}>
                        {currentBooking.title}
                      </Link>
                    </h3>
                    <p>
                      {currentBooking.category} · {currentBooking.service_area} ·
                      Updated {formatWat(currentBooking.updated_at)}
                    </p>
                  </div>
                  <div className="cb-booking-price">
                    <span>Agreed value</span>
                    <strong>{formatMoney(agreedAmountKobo(currentBooking))}</strong>
                  </div>
                </div>

                <div className="cb-stepper" aria-label="Milestone progress">
                  <div className={`cb-step ${milestoneState(currentBooking, "deposit")}`}>
                    <span className="cb-step-dot">
                      {milestoneState(currentBooking, "deposit") === "done" ? "✓" : "1"}
                    </span>
                    <span className="cb-step-copy">
                      <strong>Mobilisation deposit</strong>
                      <span>{formatMoney(depositKobo(currentBooking))} · 50%</span>
                    </span>
                  </div>
                  <div className={`cb-step ${milestoneState(currentBooking, "work")}`}>
                    <span className="cb-step-dot">
                      {milestoneState(currentBooking, "work") === "done" ? "✓" : "2"}
                    </span>
                    <span className="cb-step-copy">
                      <strong>Work in progress</strong>
                      <span>Progress notes and site updates</span>
                    </span>
                  </div>
                  <div className={`cb-step ${milestoneState(currentBooking, "signoff")}`}>
                    <span className="cb-step-dot">
                      {milestoneState(currentBooking, "signoff") === "done" ? "✓" : "3"}
                    </span>
                    <span className="cb-step-copy">
                      <strong>Sign-off &amp; balance</strong>
                      <span>{formatMoney(balanceKobo(currentBooking))} · 50%</span>
                    </span>
                  </div>
                </div>

                <div className="cb-actions">
                  <Link
                    className="button button-primary"
                    href={`/jobs/${currentBooking.id}`}
                  >
                    Open booking
                  </Link>
                  <Link
                    className="button button-outline"
                    href={`/jobs/${currentBooking.id}/progress`}
                  >
                    Track progress
                  </Link>
                  <Link
                    className="button button-subtle"
                    href={`/jobs/${currentBooking.id}/signoff`}
                  >
                    Review &amp; sign off
                  </Link>
                </div>
              </div>
            ) : (
              <div className="cb-empty">
                <span className="cb-empty-icon">
                  <Icon name="briefcase" size={22} />
                </span>
                <h3>No active booking yet</h3>
                <p>
                  Accept an artisan quote to start a booking. You can explore
                  trades or post a new request to begin collecting quotes.
                </p>
                <div className="cb-inline-actions">
                  <Link className="button button-outline" href="/explore">
                    Explore services
                  </Link>
                  <Link className="button button-primary" href="/requests/new">
                    Post a request
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="cb-panel" id="activity">
            <div className="cb-panel-head">
              <h2>Recent requests</h2>
              <Link className="cb-section-link" href="/requests">
                View all requests <Icon name="arrow" size={15} />
              </Link>
            </div>

            {loading ? (
              <LoadingBlock rows={2} />
            ) : recentRequests.length === 0 ? (
              <div className="cb-empty">
                <span className="cb-empty-icon">
                  <Icon name="clipboard" size={22} />
                </span>
                <h3>No requests yet</h3>
                <p>
                  Describe the work you need and local artisans will send
                  itemised quotes for you to compare.
                </p>
                <div className="cb-inline-actions">
                  <Link className="button button-primary" href="/requests/new">
                    Create your first request
                  </Link>
                </div>
              </div>
            ) : (
              <div className="cb-list">
                {recentRequests.map((request) => (
                  <div className="cb-row" key={request.id}>
                    <div className="cb-row-main">
                      <strong>
                        <Link href={`/requests/${request.id}`}>
                          {request.title}
                        </Link>
                      </strong>
                      <span>
                        {request.category} · {request.service_area} ·{" "}
                        {formatMoney(request.budget_guidance_kobo)} guidance
                      </span>
                    </div>
                    <div className="cb-row-side">
                      <Status
                        label={requestStatusLabel[request.status]}
                        tone={requestStatusTone[request.status]}
                      />
                      <Icon name="next" size={15} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cb-stack">
          <div className="cb-panel">
            <div className="cb-panel-head">
              <h2>Quick actions</h2>
            </div>
            <div className="cb-quick-grid">
              <Link className="cb-quick-link" href="/explore">
                <Icon name="compass" size={18} />
                <span>
                  <strong>Explore services</strong>
                  <small>Find a trade to book</small>
                </span>
              </Link>
              <Link className="cb-quick-link" href="/jobs">
                <Icon name="briefcase" size={18} />
                <span>
                  <strong>My bookings</strong>
                  <small>Track milestones</small>
                </span>
              </Link>
              <Link className="cb-quick-link" href="/reviews">
                <Icon name="star" size={18} />
                <span>
                  <strong>Reviews &amp; ratings</strong>
                  <small>Rate completed work</small>
                </span>
              </Link>
              <Link className="cb-quick-link" href="/payments">
                <Icon name="receipt" size={18} />
                <span>
                  <strong>Payments</strong>
                  <small>Test-mode records</small>
                </span>
              </Link>
            </div>
          </div>

          <div className="cb-support-card">
            <h3>Need a hand?</h3>
            <p>
              Browse booking answers or send a message. Support messages are not
              delivered to a live inbox yet.
            </p>
            <Link className="button button-outline" href="/support">
              <Icon name="lifeBuoy" size={16} /> Visit support
            </Link>
          </div>

          <div className="cb-panel">
            <div className="cb-panel-head">
              <h2>Recommended trades</h2>
              <span className="cb-panel-note">Sample directory</span>
            </div>
            <div className="cb-list">
              {featuredArtisans.map((artisan) => (
                <div className="cb-row" key={artisan.id}>
                  <div className="cb-row-main">
                    <strong>{artisan.headline}</strong>
                    <span>
                      {artisan.area} · from {formatNaira(artisan.startingPriceKobo)}
                    </span>
                  </div>
                  <Link
                    className="cb-section-link"
                    href={`/requests/new?category=${encodeURIComponent(
                      tradeRequestLabels[artisan.category],
                    )}`}
                  >
                    Request <Icon name="arrow" size={14} />
                  </Link>
                </div>
              ))}
            </div>
            <p className="cb-footnote" style={{ marginTop: 12 }}>
              Sample profiles are fictional demonstration records, not verified
              artisans.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Explore services (/explore)
// ============================================================================
const tradesById = new Map(exploreTrades.map((trade) => [trade.id, trade]));

function matchTrade(value: string | undefined): CategoryId | "" {
  if (!value) return "";
  const normalized = value.trim().toLowerCase();
  const match = exploreTrades.find(
    (trade) =>
      trade.id === normalized ||
      trade.short.toLowerCase() === normalized ||
      trade.name.toLowerCase() === normalized ||
      trade.requestLabel.toLowerCase() === normalized,
  );
  return (match?.id as CategoryId | undefined) ?? "";
}

export function ExploreServicesScreen({ initialTrade = "" }: { initialTrade?: string }) {
  const [query, setQuery] = useState("");
  const [trade, setTrade] = useState<CategoryId | "">(matchTrade(initialTrade));
  const [area, setArea] = useState<Area | "">("");
  const [sort, setSort] = useState<SearchFilters["sort"]>("recommended");
  const [page, setPage] = useState(1);

  const filters: SearchFilters = {
    q: query,
    category: trade,
    area,
    rating: 0,
    sort,
    page,
    view: "grid",
  };

  const result = useMemo(
    () => searchArtisans(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, trade, area, sort, page],
  );

  const activeTrade = trade ? tradesById.get(trade) : undefined;

  const update = (change: () => void) => {
    change();
    setPage(1);
  };

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>Explore services</span>
            <span>Benin City coverage</span>
          </p>
          <h1>Find the right trade for the job</h1>
          <p>
            Browse trades and sample artisan profiles, then post a request so
            artisans can send you itemised quotes.
          </p>
        </div>
        <div className="cb-actions">
          <Link className="button button-outline" href="/categories">
            Full directory
          </Link>
          <Link className="button button-primary" href="/requests/new">
            <Icon name="plus" size={17} /> Post a request
          </Link>
        </div>
      </header>

      <div className="cb-search-panel">
        <div className="cb-search-bar">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            placeholder="Search a trade, service or artisan (e.g. plumber, wiring)"
            aria-label="Search trades and sample artisans"
            onChange={(event) => update(() => setQuery(event.target.value))}
          />
          {query ? (
            <button
              type="button"
              className="cb-search-clear"
              aria-label="Clear search"
              onClick={() => update(() => setQuery(""))}
            >
              <Icon name="x" size={15} />
            </button>
          ) : null}
        </div>

        <div className="cb-filter-row">
          <button
            type="button"
            className="cb-chip"
            aria-pressed={trade === ""}
            onClick={() => update(() => setTrade(""))}
          >
            All trades
          </button>
          <label className="cb-select">
            <span className="cb-visually-hidden">Filter by area</span>
            <select
              value={area}
              aria-label="Filter by area"
              onChange={(event) =>
                update(() => setArea(event.target.value as Area | ""))
              }
              style={{ border: 0, padding: 0, minHeight: 0, background: "transparent" }}
            >
              <option value="">All areas</option>
              {areas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="cb-select">
            <span className="cb-visually-hidden">Sort results</span>
            <select
              value={sort}
              aria-label="Sort results"
              onChange={(event) =>
                update(() => setSort(event.target.value as SearchFilters["sort"]))
              }
              style={{ border: 0, padding: 0, minHeight: 0, background: "transparent" }}
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
          {activeTrade ? (
            <button
              type="button"
              className="cb-chip"
              aria-pressed="true"
              onClick={() => update(() => setTrade(""))}
            >
              {activeTrade.short} <Icon name="x" size={13} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="cb-trade-grid">
        {exploreTrades.map((item) => (
          <button
            key={item.id}
            type="button"
            className="cb-trade-card"
            data-selected={trade === item.id ? "true" : undefined}
            aria-pressed={trade === item.id}
            onClick={() =>
              update(() => setTrade(trade === item.id ? "" : (item.id as CategoryId)))
            }
          >
            <span className="cb-trade-icon">
              <Icon name={item.icon} size={19} />
            </span>
            <span className="cb-trade-copy">
              <strong>{item.name}</strong>
              <span>{item.description}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="cb-result-head">
        <h2>
          {activeTrade ? `${activeTrade.short} profiles` : "Sample artisan profiles"}
        </h2>
        <p>
          {result.total} {result.total === 1 ? "profile" : "profiles"} ·{" "}
          {area || "all areas"}
        </p>
      </div>

      <div className="cb-disclosure">
        <Icon name="alertCircle" size={17} />
        <span>
          These directory profiles are fictional sample records used to preview
          discovery. Ratings are not persisted reviews and profiles are not
          verified artisans.
        </span>
      </div>

      {result.items.length === 0 ? (
        <div className="cb-empty">
          <span className="cb-empty-icon">
            <Icon name="search" size={22} />
          </span>
          <h3>No profiles match those filters</h3>
          <p>
            Try a different trade or area, or post a request and let artisans
            come to you.
          </p>
          <div className="cb-inline-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() =>
                update(() => {
                  setQuery("");
                  setTrade("");
                  setArea("");
                })
              }
            >
              Reset filters
            </button>
            <Link className="button button-primary" href="/requests/new">
              Post a request
            </Link>
          </div>
        </div>
      ) : (
        <div className="cb-artisan-grid">
          {result.items.map((artisan) => (
            <article className="cb-artisan-card" key={artisan.id}>
              <div className="cb-artisan-top">
                <span className="cb-avatar-sm" aria-hidden="true">
                  {artisan.initials}
                </span>
                <div>
                  <h3>{artisan.name}</h3>
                  <p>{artisan.headline}</p>
                </div>
              </div>
              <div className="cb-artisan-meta">
                <span className="cb-rating">
                  <Icon name="star" size={13} /> {artisan.rating.toFixed(1)}
                </span>
                <span>{artisan.reviewCount} sample reviews</span>
                <span>
                  <Icon name="pin" size={13} /> {artisan.area}
                </span>
              </div>
              <div className="cb-artisan-foot">
                <span className="cb-artisan-price">
                  <span>Typical starting labour</span>
                  <strong>{formatNaira(artisan.startingPriceKobo)}</strong>
                </span>
                <Link
                  className="button button-subtle"
                  href={`/requests/new?category=${encodeURIComponent(
                    tradeRequestLabels[artisan.category],
                  )}`}
                >
                  Request this trade
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {result.pages > 1 ? (
        <nav className="cb-pagination" aria-label="Directory pages">
          <button
            type="button"
            disabled={result.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          {Array.from({ length: result.pages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={result.page === pageNumber ? "page" : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={result.page >= result.pages}
            onClick={() =>
              setPage((current) => Math.min(result.pages, current + 1))
            }
          >
            Next
          </button>
        </nav>
      ) : null}
    </section>
  );
}

// ============================================================================
// My requests (/requests)
// ============================================================================
type RequestTab = "all" | CustomerRequest["status"];

const requestTabs: Array<{ id: RequestTab; label: string }> = [
  { id: "all", label: "All requests" },
  { id: "draft", label: "Drafts" },
  { id: "submitted", label: "Submitted" },
  { id: "matching", label: "Receiving quotes" },
  { id: "cancelled", label: "Cancelled" },
];

export function MyRequestsScreen() {
  const [tab, setTab] = useState<RequestTab>("all");
  const [query, setQuery] = useState("");

  const fetchRequests = useCallback(
    () =>
      customerService
        .listRequests()
        .then((requests) => ({ requests })),
    [],
  );
  const { data, loading, error, retry } = useScreenData(
    fetchRequests,
    "Could not load your requests.",
  );

  const requests = data?.requests ?? noRequests;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return requests.filter((request) => {
      if (tab !== "all" && request.status !== tab) return false;
      if (!term) return true;
      return (
        request.title.toLowerCase().includes(term) ||
        request.category.toLowerCase().includes(term) ||
        request.service_area.toLowerCase().includes(term)
      );
    });
  }, [requests, tab, query]);

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>My requests</span>
            <span>{requests.length} saved</span>
          </p>
          <h1>Requests &amp; incoming quotes</h1>
          <p>
            Every service request you have saved, with the quotes attached to it.
            Accept one quote to start a booking.
          </p>
        </div>
        <div className="cb-actions">
          <Link className="button button-primary" href="/requests/new">
            <Icon name="plus" size={17} /> New request
          </Link>
        </div>
      </header>

      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      <div className="cb-search-panel">
        <div className="cb-search-bar">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            placeholder="Search by title, trade or service area"
            aria-label="Search your requests"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              className="cb-search-clear"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <Icon name="x" size={15} />
            </button>
          ) : null}
        </div>
        <div className="cb-tabs" role="tablist" aria-label="Filter requests">
          {requestTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className="cb-tab"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingBlock rows={3} />
      ) : filtered.length === 0 ? (
        <div className="cb-empty">
          <span className="cb-empty-icon">
            <Icon name="clipboard" size={22} />
          </span>
          <h3>{requests.length === 0 ? "No requests yet" : "No requests match"}</h3>
          <p>
            {requests.length === 0
              ? "Describe the work you need so artisans can send itemised quotes."
              : "Try another tab or clear the search field to see all your requests."}
          </p>
          <div className="cb-inline-actions">
            {requests.length === 0 ? (
              <Link className="button button-primary" href="/requests/new">
                Create a request
              </Link>
            ) : (
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  setQuery("");
                  setTab("all");
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="cb-request-grid">
          {filtered.map((request) => (
            <article className="cb-request-card" key={request.id}>
              <div className="cb-request-top">
                <div>
                  <Status
                    label={requestStatusLabel[request.status]}
                    tone={requestStatusTone[request.status]}
                  />
                  <h3>
                    <Link href={`/requests/${request.id}`}>{request.title}</Link>
                  </h3>
                </div>
              </div>
              <div className="cb-request-meta">
                <span>
                  <Icon name="hammer" size={13} /> {request.category}
                </span>
                <span>
                  <Icon name="pin" size={13} /> {request.service_area}
                </span>
                <span>
                  <Icon name="clock" size={13} /> {formatWatDate(request.created_at)}
                </span>
              </div>
              <div className="cb-request-budget">
                <span>
                  Budget guidance
                  <br />
                  <strong>{formatMoney(request.budget_guidance_kobo)}</strong>
                </span>
                <div className="cb-actions">
                  <Link
                    className="button button-outline"
                    href={`/requests/${request.id}`}
                  >
                    View request
                  </Link>
                  {request.status === "submitted" || request.status === "matching" ? (
                    <Link
                      className="button button-primary"
                      href={`/requests/${request.id}/quotes`}
                    >
                      Compare quotes
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// Reviews & ratings (/reviews)
// ============================================================================
export function ReviewsHubScreen() {
  const fetchReviews = useCallback(() => customerService.reviewOverview(), []);
  const { data, loading, error, retry } = useScreenData(
    fetchReviews,
    "Could not load your reviews.",
  );

  const pending = data?.pending ?? noJobs;
  const reviewed = data?.reviewed ?? noReviewEntries;
  const averageRating = data?.averageRating ?? 0;

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>Reviews &amp; ratings</span>
            <span>After sign-off only</span>
          </p>
          <h1>Your ratings and artisan feedback</h1>
          <p>
            Reviews open once you sign off a booking as completed. Each completed
            booking accepts one rating and a short comment.
          </p>
        </div>
        <div className="cb-actions">
          <Link className="button button-outline" href="/jobs">
            View bookings
          </Link>
        </div>
      </header>

      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      <div className="cb-review-summary">
        <div className="cb-review-score">
          <strong>
            {loading ? "—" : reviewed.length ? averageRating.toFixed(1) : "0.0"}
          </strong>
          <span>average rating given</span>
        </div>
        <Stars rating={loading ? 0 : averageRating} />
        <div className="cb-review-counts">
          <div>
            <strong>{loading ? "—" : reviewed.length}</strong>
            <span>reviews submitted</span>
          </div>
          <div>
            <strong>{loading ? "—" : pending.length}</strong>
            <span>waiting for your rating</span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingBlock rows={3} />
      ) : (
        <>
          <div className="cb-panel">
            <div className="cb-panel-head">
              <h2>Waiting for your rating</h2>
              <span className="cb-panel-note">
                {pending.length === 1
                  ? "1 completed booking"
                  : `${pending.length} completed bookings`}
              </span>
            </div>
            {pending.length === 0 ? (
              <div className="cb-empty">
                <span className="cb-empty-icon">
                  <Icon name="checkCircle" size={22} />
                </span>
                <h3>You are all caught up</h3>
                <p>
                  Every completed booking has a review. New rating prompts appear
                  after you sign off the next booking.
                </p>
              </div>
            ) : (
              <div className="cb-list">
                {pending.map((job) => (
                  <div className="cb-pending-card" key={job.id}>
                    <div>
                      <strong>{job.title}</strong>
                      <span>
                        Completed booking · {job.category} ·{" "}
                        {job.service_area}
                      </span>
                    </div>
                    <div className="cb-actions">
                      <Link
                        className="button button-outline"
                        href={`/jobs/${job.id}`}
                      >
                        View booking
                      </Link>
                      <Link
                        className="button button-primary"
                        href={`/jobs/${job.id}/review`}
                      >
                        Rate experience
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cb-panel">
            <div className="cb-panel-head">
              <h2>Reviews you have submitted</h2>
              <span className="cb-panel-note">Saved against completed work</span>
            </div>
            {reviewed.length === 0 ? (
              <div className="cb-empty">
                <span className="cb-empty-icon">
                  <Icon name="star" size={22} />
                </span>
                <h3>No reviews submitted yet</h3>
                <p>
                  Completed bookings that you rate will show their stars and
                  comments here.
                </p>
                <div className="cb-inline-actions">
                  <Link className="button button-outline" href="/jobs">
                    Open my bookings
                  </Link>
                </div>
              </div>
            ) : (
              <div className="cb-list">
                {reviewed.map(({ job, review }) => (
                  <article className="cb-review-card" key={review.id}>
                    <div className="cb-review-card-head">
                      <h3>
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <Stars rating={review.rating} />
                    </div>
                    <p className="cb-review-comment">
                      {review.comment || "No written comment was added."}
                    </p>
                    <span className="cb-review-date">
                      Rated {formatWat(review.created_at)}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// ============================================================================
// Support (/support)
// ============================================================================
export function SupportScreen() {
  const [topic, setTopic] = useState(supportTopics[0]?.id ?? "booking");
  const [subject, setSubject] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SupportTicketResult | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (subject.trim().length < 5) {
      setError("Add a short subject of at least 5 characters.");
      return;
    }
    if (message.trim().length < 20) {
      setError("Describe the issue in at least 20 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await customerService.submitSupportTicket({
        topic,
        subject,
        message,
        replyEmail,
      });
      setResult(response);
      setSubject("");
      setMessage("");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not submit your message.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>Support</span>
            <span>Customer help desk</span>
          </p>
          <h1>How can we help?</h1>
          <p>
            Find answers about bookings, test-mode payments, reviews and
            disputes, or send a message about something else.
          </p>
        </div>
        <div className="cb-actions">
          <Link className="button button-outline" href="/jobs">
            Open my bookings
          </Link>
        </div>
      </header>

      <div className="cb-support-hero">
        <div className="cb-support-hero-copy">
          <h2>Start with the most common questions</h2>
          <p>
            Quotes, milestone payments, sign-off and reviews all follow the same
            booking flow. The answers below explain what is real in this build and
            what is still a demonstration.
          </p>
        </div>
        <Icon name="headset" size={40} />
      </div>

      <div className="cb-panel">
        <div className="cb-panel-head">
          <h2>Jump to a screen</h2>
        </div>
        <div className="cb-support-links">
          {supportQuickLinks.map((link) => (
            <Link className="cb-quick-link" href={link.href} key={link.href}>
              <Icon name={link.icon} size={18} />
              <span>
                <strong>{link.label}</strong>
                <small>{link.description}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="cb-support-grid">
        <div className="cb-panel">
          <div className="cb-panel-head">
            <h2>Answers</h2>
            <span className="cb-panel-note">{supportFaqs.length} topics</span>
          </div>
          <div className="cb-faq">
            {supportFaqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="cb-panel">
          <div className="cb-panel-head">
            <h2>Send a message</h2>
            <span className="cb-panel-note">Demo form</span>
          </div>

          {result ? (
            <div className="cb-success" role="status">
              <strong>Message recorded locally</strong>
              <span>Reference: {result.reference}</span>
              <span>{result.notice}</span>
              <div className="cb-inline-actions" style={{ justifyContent: "flex-start" }}>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setResult(null)}
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form className="cb-form" onSubmit={submit} noValidate>
              <label className="cb-field">
                What is this about?
                <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                  {supportTopics.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="cb-field">
                Subject
                <input
                  value={subject}
                  minLength={5}
                  maxLength={120}
                  placeholder="e.g. Question about my deposit milestone"
                  onChange={(event) => setSubject(event.target.value)}
                  required
                />
              </label>

              <label className="cb-field">
                Reply email (optional)
                <input
                  type="email"
                  value={replyEmail}
                  placeholder="you@example.com"
                  onChange={(event) => setReplyEmail(event.target.value)}
                />
                <small>
                  No email will be sent from this demo, so this is only used for
                  validation.
                </small>
              </label>

              <label className="cb-field">
                Message
                <textarea
                  value={message}
                  rows={5}
                  minLength={20}
                  maxLength={2000}
                  placeholder="Tell us what happened, what you have tried, and what you need."
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
                <span className="cb-char-count">{message.length} / 2000</span>
              </label>

              <div className="cb-disclosure">
                <Icon name="alertCircle" size={17} />
                <span>
                  Support messaging is not connected to a backend yet. Submitting
                  validates your message, then shows a demonstration reference
                  without delivering it to an inbox.
                </span>
              </div>

              {error ? (
                <p className="cb-field-error" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="cb-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submitting}
                >
                  {submitting ? "Checking message…" : "Submit message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// My bookings (/jobs)
// ============================================================================

function initialsOfName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "SW";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function bookingReference(job: CustomerJob) {
  return `#SW-${job.id.slice(0, 6).toUpperCase()}`;
}

/** Milestone money is derived from the job status: the deposit is recorded once
 * work has started and the balance only once the booking is signed off. */
function bookingMoney(job: CustomerJob) {
  const total = agreedAmountKobo(job);
  const deposit = depositKobo(job);
  const balance = balanceKobo(job);
  const paid =
    job.status === "completed" ? total : job.status === "in_progress" ? deposit : 0;

  return {
    total,
    deposit,
    balance,
    paid,
    outstanding: total - paid,
    percent: total > 0 ? Math.round((paid / total) * 100) : 0,
  };
}

type BookingFilter = "all" | JobStatus;

const bookingFilters: readonly { id: BookingFilter; label: string }[] = [
  { id: "all", label: "All bookings" },
  { id: "accepted", label: "Awaiting deposit" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

type BookingSort = "recent" | "value" | "title";

export function MyBookingsScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [sort, setSort] = useState<BookingSort>("recent");

  const fetchBookings = useCallback(
    () =>
      customerService.listJobs().then(async (rows) => ({
        jobs: rows,
        artisans: await customerService.getArtisanSummaries(
          rows.map((job) => job.worker_id),
        ),
      })),
    [],
  );
  const { data, loading, error, retry } = useScreenData(
    fetchBookings,
    "Could not load your bookings.",
  );

  const jobs = data?.jobs ?? noJobs;
  const artisans = data?.artisans ?? noArtisans;

  const counts = useMemo(
    () => ({
      inProgress: jobs.filter((job) => job.status === "in_progress").length,
      awaitingDeposit: jobs.filter((job) => job.status === "accepted").length,
      completed: jobs.filter((job) => job.status === "completed").length,
    }),
    [jobs],
  );

  const visibleJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobs
      .filter((job) => filter === "all" || job.status === filter)
      .filter((job) => {
        if (!needle) return true;
        const artisan = artisans[job.worker_id]?.name ?? "";
        return [job.title, job.category, job.service_area, artisan].some((value) =>
          value.toLowerCase().includes(needle),
        );
      })
      .sort((a, b) => {
        if (sort === "value") return agreedAmountKobo(b) - agreedAmountKobo(a);
        if (sort === "title") return a.title.localeCompare(b.title);
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });
  }, [jobs, artisans, filter, query, sort]);

  const isFiltered = filter !== "all" || query.trim().length > 0;

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>Bookings</span>
            <span>Benin City · WAT</span>
          </p>
          <h1>My bookings</h1>
          <p>
            Every accepted quote, the milestone money attached to it and how far
            the work has got. Open a booking to follow progress, sign off or
            raise an issue.
          </p>
        </div>
        <div className="cb-actions">
          <Link className="button button-outline" href="/explore">
            <Icon name="compass" size={17} /> Explore services
          </Link>
          <Link className="button button-primary" href="/requests/new">
            <Icon name="plus" size={17} /> Post a request
          </Link>
        </div>
      </header>

      <div className="cb-metric-strip" aria-label="Booking summary">
        <span className="cb-metric-pill">
          <span className="cb-metric-dot active" aria-hidden="true" />
          In progress <strong>{loading ? "—" : counts.inProgress}</strong>
        </span>
        <span className="cb-metric-pill">
          <span className="cb-metric-dot pending" aria-hidden="true" />
          Awaiting deposit <strong>{loading ? "—" : counts.awaitingDeposit}</strong>
        </span>
        <span className="cb-metric-pill">
          <span className="cb-metric-dot done" aria-hidden="true" />
          Completed <strong>{loading ? "—" : counts.completed}</strong>
        </span>
        <span className="cb-metric-pill">
          <Icon name="briefcase" size={14} />
          Total bookings <strong>{loading ? "—" : jobs.length}</strong>
        </span>
      </div>

      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      <div className="cb-search-panel">
        <div className="cb-search-bar">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            placeholder="Search by job title, trade, artisan or area"
            aria-label="Search bookings"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              className="cb-search-clear"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <Icon name="x" size={15} />
            </button>
          ) : null}
        </div>

        <div className="cb-filter-row">
          <div className="cb-tabs" role="tablist" aria-label="Filter bookings">
            {bookingFilters.map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                className="cb-tab"
                aria-selected={filter === option.id}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="cb-select">
            <span className="cb-visually-hidden">Sort bookings</span>
            <select
              value={sort}
              aria-label="Sort bookings"
              onChange={(event) => setSort(event.target.value as BookingSort)}
              style={{ border: 0, padding: 0, minHeight: 0, background: "transparent" }}
            >
              <option value="recent">Sort: most recent</option>
              <option value="value">Sort: booking value</option>
              <option value="title">Sort: title A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <LoadingBlock rows={3} />
      ) : jobs.length === 0 ? (
        <div className="cb-empty">
          <span className="cb-empty-icon">
            <Icon name="briefcase" size={22} />
          </span>
          <h3>No bookings yet</h3>
          <p>
            A booking opens as soon as you accept an artisan quote. Explore a
            trade or post a request to start receiving quotes.
          </p>
          <div className="cb-inline-actions">
            <Link className="button button-outline" href="/explore">
              Explore services
            </Link>
            <Link className="button button-primary" href="/requests/new">
              Post a request
            </Link>
          </div>
        </div>
      ) : visibleJobs.length === 0 ? (
        <div className="cb-empty">
          <span className="cb-empty-icon">
            <Icon name="search" size={22} />
          </span>
          <h3>No bookings match that filter</h3>
          <p>Try a different status, or clear the search to see every booking.</p>
          <div className="cb-inline-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="cb-booking-list">
            {visibleJobs.map((job) => {
              const money = bookingMoney(job);
              const artisan = artisans[job.worker_id] ?? null;

              return (
                <article
                  className="cb-booking-card"
                  key={job.id}
                  data-stage={job.status}
                >
                  <div className="cb-booking-card-head">
                    <div className="cb-booking-ref">
                      <Status
                        label={jobStatusLabel[job.status]}
                        tone={jobStatusTone[job.status]}
                      />
                      <span className="cb-booking-ref-code">
                        {bookingReference(job)}
                      </span>
                      <span className="cb-booking-ref-time">
                        Updated {formatWat(job.updated_at)}
                      </span>
                    </div>
                    <div className="cb-booking-value">
                      <span>Agreed value</span>
                      <strong>{formatMoney(money.total)}</strong>
                    </div>
                  </div>

                  <h3 className="cb-booking-card-title">
                    <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>

                  <div className="cb-booking-meta">
                    <span>
                      <Icon name="pin" size={14} /> {job.service_area}
                    </span>
                    <span>
                      <Icon name="hammer" size={14} /> {job.category}
                    </span>
                    <span>
                      <Icon name="clock" size={14} /> Opened{" "}
                      {formatWatDate(job.created_at)}
                    </span>
                  </div>

                  {artisan ? (
                    <div className="cb-booking-artisan">
                      <span className="cb-avatar-sm" aria-hidden="true">
                        {initialsOfName(artisan.name)}
                      </span>
                      <div className="cb-booking-artisan-copy">
                        <strong>{artisan.name}</strong>
                        <span>
                          {artisan.primary_trade ?? job.category}
                          {artisan.workshop_area
                            ? ` · ${artisan.workshop_area}`
                            : ""}
                        </span>
                      </div>
                      {artisan.reviews_count > 0 ? (
                        <span className="cb-rating">
                          <Icon name="star" size={13} />
                          {artisan.average_rating.toFixed(1)}
                          <span className="cb-rating-count">
                            ({artisan.reviews_count})
                          </span>
                        </span>
                      ) : (
                        <span className="cb-booking-artisan-note">
                          No reviews yet
                        </span>
                      )}
                    </div>
                  ) : null}

                  <div className="cb-booking-milestones">
                    <div className="cb-milestone-row">
                      <span className="cb-milestone-label">
                        <strong>Deposit</strong>
                        <span>{formatMoney(money.deposit)} · 50%</span>
                      </span>
                      <span className="cb-milestone-state">
                        {job.status === "accepted"
                          ? "Due now"
                          : job.status === "cancelled"
                            ? "Not charged"
                            : "Recorded"}
                      </span>
                    </div>
                    <div className="cb-milestone-row">
                      <span className="cb-milestone-label">
                        <strong>Completion balance</strong>
                        <span>{formatMoney(money.balance)} · 50%</span>
                      </span>
                      <span className="cb-milestone-state">
                        {job.status === "completed"
                          ? "Recorded"
                          : job.status === "in_progress"
                            ? "Due at sign-off"
                            : job.status === "cancelled"
                              ? "Not charged"
                              : "Opens after work starts"}
                      </span>
                    </div>

                    <div
                      className="cb-progress"
                      role="img"
                      aria-label={`${money.percent}% of the agreed value recorded in test mode`}
                    >
                      <div
                        className="cb-progress-bar"
                        style={{ width: `${money.percent}%` }}
                      />
                    </div>
                    <p className="cb-footnote">
                      {formatMoney(money.paid)} of {formatMoney(money.total)}{" "}
                      recorded for this booking. No card is charged.
                    </p>
                  </div>

                  <div className="cb-booking-actions">
                    {job.status === "accepted" ? (
                      <Link
                        className="button button-primary"
                        href={`/jobs/${job.id}/payments/deposit`}
                      >
                        Pay deposit <Icon name="arrow" size={15} />
                      </Link>
                    ) : null}
                    {job.status === "in_progress" ? (
                      <Link
                        className="button button-primary"
                        href={`/jobs/${job.id}/progress`}
                      >
                        Track progress <Icon name="arrow" size={15} />
                      </Link>
                    ) : null}
                    {job.status === "completed" ? (
                      <Link
                        className="button button-primary"
                        href={`/jobs/${job.id}/review`}
                      >
                        Rate &amp; review <Icon name="arrow" size={15} />
                      </Link>
                    ) : null}
                    {job.status === "cancelled" ? (
                      <Link
                        className="button button-primary"
                        href={`/requests/new?category=${encodeURIComponent(job.category)}`}
                      >
                        Book again <Icon name="arrow" size={15} />
                      </Link>
                    ) : null}

                    <Link className="button button-outline" href={`/jobs/${job.id}`}>
                      View booking
                    </Link>
                    {job.status === "completed" ? (
                      <Link
                        className="button button-subtle"
                        href={`/jobs/${job.id}/signoff`}
                      >
                        Sign-off record
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="cb-footnote">
            Showing {visibleJobs.length} of {jobs.length} bookings
            {isFiltered ? " after filtering" : ""}.
          </p>
        </>
      )}
    </section>
  );
}

// ============================================================================
// Payments & receipts (/payments)
// ============================================================================

type LedgerStatus = "confirmed" | "pending" | "void";

const ledgerStatusLabel: Record<LedgerStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  void: "Not charged",
};

const ledgerStatusTone: Record<LedgerStatus, string> = {
  confirmed: "done",
  pending: "pending",
  void: "muted",
};

interface LedgerEntry {
  id: string;
  ref: string;
  jobId: string;
  bookingRef: string;
  jobTitle: string;
  category: string;
  milestone: string;
  amountKobo: number;
  recordedAt: string;
  status: LedgerStatus;
  serviceArea: string;
  artisanName: string | null;
}

/** The ledger is derived from bookings: a deposit milestone always exists, and a
 * balance milestone only appears once work has started or the job is closed. */
function buildLedger(
  jobs: CustomerJob[],
  artisans: Record<string, ArtisanSummary>,
): LedgerEntry[] {
  const entries: LedgerEntry[] = [];

  jobs.forEach((job) => {
    const money = bookingMoney(job);
    const artisanName = artisans[job.worker_id]?.name ?? null;
    const suffix = job.id.slice(0, 6).toUpperCase();

    const depositStatus: LedgerStatus =
      job.status === "cancelled"
        ? "void"
        : job.status === "accepted"
          ? "pending"
          : "confirmed";

    entries.push({
      id: `${job.id}-deposit`,
      ref: `TST-PAY-${suffix}`,
      jobId: job.id,
      bookingRef: bookingReference(job),
      jobTitle: job.title,
      category: job.category,
      milestone: "Mobilisation deposit · 50%",
      amountKobo: money.deposit,
      recordedAt: job.updated_at,
      status: depositStatus,
      serviceArea: job.service_area,
      artisanName,
    });

    if (job.status === "in_progress" || job.status === "completed") {
      entries.push({
        id: `${job.id}-balance`,
        ref: `TST-BAL-${suffix}`,
        jobId: job.id,
        bookingRef: bookingReference(job),
        jobTitle: job.title,
        category: job.category,
        milestone: "Completion balance · 50%",
        amountKobo: money.balance,
        recordedAt: job.updated_at,
        status: job.status === "completed" ? "confirmed" : "pending",
        serviceArea: job.service_area,
        artisanName,
      });
    }
  });

  return entries.sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
}

const ledgerPageSize = 6;

export function PaymentsScreen() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | LedgerStatus>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchLedger = useCallback(
    () =>
      customerService.listJobs().then(async (rows) => ({
        jobs: rows,
        artisans: await customerService.getArtisanSummaries(
          rows.map((job) => job.worker_id),
        ),
      })),
    [],
  );
  const { data, loading, error, retry } = useScreenData(
    fetchLedger,
    "Could not load the payment ledger.",
  );

  const jobs = data?.jobs ?? noJobs;
  const artisans = data?.artisans ?? noArtisans;

  const ledger = useMemo(() => buildLedger(jobs, artisans), [jobs, artisans]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ledger
      .filter((entry) => status === "all" || entry.status === status)
      .filter((entry) => {
        if (!needle) return true;
        return [
          entry.ref,
          entry.jobTitle,
          entry.category,
          entry.milestone,
          entry.artisanName ?? "",
        ].some((value) => value.toLowerCase().includes(needle));
      });
  }, [ledger, status, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ledgerPageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (currentPage - 1) * ledgerPageSize,
    currentPage * ledgerPageSize,
  );

  const selected =
    filtered.find((entry) => entry.id === selectedId) ??
    filtered[0] ??
    null;

  const totals = useMemo(() => {
    const contracted = jobs.reduce((sum, job) => sum + agreedAmountKobo(job), 0);
    const deposits = ledger
      .filter((entry) => entry.status === "confirmed" && entry.ref.startsWith("TST-PAY"))
      .reduce((sum, entry) => sum + entry.amountKobo, 0);
    const outstanding = ledger
      .filter((entry) => entry.status === "pending")
      .reduce((sum, entry) => sum + entry.amountKobo, 0);
    return {
      contracted,
      deposits,
      outstanding,
      settled: jobs.filter((job) => job.status === "completed").length,
    };
  }, [jobs, ledger]);

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>Payments</span>
          </p>
          <h1>Payment ledger &amp; receipts</h1>
          <p>
            Milestone amounts recorded against your bookings, split into the 50%
            mobilisation deposit and the 50% completion balance.
          </p>
        </div>
        <div className="cb-actions">
          <Link className="button button-outline" href="/jobs">
            <Icon name="briefcase" size={17} /> My bookings
          </Link>
          <Link className="button button-primary" href="/support">
            <Icon name="lifeBuoy" size={17} /> Payment help
          </Link>
        </div>
      </header>

      <div className="cb-disclosure">
        <Icon name="alertCircle" size={17} />
        <span>
          Every figure below is a test-mode record derived from your booking
          quotes. No card is charged, no transfer is collected and SabiWork does
          not hold funds in escrow.
        </span>
      </div>

      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      <div className="cb-kpi-grid" aria-label="Payment summary">
        <div className="cb-kpi">
          <div className="cb-kpi-top">
            <span className="cb-kpi-label">Contracted value</span>
            <span className="cb-kpi-icon">
              <Icon name="wallet" size={17} />
            </span>
          </div>
          <span className="cb-kpi-value">
            {loading ? "—" : formatMoney(totals.contracted)}
          </span>
          <span className="cb-kpi-sub">Quote totals across your bookings</span>
        </div>
        <div className="cb-kpi">
          <div className="cb-kpi-top">
            <span className="cb-kpi-label">Deposits recorded</span>
            <span className="cb-kpi-icon done">
              <Icon name="checkCircle" size={17} />
            </span>
          </div>
          <span className="cb-kpi-value">
            {loading ? "—" : formatMoney(totals.deposits)}
          </span>
          <span className="cb-kpi-sub">First milestone, work under way</span>
        </div>
        <div className="cb-kpi">
          <div className="cb-kpi-top">
            <span className="cb-kpi-label">Still outstanding</span>
            <span className="cb-kpi-icon pending">
              <Icon name="clock" size={17} />
            </span>
          </div>
          <span className="cb-kpi-value">
            {loading ? "—" : formatMoney(totals.outstanding)}
          </span>
          <span className="cb-kpi-sub">Deposits and balances not yet confirmed</span>
        </div>
        <div className="cb-kpi">
          <div className="cb-kpi-top">
            <span className="cb-kpi-label">Settled bookings</span>
            <span className="cb-kpi-icon done">
              <Icon name="receipt" size={17} />
            </span>
          </div>
          <span className="cb-kpi-value">{loading ? "—" : totals.settled}</span>
          <span className="cb-kpi-sub">Both milestones recorded</span>
        </div>
      </div>

      {loading ? (
        <LoadingBlock rows={3} />
      ) : jobs.length === 0 ? (
        <div className="cb-empty">
          <span className="cb-empty-icon">
            <Icon name="receipt" size={22} />
          </span>
          <h3>No payment records</h3>
          <p>
            Milestone records appear once you accept an artisan quote and a
            booking opens.
          </p>
          <div className="cb-inline-actions">
            <Link className="button button-primary" href="/explore">
              Explore services
            </Link>
          </div>
        </div>
      ) : (
        <div className="cb-ledger-grid">
          <div className="cb-panel">
            <div className="cb-panel-head">
              <h2>Transaction records</h2>
              <span className="cb-panel-note">
                {filtered.length} of {ledger.length} milestones
              </span>
            </div>

            <div className="cb-ledger-tools">
              <div className="cb-search-bar">
                <Icon name="search" size={17} />
                <input
                  type="search"
                  value={query}
                  placeholder="Search reference, booking or artisan"
                  aria-label="Search payment records"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
                {query ? (
                  <button
                    type="button"
                    className="cb-search-clear"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                  >
                    <Icon name="x" size={15} />
                  </button>
                ) : null}
              </div>

              <div className="cb-filter-row">
                {(["all", "confirmed", "pending", "void"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="cb-chip"
                    aria-pressed={status === option}
                    onClick={() => {
                      setStatus(option);
                      setPage(1);
                    }}
                  >
                    {option === "all" ? "All" : ledgerStatusLabel[option]}
                  </button>
                ))}
              </div>
            </div>

            {pageRows.length === 0 ? (
              <div className="cb-empty">
                <span className="cb-empty-icon">
                  <Icon name="search" size={22} />
                </span>
                <h3>No matching records</h3>
                <p>Try a different status filter or clear the search.</p>
                <div className="cb-inline-actions">
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => {
                      setStatus("all");
                      setQuery("");
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="cb-ledger-scroll">
                <table className="cb-ledger-table">
                  <caption className="cb-visually-hidden">
                    Milestone payment records derived from your bookings
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Booking &amp; milestone</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Date (WAT)</th>
                      <th scope="col">Reference</th>
                      <th scope="col">Status</th>
                      <th scope="col">
                        <span className="cb-visually-hidden">Open</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((entry) => (
                      <tr
                        key={entry.id}
                        data-selected={selected?.id === entry.id ? "true" : undefined}
                        onClick={() => setSelectedId(entry.id)}
                      >
                        <td data-label="Booking and milestone">
                          <span className="cb-ledger-ref">{entry.bookingRef}</span>
                          <span className="cb-ledger-sub">
                            {entry.milestone}
                            {entry.artisanName ? ` · ${entry.artisanName}` : ""}
                          </span>
                        </td>
                        <td data-label="Amount">
                          <strong className="cb-ledger-amount">
                            {formatMoney(entry.amountKobo)}
                          </strong>
                        </td>
                        <td data-label="Date (WAT)">{formatWat(entry.recordedAt)}</td>
                        <td data-label="Reference">
                          <code className="cb-ledger-code">{entry.ref}</code>
                        </td>
                        <td data-label="Status">
                          <Status
                            label={ledgerStatusLabel[entry.status]}
                            tone={ledgerStatusTone[entry.status]}
                          />
                        </td>
                        <td data-label="Open">
                          <button
                            type="button"
                            className="cb-ledger-open"
                            aria-label={`Show details for ${entry.ref}`}
                            aria-pressed={selected?.id === entry.id}
                            onClick={() => setSelectedId(entry.id)}
                          >
                            <Icon name="next" size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="cb-ledger-foot">
              <span className="cb-footnote">
                Showing {pageRows.length} of {filtered.length} records
              </span>
              <div className="cb-pagination">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="cb-panel cb-receipt-panel">
            {selected ? (
              <>
                <div className="cb-receipt-head">
                  <span className="cb-receipt-label">Receipt detail</span>
                  <h2>{selected.ref}</h2>
                  <Status
                    label={ledgerStatusLabel[selected.status]}
                    tone={ledgerStatusTone[selected.status]}
                  />
                </div>

                <div className="cb-receipt-amount">
                  <span>{selected.milestone.split(" · ")[0]}</span>
                  <strong>{formatMoney(selected.amountKobo)}</strong>
                  <span className="cb-receipt-amount-note">
                    {selected.status === "confirmed"
                      ? "Recorded in test mode"
                      : selected.status === "pending"
                        ? "Awaiting milestone payment"
                        : "Booking cancelled, nothing charged"}
                  </span>
                </div>

                <dl className="cb-receipt-meta">
                  <div>
                    <dt>Booking</dt>
                    <dd>
                      <Link href={`/jobs/${selected.jobId}`}>
                        {selected.jobTitle}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt>Trade</dt>
                    <dd>{selected.category}</dd>
                  </div>
                  <div>
                    <dt>Assigned artisan</dt>
                    <dd>{selected.artisanName ?? "Not available"}</dd>
                  </div>
                  <div>
                    <dt>Service area</dt>
                    <dd>{selected.serviceArea}</dd>
                  </div>
                  <div>
                    <dt>Payment channel</dt>
                    <dd>Test mode</dd>
                  </div>
                  <div>
                    <dt>Timestamp (WAT)</dt>
                    <dd>{formatWat(selected.recordedAt)}</dd>
                  </div>
                </dl>

                <div className="cb-actions">
                  <Link
                    className="button button-outline"
                    href={`/jobs/${selected.jobId}/progress`}
                  >
                    <Icon name="trending" size={16} /> View progress
                  </Link>
                  <Link
                    className="button button-subtle"
                    href={`/payments/${selected.ref}/receipt`}
                  >
                    <Icon name="receipt" size={16} /> Open receipt
                  </Link>
                </div>

                <p className="cb-footnote">
                  Receipts are demonstration records. No downloadable document is
                  generated and no money moved.
                </p>
              </>
            ) : (
              <div className="cb-empty">
                <span className="cb-empty-icon">
                  <Icon name="receipt" size={22} />
                </span>
                <h3>Nothing selected</h3>
                <p>Pick a record from the ledger to see its details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
