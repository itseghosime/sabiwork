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
  return <span className="artisan-status-pill">{text.replaceAll("_", " ")}</span>;
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

  if (loading) {
    return (
      <PageFrame title="Artisan overview" subtitle="Loading workspace data...">
        <p>Loading...</p>
      </PageFrame>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === "accepted" || j.status === "in_progress");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  return (
    <PageFrame
      title="Artisan workspace"
      subtitle="Manage your trade profile, review hiring opportunities, and track active work."
    >
      {error ? <p className="artisan-error" role="alert">{error}</p> : null}

      {!hasProfile ? (
        <article className="artisan-card" style={{ borderLeft: "4px solid var(--primary, #059669)" }}>
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
        <>
          <div className="artisan-metrics-grid">
            <div className="artisan-metric-card">
              <span className="metric-label">Trade</span>
              <span className="metric-value" style={{ fontSize: "1.25rem" }}>{profile?.primary_trade}</span>
            </div>
            <div className="artisan-metric-card">
              <span className="metric-label">Active jobs</span>
              <span className="metric-value">{activeJobs.length}</span>
            </div>
            <div className="artisan-metric-card">
              <span className="metric-label">Open requests</span>
              <span className="metric-value">{openRequests.length}</span>
            </div>
            <div className="artisan-metric-card">
              <span className="metric-label">Completed jobs</span>
              <span className="metric-value">{completedJobs.length}</span>
            </div>
          </div>

          <article className="artisan-card">
            <div className="artisan-inline">
              <h2>Trade profile status</h2>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className={`artisan-badge ${profile?.verification_status}`}>
                  ● {profile?.verification_status}
                </span>
                <StatusPill text={profile?.is_listed ? "Listed publicly" : "Hidden"} />
              </div>
            </div>
            <p><strong>Workshop:</strong> {profile?.workshop_area}</p>
            <p><strong>Coverage:</strong> {profile?.coverage_areas?.join(", ")}</p>
            {profile?.rate_guidance_kobo ? (
              <p><strong>Starting rate:</strong> {formatMoney(profile.rate_guidance_kobo)}</p>
            ) : null}
            <div className="artisan-actions">
              <Link className="button button-primary" href="/artisan/profile">
                Edit work profile
              </Link>
              <Link className="button button-outline" href={`/artisans/${profile?.user_id}`}>
                View public profile
              </Link>
              <Link className="button button-subtle" href="/artisan/availability">
                Availability
              </Link>
              <Link className="button button-subtle" href="/artisan/verification">
                Verification status
              </Link>
            </div>
          </article>
        </>
      )}

      <div style={{ marginTop: "12px", display: "grid", gap: "16px" }}>
        <div className="artisan-inline">
          <h2>Active work orders</h2>
          <Link className="button button-subtle" href="/artisan/jobs">
            View all jobs ({jobs.length})
          </Link>
        </div>

        {activeJobs.length === 0 ? (
          <p className="artisan-empty">No active jobs right now. Browse open requests to quote new work.</p>
        ) : (
          <div className="artisan-list">
            {activeJobs.map((job) => (
              <article key={job.id} className="artisan-card">
                <div className="artisan-inline">
                  <h3>{job.title}</h3>
                  <StatusPill text={job.status} />
                </div>
                <p>{job.category} · {job.service_area}</p>
                <p><strong>Agreed quote:</strong> {formatMoney(job.total_quote_kobo)}</p>
                <div className="artisan-actions">
                  <Link className="button button-primary" href={`/artisan/jobs/${job.id}/update`}>
                    Post progress update
                  </Link>
                  <Link className="button button-outline" href={`/jobs/${job.id}`}>
                    View job details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="artisan-inline" style={{ marginTop: "16px" }}>
          <h2>Recent hiring opportunities</h2>
          <Link className="button button-subtle" href="/artisan/requests">
            View all open requests ({openRequests.length})
          </Link>
        </div>

        {openRequests.length === 0 ? (
          <p className="artisan-empty">No open hiring requests matching your trade right now.</p>
        ) : (
          <div className="artisan-list">
            {openRequests.slice(0, 3).map((req) => (
              <article key={req.id} className="artisan-card">
                <div className="artisan-inline">
                  <h3>{req.title}</h3>
                  <StatusPill text={`${req.quotes_count} quotes`} />
                </div>
                <p>{req.category} · {req.service_area}</p>
                <p><strong>Client budget:</strong> {formatMoney(req.budget_guidance_kobo)}</p>
                <div className="artisan-actions">
                  <Link className="button button-primary" href={`/artisan/requests/${req.id}/quote`}>
                    Quote this request
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageFrame>
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

  return (
    <PageFrame
      title="My work orders"
      subtitle="Track your accepted jobs, post milestone progress, and coordinate with clients."
    >
      {loading ? <p>Loading work orders...</p> : null}
      {error ? <p className="artisan-error" role="alert">{error}</p> : null}

      {!loading && !error && jobs.length === 0 ? (
        <p className="artisan-empty">No work orders assigned yet. Quote open requests to win new jobs.</p>
      ) : null}

      <div className="artisan-list">
        {jobs.map((job) => (
          <article key={job.id} className="artisan-card">
            <div className="artisan-inline">
              <h2>{job.title}</h2>
              <StatusPill text={job.status} />
            </div>
            <p><strong>Category:</strong> {job.category} · <strong>Area:</strong> {job.service_area}</p>
            <p><strong>Contracted quote:</strong> {formatMoney(job.total_quote_kobo)}</p>
            <p><small>Last updated {formatWat(job.updated_at)}</small></p>
            <div className="artisan-actions">
              <Link className="button button-primary" href={`/artisan/jobs/${job.id}/update`}>
                Post progress update
              </Link>
              <Link className="button button-outline" href={`/jobs/${job.id}`}>
                View client audit
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
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
    <PageFrame
      title="Earnings & payouts"
      subtitle="Review contracted earnings across all assigned and completed work orders."
    >
      {loading ? <p>Loading earnings...</p> : null}
      {error ? <p className="artisan-error" role="alert">{error}</p> : null}

      <div className="artisan-metrics-grid">
        <div className="artisan-metric-card">
          <span className="metric-label">Completed earnings</span>
          <span className="metric-value">{formatMoney(completedKobo)}</span>
        </div>
        <div className="artisan-metric-card">
          <span className="metric-label">Pending completion</span>
          <span className="metric-value">{formatMoney(inProgressKobo)}</span>
        </div>
        <div className="artisan-metric-card">
          <span className="metric-label">Total contracted</span>
          <span className="metric-value">{formatMoney(totalContractedKobo)}</span>
        </div>
      </div>

      <article className="artisan-card" style={{ borderLeft: "4px solid #3b82f6" }}>
        <h3>Payout service status</h3>
        <p>
          Automated bank transfers and Paystack payout releases are currently unavailable in this build.
          Completed work orders are securely recorded in Postgres. No simulated payouts or fake disbursements are issued.
        </p>
      </article>

      <div style={{ marginTop: "16px" }}>
        <h2>Job earnings ledger</h2>
        {jobs.length === 0 ? (
          <p className="artisan-empty">No work order earnings recorded yet.</p>
        ) : (
          <div className="artisan-list" style={{ marginTop: "10px" }}>
            {jobs.map((job) => (
              <article key={job.id} className="artisan-card">
                <div className="artisan-inline">
                  <h3>{job.title}</h3>
                  <StatusPill text={job.status} />
                </div>
                <p><strong>Contract value:</strong> {formatMoney(job.total_quote_kobo)}</p>
                <p><small>Updated {formatWat(job.updated_at)}</small></p>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageFrame>
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
