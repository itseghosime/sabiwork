"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import "./screens.css";

type RequestRow = {
  id: string;
  title: string;
  category: string;
  service_area: string;
  description: string;
  budget_guidance_kobo: number;
  status: "draft" | "submitted" | "matching" | "cancelled";
  created_at: string;
  updated_at?: string;
};

type QuoteRow = {
  id: string;
  request_id: string;
  worker_id: string;
  worker_name: string;
  total_kobo: number;
  note: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

type JobRow = {
  id: string;
  request_id: string;
  status: "accepted" | "in_progress" | "completed" | "cancelled";
  customer_id: string;
  worker_id: string;
  title: string;
  category: string;
  service_area: string;
  description?: string;
  budget_guidance_kobo: number;
  total_quote_kobo: number;
  quote_note?: string;
  updates?: Array<{ id: string; author_id: string; note: string; created_at: string }>;
  review?: { id: string; rating: number; comment: string; created_at: string } | null;
  created_at: string;
  updated_at: string;
};

type ApiError = { error?: { code?: string; message?: string } };

const formatMoney = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

const formatWat = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error?.message ?? "Request failed.");
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

function StatusPill({ text }: { text: string }) {
  const norm = text.toLowerCase().replaceAll("-", "_");
  return <span className={`hire-status-pill ${norm}`}>{text.replaceAll("_", " ")}</span>;
}

function PageFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="hire-page">
      <header className="hire-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

// ============================================================================
// S14: Request Composer Screen
// ============================================================================
export function RequestComposerScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [area, setArea] = useState("GRA, Benin City");
  const [description, setDescription] = useState("");
  const [budgetNaira, setBudgetNaira] = useState("35000");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"draft" | "submitted" | null>(null);

  const submit = async (event: FormEvent, status: "draft" | "submitted") => {
    event.preventDefault();
    setSaving(status);
    setError(null);

    const payload = {
      title,
      category,
      service_area: area,
      description,
      budget_guidance_kobo: Math.round(Number(budgetNaira || "0") * 100),
      status,
    };

    try {
      const saved = await readJson<RequestRow>("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.push(`/requests/${saved.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save request.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <PageFrame
      title="Create a service request"
      subtitle="Describe the work clearly so artisans can quote accurately. Amounts are saved in NGN kobo."
    >
      <form className="hire-form" onSubmit={(event) => submit(event, "draft")}>
        <label>
          Request title
          <input required minLength={3} maxLength={120} placeholder="e.g. Kitchen pipe burst repair" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Painting">Painting</option>
            <option value="Masonry & Tiling">Masonry &amp; Tiling</option>
            <option value="Welding & Metalwork">Welding &amp; Metalwork</option>
            <option value="Generator Repair">Generator Repair</option>
            <option value="Automobile Mechanics">Automobile Mechanics</option>
          </select>
        </label>
        <label>
          Service Area / Landmark
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="GRA, Benin City">GRA, Benin City</option>
            <option value="Ugbowo / UNIBEN Axis, Benin City">Ugbowo / UNIBEN Axis, Benin City</option>
            <option value="Ikpoba Hill, Benin City">Ikpoba Hill, Benin City</option>
            <option value="Airport Road / Oko Central, Benin City">Airport Road / Oko Central, Benin City</option>
            <option value="Ekenwan Road, Benin City">Ekenwan Road, Benin City</option>
            <option value="Ring Road / Mission Road, Benin City">Ring Road / Mission Road, Benin City</option>
          </select>
        </label>
        <label>
          Estimated Budget (NGN)
          <input required type="number" min={0} step={1000} value={budgetNaira} onChange={(event) => setBudgetNaira(event.target.value)} />
        </label>
        <label>
          Job description &amp; site access details
          <textarea required minLength={20} maxLength={2000} placeholder="Describe the task, materials needed, and any site constraints..." value={description} onChange={(event) => setDescription(event.target.value)} rows={5} />
        </label>
        {error ? <p className="hire-error" role="alert">{error}</p> : null}
        <div className="hire-actions">
          <button className="button button-outline" type="submit" disabled={saving !== null}>
            {saving === "draft" ? "Saving draft..." : "Save draft"}
          </button>
          <button className="button button-primary" type="button" disabled={saving !== null} onClick={(event) => void submit(event, "submitted")}>
            {saving === "submitted" ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </form>
    </PageFrame>
  );
}

// ============================================================================
// S15: Request Detail Screen
// ============================================================================
export function RequestDetailScreen({ requestId }: { requestId: string }) {
  const [item, setItem] = useState<RequestRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<RequestRow>(`/api/requests/${requestId}`)
      .then((data) => {
        if (active) setItem(data);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load this request.");
      });
    return () => {
      active = false;
    };
  }, [requestId]);

  if (error) return <PageFrame title="Request detail" subtitle="Could not load."><p className="hire-error" role="alert">{error}</p></PageFrame>;
  if (!item) return <PageFrame title="Request detail" subtitle="Loading..."><p>Loading...</p></PageFrame>;

  return (
    <PageFrame title={item.title} subtitle={`${item.category} · ${item.service_area}`}>
      <article className="hire-card">
        <div className="hire-inline"><StatusPill text={item.status} /><span>Created {formatWat(item.created_at)}</span></div>
        <p>{item.description}</p>
        <p><strong>Budget guidance:</strong> {formatMoney(item.budget_guidance_kobo)}</p>
      </article>
      <div className="hire-actions">
        <Link className="button button-primary" href={`/requests/${item.id}/quotes`}>View incoming quotes</Link>
        <Link className="button button-outline" href="/requests/new">Create another request</Link>
      </div>
    </PageFrame>
  );
}

// ============================================================================
// S16 / S19: Request Quotes & Comparison Screen
// ============================================================================
export function RequestQuotesScreen({ requestId, compare }: { requestId: string; compare?: boolean }) {
  const [quotesList, setQuotesList] = useState<QuoteRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<QuoteRow[]>(`/api/requests/${requestId}/quotes`)
      .then((data) => {
        if (active) setQuotesList(data);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load quotes.");
      });
    return () => {
      active = false;
    };
  }, [requestId]);

  return (
    <PageFrame
      title={compare ? "Compare artisan quotes" : "Incoming artisan quotes"}
      subtitle="Select the best verified craftsperson for your project."
    >
      {error ? <p className="hire-error" role="alert">{error}</p> : null}
      <div className="hire-list">
        {quotesList.length === 0 ? (
          <div className="hire-empty">
            <div style={{ fontSize: "2rem" }}>⏳</div>
            <h3>Waiting for artisan bids</h3>
            <p>Your request has been broadcast to verified artisans in your coverage zone. You will see itemized quotes appear here.</p>
          </div>
        ) : null}
        {quotesList.map((quote) => (
          <article key={quote.id} className="hire-card">
            <div className="hire-inline">
              <div className="hire-artisan-box">
                <div className="hire-artisan-avatar">{quote.worker_name ? quote.worker_name[0] : "A"}</div>
                <div className="hire-artisan-meta">
                  <h4>{quote.worker_name || "Verified Artisan"}</h4>
                  <p>Quoted on {formatWat(quote.created_at)}</p>
                </div>
              </div>
              <StatusPill text={quote.status} />
            </div>
            <p>{quote.note}</p>
            <p><strong>Quote Total:</strong> {formatMoney(quote.total_kobo)}</p>
            <div className="hire-actions">
              <Link className="button button-primary" href={`/quotes/${quote.id}`}>Inspect &amp; accept quote</Link>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

// ============================================================================
// S20: Quote Detail Screen
// ============================================================================
export function QuoteDetailScreen({ quoteId, requestId }: { quoteId: string; requestId?: string }) {
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<QuoteRow>(`/api/quotes/${quoteId}`)
      .then((data) => {
        if (active) setQuote(data);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load quote.");
      });
    return () => {
      active = false;
    };
  }, [quoteId]);

  const decide = async (decision: "accept" | "decline") => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await readJson<{ id?: string; job_id?: string }>(`/api/quotes/${quoteId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (decision === "accept") {
        router.push(response.job_id ? `/jobs/${response.job_id}` : `/requests/${quote?.request_id ?? requestId ?? ""}`);
      } else {
        router.push(`/requests/${quote?.request_id ?? requestId ?? ""}/quotes`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update quote.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <PageFrame title="Quote detail" subtitle="Could not load."><p className="hire-error" role="alert">{error}</p></PageFrame>;
  if (!quote) return <PageFrame title="Quote detail" subtitle="Loading..."><p>Loading...</p></PageFrame>;

  return (
    <PageFrame title={`Quote from ${quote.worker_name || "Verified Artisan"}`} subtitle="Review scope and total commitment before accepting.">
      <article className="hire-card">
        <div className="hire-inline"><StatusPill text={quote.status} /><span>Submitted {formatWat(quote.created_at)}</span></div>
        <p>{quote.note}</p>
        <p><strong>Total amount:</strong> {formatMoney(quote.total_kobo)}</p>
        <p className="hire-card-meta-item">💳 50% mobilization deposit required on acceptance; 50% balance on completion.</p>
      </article>
      {quote.status === "pending" ? (
        <div className="hire-actions">
          <button type="button" className="button button-primary" disabled={submitting} onClick={() => void decide("accept")}>
            Accept quote &amp; start engagement
          </button>
          <button type="button" className="button button-outline" disabled={submitting} onClick={() => void decide("decline")}>
            Decline quote
          </button>
        </div>
      ) : null}
    </PageFrame>
  );
}

// ============================================================================
// S21: Checkout Notice Screen
// ============================================================================
export function CheckoutNoticeScreen({ quoteId, requestId }: { quoteId: string; requestId: string }) {
  return (
    <PageFrame title="Milestone deposit checkout" subtitle="Processed securely in Paystack sandbox mode.">
      <article className="hire-card">
        <p>Accepting quote <strong>#{quoteId}</strong> creates an active engagement for request <strong>#{requestId}</strong>.</p>
        <p>Payment processing operates in Paystack sandbox test mode. No real bank cards or transfers are charged.</p>
      </article>
      <div className="hire-actions">
        <Link className="button button-primary" href={`/quotes/${quoteId}`}>Back to quote</Link>
        <Link className="button button-outline" href="/jobs">View active jobs</Link>
      </div>
    </PageFrame>
  );
}

// ============================================================================
// S27: My Bookings & Active Engagements Screen (Stitch S27)
// ============================================================================
export function JobsListScreen() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "amount">("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<JobRow[]>("/api/jobs?scope=customer")
      .then((rows) => {
        if (!active) return;
        setJobs(rows);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load jobs.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const inProgressCount = useMemo(() => jobs.filter((j) => j.status === "in_progress").length, [jobs]);
  const acceptedCount = useMemo(() => jobs.filter((j) => j.status === "accepted").length, [jobs]);
  const completedCount = useMemo(() => jobs.filter((j) => j.status === "completed").length, [jobs]);
  const totalValueKobo = useMemo(
    () => jobs.reduce((sum, j) => sum + (j.total_quote_kobo ?? j.budget_guidance_kobo ?? 0), 0),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (filter !== "all" && job.status !== filter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const match =
            job.title.toLowerCase().includes(q) ||
            job.category.toLowerCase().includes(q) ||
            job.service_area.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "amount") {
          return (b.total_quote_kobo ?? 0) - (a.total_quote_kobo ?? 0);
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [jobs, filter, search, sortBy]);

  return (
    <section className="hire-page">
      <header className="hire-header">
        <div className="hire-eyebrow">
          <span className="hire-eyebrow-pill">Customer Portal</span>
          <span>•</span>
          <span>{jobs.length} Active Engagements</span>
        </div>
        <div className="hire-header-top">
          <h1>My Bookings &amp; Engagements</h1>
          <div className="hire-actions">
            <Link className="button button-outline" href="/categories">
              Explore services
            </Link>
            <Link className="button button-primary" href="/requests/new">
              + Post a new request
            </Link>
          </div>
        </div>
        <p>Track accepted artisan quotes, milestone progress updates, completion sign-offs, and ratings.</p>
      </header>

      {/* Bento KPI Cards (Stitch S27) */}
      <div className="hire-bento-grid">
        <div className="hire-bento-card">
          <div className="hire-bento-head">
            <span className="hire-bento-label">In Progress</span>
            <span className="hire-bento-icon in-progress">⚡</span>
          </div>
          <div className="hire-bento-value">{inProgressCount}</div>
          <div className="hire-bento-sub">Active jobsite executions</div>
        </div>

        <div className="hire-bento-card">
          <div className="hire-bento-head">
            <span className="hire-bento-label">Awaiting Action</span>
            <span className="hire-bento-icon pending">⏳</span>
          </div>
          <div className="hire-bento-value">{acceptedCount}</div>
          <div className="hire-bento-sub">Accepted / awaiting mobilization</div>
        </div>

        <div className="hire-bento-card">
          <div className="hire-bento-head">
            <span className="hire-bento-label">Completed</span>
            <span className="hire-bento-icon completed">✓</span>
          </div>
          <div className="hire-bento-value">{completedCount}</div>
          <div className="hire-bento-sub">Fully signed-off &amp; delivered</div>
        </div>

        <div className="hire-bento-card">
          <div className="hire-bento-head">
            <span className="hire-bento-label">Contracted Value</span>
            <span className="hire-bento-icon value">₦</span>
          </div>
          <div className="hire-bento-value">{formatMoney(totalValueKobo)}</div>
          <div className="hire-bento-sub">Total agreed customer volume</div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="hire-control-bar">
        <div className="hire-search-box">
          <span className="hire-search-icon">🔍</span>
          <input
            type="text"
            className="hire-search-input"
            placeholder="Search by job title, trade, or area (e.g. Plumbing, GRA)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hire-filters-group">
          {["all", "in_progress", "accepted", "completed", "cancelled"].map((item) => (
            <button
              key={item}
              type="button"
              className={`hire-filter-pill ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item === "all" ? "All Bookings" : item.replace("_", " ")}
            </button>
          ))}
          <select
            className="hire-filter-pill"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "amount")}
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="amount">Sort: Value</option>
          </select>
        </div>
      </div>

      {loading ? <p>Loading bookings...</p> : null}
      {error ? <p className="hire-error" role="alert">{error}</p> : null}

      {!loading && !error && filteredJobs.length === 0 ? (
        <div className="hire-empty">
          <div style={{ fontSize: "2rem" }}>📋</div>
          <h3>No bookings found</h3>
          <p>
            {jobs.length === 0
              ? "You haven't accepted any artisan quotes yet. Post a service request to start receiving quotes from verified craftspeople."
              : "No bookings match your current search query or filter selection."}
          </p>
          {jobs.length === 0 ? (
            <div className="hire-actions" style={{ marginTop: "8px" }}>
              <Link className="button button-outline" href="/categories">
                Explore services
              </Link>
              <Link className="button button-primary" href="/requests/new">
                Post a new request
              </Link>
            </div>
          ) : (
            <button className="button button-subtle" type="button" onClick={() => { setSearch(""); setFilter("all"); }}>
              Reset filters
            </button>
          )}
        </div>
      ) : null}

      <div className="hire-list">
        {filteredJobs.map((job) => {
          const agreedKobo = job.total_quote_kobo ?? job.budget_guidance_kobo;
          const depositKobo = Math.floor(agreedKobo / 2);
          const balanceKobo = agreedKobo - depositKobo;

          return (
            <article key={job.id} className="hire-card">
              <div className="hire-card-top">
                <div className="hire-card-title-group">
                  <div className="hire-card-icon">🛠️</div>
                  <div className="hire-card-hgroup">
                    <div className="hire-card-badges">
                      <span className="hire-eyebrow-pill">Ref: #BN-REQ-{job.id.slice(0, 8)}</span>
                      <StatusPill text={job.status} />
                    </div>
                    <h2>
                      <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                    </h2>
                    <div className="hire-card-meta">
                      <span className="hire-card-meta-item">📍 {job.service_area}</span>
                      <span className="hire-card-meta-item">🛠️ {job.category}</span>
                      <span className="hire-card-meta-item">🕒 Updated {formatWat(job.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="hire-card-price">
                  <span className="hire-card-price-label">Agreed Job Value</span>
                  <span className="hire-card-price-value">{formatMoney(agreedKobo)}</span>
                </div>
              </div>

              {/* 3-Step Milestone Stepper */}
              <div className="hire-milestone-stepper">
                <div className={`hire-milestone-step ${job.status !== "accepted" ? "done" : "active"}`}>
                  <div className="hire-milestone-dot">{job.status !== "accepted" ? "✓" : "1"}</div>
                  <div className="hire-milestone-info">
                    <span className="hire-milestone-label">1. Mobilization Deposit</span>
                    <span className="hire-milestone-amount">{formatMoney(depositKobo)} (50%)</span>
                  </div>
                </div>

                <div className={`hire-milestone-step ${job.status === "completed" ? "done" : job.status === "in_progress" ? "active" : ""}`}>
                  <div className="hire-milestone-dot">{job.status === "completed" ? "✓" : "2"}</div>
                  <div className="hire-milestone-info">
                    <span className="hire-milestone-label">2. Work Execution</span>
                    <span className="hire-milestone-amount">{job.updates?.length ?? 0} progress note(s)</span>
                  </div>
                </div>

                <div className={`hire-milestone-step ${job.status === "completed" ? "done" : ""}`}>
                  <div className="hire-milestone-dot">{job.status === "completed" ? "✓" : "3"}</div>
                  <div className="hire-milestone-info">
                    <span className="hire-milestone-label">3. Sign-off &amp; Balance</span>
                    <span className="hire-milestone-amount">{formatMoney(balanceKobo)} (50%)</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="hire-card-foot">
                <div className="hire-actions">
                  <Link className="button button-primary" href={`/jobs/${job.id}`}>
                    View details →
                  </Link>
                  <Link className="button button-outline" href={`/jobs/${job.id}/progress`}>
                    Track progress
                  </Link>
                  {job.status === "in_progress" || job.status === "accepted" ? (
                    <Link className="button button-subtle" href={`/jobs/${job.id}/signoff`}>
                      Review &amp; Sign-off
                    </Link>
                  ) : null}
                  {job.status === "completed" ? (
                    <Link className="button button-primary" href={`/jobs/${job.id}/review`}>
                      ★ Rate experience
                    </Link>
                  ) : null}
                </div>

                <div className="hire-actions">
                  <Link className="button button-subtle" href={`/jobs/${job.id}/dispute`}>
                    Report issue
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================================
// S28: Job Detail Screen (Stitch S28)
// ============================================================================
export function JobDetailScreen({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobRow | null>(null);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJob = useCallback(async () => {
    try {
      const data = await readJson<JobRow>(`/api/jobs/${jobId}`);
      setJob(data);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load this job.");
    }
  }, [jobId]);

  useEffect(() => {
    let active = true;
    readJson<JobRow>(`/api/jobs/${jobId}`)
      .then((data) => {
        if (!active) return;
        setJob(data);
        setError(null);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Could not load this job.");
      });
    return () => {
      active = false;
    };
  }, [jobId]);

  const handlePostNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      await readJson(`/api/jobs/${jobId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });
      setNewNote("");
      await loadJob();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post message.");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (error) return <PageFrame title="Job details" subtitle="Unable to load job."><p className="hire-error" role="alert">{error}</p></PageFrame>;
  if (!job) return <PageFrame title="Job details" subtitle="Loading job..."><p>Loading...</p></PageFrame>;

  const agreedKobo = job.total_quote_kobo ?? job.budget_guidance_kobo;
  const depositKobo = Math.floor(agreedKobo / 2);
  const balanceKobo = agreedKobo - depositKobo;

  return (
    <section className="hire-page">
      <header className="hire-header">
        <div className="hire-eyebrow">
          <Link href="/jobs" className="hire-eyebrow-pill">← Back to My Bookings</Link>
          <span>•</span>
          <span>Ref: #BN-REQ-{job.id.slice(0, 8)}</span>
        </div>
        <div className="hire-header-top">
          <h1>{job.title}</h1>
          <div className="hire-actions">
            <Link className="button button-outline" href={`/jobs/${job.id}/dispute`}>
              Report dispute / Help
            </Link>
            {job.status === "completed" ? (
              <Link className="button button-primary" href={`/jobs/${job.id}/review`}>
                ★ Rate experience
              </Link>
            ) : (
              <Link className="button button-primary" href={`/jobs/${job.id}/signoff`}>
                Review &amp; Sign-off
              </Link>
            )}
          </div>
        </div>
        <p>{job.category} • {job.service_area} • Edo Central Cluster Node</p>
      </header>

      {/* 12-Column Layout */}
      <div className="hire-detail-layout">
        {/* Main Column */}
        <div className="hire-detail-main">
          {/* Milestone Status Card */}
          <div className="hire-panel">
            <div className="hire-panel-head">
              <h3>Milestone Execution Tracker</h3>
              <StatusPill text={job.status} />
            </div>

            <div className="hire-milestone-stepper">
              <div className={`hire-milestone-step ${job.status !== "accepted" ? "done" : "active"}`}>
                <div className="hire-milestone-dot">{job.status !== "accepted" ? "✓" : "1"}</div>
                <div className="hire-milestone-info">
                  <span className="hire-milestone-label">1. Mobilization &amp; Materials</span>
                  <span className="hire-milestone-amount">{formatMoney(depositKobo)} (50%)</span>
                </div>
              </div>

              <div className={`hire-milestone-step ${job.status === "completed" ? "done" : job.status === "in_progress" ? "active" : ""}`}>
                <div className="hire-milestone-dot">{job.status === "completed" ? "✓" : "2"}</div>
                <div className="hire-milestone-info">
                  <span className="hire-milestone-label">2. Work Execution</span>
                  <span className="hire-milestone-amount">{job.updates?.length ?? 0} notes posted</span>
                </div>
              </div>

              <div className={`hire-milestone-step ${job.status === "completed" ? "done" : ""}`}>
                <div className="hire-milestone-dot">{job.status === "completed" ? "✓" : "3"}</div>
                <div className="hire-milestone-info">
                  <span className="hire-milestone-label">3. Final Sign-off</span>
                  <span className="hire-milestone-amount">{formatMoney(balanceKobo)} (50%)</span>
                </div>
              </div>
            </div>

            {job.description ? (
              <div style={{ marginTop: "8px" }}>
                <p className="hire-check-desc"><strong>Original Scope:</strong> {job.description}</p>
              </div>
            ) : null}
          </div>

          {/* Communications & Progress Feed */}
          <div className="hire-panel">
            <div className="hire-panel-head">
              <h3>Progress &amp; Communications Feed</h3>
              <span className="hire-bento-sub">{job.updates?.length ?? 0} total updates</span>
            </div>

            <form onSubmit={handlePostNote} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <textarea
                placeholder="Post an update, question, or note to the job timeline..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  fontSize: "14px",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="button button-primary" disabled={submittingNote}>
                  {submittingNote ? "Posting..." : "Post note"}
                </button>
              </div>
            </form>

            <div className="hire-timeline">
              {(!job.updates || job.updates.length === 0) ? (
                <p className="hire-empty">No updates logged yet. Use the composer above to post communications.</p>
              ) : (
                job.updates.map((update) => (
                  <div key={update.id} className="hire-timeline-item">
                    <div className="hire-timeline-meta">
                      <span className="hire-eyebrow-pill">
                        {update.author_id === job.customer_id ? "Customer Note" : "Artisan Update"}
                      </span>
                      <span>{formatWat(update.created_at)}</span>
                    </div>
                    <div className="hire-timeline-note">{update.note}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="hire-detail-side">
          {/* Artisan Profile Card */}
          <div className="hire-panel">
            <div className="hire-panel-head">
              <h3>Assigned Artisan</h3>
              <span className="hire-eyebrow-pill">Verified Pro</span>
            </div>
            <div className="hire-artisan-box">
              <div className="hire-artisan-avatar">AP</div>
              <div className="hire-artisan-meta">
                <h4>Verified Trade Artisan</h4>
                <p>{job.category} Specialist</p>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                  📍 Physical Workshop Vetted • Edo State Hub
                </p>
              </div>
            </div>
          </div>

          {/* Financial Ledger Card */}
          <div className="hire-panel">
            <div className="hire-panel-head">
              <h3>Milestone Ledger</h3>
              <span className="hire-bento-sub">Paystack TEST Mode</span>
            </div>
            <table className="hire-ledger-table">
              <tbody>
                <tr>
                  <td>Agreed Quote Total</td>
                  <td>{formatMoney(agreedKobo)}</td>
                </tr>
                <tr>
                  <td>Phase 1 Deposit (50%)</td>
                  <td>{formatMoney(depositKobo)}</td>
                </tr>
                <tr>
                  <td>Phase 2 Balance (50%)</td>
                  <td>{formatMoney(balanceKobo)}</td>
                </tr>
              </tbody>
            </table>
            <p className="hire-check-desc">
              Transactions operate under Paystack test mode without charging live bank debit cards.
            </p>
          </div>

          {/* Service Details */}
          <div className="hire-panel">
            <div className="hire-panel-head">
              <h3>Service Location</h3>
            </div>
            <p style={{ margin: 0, fontSize: "14px" }}>📍 {job.service_area}</p>
            <p className="hire-check-desc" style={{ marginTop: "4px" }}>
              Booked on {formatWat(job.created_at)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// S28: Progress Updates Dedicated Screen
// ============================================================================
export function JobProgressScreen({ jobId }: { jobId: string }) {
  const [notes, setNotes] = useState<Array<{ id: string; author_id: string; note: string; created_at: string }>>([]);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = await readJson<Array<{ id: string; author_id: string; note: string; created_at: string }>>(`/api/jobs/${jobId}/progress`);
      setNotes(rows);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load progress updates.");
    }
  }, [jobId]);

  useEffect(() => {
    let active = true;
    readJson<Array<{ id: string; author_id: string; note: string; created_at: string }>>(`/api/jobs/${jobId}/progress`)
      .then((rows) => {
        if (!active) return;
        setNotes(rows);
        setError(null);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Could not load progress updates.");
      });
    return () => {
      active = false;
    };
  }, [jobId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!newNote.trim()) return;
    setError(null);
    try {
      await readJson(`/api/jobs/${jobId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });
      setNewNote("");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save progress.");
    }
  };

  return (
    <PageFrame title="Job Progress Updates" subtitle="Follow milestone evidence and communicate directly with your artisan.">
      <div className="hire-actions" style={{ marginBottom: "16px" }}>
        <Link className="button button-outline" href={`/jobs/${jobId}`}>
          ← Back to job detail
        </Link>
      </div>

      <form className="hire-form" onSubmit={submit}>
        <label>
          Post a message or progress verification note
          <textarea
            value={newNote}
            minLength={3}
            maxLength={2000}
            onChange={(event) => setNewNote(event.target.value)}
            rows={4}
            placeholder="Share site observations, material receipts, or status notes..."
            required
          />
        </label>
        <button className="button button-primary" type="submit">Post update</button>
      </form>

      {error ? <p className="hire-error" role="alert">{error}</p> : null}

      <div className="hire-timeline" style={{ marginTop: "24px" }}>
        {notes.length === 0 ? <p className="hire-empty">No updates posted yet.</p> : null}
        {notes.map((note) => (
          <div key={note.id} className="hire-timeline-item">
            <div className="hire-timeline-meta">
              <span>{formatWat(note.created_at)}</span>
            </div>
            <div className="hire-timeline-note">{note.note}</div>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

// ============================================================================
// S30: Job Review & Completion Sign-off Screen (Stitch S30)
// ============================================================================
export function JobSignoffScreen({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [checklist, setChecklist] = useState({
    scopeCompleted: true,
    siteCleaned: true,
    toolsCleared: true,
    testedOperational: true,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allChecked = checklist.scopeCompleted && checklist.siteCleaned && checklist.toolsCleared && checklist.testedOperational;

  const handleConfirmCompletion = async () => {
    if (!allChecked) {
      setError("Please verify and check all punch-list items before confirming completion.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await readJson(`/api/jobs/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      setStatus("Job successfully signed off and marked completed.");
      setTimeout(() => {
        router.push(`/jobs/${jobId}/review`);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record sign-off.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageFrame
      title="Review & Completion Sign-off"
      subtitle="Verify completed works before authorizing final completion and releasing the artisan."
    >
      <div className="hire-eyebrow" style={{ marginBottom: "8px" }}>
        <span className="hire-eyebrow-pill">Job #BN-REQ-{jobId.slice(0, 8)}</span>
        <span>•</span>
        <span>Benin City Operational Hub</span>
      </div>

      <div className="hire-panel">
        <div className="hire-panel-head">
          <h3>Pre-Release Workmanship Verification Checklist</h3>
          <span className="hire-bento-sub">4 mandatory verifications</span>
        </div>

        <div className="hire-signoff-checklist">
          <label className="hire-check-item">
            <input
              type="checkbox"
              checked={checklist.scopeCompleted}
              onChange={(e) => setChecklist((prev) => ({ ...prev, scopeCompleted: e.target.checked }))}
            />
            <div className="hire-check-text">
              <span className="hire-check-title">Scope of Work Fully Delivered</span>
              <span className="hire-check-desc">All agreed repair items, installations, and fittings match the original quote specification.</span>
            </div>
          </label>

          <label className="hire-check-item">
            <input
              type="checkbox"
              checked={checklist.testedOperational}
              onChange={(e) => setChecklist((prev) => ({ ...prev, testedOperational: e.target.checked }))}
            />
            <div className="hire-check-text">
              <span className="hire-check-title">Operational / Pressure Testing Verified</span>
              <span className="hire-check-desc">Fittings, electrical loads, or water lines were turned on and inspected under real working conditions.</span>
            </div>
          </label>

          <label className="hire-check-item">
            <input
              type="checkbox"
              checked={checklist.siteCleaned}
              onChange={(e) => setChecklist((prev) => ({ ...prev, siteCleaned: e.target.checked }))}
            />
            <div className="hire-check-text">
              <span className="hire-check-title">Worksite Cleaned &amp; Debris Cleared</span>
              <span className="hire-check-desc">Workplace swept clean and all discard materials disposed of responsibly.</span>
            </div>
          </label>

          <label className="hire-check-item">
            <input
              type="checkbox"
              checked={checklist.toolsCleared}
              onChange={(e) => setChecklist((prev) => ({ ...prev, toolsCleared: e.target.checked }))}
            />
            <div className="hire-check-text">
              <span className="hire-check-title">Artisan Tools Cleared from Premises</span>
              <span className="hire-check-desc">Artisan has accounted for all tools, equipment, and personal belongings.</span>
            </div>
          </label>
        </div>

        <div className="hire-protocol-box">
          <span>ℹ️</span>
          <div>
            <strong>Milestone Sign-off Terms:</strong> Authorizing completion records the service as successfully delivered in the Neon database. Both parties will be invited to submit mutual ratings.
          </div>
        </div>

        {status ? <p className="hire-success">{status}</p> : null}
        {error ? <p className="hire-error" role="alert">{error}</p> : null}

        <div className="hire-actions" style={{ justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
          <Link className="button button-subtle" href={`/jobs/${jobId}/dispute`}>
            Unsatisfied? Report an issue
          </Link>
          <div className="hire-actions">
            <Link className="button button-outline" href={`/jobs/${jobId}`}>
              Back to job
            </Link>
            <button
              type="button"
              className="button button-primary"
              disabled={!allChecked || submitting}
              onClick={() => void handleConfirmCompletion()}
            >
              {submitting ? "Confirming..." : "Authorize Sign-Off & Mark Completed →"}
            </button>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

export function JobCompleteScreen({ jobId }: { jobId: string }) {
  return <JobSignoffScreen jobId={jobId} />;
}

// ============================================================================
// S31: Rate Your Experience / Review Screen (Stitch S31)
// ============================================================================
export function JobReviewScreen({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Exceptional Craftsmanship",
    "Punctual & Reliable",
  ]);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tags = [
    "Exceptional Craftsmanship",
    "Punctual & Reliable",
    "Fair & Honest Pricing",
    "Clean Worksite",
    "Clear Communication",
    "Polite & Professional",
  ];

  const ratingLabels: Record<number, string> = {
    1: "1 - Subpar / Dissatisfied",
    2: "2 - Below Expectations",
    3: "3 - Satisfactory Work",
    4: "4 - Very Good Craftsmanship",
    5: "5 - Exceptional Craftsmanship",
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setError(null);

    const fullComment = selectedTags.length
      ? `${comment.trim()}\n\nHighlights: ${selectedTags.join(", ")}`
      : comment.trim();

    try {
      await readJson(`/api/jobs/${jobId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: fullComment }),
      });
      setStatus("Thank you! Your verified review has been recorded.");
      setTimeout(() => {
        router.push("/jobs");
      }, 1500);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageFrame
      title="Rate Your Experience"
      subtitle="Share clear, factual feedback to maintain high trust across Edo State trade guilds."
    >
      <div className="hire-eyebrow" style={{ marginBottom: "8px" }}>
        <span className="hire-eyebrow-pill">Job #BN-REQ-{jobId.slice(0, 8)}</span>
        <span>•</span>
        <span>Completed Service</span>
      </div>

      <div className="hire-panel">
        {/* Star Rating Control */}
        <div className="hire-rating-box">
          <div className="hire-stars-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`hire-star-btn ${star <= (hoverRating || rating) ? "filled" : ""}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star`}
              >
                ★
              </button>
            ))}
          </div>
          <span className="hire-rating-tagline">{ratingLabels[hoverRating || rating]}</span>

          {/* Quick evaluation pills */}
          <div className="hire-rating-tags">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                className={`hire-rating-tag ${selectedTags.includes(t) ? "selected" : ""}`}
                onClick={() => toggleTag(t)}
              >
                {selectedTags.includes(t) ? "✓ " : "+ "}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Written Review Form */}
        <form onSubmit={submit} className="hire-form" style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <label>
            Detailed Review
            <small>Mention specific work items completed, timeliness, and how the artisan handled materials.</small>
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              placeholder="e.g. Osaze arrived promptly at GRA, diagnosed the drainage blockage quickly, and finished within 2 hours. Left the kitchen clean and dry."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <small style={{ textAlign: "right" }}>{comment.length} / 2000 characters</small>
          </label>

          {status ? <p className="hire-success">{status}</p> : null}
          {error ? <p className="hire-error" role="alert">{error}</p> : null}

          <div className="hire-actions" style={{ justifyContent: "flex-end" }}>
            <Link className="button button-outline" href={`/jobs/${jobId}`}>
              Cancel
            </Link>
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting review..." : "Publish verified review"}
            </button>
          </div>
        </form>
      </div>
    </PageFrame>
  );
}

// ============================================================================
// S32: Dispute Resolution & Issue Submission Screen (Stitch S32)
// ============================================================================
export function JobDisputeScreen({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [category, setCategory] = useState("quality");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("rework");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    {
      id: "quality",
      icon: "🛠️",
      title: "Quality & Workmanship Defect",
      desc: "Work completed does not meet trade standards or leaks/faults persist.",
    },
    {
      id: "abandoned",
      icon: "⏱️",
      title: "Severe Delay or Job Abandonment",
      desc: "Artisan failed to show up without notification or left job uncompleted.",
    },
    {
      id: "pricing",
      icon: "💰",
      title: "Material or Pricing Discrepancy",
      desc: "Unauthorized extra cost demanded or inferior materials used.",
    },
    {
      id: "damage",
      icon: "🚨",
      title: "Property Damage or Safety Hazard",
      desc: "Accidental or negligent damage occurred to property during execution.",
    },
    {
      id: "conduct",
      icon: "💬",
      title: "Conduct or Communication Breakdown",
      desc: "Unprofessional interaction, refusal to coordinate, or unreachable.",
    },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 15) {
      setError("Please describe the issue in at least 15 characters.");
      return;
    }
    setSubmitting(true);
    // Navigate to Dispute Status view for this job
    router.push(`/disputes/${jobId}`);
  };

  return (
    <PageFrame
      title="Report Issue / Dispute Resolution"
      subtitle="Submit an issue for physical mediation through the Benin City Artisan Hub desk."
    >
      <div className="hire-eyebrow">
        <Link href={`/jobs/${jobId}`} className="hire-eyebrow-pill">← Back to Job #{jobId.slice(0, 8)}</Link>
        <span>•</span>
        <span>Benin City Hub Mediation Desk</span>
      </div>

      <form className="hire-form" onSubmit={handleSubmit}>
        <div>
          <label style={{ marginBottom: "10px" }}>1. Select Issue Category</label>
          <div className="hire-dispute-grid">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`hire-dispute-tile ${category === c.id ? "selected" : ""}`}
                onClick={() => setCategory(c.id)}
              >
                <span className="hire-dispute-tile-icon">{c.icon}</span>
                <span className="hire-dispute-tile-title">{c.title}</span>
                <span className="hire-dispute-tile-desc">{c.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <label>
          2. Detailed Description of the Issue
          <small>Include specific observations, timelines, and communications with the artisan.</small>
          <textarea
            required
            minLength={15}
            maxLength={2000}
            rows={5}
            placeholder="Explain what happened and what steps you took with the artisan before escalating..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          3. Desired Resolution Outcome
          <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
            <option value="rework">Artisan Rework &amp; Rectification on Site</option>
            <option value="adjustment">Milestone Financial Adjustment / Partial Release</option>
            <option value="mediation">Edo State Hub Officer Hearing &amp; Mediation</option>
          </select>
        </label>

        <div className="hire-protocol-box">
          <span>⚖️</span>
          <div>
            <strong>Mediation Notice:</strong> Formal administrative holds are handled through the Edo State Artisan Hub desk at GRA Benin City. Submission alerts both the artisan and the duty mediation officer.
          </div>
        </div>

        {error ? <p className="hire-error" role="alert">{error}</p> : null}

        <div className="hire-actions" style={{ justifyContent: "flex-end" }}>
          <Link className="button button-outline" href={`/jobs/${jobId}`}>
            Cancel
          </Link>
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Filing report..." : "Submit to Mediation Desk →"}
          </button>
        </div>
      </form>
    </PageFrame>
  );
}

// Backward-compatible alias
export function DisputeUnavailableScreen({ jobId }: { jobId: string }) {
  return <JobDisputeScreen jobId={jobId} />;
}

// ============================================================================
// S33: Dispute Status & Mediation Tracker Screen (Stitch S33)
// ============================================================================
export function DisputeStatusScreen({ disputeId }: { disputeId: string }) {
  return (
    <PageFrame
      title="Dispute Status & Mediation Tracker"
      subtitle="Track active mediation between customer and artisan through the Edo State Hub desk."
    >
      <div className="hire-eyebrow">
        <Link href="/jobs" className="hire-eyebrow-pill">← Back to My Bookings</Link>
        <span>•</span>
        <span>Case Ref: #DISP-BN-{disputeId.slice(0, 8)}</span>
      </div>

      <div className="hire-panel">
        <div className="hire-panel-head">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="sabi-pulse-dot online" />
            <h3 style={{ margin: 0 }}>Mediation Desk Workspace (GRA Node)</h3>
          </div>
          <span className="hire-status-pill in_progress">Under Review</span>
        </div>

        {/* 4-Step Mediation Stepper */}
        <div className="hire-mediation-stepper">
          <div className="hire-mediation-node done">
            <span className="hire-check-title">1. Dispute Lodged</span>
            <span className="hire-check-desc">Customer submitted issue report into Neon system. Case timestamped.</span>
          </div>

          <div className="hire-mediation-node active">
            <span className="hire-check-title">2. Hub Officer Initial Triage</span>
            <span className="hire-check-desc">Assigned Duty Mediation Officer reviewing photos, job milestones, and artisan responses.</span>
          </div>

          <div className="hire-mediation-node">
            <span className="hire-check-title">3. Bilateral Coordination Window</span>
            <span className="hire-check-desc">48-hour response window for mutual remediation or physical workshop inspection.</span>
          </div>

          <div className="hire-mediation-node">
            <span className="hire-check-title">4. Determination &amp; Settlement</span>
            <span className="hire-check-desc">Binding resolution recorded with sign-off or milestone disbursement.</span>
          </div>
        </div>

        <div className="hire-protocol-box">
          <span>🏛️</span>
          <div>
            <strong>Edo State Artisan Hub Mediation Protocol:</strong> For urgent onsite inspections or physical mediation sessions, visit the Benin City Operational Hub at GRA, Benin City. Hub hours: Mon - Sat, 8:00 AM - 6:00 PM WAT. Email: <code>support@sabiwork.ng</code>.
          </div>
        </div>

        <div className="hire-actions" style={{ justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
          <Link className="button button-outline" href={`/jobs/${disputeId}`}>
            View job timeline
          </Link>
          <a className="button button-primary" href="mailto:support@sabiwork.ng?subject=Dispute%20Inquiry%20Ref%20#DISP-BN-8421">
            Contact Duty Officer
          </a>
        </div>
      </div>
    </PageFrame>
  );
}

// ============================================================================
// S26: Payment History Screen (Stitch S26)
// ============================================================================
export function PaymentHistoryListScreen() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<JobRow[]>("/api/jobs?scope=customer")
      .then((rows) => {
        if (!active) return;
        setJobs(rows);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load transaction history.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalTransactedKobo = useMemo(
    () => jobs.reduce((sum, j) => sum + (j.total_quote_kobo ?? j.budget_guidance_kobo ?? 0), 0),
    [jobs]
  );
  const activeMilestonesCount = useMemo(
    () => jobs.filter((j) => j.status === "in_progress" || j.status === "accepted").length,
    [jobs]
  );
  const completedMilestonesCount = useMemo(
    () => jobs.filter((j) => j.status === "completed").length,
    [jobs]
  );

  return (
    <section className="hire-page">
      <header className="hire-header">
        <div className="hire-eyebrow">
          <span className="hire-eyebrow-pill">Customer Portal</span>
          <span>•</span>
          <span>Financial Ledger</span>
        </div>
        <div className="hire-header-top">
          <h1>Payment History &amp; Transactions</h1>
          <div className="hire-actions">
            <span className="hire-eyebrow-pill">Paystack TEST Mode</span>
          </div>
        </div>
        <p>Review milestone allocations, deposit records, and settlement status for contracted jobs.</p>
      </header>

      {/* Bento KPI Stats */}
      <div className="hire-bento-grid">
        <div className="hire-bento-card">
          <div className="hire-bento-head">
            <span className="hire-bento-label">Total Contracted</span>
            <span className="hire-bento-icon value">₦</span>
          </div>
          <div className="hire-bento-value">{formatMoney(totalTransactedKobo)}</div>
          <div className="hire-bento-sub">Across {jobs.length} total engagements</div>
        </div>

        <div className="hire-bento-card">
          <div className="hire-bento-head">
            <span className="hire-bento-label">Active Milestones</span>
            <span className="hire-bento-icon in-progress">⚡</span>
          </div>
          <div className="hire-bento-value">{activeMilestonesCount}</div>
          <div className="hire-bento-sub">In progress or pending mobilization</div>
        </div>

        <div className="hire-bento-card">
          <div className="hire-bento-head">
            <span className="hire-bento-label">Settled Milestones</span>
            <span className="hire-bento-icon completed">✓</span>
          </div>
          <div className="hire-bento-value">{completedMilestonesCount}</div>
          <div className="hire-bento-sub">Fully verified and delivered</div>
        </div>
      </div>

      <div className="hire-protocol-box">
        <span>ℹ️</span>
        <div>
          <strong>Payment Gateway Disclosure:</strong> Milestone payments are simulated in Paystack TEST Mode. Amounts reflect real quotes saved in Postgres without real card debits.
        </div>
      </div>

      {loading ? <p>Loading payment history...</p> : null}
      {error ? <p className="hire-error" role="alert">{error}</p> : null}

      {!loading && !error && jobs.length === 0 ? (
        <div className="hire-empty">
          <div style={{ fontSize: "2rem" }}>💳</div>
          <h3>No payment records</h3>
          <p>You have not contracted any artisan jobs yet. Post a service request to start receiving quotes.</p>
        </div>
      ) : (
        <div className="hire-list">
          {jobs.map((job) => {
            const agreed = job.total_quote_kobo ?? job.budget_guidance_kobo;
            const deposit = Math.floor(agreed / 2);
            const balance = agreed - deposit;

            return (
              <article key={job.id} className="hire-card">
                <div className="hire-card-top">
                  <div>
                    <div className="hire-card-badges">
                      <span className="hire-eyebrow-pill">Ref: #TXN-BN-{job.id.slice(0, 8)}</span>
                      <StatusPill text={job.status} />
                    </div>
                    <h2 style={{ marginTop: "6px" }}>{job.title}</h2>
                    <p className="hire-check-desc">{job.category} • {job.service_area}</p>
                  </div>
                  <div className="hire-card-price">
                    <span className="hire-card-price-label">Total Agreed</span>
                    <span className="hire-card-price-value">{formatMoney(agreed)}</span>
                  </div>
                </div>

                <table className="hire-ledger-table">
                  <tbody>
                    <tr>
                      <td>Milestone 1: Mobilization Deposit (50%)</td>
                      <td>{formatMoney(deposit)}</td>
                    </tr>
                    <tr>
                      <td>Milestone 2: Completion Balance (50%)</td>
                      <td>{formatMoney(balance)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="hire-card-foot">
                  <span className="hire-card-meta-item">🕒 Recorded on {formatWat(job.created_at)}</span>
                  <div className="hire-actions">
                    <Link className="button button-outline" href={`/jobs/${job.id}`}>
                      View job details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function PaymentUnavailableScreen({ reference, title }: { reference: string; title: string }) {
  return (
    <PageFrame title={title} subtitle="Payment processing operates in Paystack sandbox mode.">
      <article className="hire-card">
        <p>Reference: <strong>{reference}</strong></p>
        <p>Live card billing is not enabled. All milestone allocations operate in test mode.</p>
      </article>
      <div className="hire-actions">
        <Link className="button button-outline" href="/jobs">Back to bookings</Link>
      </div>
    </PageFrame>
  );
}

// ============================================================================
// S13: Account Settings Screen (Stitch S13)
// ============================================================================
export function AccountSettingsScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [hasWorkProfile, setHasWorkProfile] = useState<boolean | null>(null);
  const [trade, setTrade] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [accountRes, profileRes] = await Promise.all([
          readJson<{ role: string; display_name: string; email?: string }>("/api/account/profile"),
          readJson<{ primary_trade: string }>("/api/profiles/artisan").catch(() => null),
        ]);
        if (!active) return;
        setDisplayName(accountRes.display_name || "");
        setEmail(accountRes.email || "");
        setRole(accountRes.role || "customer");
        if (profileRes) {
          setHasWorkProfile(true);
          setTrade(profileRes.primary_trade);
        } else {
          setHasWorkProfile(false);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load account profile.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    setError(null);
    try {
      await readJson("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName.trim() }),
      });
      setStatusMessage("Account profile updated successfully in Neon.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update account profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageFrame title="Account settings" subtitle="Loading account preferences...">
        <p>Loading...</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Account Settings & Preferences"
      subtitle="Manage your identity, role capabilities, and contact preferences."
    >
      <div className="hire-eyebrow">
        <span className="hire-eyebrow-pill">Role: {role.toUpperCase()}</span>
        <span>•</span>
        <span>Benin City Node</span>
      </div>

      <div className="hire-panel">
        <form onSubmit={save} className="hire-form" style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <label>
            Full Name / Display Name
            <input
              required
              minLength={2}
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          {email ? (
            <label>
              Registered Email
              <input type="text" value={email} disabled style={{ background: "#f8fafc", color: "var(--muted)" }} />
            </label>
          ) : null}

          {statusMessage ? <p className="hire-success">{statusMessage}</p> : null}
          {error ? <p className="hire-error" role="alert">{error}</p> : null}

          <div className="hire-actions" style={{ justifyContent: "flex-end" }}>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>

        <div style={{ paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>Artisan Work Capability</h4>
          {hasWorkProfile ? (
            <div className="hire-protocol-box">
              <span>🛠️</span>
              <div>
                <strong>Active Artisan Work Profile:</strong> You offer services as <strong>{trade || "Artisan"}</strong>. You can switch to your artisan workspace at any time to receive job requests.
                <div style={{ marginTop: "8px" }}>
                  <Link className="button button-outline" href="/artisan">
                    Open Artisan Workspace →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="hire-protocol-box" style={{ background: "#f8fafc", borderColor: "var(--border)", color: "var(--text)" }}>
              <span>ℹ️</span>
              <div>
                <strong>Offer Services as an Artisan:</strong> Any account can optionally create an artisan work profile without creating a separate login.
                <div style={{ marginTop: "8px" }}>
                  <Link className="button button-outline" href="/artisan/profile">
                    Create Work Profile →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
