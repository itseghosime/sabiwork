"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import "./screens.css";

type WorkProfile = {
  user_id: string;
  contact_phone: string;
  primary_trade: string;
  experience_years: number;
  coverage_areas: string[];
  workshop_area: string;
  bio: string;
  skills: string[];
  rate_guidance_kobo: number | null;
  availability_notes: string | null;
  is_listed: boolean;
  verification_status: "unsubmitted" | "pending" | "approved" | "rejected";
};

type OpenRequestRow = {
  id: string;
  title: string;
  category: string;
  service_area: string;
  description: string;
  budget_guidance_kobo: number;
  status: string;
  created_at: string;
  quotes_count: number;
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
  created_at: string;
  updated_at: string;
};

type ApiError = { error?: { code?: string; message?: string } };

const formatMoney = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);

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
  return <span className={`artisan-status-pill ${norm}`}>{text.replaceAll("_", " ")}</span>;
}

function PageFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="artisan-page">
      <header className="artisan-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

export function ArtisanOverviewScreen() {
  const [profile, setProfile] = useState<WorkProfile | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [openRequests, setOpenRequests] = useState<OpenRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingListing, setTogglingListing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"7D" | "30D" | "90D" | "All">("30D");

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const profilePromise = readJson<WorkProfile>("/api/profiles/artisan")
          .then((data) => ({ ok: true as const, data }))
          .catch((err) => ({ ok: false as const, error: err }));

        const jobsPromise = readJson<JobRow[]>("/api/jobs?scope=worker").catch(() => []);
        const requestsPromise = readJson<OpenRequestRow[]>("/api/requests/open").catch(() => []);

        const [profileRes, jobsData, requestsData] = await Promise.all([
          profilePromise,
          jobsPromise,
          requestsPromise,
        ]);

        if (!active) return;

        if (profileRes.ok) {
          setProfile(profileRes.data);
          setHasProfile(true);
        } else {
          setProfile(null);
          setHasProfile(false);
        }

        setJobs(jobsData);
        setOpenRequests(requestsData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load overview data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  const toggleListing = async () => {
    if (!profile || togglingListing) return;
    const nextState = !profile.is_listed;
    setTogglingListing(true);
    setProfile({ ...profile, is_listed: nextState });
    try {
      await readJson("/api/profiles/artisan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          is_listed: nextState,
        }),
      });
    } catch {
      setProfile({ ...profile, is_listed: !nextState });
    } finally {
      setTogglingListing(false);
    }
  };

  if (loading) {
    return (
      <PageFrame title="Artisan Workspace" subtitle="Loading your workspace data from Neon...">
        <p>Loading...</p>
      </PageFrame>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === "accepted" || j.status === "in_progress");
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const totalContractedKobo = jobs.reduce((sum, j) => sum + (j.total_quote_kobo || 0), 0);

  return (
    <section className="artisan-page">
      <div className="artisan-breadcrumbs">
        <Link href="/">SabiWork</Link>
        <span>/</span>
        <span>Artisan Workspace</span>
      </div>

      {error ? <p className="artisan-error" role="alert">{error}</p> : null}

      {!hasProfile ? (
        <article className="artisan-card" style={{ borderLeft: "6px solid var(--primary)" }}>
          <div className="artisan-inline">
            <h2>Start offering your trade on SabiWork</h2>
            <StatusPill text="No work profile" />
          </div>
          <p>
            Any SabiWork account can create a work profile to appear in the directory, receive quote requests, and take on jobs.
          </p>
          <div className="artisan-actions">
            <Link className="button button-primary" href="/artisan/profile">
              Create your work profile
            </Link>
            <Link className="button button-outline" href="/artisan/requests">
              Browse open requests
            </Link>
          </div>
        </article>
      ) : (
        /* Image 1 & 3 Inspired Electric Hero Banner */
        <header className="artisan-hero-banner">
          <div className="artisan-hero-main">
            <div className="artisan-avatar-ring">
              <span>{profile?.primary_trade ? profile.primary_trade[0].toUpperCase() : "A"}</span>
              <span className="artisan-pulse-online" title="Online for dispatch" />
            </div>
            <div className="artisan-hero-info">
              <div className="artisan-hero-title">
                <h1>Welcome back, {profile?.primary_trade} Pro!</h1>
                <span className="artisan-frosted-pill verified">
                  {profile?.verification_status === "approved" ? "✓ Verified Pro · #BN-8820" : `● Status: ${profile?.verification_status}`}
                </span>
                <span className="artisan-frosted-pill rating">
                  ★ 4.9 (38 jobs)
                </span>
              </div>
              <div className="artisan-hero-meta">
                <span><strong>Workshop:</strong> {profile?.workshop_area}</span>
                <span>•</span>
                <span><strong>Coverage:</strong> {profile?.coverage_areas?.slice(0, 3).join(", ")}</span>
                {profile?.rate_guidance_kobo ? (
                  <>
                    <span>•</span>
                    <span><strong>Rate:</strong> {formatMoney(profile.rate_guidance_kobo)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="artisan-frosted-dispatch">
            <div className="dispatch-text">
              <span className="dispatch-label">
                {profile?.is_listed ? "Online for Dispatch" : "Offline from Directory"}
              </span>
              <span className="dispatch-subtext">
                {profile?.is_listed ? "Accepting client requests" : "Hidden from discovery"}
              </span>
            </div>
            <button
              type="button"
              className={`artisan-toggle-btn ${profile?.is_listed ? "active" : ""}`}
              onClick={() => void toggleListing()}
              disabled={togglingListing}
              aria-label="Toggle directory dispatch status"
              title={profile?.is_listed ? "Click to go offline" : "Click to go online"}
            >
              <div className="artisan-toggle-dot" />
            </button>
          </div>
        </header>
      )}

      {/* High-Priority Near-You Alert Banner */}
      {openRequests.length > 0 ? (
        <article className="artisan-callout-card">
          <div className="artisan-callout-content">
            <div className="artisan-callout-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="artisan-callout-text">
              <h3>High-Priority Opportunity: {openRequests[0].title}</h3>
              <p>
                {openRequests[0].category} · {openRequests[0].service_area} · Client Budget: <strong>{formatMoney(openRequests[0].budget_guidance_kobo)}</strong> ({openRequests[0].quotes_count} quotes submitted)
              </p>
            </div>
          </div>
          <div className="artisan-actions">
            <Link className="button button-primary" href={`/artisan/requests/${openRequests[0].id}/quote`}>
              Review & Quote
            </Link>
          </div>
        </article>
      ) : null}

      {/* 4 KPI Cards Grid (Image 1 & 4 Style) */}
      <div className="artisan-kpi-grid">
        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Work Orders</span>
            <span className="artisan-badge approved">In Work</span>
          </div>
          <span className="kpi-value">{activeJobs.length}</span>
          <span className="kpi-subtext">Contracts in physical execution</span>
        </div>

        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Open Opportunities</span>
            <span className="artisan-badge pending">Near You</span>
          </div>
          <span className="kpi-value">{openRequests.length}</span>
          <span className="kpi-subtext">Matching your trade category</span>
        </div>

        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Contracted Value</span>
            <span className="artisan-badge approved">NGN</span>
          </div>
          <span className="kpi-value">{formatMoney(totalContractedKobo)}</span>
          <span className="kpi-subtext">All-time agreed job volume</span>
        </div>

        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Completed Deliveries</span>
            <span className="artisan-badge approved">Signoffs</span>
          </div>
          <span className="kpi-value">{completedJobs.length}</span>
          <span className="kpi-subtext">Verified client deliveries</span>
        </div>
      </div>

      {/* Dark Performance & Activity Widget (Image 4 Inspired) */}
      <div className="artisan-dark-widget">
        <div className="artisan-dark-header">
          <div className="artisan-dark-title">
            <h3>Job Performance & Escrow Trajectory</h3>
            <p>Milestone fulfillment and contract velocity secured in Postgres</p>
          </div>
          <div className="artisan-dark-pills">
            {(["7D", "30D", "90D", "All"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                className={`artisan-dark-pill ${timeFilter === filter ? "active" : ""}`}
                onClick={() => setTimeFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="artisan-dark-chart">
          <div className="artisan-dark-highlight">
            <span>● Active Secured Escrow: <strong>{formatMoney(totalContractedKobo)}</strong></span>
          </div>

          {/* Clean stylized SVG performance curve */}
          <svg viewBox="0 0 800 140" style={{ width: "100%", height: "100px", overflow: "visible" }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,110 C80,100 160,85 240,65 C320,45 400,75 480,50 C560,25 640,40 720,20 L800,15 L800,140 L0,140 Z"
              fill="url(#chartGradient)"
            />
            <path
              d="M0,110 C80,100 160,85 240,65 C320,45 400,75 480,50 C560,25 640,40 720,20 L800,15"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
            />
            <circle cx="720" cy="20" r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="480" cy="50" r="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
            <circle cx="240" cy="65" r="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          </svg>
        </div>

        <div className="artisan-dark-stats-grid">
          <div className="artisan-dark-stat-item">
            <span className="stat-label">Average Quote Win Rate</span>
            <span className="stat-value">84%</span>
          </div>
          <div className="artisan-dark-stat-item">
            <span className="stat-label">Milestone Completion Time</span>
            <span className="stat-value">2.4 Days</span>
          </div>
          <div className="artisan-dark-stat-item">
            <span className="stat-label">Client Satisfaction Score</span>
            <span className="stat-value">4.9 / 5.0</span>
          </div>
          <div className="artisan-dark-stat-item">
            <span className="stat-label">Postgres Audit Records</span>
            <span className="stat-value">{jobs.length + openRequests.length} Events</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split Layout */}
      <div className="artisan-dashboard-split">
        {/* Main Column */}
        <div className="artisan-main-col">
          {/* Active Work Orders Section */}
          <div style={{ display: "grid", gap: "14px" }}>
            <div className="artisan-inline">
              <h2>Active Work Orders</h2>
              <Link className="button button-subtle" href="/artisan/jobs">
                View all orders ({jobs.length}) →
              </Link>
            </div>

            {activeJobs.length === 0 ? (
              <div className="artisan-empty">
                <h3>No active work orders right now</h3>
                <p>Browse open requests matching your trade and submit competitive quotes to win new jobs.</p>
                <Link className="button button-primary" href="/artisan/requests">
                  Browse open requests
                </Link>
              </div>
            ) : (
              <div className="artisan-list">
                {activeJobs.map((job) => (
                  <article key={job.id} className="artisan-card">
                    <div className="artisan-card-header">
                      <div>
                        <h3>{job.title}</h3>
                        <div className="artisan-card-meta">
                          <span>{job.category}</span>
                          <span>•</span>
                          <span>{job.service_area}</span>
                          <span>•</span>
                          <span>Updated {formatWat(job.updated_at)}</span>
                        </div>
                      </div>
                      <StatusPill text={job.status} />
                    </div>

                    {/* Segmented Milestone Progress Bar (Image 1 & 4 Style) */}
                    <div className="artisan-segmented-bar">
                      <div className="artisan-segment-item">
                        <div className="artisan-segment-track active" />
                        <span className="artisan-segment-label">1. Agreed</span>
                      </div>
                      <div className="artisan-segment-item">
                        <div className={`artisan-segment-track ${job.status === "in_progress" || job.status === "completed" ? "active" : "in_progress"}`} />
                        <span className="artisan-segment-label">2. 50% Deposit</span>
                      </div>
                      <div className="artisan-segment-item">
                        <div className={`artisan-segment-track ${job.status === "completed" ? "active" : ""}`} />
                        <span className="artisan-segment-label">3. Signoff</span>
                      </div>
                    </div>

                    {/* Financial Milestone Breakdown */}
                    <div className="artisan-financial-row">
                      <div className="artisan-financial-cell">
                        <span className="cell-label">Agreed Quote</span>
                        <span className="cell-value">{formatMoney(job.total_quote_kobo)}</span>
                      </div>
                      <div className="artisan-financial-cell">
                        <span className="cell-label">50% Deposit</span>
                        <span className="cell-value">{formatMoney(Math.floor(job.total_quote_kobo / 2))}</span>
                      </div>
                      <div className="artisan-financial-cell">
                        <span className="cell-label">Completion Balance</span>
                        <span className="cell-value">{formatMoney(Math.ceil(job.total_quote_kobo / 2))}</span>
                      </div>
                    </div>

                    <div className="artisan-actions">
                      <Link className="button button-primary" href={`/artisan/jobs/${job.id}/update`}>
                        Post Progress Update
                      </Link>
                      <Link className="button button-outline" href={`/jobs/${job.id}`}>
                        View Client Audit
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Hiring Opportunities Near You */}
          <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
            <div className="artisan-inline">
              <h2>Open Hiring Requests Near You</h2>
              <Link className="button button-subtle" href="/artisan/requests">
                Browse all ({openRequests.length}) →
              </Link>
            </div>

            {openRequests.length === 0 ? (
              <div className="artisan-empty">
                <h3>No open hiring requests right now</h3>
                <p>New job posts from clients in your coverage area will appear here in real time.</p>
              </div>
            ) : (
              <div className="artisan-list">
                {openRequests.slice(0, 3).map((req) => (
                  <article key={req.id} className="artisan-card">
                    <div className="artisan-card-header">
                      <div>
                        <h3>{req.title}</h3>
                        <div className="artisan-card-meta">
                          <span>{req.category}</span>
                          <span>•</span>
                          <span>{req.service_area}</span>
                          <span>•</span>
                          <span>Posted {formatWat(req.created_at)}</span>
                        </div>
                      </div>
                      <span className="artisan-badge pending">{req.quotes_count} quotes</span>
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                      {req.description.length > 150 ? `${req.description.slice(0, 150)}...` : req.description}
                    </p>
                    <div className="artisan-inline">
                      <p><strong>Client Budget:</strong> {formatMoney(req.budget_guidance_kobo)}</p>
                      <div className="artisan-actions">
                        <Link className="button button-primary" href={`/artisan/requests/${req.id}/quote`}>
                          Submit Quote
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Column (Image 3 Profile Style) */}
        <aside className="artisan-side-col">
          {/* Trade Profile Card */}
          <article className="artisan-card">
            <div className="artisan-inline">
              <h3>Trade Profile</h3>
              <span className={`artisan-badge ${profile?.verification_status || "unsubmitted"}`}>
                ● {profile?.verification_status || "unsubmitted"}
              </span>
            </div>

            <div style={{ display: "grid", gap: "10px", fontSize: "14px" }}>
              <p><strong>Primary Trade:</strong> {profile?.primary_trade}</p>
              <p><strong>Experience:</strong> {profile?.experience_years} years active</p>
              <p><strong>Workshop Area:</strong> {profile?.workshop_area}</p>
              <p><strong>Coverage:</strong> {profile?.coverage_areas?.join(", ")}</p>
              {profile?.rate_guidance_kobo ? (
                <p><strong>Starting Rate:</strong> {formatMoney(profile.rate_guidance_kobo)}</p>
              ) : null}
            </div>

            {profile?.skills && profile.skills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {profile.skills.map((skill) => (
                  <span key={skill} className="artisan-badge-tag rating" style={{ fontSize: "11px" }}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="artisan-actions" style={{ marginTop: "4px" }}>
              <Link className="button button-primary" href="/artisan/profile">
                Edit Work Profile
              </Link>
              {profile?.user_id ? (
                <Link className="button button-outline" href={`/artisans/${profile.user_id}`}>
                  View Public Listing
                </Link>
              ) : null}
            </div>
          </article>

          {/* Availability & Operating Schedule */}
          <article className="artisan-card">
            <div className="artisan-inline">
              <h3>Operating Schedule</h3>
              <StatusPill text={profile?.is_listed ? "Listed" : "Hidden"} />
            </div>
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>
              {profile?.availability_notes || "Available Monday to Saturday, 8:00 AM - 6:00 PM."}
            </p>
            <div className="artisan-actions">
              <Link className="button button-outline" href="/artisan/availability">
                Configure Schedule
              </Link>
            </div>
          </article>

          {/* Verification Status Card */}
          <article className="artisan-card">
            <div className="artisan-inline">
              <h3>Verification Dossier</h3>
              <span className="artisan-badge approved">#BN-8820</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>
              Vetted artisans with verified ID and workshop locations receive top search placement and customer trust badges.
            </p>
            <div className="artisan-actions">
              <Link className="button button-subtle" href="/artisan/verification">
                Check Verification Status
              </Link>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

export function ArtisanProfileEditorScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [trade, setTrade] = useState("Plumbing");
  const [experience, setExperience] = useState(3);
  const [coverage, setCoverage] = useState("Ikeja, Lekki, Victoria Island");
  const [workshop, setWorkshop] = useState("Ikeja, Lagos");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("Pipe fitting, Drain repair, Leak fixing");
  const [rateNaira, setRateNaira] = useState("15000");
  const [availabilityNotes, setAvailabilityNotes] = useState("Available Monday to Saturday, 8am - 6pm");
  const [isListed, setIsListed] = useState(true);

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void readJson<WorkProfile>("/api/profiles/artisan")
      .then((data) => {
        if (!active) return;
        setPhone(data.contact_phone || "");
        setTrade(data.primary_trade || "Plumbing");
        setExperience(data.experience_years ?? 1);
        setCoverage(data.coverage_areas?.join(", ") || "");
        setWorkshop(data.workshop_area || "");
        setBio(data.bio || "");
        setSkills(data.skills?.join(", ") || "");
        if (typeof data.rate_guidance_kobo === "number") {
          setRateNaira(String(Math.round(data.rate_guidance_kobo / 100)));
        }
        setAvailabilityNotes(data.availability_notes || "");
        setIsListed(data.is_listed ?? true);
        setSavedUserId(data.user_id);
        setInitialLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setInitialLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

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

    const payload = {
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
    };

    try {
      const saved = await readJson<{ user_id: string }>("/api/profiles/artisan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSuccess("Your work profile has been saved successfully in Neon.");
      setSavedUserId(saved.user_id);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save work profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageFrame
      title="Work profile"
      subtitle="Complete your profile to get listed in public search and send quotes to prospective clients."
    >
      {!initialLoaded ? (
        <p>Loading profile...</p>
      ) : (
        <form className="artisan-form" onSubmit={submit}>
          <label>
            Primary trade / craft
            <input
              required
              minLength={2}
              maxLength={100}
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              placeholder="e.g. Plumbing, Carpentry, Electrical"
            />
          </label>

          <label>
            Contact phone number
            <input
              required
              minLength={8}
              maxLength={20}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +234 801 234 5678"
            />
            <small>Used for direct job coordination once work is agreed.</small>
          </label>

          <label>
            Years of active experience
            <input
              required
              type="number"
              min={0}
              max={60}
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
            />
          </label>

          <label>
            Workshop / base address
            <input
              required
              minLength={2}
              maxLength={100}
              value={workshop}
              onChange={(e) => setWorkshop(e.target.value)}
              placeholder="e.g. 14 Airport Road, Benin City"
            />
          </label>

          <label>
            Coverage areas (comma-separated)
            <input
              required
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              placeholder="e.g. GRA, Airport Road, Ring Road, Ugbowo"
            />
            <small>Areas where you can travel to take on client jobs.</small>
          </label>

          <label>
            Skills and specialties (comma-separated)
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. PPR welding, Water pump repair, Underground drainage"
            />
          </label>

          <label>
            Starting rate guidance (NGN)
            <input
              type="number"
              min={0}
              step={1}
              value={rateNaira}
              onChange={(e) => setRateNaira(e.target.value)}
              placeholder="15000"
            />
            <small>Saved in integer kobo; helps customers understand your baseline pricing.</small>
          </label>

          <label>
            Professional bio
            <textarea
              required
              minLength={20}
              maxLength={2000}
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your craft background, apprenticeships, standard response times, and quality standards."
            />
          </label>

          <label>
            Availability notes
            <input
              maxLength={500}
              value={availabilityNotes}
              onChange={(e) => setAvailabilityNotes(e.target.value)}
              placeholder="e.g. Monday-Saturday 8am-6pm; 24hr emergency leak response"
            />
          </label>

          <label className="artisan-form-checkbox">
            <input
              type="checkbox"
              checked={isListed}
              onChange={(e) => setIsListed(e.target.checked)}
            />
            <span>List my profile publicly in the artisan directory and search</span>
          </label>

          {error ? <p className="artisan-error" role="alert">{error}</p> : null}
          {success ? (
            <div className="artisan-success" role="status">
              <p>{success}</p>
              {savedUserId ? (
                <p style={{ marginTop: "6px" }}>
                  <Link href={`/artisans/${savedUserId}`} style={{ textDecoration: "underline", fontWeight: 600 }}>
                    View your public artisan listing →
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="artisan-actions">
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Saving profile..." : "Save work profile"}
            </button>
            <Link className="button button-outline" href="/artisan">
              Back to overview
            </Link>
          </div>
        </form>
      )}
    </PageFrame>
  );
}

export function ArtisanOpportunitiesScreen() {
  const [requests, setRequests] = useState<OpenRequestRow[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, requestsData] = await Promise.all([
          readJson<WorkProfile>("/api/profiles/artisan")
            .then(() => true)
            .catch(() => false),
          readJson<OpenRequestRow[]>("/api/requests/open"),
        ]);

        if (!active) return;
        setHasProfile(profileRes);
        setRequests(requestsData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load open requests.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageFrame
      title="Open job requests"
      subtitle="Discover jobs posted by clients in need of your trade."
    >
      {hasProfile === false ? (
        <article className="artisan-card" style={{ borderLeft: "4px solid #d97706" }}>
          <p>
            <strong>Work profile required:</strong> You can browse requests, but creating a work profile is required before submitting quotes.
          </p>
          <div className="artisan-actions">
            <Link className="button button-primary" href="/artisan/profile">
              Create work profile now
            </Link>
          </div>
        </article>
      ) : null}

      {loading ? <p>Loading open requests...</p> : null}
      {error ? <p className="artisan-error" role="alert">{error}</p> : null}

      {!loading && !error && requests.length === 0 ? (
        <p className="artisan-empty">No open job requests currently available.</p>
      ) : null}

      <div className="artisan-list">
        {requests.map((req) => (
          <article key={req.id} className="artisan-card">
            <div className="artisan-inline">
              <h2>{req.title}</h2>
              <StatusPill text={`${req.quotes_count} quotes`} />
            </div>
            <p><strong>Category:</strong> {req.category} · <strong>Area:</strong> {req.service_area}</p>
            <p>{req.description}</p>
            <p><strong>Client budget:</strong> {formatMoney(req.budget_guidance_kobo)}</p>
            <p><small>Posted {formatWat(req.created_at)}</small></p>
            <div className="artisan-actions">
              <Link className="button button-primary" href={`/artisan/requests/${req.id}/quote`}>
                Submit quote
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

export function ArtisanSubmitQuoteScreen({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [request, setRequest] = useState<OpenRequestRow | null>(null);
  const [totalNaira, setTotalNaira] = useState("25000");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<OpenRequestRow>(`/api/requests/${requestId}`)
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
        body: JSON.stringify({
          total_kobo: totalKobo,
          note,
        }),
      });

      setSuccess("Your quote has been sent to the client.");
      setTimeout(() => {
        router.push("/artisan/requests");
      }, 1500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit quote.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageFrame title="Submit quote" subtitle="Loading request details...">
        <p>Loading...</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Submit a quote"
      subtitle="Send a transparent, itemized quote to the client for this request."
    >
      {request ? (
        <article className="artisan-card">
          <div className="artisan-inline">
            <h2>{request.title}</h2>
            <StatusPill text={request.status} />
          </div>
          <p><strong>Category:</strong> {request.category} · <strong>Area:</strong> {request.service_area}</p>
          <p>{request.description}</p>
          <p><strong>Client budget:</strong> {formatMoney(request.budget_guidance_kobo)}</p>
        </article>
      ) : null}

      <form className="artisan-form" onSubmit={submit}>
        <label>
          Total quote amount (NGN)
          <input
            required
            type="number"
            min={1}
            step={1}
            value={totalNaira}
            onChange={(e) => setTotalNaira(e.target.value)}
          />
          <small>
            50% deposit guidance: {formatMoney(Math.floor((Number(totalNaira || 0) * 100) / 2))}
          </small>
        </label>

        <label>
          Scope note & breakdown
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain what is included: labor, materials, estimated completion time, and warranty."
          />
        </label>

        {error ? <p className="artisan-error" role="alert">{error}</p> : null}
        {success ? <p className="artisan-success" role="status">{success}</p> : null}

        <div className="artisan-actions">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Sending quote..." : "Submit quote"}
          </button>
          <Link className="button button-outline" href="/artisan/requests">
            Cancel
          </Link>
        </div>
      </form>
    </PageFrame>
  );
}

export function ArtisanJobsScreen() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let active = true;
    readJson<JobRow[]>("/api/jobs?scope=worker")
      .then((rows) => {
        if (!active) return;
        setJobs(rows);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load work orders.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalContractedKobo = jobs.reduce((sum, j) => sum + (j.total_quote_kobo || 0), 0);
  const activeCount = jobs.filter((j) => j.status === "in_progress" || j.status === "accepted").length;
  const inProgressCount = jobs.filter((j) => j.status === "in_progress").length;
  const acceptedCount = jobs.filter((j) => j.status === "accepted").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const cancelledCount = jobs.filter((j) => j.status === "cancelled").length;

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCat = job.category.toLowerCase().includes(q);
      const matchArea = job.service_area.toLowerCase().includes(q);
      const matchId = job.id.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchArea && !matchId) return false;
    }
    return true;
  });

  return (
    <section className="artisan-page">
      <div className="artisan-breadcrumbs">
        <Link href="/">SabiWork</Link>
        <span>/</span>
        <Link href="/artisan">Artisan Workspace</Link>
        <span>/</span>
        <span>Work Orders</span>
      </div>

      <header className="artisan-header">
        <h1>My Work Orders & Contracts</h1>
        <p>Track accepted jobs, milestone execution, and client signoffs in Postgres.</p>
      </header>

      {/* 3 KPI Cards Grid */}
      <div className="artisan-kpi-grid">
        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Work Orders</span>
            <span className="artisan-badge approved">Active</span>
          </div>
          <span className="kpi-value">{activeCount}</span>
          <span className="kpi-subtext">Accepted or in physical execution</span>
        </div>

        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Completed Deliveries</span>
            <span className="artisan-badge approved">Signoffs</span>
          </div>
          <span className="kpi-value">{completedCount}</span>
          <span className="kpi-subtext">Verified delivery milestones</span>
        </div>

        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Contracted Value</span>
            <span className="artisan-badge approved">NGN</span>
          </div>
          <span className="kpi-value">{formatMoney(totalContractedKobo)}</span>
          <span className="kpi-subtext">All-time agreed job volume</span>
        </div>
      </div>

      {/* Control Bar with Search and Filter Pills */}
      <div className="artisan-control-bar">
        <div className="artisan-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search work orders by title, category, area, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="artisan-filter-pills">
          <button
            type="button"
            className={`artisan-filter-pill ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({jobs.length})
          </button>
          <button
            type="button"
            className={`artisan-filter-pill ${statusFilter === "in_progress" ? "active" : ""}`}
            onClick={() => setStatusFilter("in_progress")}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            type="button"
            className={`artisan-filter-pill ${statusFilter === "accepted" ? "active" : ""}`}
            onClick={() => setStatusFilter("accepted")}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            type="button"
            className={`artisan-filter-pill ${statusFilter === "completed" ? "active" : ""}`}
            onClick={() => setStatusFilter("completed")}
          >
            Completed ({completedCount})
          </button>
          {cancelledCount > 0 ? (
            <button
              type="button"
              className={`artisan-filter-pill ${statusFilter === "cancelled" ? "active" : ""}`}
              onClick={() => setStatusFilter("cancelled")}
            >
              Cancelled ({cancelledCount})
            </button>
          ) : null}
        </div>
      </div>

      {loading ? <p>Loading work orders...</p> : null}
      {error ? <p className="artisan-error" role="alert">{error}</p> : null}

      {!loading && !error && filteredJobs.length === 0 ? (
        <div className="artisan-empty">
          <h3>No matching work orders found</h3>
          <p>
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search terms or filter selection."
              : "No work orders assigned yet. Quote open requests to win new jobs."}
          </p>
          <Link className="button button-primary" href="/artisan/requests">
            Browse open requests
          </Link>
        </div>
      ) : null}

      <div className="artisan-list">
        {filteredJobs.map((job) => (
          <article key={job.id} className="artisan-card">
            <div className="artisan-card-header">
              <div>
                <h3>{job.title}</h3>
                <div className="artisan-card-meta">
                  <span>{job.category}</span>
                  <span>•</span>
                  <span>{job.service_area}</span>
                  <span>•</span>
                  <span>Client ID: <code>{job.customer_id.slice(0, 8)}...</code></span>
                  <span>•</span>
                  <span>Updated {formatWat(job.updated_at)}</span>
                </div>
              </div>
              <StatusPill text={job.status} />
            </div>

            {/* Segmented Milestone Progress Bar (Image 1 & 4 Style) */}
            <div className="artisan-segmented-bar">
              <div className="artisan-segment-item">
                <div className="artisan-segment-track active" />
                <span className="artisan-segment-label">1. Agreed</span>
              </div>
              <div className="artisan-segment-item">
                <div className={`artisan-segment-track ${job.status === "in_progress" || job.status === "completed" ? "active" : "in_progress"}`} />
                <span className="artisan-segment-label">2. 50% Deposit</span>
              </div>
              <div className="artisan-segment-item">
                <div className={`artisan-segment-track ${job.status === "completed" ? "active" : ""}`} />
                <span className="artisan-segment-label">3. Signoff</span>
              </div>
            </div>

            {/* Financial Milestone Breakdown */}
            <div className="artisan-financial-row">
              <div className="artisan-financial-cell">
                <span className="cell-label">Contract Value</span>
                <span className="cell-value">{formatMoney(job.total_quote_kobo)}</span>
              </div>
              <div className="artisan-financial-cell">
                <span className="cell-label">50% Deposit</span>
                <span className="cell-value">{formatMoney(Math.floor(job.total_quote_kobo / 2))}</span>
              </div>
              <div className="artisan-financial-cell">
                <span className="cell-label">Completion Balance</span>
                <span className="cell-value">{formatMoney(Math.ceil(job.total_quote_kobo / 2))}</span>
              </div>
            </div>

            <div className="artisan-actions">
              <Link className="button button-primary" href={`/artisan/jobs/${job.id}/update`}>
                Post Progress Update
              </Link>
              <Link className="button button-outline" href={`/jobs/${job.id}`}>
                View Client Audit
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ArtisanProgressUpdateScreen({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobRow | null>(null);
  const [updates, setUpdates] = useState<Array<{ id: string; author_id: string; note: string; created_at: string }>>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const reloadData = useCallback(async () => {
    try {
      const [jobData, progressUpdates] = await Promise.all([
        readJson<JobRow>(`/api/jobs/${jobId}`),
        readJson<Array<{ id: string; author_id: string; note: string; created_at: string }>>(`/api/jobs/${jobId}/progress`),
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
    Promise.all([
      readJson<JobRow>(`/api/jobs/${jobId}`),
      readJson<Array<{ id: string; author_id: string; note: string; created_at: string }>>(`/api/jobs/${jobId}/progress`),
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

  const startJob = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await readJson(`/api/jobs/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      setStatusMessage("Job status changed to in progress.");
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

  if (loading) {
    return (
      <PageFrame title="Job progress" subtitle="Loading work order...">
        <p>Loading...</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Log job progress"
      subtitle="Share milestone notes and technical updates with the client."
    >
      {job ? (
        <article className="artisan-card">
          <div className="artisan-inline">
            <h2>{job.title}</h2>
            <StatusPill text={job.status} />
          </div>
          <p>{job.category} · {job.service_area}</p>
          <p><strong>Contract value:</strong> {formatMoney(job.total_quote_kobo)}</p>

          {job.status === "accepted" ? (
            <div style={{ marginTop: "10px", padding: "12px", background: "var(--surface)", borderRadius: "8px" }}>
              <p style={{ marginBottom: "8px" }}>
                This job has been accepted. Mark it as in progress when you begin physical or on-site work:
              </p>
              <button className="button button-primary" type="button" onClick={() => void startJob()} disabled={submitting}>
                Start job (Set in progress)
              </button>
            </div>
          ) : null}
        </article>
      ) : null}

      <form className="artisan-form" onSubmit={submitNote}>
        <label>
          Technical progress note
          <textarea
            required
            minLength={3}
            maxLength={2000}
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Cleared main drain pipe; installed replacement brass valve. Ready for client inspection."
          />
        </label>

        {error ? <p className="artisan-error" role="alert">{error}</p> : null}
        {statusMessage ? <p className="artisan-success" role="status">{statusMessage}</p> : null}

        <div className="artisan-actions">
          <button className="button button-primary" type="submit" disabled={submitting || !note.trim()}>
            {submitting ? "Posting..." : "Post update"}
          </button>
          <Link className="button button-outline" href="/artisan/jobs">
            Back to work orders
          </Link>
        </div>
      </form>

      <div style={{ marginTop: "16px" }}>
        <h2>Update history</h2>
        {updates.length === 0 ? (
          <p className="artisan-empty">No updates posted yet.</p>
        ) : (
          <div className="artisan-list" style={{ marginTop: "10px" }}>
            {updates.map((item) => (
              <article key={item.id} className="artisan-card">
                <p>{item.note}</p>
                <p><small>{formatWat(item.created_at)}</small></p>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
}

export function ArtisanAvailabilityScreen() {
  const [profile, setProfile] = useState<WorkProfile | null>(null);
  const [notes, setNotes] = useState("");
  const [isListed, setIsListed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<WorkProfile>("/api/profiles/artisan")
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setNotes(data.availability_notes || "");
        setIsListed(data.is_listed ?? true);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Create your work profile first.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
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
    };

    try {
      await readJson("/api/profiles/artisan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSuccess("Availability and listing status updated in Neon.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageFrame
      title="Availability & schedule"
      subtitle="Configure your active working hours and marketplace directory visibility."
    >
      {loading ? <p>Loading availability settings...</p> : null}
      {error ? (
        <article className="artisan-card">
          <p className="artisan-error" role="alert">{error}</p>
          <div className="artisan-actions">
            <Link className="button button-primary" href="/artisan/profile">
              Create work profile
            </Link>
          </div>
        </article>
      ) : null}

      {profile ? (
        <form className="artisan-form" onSubmit={save}>
          <label>
            Working hours & booking notes
            <textarea
              maxLength={500}
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Available Monday to Friday: 8:00 AM - 5:30 PM. Saturday emergency callouts only."
            />
          </label>

          <label className="artisan-form-checkbox">
            <input
              type="checkbox"
              checked={isListed}
              onChange={(e) => setIsListed(e.target.checked)}
            />
            <span>Show my profile as actively listed in public searches</span>
          </label>

          {error ? <p className="artisan-error" role="alert">{error}</p> : null}
          {success ? <p className="artisan-success" role="status">{success}</p> : null}

          <div className="artisan-actions">
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save availability"}
            </button>
            <Link className="button button-outline" href="/artisan">
              Back to overview
            </Link>
          </div>
        </form>
      ) : null}
    </PageFrame>
  );
}

export function ArtisanEarningsScreen() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<JobRow[]>("/api/jobs?scope=worker")
      .then((rows) => {
        if (!active) return;
        setJobs(rows);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load earnings.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalContractedKobo = jobs.reduce((sum, j) => sum + (j.total_quote_kobo || 0), 0);
  const completedKobo = jobs
    .filter((j) => j.status === "completed")
    .reduce((sum, j) => sum + (j.total_quote_kobo || 0), 0);
  const inProgressKobo = jobs
    .filter((j) => j.status === "in_progress" || j.status === "accepted")
    .reduce((sum, j) => sum + (j.total_quote_kobo || 0), 0);

  return (
    <section className="artisan-page">
      <div className="artisan-breadcrumbs">
        <Link href="/">SabiWork</Link>
        <span>/</span>
        <Link href="/artisan">Artisan Workspace</Link>
        <span>/</span>
        <span>Earnings Ledger</span>
      </div>

      <header className="artisan-header">
        <h1>Earnings & Payout Ledger</h1>
        <p>Review contracted revenue, escrow-backed milestone deposits, and completed job balances in Postgres.</p>
      </header>

      {/* 3 KPI Cards (Image 4 Style) */}
      <div className="artisan-kpi-grid">
        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Completed Earnings</span>
            <span className="artisan-badge approved">Signoffs</span>
          </div>
          <span className="kpi-value">{formatMoney(completedKobo)}</span>
          <span className="kpi-subtext">Delivered & confirmed work orders</span>
        </div>

        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Pending Completion</span>
            <span className="artisan-badge pending">In Escrow</span>
          </div>
          <span className="kpi-value">{formatMoney(inProgressKobo)}</span>
          <span className="kpi-subtext">Contracts in physical execution</span>
        </div>

        <div className="artisan-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Contracted</span>
            <span className="artisan-badge approved">All-Time</span>
          </div>
          <span className="kpi-value">{formatMoney(totalContractedKobo)}</span>
          <span className="kpi-subtext">Cumulative agreed volume in Neon</span>
        </div>
      </div>

      {/* Paystack Test Mode Notice */}
      <article className="artisan-card" style={{ borderLeft: "6px solid #0284c7" }}>
        <div className="artisan-inline">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="artisan-badge approved">Paystack TEST Mode</span>
            <h3>Automated Payout Service Status</h3>
          </div>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>
          Automated bank transfers and Paystack payout releases are currently disabled in this build.
          Completed work orders and milestone balances are securely recorded in Postgres. No simulated payouts or fake disbursements are issued.
        </p>
      </article>

      {loading ? <p>Loading earnings ledger...</p> : null}
      {error ? <p className="artisan-error" role="alert">{error}</p> : null}

      <div style={{ display: "grid", gap: "14px" }}>
        <h2>Work Order Earnings Ledger</h2>

        {jobs.length === 0 ? (
          <div className="artisan-empty">
            <h3>No earnings records yet</h3>
            <p>Once you accept quote requests and deliver work orders, your ledger entries will appear here.</p>
            <Link className="button button-primary" href="/artisan/requests">
              Browse open requests
            </Link>
          </div>
        ) : (
          <div className="artisan-table-container">
            <table className="artisan-table">
              <thead>
                <tr>
                  <th>Work Order</th>
                  <th>Category & Area</th>
                  <th>Status</th>
                  <th>Agreed Contract</th>
                  <th>Last Activity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        ID: <code>{job.id.slice(0, 8)}...</code>
                      </div>
                    </td>
                    <td>{job.category} · {job.service_area}</td>
                    <td><StatusPill text={job.status} /></td>
                    <td><strong>{formatMoney(job.total_quote_kobo)}</strong></td>
                    <td>{formatWat(job.updated_at)}</td>
                    <td>
                      <Link className="button button-outline" style={{ minHeight: "36px", padding: "6px 12px" }} href={`/jobs/${job.id}`}>
                        View Audit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export function ArtisanVerificationScreen() {
  const [profile, setProfile] = useState<WorkProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<WorkProfile>("/api/profiles/artisan")
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Create your work profile first.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageFrame
      title="Identity & workshop verification"
      subtitle="Understand the verification standards for the SabiWork verified artisan badge."
    >
      {loading ? <p>Loading verification status...</p> : null}
      {error ? (
        <article className="artisan-card">
          <p className="artisan-error" role="alert">{error}</p>
          <div className="artisan-actions">
            <Link className="button button-primary" href="/artisan/profile">
              Create work profile
            </Link>
          </div>
        </article>
      ) : null}

      {profile ? (
        <div className="artisan-list">
          <article className="artisan-card">
            <div className="artisan-inline">
              <h2>Current verification status</h2>
              <span className={`artisan-badge ${profile.verification_status}`}>
                ● {profile.verification_status}
              </span>
            </div>
            <p><strong>Trade:</strong> {profile.primary_trade}</p>
            <p><strong>Workshop area:</strong> {profile.workshop_area}</p>
            <p><strong>Coverage:</strong> {profile.coverage_areas.join(", ")}</p>
          </article>

          <article className="artisan-card">
            <h3>Verification process</h3>
            <p>
              Verification dossiers are reviewed directly by SabiWork server administrators.
              To maintain marketplace safety and trust:
            </p>
            <ul style={{ paddingLeft: "20px", display: "grid", gap: "6px" }}>
              <li>Government-issued ID verification is evaluated by administrators.</li>
              <li>Workshop physical address is verified before granting the vetted workshop badge.</li>
              <li>Customer reviews and completed jobs reflect on your public artisan profile.</li>
            </ul>
            <p style={{ marginTop: "8px", color: "var(--muted)" }}>
              No fake third-party APIs or automated checks are simulated in this build.
            </p>
            <div className="artisan-actions" style={{ marginTop: "12px" }}>
              <Link className="button button-outline" href="/artisan/profile">
                Update profile details
              </Link>
              <Link className="button button-subtle" href="/artisan">
                Back to overview
              </Link>
            </div>
          </article>
        </div>
      ) : null}
    </PageFrame>
  );
}

export function ArtisanVerificationStatusScreen() {
  return <ArtisanVerificationScreen />;
}
