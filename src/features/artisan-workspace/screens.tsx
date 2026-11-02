"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Icon, type IconName } from "@/components/icon";
import { readJson } from "./api";
import { Badge, Crumbs, Empty, Head, Kpi, PanelHead, type Tone } from "./ui";
import type {
  ArtisanDesk,
  ArtisanProfileDTO,
  DeskJob,
  DeskPayment,
  DeskQuote,
  DeskRequest,
} from "./types";


const money = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));

const dateOnly = (value: string) =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(
    new Date(value),
  );

const timeOnly = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));

const depositOf = (total: number) => Math.floor(total / 2);
const balanceOf = (total: number) => total - Math.floor(total / 2);

const jobTone: Record<DeskJob["status"], Tone> = {
  accepted: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
};

const jobLabel: Record<DeskJob["status"], string> = {
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const quoteTone: Record<DeskQuote["status"], Tone> = {
  pending: "warning",
  accepted: "success",
  declined: "danger",
};

const paymentTone: Record<DeskPayment["status"], Tone> = {
  pending: "warning",
  confirmed: "success",
  failed: "danger",
  cancelled: "neutral",
};

const verificationTone: Record<ArtisanProfileDTO["verification_status"], Tone> = {
  unsubmitted: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const verificationLabel: Record<ArtisanProfileDTO["verification_status"], string> = {
  unsubmitted: "Not submitted",
  pending: "Under review",
  approved: "Verified pro",
  rejected: "Changes requested",
};

const verificationStage: Record<ArtisanProfileDTO["verification_status"], number> = {
  unsubmitted: 0,
  pending: 2,
  approved: 4,
  rejected: 2,
};

function jobStages(status: DeskJob["status"]) {
  if (status === "completed") return ["is-done", "is-done", "is-done"];
  if (status === "in_progress") return ["is-done", "is-done", "is-current"];
  if (status === "accepted") return ["is-done", "is-current", ""];
  return ["is-done", "", ""];
}

function jobReference(id: string) {
  return `JOB-${id.slice(0, 8).toUpperCase()}`;
}

function initialsFrom(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isWithinLastDays(value: string, days: number) {
  const stamp = new Date(value).getTime();
  return Date.now() - stamp <= days * 24 * 60 * 60 * 1000;
}

function Milestones({ status }: { status: DeskJob["status"] }) {
  const stages = jobStages(status);
  return (
    <div className="aw-milestones">
      {["Agreed", "Deposit", "Sign-off"].map((label, index) => (
        <div className="aw-milestone" key={label}>
          <div className={`aw-milestone-track ${stages[index]}`.trim()} />
          <span className="aw-milestone-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function MoneyRow({ job }: { job: DeskJob }) {
  const outstanding = Math.max(job.total_quote_kobo - job.escrow_kobo, 0);
  return (
    <div className="aw-money">
      <div className="aw-money-cell">
        <span className="aw-money-label">Contract value</span>
        <span className="aw-money-value">{money(job.total_quote_kobo)}</span>
      </div>
      <div className="aw-money-cell">
        <span className="aw-money-label">Escrow funded</span>
        <span className="aw-money-value">{money(job.escrow_kobo)}</span>
      </div>
      <div className="aw-money-cell">
        <span className="aw-money-label">Outstanding</span>
        <span className="aw-money-value">{money(outstanding)}</span>
      </div>
    </div>
  );
}

function JobRow({ job }: { job: DeskJob }) {
  return (
    <article className="aw-row">
      <div className="aw-row-head">
        <div className="aw-row-title">
          <span className="aw-mono">{jobReference(job.id)}</span>
          <h3>
            <Link href={`/artisan/jobs/${job.id}/update`}>{job.title}</Link>
          </h3>
          <div className="aw-row-meta">
            <span>{job.customer_name}</span>
            <span>•</span>
            <span>{job.category}</span>
            <span>•</span>
            <span>{job.service_area}</span>
            <span>•</span>
            <span>Updated {dateOnly(job.updated_at)}</span>
          </div>
        </div>
        <Badge tone={jobTone[job.status]}>{jobLabel[job.status]}</Badge>
      </div>

      <Milestones status={job.status} />
      <MoneyRow job={job} />

      {job.latest_update ? (
        <p className="aw-row-body">
          Latest update · {job.latest_update.note}
          <br />
          <span className="aw-cell-muted">{dateTime(job.latest_update.created_at)}</span>
        </p>
      ) : null}

      <div className="aw-row-foot">
        <div className="aw-row-meta">
          <span>
            {job.update_count} progress {job.update_count === 1 ? "update" : "updates"}
          </span>
        </div>
        <div className="aw-row-actions">
          <Link className="aw-btn aw-btn-ghost aw-btn-sm" href={`/artisan/jobs/${job.id}/update`}>
            <Icon name="plus" size={14} />
            Add progress
          </Link>
          <Link className="aw-btn aw-btn-ghost aw-btn-sm" href={`/jobs/${job.id}`}>
            <Icon name="file" size={14} />
            Job details
          </Link>
        </div>
      </div>
    </article>
  );
}

function useArtisanDesk() {
  const [desk, setDesk] = useState<ArtisanDesk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await readJson<ArtisanDesk>("/api/artisan/desk");
      setDesk(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your artisan board.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void readJson<ArtisanDesk>("/api/artisan/desk")
      .then((data) => {
        if (!active) return;
        setDesk(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load your artisan board.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { desk, setDesk, loading, error, reload };
}

/* ------------------------------ S36 Overview ----------------------------- */

export function ArtisanOverviewScreen() {
  const { desk, setDesk, loading, error } = useArtisanDesk();
  const [togglingListing, setTogglingListing] = useState(false);

  const profile = desk?.profile ?? null;
  const activeJobs =
    desk?.jobs.filter((job) => job.status === "accepted" || job.status === "in_progress") ?? [];
  const priorityRequest = desk?.open_requests[0] ?? null;
  const weekPayments =
    desk?.payments.filter(
      (payment) =>
        payment.status === "confirmed" && isWithinLastDays(payment.paid_at ?? payment.created_at, 7),
    ) ?? [];

  const toggleListing = async () => {
    if (!profile || togglingListing) return;
    const nextState = !profile.is_listed;
    setTogglingListing(true);
    setDesk((current) =>
      current && current.profile
        ? { ...current, profile: { ...current.profile, is_listed: nextState } }
        : current,
    );
    try {
      await readJson("/api/profiles/artisan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, is_listed: nextState }),
      });
    } catch {
      setDesk((current) =>
        current && current.profile
          ? { ...current, profile: { ...current.profile, is_listed: !nextState } }
          : current,
      );
    } finally {
      setTogglingListing(false);
    }
  };

  const displayName = desk?.display_name?.trim() || profile?.primary_trade || "Artisan";
  const rating = desk?.stats.average_rating ?? 0;
  const reviews = desk?.stats.reviews_count ?? 0;

  return (
    <div className="aw-page">
      <Crumbs trail={[{ label: "SabiWork", href: "/" }, { label: "Artisan workspace" }]} />

      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {loading ? <p className="aw-loading">Loading your board…</p> : null}

      {!loading && !profile ? (
        <Empty
          icon="user"
          title="Create your work profile"
          body="Add your trade, coverage areas and workshop so you appear in the directory and can send quotes to clients."
          action={
            <Link className="aw-btn aw-btn-primary" href="/artisan/profile">
              Create work profile
            </Link>
          }
        />
      ) : null}

      {profile ? (
        <>
          <header className="aw-hero">
            <div className="aw-hero-main">
              <div className="aw-avatar">
                {initialsFrom(displayName)}
                <span
                  className={`aw-avatar-dot ${profile.is_listed ? "is-online" : ""}`.trim()}
                  aria-hidden="true"
                />
              </div>
              <div className="aw-hero-copy">
                <div className="aw-hero-name">
                  <h1>Welcome back, {displayName}</h1>
                  <Badge tone={verificationTone[profile.verification_status]}>
                    {verificationLabel[profile.verification_status]} · #{desk?.reference}
                  </Badge>
                  {reviews > 0 ? (
                    <span className="aw-tag">
                      <Icon name="star" size={11} /> {rating.toFixed(1)} ({reviews} jobs)
                    </span>
                  ) : null}
                </div>
                <div className="aw-hero-meta">
                  <span>
                    <strong>{profile.primary_trade}</strong>
                  </span>
                  <span>{profile.workshop_area}</span>
                  <span>{profile.coverage_areas.slice(0, 3).join(" · ")}</span>
                  {profile.rate_guidance_kobo ? (
                    <span>From {money(profile.rate_guidance_kobo)}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="aw-dispatch">
              <div className="aw-dispatch-copy">
                <strong>{profile.is_listed ? "Online for dispatch" : "Offline from directory"}</strong>
                <span>{profile.is_listed ? "Accepting client requests" : "Hidden from discovery"}</span>
              </div>
              <button
                type="button"
                className="aw-switch"
                data-on={profile.is_listed ? "true" : "false"}
                onClick={() => void toggleListing()}
                disabled={togglingListing}
                aria-label="Toggle directory dispatch status"
                aria-pressed={profile.is_listed}
              >
                <span className="aw-switch-dot" />
              </button>
            </div>
          </header>

          {priorityRequest ? (
            <article className="aw-notice">
              <span className="aw-notice-icon">
                <Icon name="zap" size={17} />
              </span>
              <div className="aw-notice-copy">
                <strong>High priority near you</strong>
                <p>
                  {priorityRequest.title} · {priorityRequest.category} ·{" "}
                  {priorityRequest.service_area} · Budget{" "}
                  {money(priorityRequest.budget_guidance_kobo)} · {priorityRequest.quotes_count}{" "}
                  {priorityRequest.quotes_count === 1 ? "quote" : "quotes"} submitted
                </p>
              </div>
              <Link
                className="aw-btn aw-btn-primary"
                href={`/artisan/requests/${priorityRequest.id}/quote`}
              >
                View & draft quote
              </Link>
            </article>
          ) : null}

          <div className="aw-kpi-strip">
            <Kpi
              icon="briefcase"
              label="Active jobs"
              value={desk?.stats.active_jobs ?? 0}
              foot={`${desk?.stats.in_progress_jobs ?? 0} in physical execution`}
            />
            <Kpi
              icon="inbox"
              label="New quote requests"
              value={desk?.stats.pending_quotes ?? 0}
              foot="Awaiting a client decision"
            />
            <Kpi
              icon="wallet"
              label="MTD cleared earnings"
              value={money(desk?.stats.mtd_earnings_kobo ?? 0)}
              foot="Confirmed milestone payments"
            />
            <Kpi
              icon="star"
              label="Client satisfaction"
              value={reviews > 0 ? `${rating.toFixed(1)} / 5.0` : "—"}
              foot={reviews > 0 ? `From ${reviews} completed reviews` : "No reviews yet"}
            />
          </div>

          <div className="aw-split">
            <div className="aw-stack">
              <section className="aw-panel">
                <PanelHead
                  title="Ongoing jobs"
                  note={`${activeJobs.length} active ${activeJobs.length === 1 ? "job" : "jobs"}`}
                >
                  <Link className="aw-link" href="/artisan/jobs">
                    View all jobs <Icon name="next" size={13} />
                  </Link>
                </PanelHead>

                {activeJobs.length === 0 ? (
                  <Empty
                    icon="clipboard"
                    title="No ongoing jobs yet"
                    body="Quotes you submit appear here once a client accepts them."
                    action={
                      <Link className="aw-btn aw-btn-primary" href="/artisan/requests">
                        Browse open requests
                      </Link>
                    }
                  />
                ) : (
                  <div className="aw-list">
                    {activeJobs.slice(0, 4).map((job) => (
                      <JobRow job={job} key={job.id} />
                    ))}
                  </div>
                )}
              </section>

              <section className="aw-panel">
                <PanelHead
                  title="Recent quote submissions"
                  note={`${desk?.stats.pending_quotes ?? 0} awaiting a decision`}
                >
                  <Link className="aw-link" href="/artisan/requests">
                    View all quotes <Icon name="next" size={13} />
                  </Link>
                </PanelHead>

                {(desk?.quotes.length ?? 0) === 0 ? (
                  <Empty
                    icon="send"
                    title="No quotes submitted yet"
                    body="Send your first quote from the open requests feed and it will be tracked here."
                    action={
                      <Link className="aw-btn aw-btn-primary" href="/artisan/requests">
                        Browse open requests
                      </Link>
                    }
                  />
                ) : (
                  <div className="aw-table-wrap">
                    <table className="aw-table">
                      <thead>
                        <tr>
                          <th>Job / scope</th>
                          <th>Customer</th>
                          <th className="aw-cell-right">Quoted total</th>
                          <th>Deposit</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {desk?.quotes.slice(0, 6).map((quote) => (
                          <tr key={quote.id}>
                            <td>
                              <div className="aw-cell-stack">
                                <span className="aw-cell-strong">{quote.title}</span>
                                <span className="aw-cell-muted">
                                  {quote.category} · {quote.service_area}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="aw-cell-stack">
                                <span>{quote.customer_name}</span>
                                <span className="aw-cell-muted">{dateOnly(quote.created_at)}</span>
                              </div>
                            </td>
                            <td className="aw-cell-right aw-cell-strong">{money(quote.total_kobo)}</td>
                            <td>
                              <div className="aw-cell-stack">
                                <span>50% · {money(depositOf(quote.total_kobo))}</span>
                                <span className="aw-cell-muted">
                                  Balance {money(balanceOf(quote.total_kobo))}
                                </span>
                              </div>
                            </td>
                            <td>
                              <Badge tone={quoteTone[quote.status]}>{quote.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            <aside className="aw-stack aw-sticky">
              <section className="aw-panel">
                <PanelHead title="Weekly payout flow" note="Mon – Sun" />
                <div className="aw-money">
                  <div className="aw-money-cell">
                    <span className="aw-money-label">Cleared this week</span>
                    <span className="aw-money-value">{money(desk?.stats.week_earnings_kobo ?? 0)}</span>
                  </div>
                  <div className="aw-money-cell">
                    <span className="aw-money-label">Held in escrow</span>
                    <span className="aw-money-value">{money(desk?.stats.pending_escrow_kobo ?? 0)}</span>
                  </div>
                </div>

                {weekPayments.length === 0 ? (
                  <p className="aw-panel-note">No milestone releases recorded this week.</p>
                ) : (
                  <dl className="aw-facts">
                    {weekPayments.slice(0, 3).map((payment) => (
                      <div className="aw-fact" key={payment.id}>
                        <dt>{dateOnly(payment.paid_at ?? payment.created_at)}</dt>
                        <dd>{money(payment.amount_kobo)}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="aw-panel-note">
                  Automated payouts are disabled in this build. Cleared milestones are recorded, not
                  disbursed.
                </p>
              </section>

              <section className="aw-panel">
                <PanelHead title="Artisan standing" note={`Reference #${desk?.reference}`}>
                  <Link className="aw-link" href="/artisan/verification/status">
                    View status <Icon name="next" size={13} />
                  </Link>
                </PanelHead>
                <dl className="aw-facts">
                  <div className="aw-fact">
                    <dt>Verification</dt>
                    <dd>{verificationLabel[profile.verification_status]}</dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Primary trade</dt>
                    <dd>{profile.primary_trade}</dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Experience</dt>
                    <dd>{profile.experience_years} years</dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Workshop</dt>
                    <dd>{profile.workshop_area}</dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Coverage</dt>
                    <dd>{profile.coverage_areas.join(", ")}</dd>
                  </div>
                </dl>
              </section>

              <section className="aw-panel">
                <PanelHead title="Quick tasks" />
                <dl className="aw-facts">
                  {[
                    { href: "/artisan/profile", label: "Update profile & bio", icon: "user" as IconName },
                    {
                      href: "/artisan/availability",
                      label: "Set coverage & hours",
                      icon: "calendar" as IconName,
                    },
                    { href: "/artisan/earnings", label: "Review earnings ledger", icon: "wallet" as IconName },
                    {
                      href: "/training",
                      label: "Safety & compliance training",
                      icon: "graduation" as IconName,
                    },
                    { href: "/settings", label: "Account settings", icon: "settings" as IconName },
                  ].map((task) => (
                    <div className="aw-fact" key={task.href}>
                      <dt>
                        <Link className="aw-link" href={task.href}>
                          <Icon name={task.icon} size={13} /> {task.label}
                        </Link>
                      </dt>
                      <dd>
                        <Icon name="next" size={13} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* --------------------------- S37 Jobs & contracts ------------------------- */

const jobFilters: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In progress" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export function ArtisanJobsScreen() {
  const { desk, loading, error } = useArtisanDesk();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const jobs = desk?.jobs ?? [];

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query) ||
        job.service_area.toLowerCase().includes(query) ||
        job.customer_name.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const contracted = jobs.reduce((sum, job) => sum + job.total_quote_kobo, 0);

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "My jobs" },
        ]}
      />

      <Head
        title="My jobs & work orders"
        subtitle="Track accepted contracts, milestone funding and client sign-offs."
      >
        <Link className="aw-btn aw-btn-ghost" href="/artisan/requests">
          Browse open requests
        </Link>
      </Head>

      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {loading ? <p className="aw-loading">Loading work orders…</p> : null}

      {!loading ? (
        <>
          <div className="aw-kpi-strip">
            <Kpi
              icon="briefcase"
              label="Active work orders"
              value={
                jobs.filter((job) => job.status === "accepted" || job.status === "in_progress").length
              }
              foot="Accepted or in physical execution"
            />
            <Kpi
              icon="wrench"
              label="In progress"
              value={jobs.filter((job) => job.status === "in_progress").length}
              foot="Sites currently being worked"
            />
            <Kpi
              icon="check"
              label="Completed"
              value={jobs.filter((job) => job.status === "completed").length}
              foot="Signed off by the client"
            />
            <Kpi
              icon="banknote"
              label="Contracted value"
              value={money(contracted)}
              foot="All-time agreed volume"
            />
          </div>

          <div className="aw-toolbar">
            <label className="aw-search">
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder="Search by title, category, area, customer or job ID"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search work orders"
              />
            </label>

            <div className="aw-filters">
              {jobFilters.map((filter) => {
                const count =
                  filter.key === "all"
                    ? jobs.length
                    : jobs.filter((job) => job.status === filter.key).length;
                if (filter.key === "cancelled" && count === 0) return null;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    className="aw-filter"
                    data-active={statusFilter === filter.key ? "true" : "false"}
                    onClick={() => setStatusFilter(filter.key)}
                  >
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <Empty
              icon="clipboard"
              title={
                searchQuery || statusFilter !== "all"
                  ? "No jobs match this filter"
                  : "No work orders yet"
              }
              body={
                searchQuery || statusFilter !== "all"
                  ? "Adjust your search or reset the filters to see every work order."
                  : "Quote open requests to win your first job. Accepted quotes appear here."
              }
              action={
                <Link className="aw-btn aw-btn-primary" href="/artisan/requests">
                  Browse open requests
                </Link>
              }
            />
          ) : (
            <div className="aw-list">
              {filteredJobs.map((job) => (
                <JobRow job={job} key={job.id} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

/* ----------------------------- S38 Earnings ------------------------------ */

export function ArtisanEarningsScreen() {
  const { desk, loading, error, reload } = useArtisanDesk();

  const jobs = desk?.jobs ?? [];
  const payments = desk?.payments ?? [];
  const jobTitles = new Map(jobs.map((job) => [job.id, job.title]));
  const contracted = jobs.reduce((sum, job) => sum + job.total_quote_kobo, 0);

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Earnings" },
        ]}
      />

      <Head
        title="Earnings & settlement ledger"
        subtitle="Contracted revenue, escrow-backed milestone payments and cleared earnings."
      >
        <button type="button" className="aw-btn aw-btn-ghost" onClick={() => void reload()}>
          <Icon name="refresh" size={14} />
          Refresh ledger
        </button>
      </Head>

      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {loading ? <p className="aw-loading">Loading ledger…</p> : null}

      {!loading ? (
        <>
          <div className="aw-kpi-strip">
            <Kpi
              icon="check"
              label="MTD cleared"
              value={money(desk?.stats.mtd_earnings_kobo ?? 0)}
              foot={`${payments.filter((payment) => payment.status === "confirmed").length} confirmed milestone payments`}
            />
            <Kpi
              icon="banknote"
              label="Cleared this week"
              value={money(desk?.stats.week_earnings_kobo ?? 0)}
              foot="Monday to today"
            />
            <Kpi
              icon="lock"
              label="Pending escrow"
              value={money(desk?.stats.pending_escrow_kobo ?? 0)}
              foot="Funded on jobs in progress"
            />
            <Kpi
              icon="trending"
              label="Total contracted"
              value={money(contracted)}
              foot={`${desk?.stats.completed_jobs ?? 0} completed orders`}
            />
          </div>

          <article className="aw-notice">
            <span className="aw-notice-icon">
              <Icon name="lock" size={17} />
            </span>
            <div className="aw-notice-copy">
              <strong>Paystack TEST mode</strong>
              <p>
                Automated bank transfers and payout releases are disabled in this build. Cleared
                milestones are recorded here; no simulated disbursements are issued.
              </p>
            </div>
          </article>

          <section className="aw-panel">
            <PanelHead title="Milestone payments" note={`${payments.length} recorded events`} />

            {payments.length === 0 ? (
              <Empty
                icon="receipt"
                title="No earnings recorded yet"
                body="Once a client funds a milestone on an accepted job, the payment appears in this ledger."
                action={
                  <Link className="aw-btn aw-btn-primary" href="/artisan/requests">
                    Browse open requests
                  </Link>
                }
              />
            ) : (
              <div className="aw-table-wrap">
                <table className="aw-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Job order</th>
                      <th>Milestone</th>
                      <th className="aw-cell-right">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <div className="aw-cell-stack">
                            <span>{dateOnly(payment.paid_at ?? payment.created_at)}</span>
                            <span className="aw-cell-muted">
                              {timeOnly(payment.paid_at ?? payment.created_at)} WAT
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="aw-mono">{payment.reference}</span>
                        </td>
                        <td>
                          <div className="aw-cell-stack">
                            <span>{jobTitles.get(payment.job_id) ?? "Job order"}</span>
                            <span className="aw-cell-muted">{jobReference(payment.job_id)}</span>
                          </div>
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{payment.milestone}</td>
                        <td className="aw-cell-right aw-cell-strong">{money(payment.amount_kobo)}</td>
                        <td>
                          <Badge tone={paymentTone[payment.status]}>{payment.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="aw-panel">
            <PanelHead title="Contract ledger" note="Agreed value per work order" />

            {jobs.length === 0 ? (
              <p className="aw-panel-note">No contracts yet.</p>
            ) : (
              <div className="aw-table-wrap">
                <table className="aw-table">
                  <thead>
                    <tr>
                      <th>Work order</th>
                      <th>Client</th>
                      <th>Status</th>
                      <th className="aw-cell-right">Contract</th>
                      <th className="aw-cell-right">Funded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <div className="aw-cell-stack">
                            <span className="aw-cell-strong">{job.title}</span>
                            <span className="aw-cell-muted">
                              {job.category} · {job.service_area}
                            </span>
                          </div>
                        </td>
                        <td>{job.customer_name}</td>
                        <td>
                          <Badge tone={jobTone[job.status]}>{jobLabel[job.status]}</Badge>
                        </td>
                        <td className="aw-cell-right aw-cell-strong">{money(job.total_quote_kobo)}</td>
                        <td className="aw-cell-right">{money(job.escrow_kobo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

/* ---------------------------- S39 Availability ---------------------------- */

export function ArtisanAvailabilityScreen() {
  const { desk, setDesk, loading, error } = useArtisanDesk();
  const profile = desk?.profile ?? null;

  const activeJobs =
    desk?.jobs.filter((job) => job.status === "accepted" || job.status === "in_progress") ?? [];

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Availability" },
        ]}
      />

      <Head
        title="Availability & work schedule"
        subtitle="Set your dispatch status, working notes and the areas you cover."
      />

      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {loading ? <p className="aw-loading">Loading availability…</p> : null}

      {!loading && !profile ? (
        <Empty
          icon="calendar"
          title="Work profile required"
          body="Create your work profile before setting availability and coverage."
          action={
            <Link className="aw-btn aw-btn-primary" href="/artisan/profile">
              Create work profile
            </Link>
          }
        />
      ) : null}

      {profile ? (
        <>
          <div className="aw-kpi-strip">
            <Kpi
              icon="zap"
              label="Dispatch status"
              value={profile.is_listed ? "Online" : "Offline"}
              foot={profile.is_listed ? "Visible in the directory" : "Hidden from discovery"}
            />
            <Kpi
              icon="briefcase"
              label="Active jobs"
              value={activeJobs.length}
              foot="Booked work orders"
            />
            <Kpi
              icon="pin"
              label="Coverage zones"
              value={profile.coverage_areas.length}
              foot={profile.coverage_areas.slice(0, 2).join(", ")}
            />
            <Kpi
              icon="clock"
              label="Experience"
              value={`${profile.experience_years} yrs`}
              foot="Active trade practice"
            />
          </div>

          <div className="aw-grid-2">
            <AvailabilityPanel key={profile.user_id} profile={profile} setDesk={setDesk} />

            <div className="aw-stack">
              <section className="aw-panel">
                <PanelHead title="Coverage zones" note="Derived from your work profile." />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {profile.coverage_areas.map((area) => (
                    <span className="aw-tag" key={area}>
                      {area}
                    </span>
                  ))}
                </div>
                <p className="aw-panel-note">Workshop base: {profile.workshop_area}</p>
                <Link className="aw-btn aw-btn-ghost aw-btn-sm" href="/artisan/profile">
                  Edit coverage areas
                </Link>
              </section>

              <section className="aw-panel">
                <PanelHead title="Booked work" note={`${activeJobs.length} active orders`} />
                {activeJobs.length === 0 ? (
                  <p className="aw-panel-note">No booked work at the moment.</p>
                ) : (
                  <dl className="aw-facts">
                    {activeJobs.map((job) => (
                      <div className="aw-fact" key={job.id}>
                        <dt>
                          {job.customer_name} · {job.service_area}
                        </dt>
                        <dd>{dateOnly(job.updated_at)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function AvailabilityPanel({
  profile,
  setDesk,
}: {
  profile: ArtisanProfileDTO;
  setDesk: Dispatch<SetStateAction<ArtisanDesk | null>>;
}) {
  const [notes, setNotes] = useState(profile.availability_notes ?? "");
  const [isListed, setIsListed] = useState(profile.is_listed);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSuccess(null);

    try {
      await readJson("/api/profiles/artisan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_phone: profile.contact_phone,
          primary_trade: profile.primary_trade,
          experience_years: profile.experience_years,
          coverage_areas: profile.coverage_areas,
          workshop_area: profile.workshop_area,
          bio: profile.bio,
          skills: profile.skills,
          rate_guidance_kobo: profile.rate_guidance_kobo,
          availability_notes: notes.trim(),
          is_listed: isListed,
        }),
      });
      setDesk((current) =>
        current && current.profile
          ? {
              ...current,
              profile: {
                ...current.profile,
                availability_notes: notes.trim() || null,
                is_listed: isListed,
              },
            }
          : current,
      );
      setSuccess("Availability and dispatch status saved.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not update availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="aw-panel">
      <PanelHead title="Dispatch availability" note="Controls directory and search visibility." />

      <form className="aw-form" onSubmit={save}>
        <div className="aw-dispatch" style={{ alignSelf: "start" }}>
          <div className="aw-dispatch-copy">
            <strong>{isListed ? "Online for dispatch" : "Offline from directory"}</strong>
            <span>{isListed ? "Accepting new client requests" : "Hidden from discovery"}</span>
          </div>
          <button
            type="button"
            className="aw-switch"
            data-on={isListed ? "true" : "false"}
            onClick={() => setIsListed((current) => !current)}
            aria-label="Toggle dispatch availability"
            aria-pressed={isListed}
          >
            <span className="aw-switch-dot" />
          </button>
        </div>

        <label className="aw-field">
          <span>Working hours & booking notes</span>
          <textarea
            maxLength={500}
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="e.g. Monday to Friday 8:00 AM – 5:30 PM. Saturday emergency call-outs only."
          />
          <small>Shown to clients considering your quote.</small>
        </label>

        {saveError ? <p className="aw-alert aw-alert-error">{saveError}</p> : null}
        {success ? <p className="aw-alert aw-alert-success">{success}</p> : null}

        <div className="aw-form-actions">
          <button className="aw-btn aw-btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save availability"}
          </button>
          <Link className="aw-btn aw-btn-ghost" href="/artisan">
            Back to overview
          </Link>
        </div>
      </form>

      <p className="aw-panel-note">
        Recurring weekly windows and calendar bookings are not stored yet — availability is
        published as the working notes above.
      </p>
    </section>
  );
}

/* --------------------------- S40/S41 Verification ------------------------- */

export function ArtisanVerificationScreen() {
  const { desk, loading, error } = useArtisanDesk();
  const profile = desk?.profile ?? null;

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Verification" },
        ]}
      />

      <Head
        title="Verification & credentials"
        subtitle="Understand what the verified pro badge requires and where your dossier stands."
      >
        <Link className="aw-btn aw-btn-ghost" href="/artisan/verification/status">
          View status
        </Link>
      </Head>

      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {loading ? <p className="aw-loading">Loading verification…</p> : null}

      {!loading && !profile ? (
        <Empty
          icon="shield"
          title="Work profile required"
          body="Create your work profile before starting verification."
          action={
            <Link className="aw-btn aw-btn-primary" href="/artisan/profile">
              Create work profile
            </Link>
          }
        />
      ) : null}

      {profile ? (
        <>
          <section className="aw-panel">
            <PanelHead title="Current verification status">
              <Badge tone={verificationTone[profile.verification_status]}>
                {verificationLabel[profile.verification_status]}
              </Badge>
            </PanelHead>
            <dl className="aw-facts">
              <div className="aw-fact">
                <dt>Primary trade</dt>
                <dd>{profile.primary_trade}</dd>
              </div>
              <div className="aw-fact">
                <dt>Workshop area</dt>
                <dd>{profile.workshop_area}</dd>
              </div>
              <div className="aw-fact">
                <dt>Coverage</dt>
                <dd>{profile.coverage_areas.join(", ")}</dd>
              </div>
              <div className="aw-fact">
                <dt>Experience</dt>
                <dd>{profile.experience_years} years</dd>
              </div>
              <div className="aw-fact">
                <dt>Workspace reference</dt>
                <dd>#{desk?.reference}</dd>
              </div>
            </dl>
          </section>

          <div className="aw-grid-2">
            <section className="aw-panel">
              <PanelHead title="Trade skills" note={`${profile.skills.length} listed competencies`} />
              {profile.skills.length === 0 ? (
                <p className="aw-panel-note">No skills listed yet.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {profile.skills.map((skill) => (
                    <span className="aw-tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="aw-panel">
              <PanelHead title="Professional bio" />
              <p className="aw-row-body">{profile.bio}</p>
              <p className="aw-panel-note">
                Contact: {profile.contact_phone} · Availability:{" "}
                {profile.availability_notes || "not set"}
              </p>
            </section>
          </div>

          <section className="aw-panel">
            <PanelHead
              title="How verification works"
              note="Reviewed manually by SabiWork administrators."
            />
            <ol className="aw-steps">
              <li className="aw-step">
                <strong>Profile confirmation</strong>
                <p>Your trade, workshop and coverage are checked against your submitted details.</p>
              </li>
              <li className="aw-step">
                <strong>Skills & competency review</strong>
                <p>Listed competencies are cross-referenced with your primary trade.</p>
              </li>
              <li className="aw-step">
                <strong>Evidence assessment</strong>
                <p>Work samples and identity documents are reviewed by a case officer.</p>
              </li>
              <li className="aw-step">
                <strong>Badge determination</strong>
                <p>The verified pro badge is granted or changes are requested.</p>
              </li>
            </ol>
          </section>

          <article className="aw-notice">
            <span className="aw-notice-icon">
              <Icon name="alert" size={17} />
            </span>
            <div className="aw-notice-copy">
              <strong>Document upload is not available yet</strong>
              <p>
                This build has no storage for identity documents or work samples, so a dossier cannot
                be submitted from the board. Verification status is set by an administrator once
                evidence has been reviewed out of band.
              </p>
            </div>
            <Link className="aw-btn aw-btn-ghost" href="/artisan/profile">
              Update profile details
            </Link>
          </article>
        </>
      ) : null}
    </div>
  );
}

export function ArtisanVerificationStatusScreen() {
  const { desk, loading, error } = useArtisanDesk();
  const profile = desk?.profile ?? null;
  const stage = profile ? verificationStage[profile.verification_status] : 0;

  const stages = [
    { title: "Dossier received", body: "Your details are captured on the artisan board." },
    {
      title: "Trade tagging check",
      body: "Competencies cross-referenced with your primary trade.",
    },
    {
      title: "Portfolio & proof assessment",
      body: "Work samples and identity documents reviewed.",
    },
    { title: "Badge determination", body: "Badge issued or corrections requested." },
  ];

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Verification", href: "/artisan/verification" },
          { label: "Status" },
        ]}
      />

      <Head
        title="Verification status"
        subtitle="Track the administrative review of your verified pro badge."
      >
        <Link className="aw-btn aw-btn-ghost" href="/artisan/verification">
          Verification hub
        </Link>
      </Head>

      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {loading ? <p className="aw-loading">Loading status…</p> : null}

      {!loading && !profile ? (
        <Empty
          icon="shield"
          title="Work profile required"
          body="Create your work profile before starting verification."
          action={
            <Link className="aw-btn aw-btn-primary" href="/artisan/profile">
              Create work profile
            </Link>
          }
        />
      ) : null}

      {profile ? (
        <>
          <section className="aw-hero">
            <div className="aw-hero-main">
              <div className="aw-avatar">
                <Icon name="shield" size={22} />
              </div>
              <div className="aw-hero-copy">
                <div className="aw-hero-name">
                  <h1>{verificationLabel[profile.verification_status]}</h1>
                  <Badge tone={verificationTone[profile.verification_status]}>
                    #{desk?.reference}
                  </Badge>
                </div>
                <div className="aw-hero-meta">
                  <span>
                    <strong>{profile.primary_trade}</strong>
                  </span>
                  <span>{profile.workshop_area}</span>
                  <span>Stage {Math.min(stage, 4)} of 4</span>
                </div>
              </div>
            </div>
            <div className="aw-dispatch">
              <div className="aw-dispatch-copy">
                <strong>
                  {profile.verification_status === "approved" ? "Badge active" : "Not yet issued"}
                </strong>
                <span>
                  {profile.verification_status === "pending"
                    ? "Awaiting administrator review"
                    : profile.verification_status === "rejected"
                      ? "Corrections requested"
                      : profile.verification_status === "unsubmitted"
                        ? "No dossier submitted"
                        : "Verified pro badge granted"}
                </span>
              </div>
            </div>
          </section>

          <div className="aw-split">
            <div className="aw-stack">
              <section className="aw-panel">
                <PanelHead title="Review workflow" note={`Stage ${Math.min(stage, 4)} of 4 active`} />
                <ol className="aw-steps">
                  {stages.map((item, index) => {
                    const done = index < stage;
                    const current = index === stage;
                    return (
                      <li className="aw-step" key={item.title}>
                        <strong>
                          {item.title}
                          {done ? " · complete" : current ? " · active" : ""}
                        </strong>
                        <p>{item.body}</p>
                      </li>
                    );
                  })}
                </ol>
              </section>

              <section className="aw-panel">
                <PanelHead title="Submitted snapshot" note="Read-only profile details." />
                <dl className="aw-facts">
                  <div className="aw-fact">
                    <dt>Reference</dt>
                    <dd>#{desk?.reference}</dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Primary craft</dt>
                    <dd>{profile.primary_trade}</dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Hub zone</dt>
                    <dd>{profile.workshop_area}</dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Coverage</dt>
                    <dd>{profile.coverage_areas.join(", ")}</dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Skills tagged</dt>
                    <dd>{profile.skills.length}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <aside className="aw-stack aw-sticky">
              <section className="aw-panel">
                <PanelHead title="Badge perks" />
                <dl className="aw-facts">
                  <div className="aw-fact">
                    <dt>Priority placement in artisan search</dt>
                    <dd>
                      <Icon
                        name={profile.verification_status === "approved" ? "check" : "x"}
                        size={13}
                      />
                    </dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Verified pro badge on your listing</dt>
                    <dd>
                      <Icon
                        name={profile.verification_status === "approved" ? "check" : "x"}
                        size={13}
                      />
                    </dd>
                  </div>
                  <div className="aw-fact">
                    <dt>Dispatch eligibility</dt>
                    <dd>{profile.is_listed ? "Listed" : "Hidden"}</dd>
                  </div>
                </dl>
              </section>

              <section className="aw-panel">
                <PanelHead title="Need help?" />
                <p className="aw-panel-note">
                  Verification is reviewed by SabiWork administrators during weekday hours. Ensure
                  your profile details are accurate before a review completes.
                </p>
                <Link className="aw-btn aw-btn-ghost aw-btn-sm" href="/artisan/profile">
                  Edit profile
                </Link>
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------- S06 Profile editor ---------------------------- */

export function ArtisanProfileEditorScreen() {
  const { desk, loading } = useArtisanDesk();
  const profile = desk?.profile ?? null;

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Work profile" },
        ]}
      />

      <Head
        title="Work profile"
        subtitle="Complete your profile to appear in public search and send quotes to prospective clients."
      >
        <Link className="aw-btn aw-btn-ghost" href="/artisan">
          Back to overview
        </Link>
      </Head>

      {loading ? <p className="aw-loading">Loading profile…</p> : null}

      {!loading ? (
        <section className="aw-panel">
          <ProfileEditorForm key={profile?.user_id ?? "new"} profile={profile} />
        </section>
      ) : null}
    </div>
  );
}

function ProfileEditorForm({ profile }: { profile: ArtisanProfileDTO | null }) {
  const router = useRouter();
  const [phone, setPhone] = useState(profile?.contact_phone ?? "");
  const [trade, setTrade] = useState(profile?.primary_trade ?? "Plumbing");
  const [experience, setExperience] = useState(profile?.experience_years ?? 3);
  const [coverage, setCoverage] = useState(profile?.coverage_areas.join(", ") ?? "");
  const [workshop, setWorkshop] = useState(profile?.workshop_area ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [skills, setSkills] = useState(profile?.skills.join(", ") ?? "");
  const [rateNaira, setRateNaira] = useState(
    typeof profile?.rate_guidance_kobo === "number"
      ? String(Math.round(profile.rate_guidance_kobo / 100))
      : "15000",
  );
  const [availabilityNotes, setAvailabilityNotes] = useState(profile?.availability_notes ?? "");
  const [isListed, setIsListed] = useState(profile?.is_listed ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedUserId, setSavedUserId] = useState<string | null>(profile?.user_id ?? null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const coverageArray = coverage
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length >= 2);

    if (coverageArray.length < 1) {
      setError("Please specify at least one service coverage area.");
      setSaving(false);
      return;
    }

    const skillsArray = skills
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length >= 2);

    try {
      const saved = await readJson<{ user_id: string }>("/api/profiles/artisan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_phone: phone,
          primary_trade: trade,
          experience_years: Number(experience),
          coverage_areas: coverageArray,
          workshop_area: workshop,
          bio,
          skills: skillsArray.length > 0 ? skillsArray : [trade],
          rate_guidance_kobo: Math.round(Number(rateNaira || "0") * 100),
          availability_notes: availabilityNotes || null,
          is_listed: isListed,
        }),
      });
      setSuccess("Your work profile has been saved.");
      setSavedUserId(saved.user_id);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save work profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="aw-form" onSubmit={submit}>
<div className="aw-form-row">
        <label className="aw-field">
          <span>Primary trade / craft</span>
          <input
            required
            minLength={2}
            maxLength={100}
            value={trade}
            onChange={(event) => setTrade(event.target.value)}
            placeholder="e.g. Plumbing, Carpentry, Electrical"
          />
        </label>

        <label className="aw-field">
          <span>Contact phone number</span>
          <input
            required
            minLength={8}
            maxLength={20}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="e.g. +234 801 234 5678"
          />
          <small>Used for direct job coordination once work is agreed.</small>
        </label>
      </div>

      <div className="aw-form-row">
        <label className="aw-field">
          <span>Years of active experience</span>
          <input
            required
            type="number"
            min={0}
            max={60}
            value={experience}
            onChange={(event) => setExperience(Number(event.target.value))}
          />
        </label>

        <label className="aw-field">
          <span>Starting rate guidance (NGN)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={rateNaira}
            onChange={(event) => setRateNaira(event.target.value)}
            placeholder="15000"
          />
          <small>Helps customers understand your baseline pricing.</small>
        </label>
      </div>

      <label className="aw-field">
        <span>Workshop / base address</span>
        <input
          required
          minLength={2}
          maxLength={100}
          value={workshop}
          onChange={(event) => setWorkshop(event.target.value)}
          placeholder="e.g. 14 Airport Road, Benin City"
        />
      </label>

      <label className="aw-field">
        <span>Coverage areas (comma-separated)</span>
        <input
          required
          value={coverage}
          onChange={(event) => setCoverage(event.target.value)}
          placeholder="e.g. GRA, Airport Road, Ring Road, Ugbowo"
        />
        <small>Areas where you can travel to take on client jobs.</small>
      </label>

      <label className="aw-field">
        <span>Skills and specialties (comma-separated)</span>
        <input
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
          placeholder="e.g. PPR welding, Water pump repair, Underground drainage"
        />
      </label>

      <label className="aw-field">
        <span>Professional bio</span>
        <textarea
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Describe your craft background, apprenticeships, standard response times and quality standards."
        />
      </label>

      <label className="aw-field">
        <span>Availability notes</span>
        <input
          maxLength={500}
          value={availabilityNotes}
          onChange={(event) => setAvailabilityNotes(event.target.value)}
          placeholder="e.g. Monday-Saturday 8am-6pm; 24hr emergency leak response"
        />
      </label>

      <label className="aw-check">
        <input
          type="checkbox"
          checked={isListed}
          onChange={(event) => setIsListed(event.target.checked)}
        />
        <span>List my profile publicly in the artisan directory and search</span>
      </label>

      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {success ? (
        <div className="aw-alert aw-alert-success">
          <span>
            {success}{" "}
            {savedUserId ? (
              <Link className="aw-link" href={`/artisans/${savedUserId}`}>
                View your public listing →
              </Link>
            ) : null}
          </span>
        </div>
      ) : null}

      <div className="aw-form-actions">
        <button className="aw-btn aw-btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving profile…" : "Save work profile"}
        </button>
        <Link className="aw-btn aw-btn-ghost" href="/artisan">
          Back to overview
        </Link>
      </div>
    </form>
  );
}

/* -------------------------- S17 Open requests ---------------------------- */

export function ArtisanOpportunitiesScreen() {
  const { desk, loading: deskLoading } = useArtisanDesk();
  const [requests, setRequests] = useState<DeskRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;
    void readJson<DeskRequest[]>("/api/requests/open")
      .then((rows) => {
        if (!active) return;
        setRequests(rows);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load open requests.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const hasProfile = desk?.profile != null;
  const filtered = requests.filter((request) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.title.toLowerCase().includes(query) ||
      request.category.toLowerCase().includes(query) ||
      request.service_area.toLowerCase().includes(query) ||
      request.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Requests & quotes" },
        ]}
      />

      <Head
        title="Open job requests"
        subtitle="Discover jobs posted by clients in need of your trade."
      />

      {!deskLoading && !hasProfile ? (
        <article className="aw-notice">
          <span className="aw-notice-icon">
            <Icon name="alert" size={17} />
          </span>
          <div className="aw-notice-copy">
            <strong>Work profile required</strong>
            <p>
              You can browse requests, but creating a work profile is required before submitting
              quotes.
            </p>
          </div>
          <Link className="aw-btn aw-btn-primary" href="/artisan/profile">
            Create work profile
          </Link>
        </article>
      ) : null}

      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {loading ? <p className="aw-loading">Loading open requests…</p> : null}

      <div className="aw-toolbar">
        <label className="aw-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Search by title, category, area or scope"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search open requests"
          />
        </label>
        <div className="aw-filters">
          <span className="aw-badge is-info">
            {filtered.length} of {requests.length} open
          </span>
        </div>
      </div>

      {!loading && filtered.length === 0 ? (
        <Empty
          icon="inbox"
          title={searchQuery ? "No requests match your search" : "No open requests right now"}
          body={
            searchQuery
              ? "Try a different trade, area or keyword."
              : "New client job posts appear here as soon as they are published."
          }
        />
      ) : null}

      {filtered.length > 0 ? (
        <div className="aw-list">
          {filtered.map((request) => (
            <article className="aw-row" key={request.id}>
              <div className="aw-row-head">
                <div className="aw-row-title">
                  <span className="aw-mono">{jobReference(request.id)}</span>
                  <h3>
                    <Link href={`/artisan/requests/${request.id}/quote`}>{request.title}</Link>
                  </h3>
                  <div className="aw-row-meta">
                    <span>{request.customer_name}</span>
                    <span>•</span>
                    <span>{request.category}</span>
                    <span>•</span>
                    <span>{request.service_area}</span>
                    <span>•</span>
                    <span>Posted {dateOnly(request.created_at)}</span>
                  </div>
                </div>
                <span className="aw-badge is-info">
                  {request.quotes_count} {request.quotes_count === 1 ? "quote" : "quotes"}
                </span>
              </div>

              <p className="aw-row-body">{request.description}</p>

              <div className="aw-row-foot">
                <div className="aw-money" style={{ borderTop: 0, paddingTop: 0 }}>
                  <div className="aw-money-cell">
                    <span className="aw-money-label">Client budget</span>
                    <span className="aw-money-value">{money(request.budget_guidance_kobo)}</span>
                  </div>
                  <div className="aw-money-cell">
                    <span className="aw-money-label">50% deposit guidance</span>
                    <span className="aw-money-value">
                      {money(depositOf(request.budget_guidance_kobo))}
                    </span>
                  </div>
                </div>
                <div className="aw-row-actions">
                  <Link
                    className="aw-btn aw-btn-primary aw-btn-sm"
                    href={`/artisan/requests/${request.id}/quote`}
                  >
                    <Icon name="send" size={14} />
                    Submit quote
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------- S18 Send quote ----------------------------- */

export function ArtisanSubmitQuoteScreen({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [request, setRequest] = useState<DeskRequest | null>(null);
  const [totalNaira, setTotalNaira] = useState("25000");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void readJson<DeskRequest>(`/api/requests/${requestId}`)
      .then((data) => {
        if (!active) return;
        setRequest(data);
        if (data.budget_guidance_kobo > 0) {
          setTotalNaira(String(Math.round(data.budget_guidance_kobo / 100)));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load this request.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const totalKobo = Math.round(Number(totalNaira || "0") * 100);
    if (totalKobo <= 0) {
      setError("Please provide a valid total quote amount.");
      setSubmitting(false);
      return;
    }

    try {
      await readJson(`/api/requests/${requestId}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_kobo: totalKobo, note }),
      });
      setSuccess("Your quote has been sent to the client.");
      setTimeout(() => router.push("/artisan/requests"), 1500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit quote.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalKobo = Math.round(Number(totalNaira || "0") * 100);

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Requests", href: "/artisan/requests" },
          { label: "New quote" },
        ]}
      />

      <Head
        title="Submit a quote"
        subtitle="Send a transparent, itemised quote to the client for this request."
      />

      {loading ? <p className="aw-loading">Loading request…</p> : null}
      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}

      <div className="aw-split">
        <section className="aw-panel">
          {request ? (
            <>
              <PanelHead
                title={request.title}
                note={`${request.category} · ${request.service_area}`}
              >
                <span className="aw-badge is-info">
                  {request.quotes_count} {request.quotes_count === 1 ? "quote" : "quotes"}
                </span>
              </PanelHead>

              <p className="aw-row-body">{request.description}</p>

              <dl className="aw-facts">
                <div className="aw-fact">
                  <dt>Client</dt>
                  <dd>{request.customer_name}</dd>
                </div>
                <div className="aw-fact">
                  <dt>Client budget</dt>
                  <dd>{money(request.budget_guidance_kobo)}</dd>
                </div>
                <div className="aw-fact">
                  <dt>Posted</dt>
                  <dd>{dateTime(request.created_at)}</dd>
                </div>
              </dl>
            </>
          ) : null}

          <form className="aw-form" onSubmit={submit}>
            <label className="aw-field">
              <span>Total quote amount (NGN)</span>
              <input
                required
                type="number"
                min={1}
                step={1}
                value={totalNaira}
                onChange={(event) => setTotalNaira(event.target.value)}
              />
              <small>
                Deposit guidance: {money(depositOf(totalKobo))} · Balance:{" "}
                {money(balanceOf(totalKobo))}
              </small>
            </label>

            <label className="aw-field">
              <span>Scope note & breakdown</span>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={6}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Explain what is included: labour, materials, estimated completion time and warranty."
              />
            </label>

            {success ? <p className="aw-alert aw-alert-success">{success}</p> : null}

            <div className="aw-form-actions">
              <button
                className="aw-btn aw-btn-primary"
                type="submit"
                disabled={submitting || Boolean(success)}
              >
                {submitting ? "Sending quote…" : "Submit quote"}
              </button>
              <Link className="aw-btn aw-btn-ghost" href="/artisan/requests">
                Cancel
              </Link>
            </div>
          </form>
        </section>

        <aside className="aw-stack aw-sticky">
          <section className="aw-panel">
            <PanelHead title="How quoting works" />
            <ol className="aw-steps">
              <li className="aw-step">
                <strong>Send your quote</strong>
                <p>The client compares quotes from artisans for this request.</p>
              </li>
              <li className="aw-step">
                <strong>Client accepts</strong>
                <p>An accepted quote becomes an active work order on your board.</p>
              </li>
              <li className="aw-step">
                <strong>Milestone funding</strong>
                <p>Deposits are recorded against the job as the client funds escrow.</p>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------ S28/S29 Progress updates ----------------------- */

type JobDetail = {
  work_ready_at?: string | null;
  signed_off_at?: string | null;
  id: string;
  request_id: string;
  status: DeskJob["status"];
  customer_id: string;
  worker_id: string;
  title: string;
  category: string;
  service_area: string;
  description?: string;
  budget_guidance_kobo: number;
  total_quote_kobo: number;
  created_at: string;
  updated_at: string;
};

type ProgressNote = { id: string; author_id: string; note: string; created_at: string };

export function ArtisanProgressUpdateScreen({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [updates, setUpdates] = useState<ProgressNote[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const reloadData = useCallback(async () => {
    try {
      const [jobData, progressUpdates] = await Promise.all([
        readJson<JobDetail>(`/api/jobs/${jobId}`),
        readJson<ProgressNote[]>(`/api/jobs/${jobId}/progress`),
      ]);
      setJob(jobData);
      setUpdates(progressUpdates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load job details.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      readJson<JobDetail>(`/api/jobs/${jobId}`),
      readJson<ProgressNote[]>(`/api/jobs/${jobId}/progress`),
    ])
      .then(([jobData, progressUpdates]) => {
        if (!active) return;
        setJob(jobData);
        setUpdates(progressUpdates);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load job details.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId]);

  const startJob = async (nextStatus = "in_progress") => {
    setSubmitting(true);
    setError(null);
    try {
      await readJson(`/api/jobs/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      setStatusMessage(nextStatus === "awaiting_signoff" ? "Work is ready for customer inspection." : "Job status changed to in progress.");
      await reloadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitNote = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatusMessage(null);

    try {
      await readJson(`/api/jobs/${jobId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      setNote("");
      setStatusMessage("Progress note posted successfully.");
      await reloadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post update.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "My jobs", href: "/artisan/jobs" },
          { label: "Progress" },
        ]}
      />

      <Head
        title="Log job progress"
        subtitle="Share milestone notes and technical updates with the client."
      >
        <Link className="aw-btn aw-btn-ghost" href="/artisan/jobs">
          Back to jobs
        </Link>
      </Head>

      {loading ? <p className="aw-loading">Loading work order…</p> : null}
      {error ? <p className="aw-alert aw-alert-error">{error}</p> : null}
      {statusMessage ? <p className="aw-alert aw-alert-success">{statusMessage}</p> : null}

      <div className="aw-split">
        <div className="aw-stack">
          {job ? (
            <section className="aw-panel">
              <PanelHead title={job.title} note={`${job.category} · ${job.service_area}`}>
                <Badge tone={jobTone[job.status]}>{jobLabel[job.status]}</Badge>
              </PanelHead>

              <Milestones status={job.status} />

              <div className="aw-money">
                <div className="aw-money-cell">
                  <span className="aw-money-label">Contract value</span>
                  <span className="aw-money-value">{money(job.total_quote_kobo)}</span>
                </div>
                <div className="aw-money-cell">
                  <span className="aw-money-label">Deposit</span>
                  <span className="aw-money-value">{money(depositOf(job.total_quote_kobo))}</span>
                </div>
                <div className="aw-money-cell">
                  <span className="aw-money-label">Balance</span>
                  <span className="aw-money-value">{money(balanceOf(job.total_quote_kobo))}</span>
                </div>
              </div>

              {job.status === "in_progress" && !job.work_ready_at ? <button className="aw-btn aw-btn-primary" disabled={submitting} onClick={() => void startJob("awaiting_signoff")}>Mark work ready for inspection</button> : null}
              {job.work_ready_at ? <p role="status">{job.status === "completed" ? "Booking completed; see Earnings for payout status." : job.signed_off_at ? "Customer sign-off saved; awaiting final payment." : "Waiting for customer inspection and sign-off."}</p> : null}
              {job.status === "accepted" ? (
                <div className="aw-form-actions">
                  <button
                    className="aw-btn aw-btn-primary"
                    type="button"
                    onClick={() => void startJob()}
                    disabled={submitting}
                  >
                    Start job · set in progress
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="aw-panel">
            <PanelHead title="Post an update" note="Visible to the client on the shared job view." />
            <form className="aw-form" onSubmit={submitNote}>
              <label className="aw-field">
                <span>Technical progress note</span>
                <textarea
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. Cleared main drain pipe; installed replacement brass valve. Ready for client inspection."
                />
              </label>

              <div className="aw-form-actions">
                <button
                  className="aw-btn aw-btn-primary"
                  type="submit"
                  disabled={submitting || !note.trim()}
                >
                  {submitting ? "Posting…" : "Post update"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="aw-stack aw-sticky">
          <section className="aw-panel">
            <PanelHead title="Update history" note={`${updates.length} entries`} />
            {updates.length === 0 ? (
              <p className="aw-panel-note">No updates posted yet.</p>
            ) : (
              <ul className="aw-timeline">
                {updates.map((item) => (
                  <li key={item.id}>
                    <p className="aw-timeline-note">{item.note}</p>
                    <span className="aw-timeline-time">{dateTime(item.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
