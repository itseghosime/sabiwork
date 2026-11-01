"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "./screens.css";

type WorkProfileSummary = {
  user_id: string;
  primary_trade: string;
  coverage_areas: string[];
  is_listed: boolean;
  verification_status: "unsubmitted" | "pending" | "approved" | "rejected";
  created_at: string;
};

type UserSummary = {
  user_id: string;
  role: string;
  display_name: string;
  created_at: string;
};

type RequestSummary = {
  id: string;
  customer_id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
};

type OverviewData = {
  users: UserSummary[];
  workProfiles: WorkProfileSummary[];
  requests: RequestSummary[];
};

type DossierDetail = {
  user_id: string;
  display_name: string;
  contact_phone: string;
  primary_trade: string;
  experience_years: number;
  coverage_areas: string[];
  workshop_area: string;
  bio: string;
  skills: string[];
  rate_guidance_kobo: number | null;
  verification_status: "unsubmitted" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

type ApiError = { error?: { code?: string; message?: string } };

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
  return <span className="admin-status-pill">{text.replaceAll("_", " ")}</span>;
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
    <section className="admin-page">
      <header className="admin-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

export function AdminVerificationQueueScreen() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<OverviewData>("/api/admin/overview")
      .then((res) => {
        if (!active) return;
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load admin overview.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <PageFrame title="Verification Queue" subtitle="Loading artisan dossiers from Neon...">
        <p>Loading...</p>
      </PageFrame>
    );
  }

  const profiles = data?.workProfiles || [];
  const pendingCount = profiles.filter((p) => p.verification_status === "pending").length;
  const approvedCount = profiles.filter((p) => p.verification_status === "approved").length;
  const unsubmittedCount = profiles.filter((p) => p.verification_status === "unsubmitted").length;
  const rejectedCount = profiles.filter((p) => p.verification_status === "rejected").length;

  const filtered = profiles.filter((p) => {
    if (filter === "all") return true;
    return p.verification_status === filter;
  });

  return (
    <section className="admin-page">
      <div className="admin-breadcrumbs">
        <Link href="/">SabiWork</Link>
        <span>/</span>
        <span>Admin Portal</span>
        <span>/</span>
        <span>Verification Queue</span>
      </div>

      <header className="admin-header">
        <h1>Artisan Verification Queue</h1>
        <p>Review trade credentials, evaluate physical workshop locations, and grant verified marketplace badges.</p>
      </header>

      {error ? <p className="admin-error" role="alert">{error}</p> : null}

      {/* 4-Column KPI Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span className="metric-label">Registered Accounts</span>
          <span className="metric-value">{data?.users?.length ?? 0}</span>
          <span className="metric-subtext">Total users in Neon</span>
        </div>
        <div className="admin-metric-card">
          <span className="metric-label">Work Profiles</span>
          <span className="metric-value">{profiles.length}</span>
          <span className="metric-subtext">Marketplace trade profiles</span>
        </div>
        <div className="admin-metric-card">
          <span className="metric-label">Pending Review</span>
          <span className="metric-value" style={{ color: "#d97706" }}>{pendingCount}</span>
          <span className="metric-subtext">Awaiting administrative ruling</span>
        </div>
        <div className="admin-metric-card">
          <span className="metric-label">Approved Badges</span>
          <span className="metric-value" style={{ color: "#059669" }}>{approvedCount}</span>
          <span className="metric-subtext">Verified ID & workshop badges</span>
        </div>
      </div>

      {/* Filter Pill Controls */}
      <div className="admin-control-bar">
        <button
          type="button"
          className={`admin-filter-pill ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Applications ({profiles.length})
        </button>
        <button
          type="button"
          className={`admin-filter-pill ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          type="button"
          className={`admin-filter-pill ${filter === "unsubmitted" ? "active" : ""}`}
          onClick={() => setFilter("unsubmitted")}
        >
          Unsubmitted ({unsubmittedCount})
        </button>
        <button
          type="button"
          className={`admin-filter-pill ${filter === "approved" ? "active" : ""}`}
          onClick={() => setFilter("approved")}
        >
          Approved ({approvedCount})
        </button>
        {rejectedCount > 0 ? (
          <button
            type="button"
            className={`admin-filter-pill ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({rejectedCount})
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <h3>No artisan profiles found</h3>
          <p>No profiles match the filter &ldquo;{filter}&rdquo;.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Artisan Applicant</th>
                <th>Trade</th>
                <th>Coverage Areas</th>
                <th>Listing Status</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile) => (
                <tr key={profile.user_id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "#0f172a",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "15px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {profile.primary_trade[0].toUpperCase()}
                      </div>
                      <div>
                        <strong>{profile.primary_trade} Pro</strong>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                          ID: <code>{profile.user_id.slice(0, 12)}...</code>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-status-pill approved">{profile.primary_trade}</span>
                  </td>
                  <td>{profile.coverage_areas.slice(0, 2).join(", ")}</td>
                  <td>
                    <span style={{ fontSize: "13px", color: profile.is_listed ? "#047857" : "var(--muted)" }}>
                      {profile.is_listed ? "● Listed in Search" : "○ Hidden"}
                    </span>
                  </td>
                  <td><StatusPill text={profile.verification_status} /></td>
                  <td>
                    <Link
                      className="button button-outline"
                      style={{ minHeight: "36px", padding: "6px 14px", fontSize: "13px" }}
                      href={`/admin/verification/${profile.user_id}`}
                    >
                      Inspect Dossier →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function AdminDossierReviewScreen({ id }: { id: string }) {
  const [dossier, setDossier] = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const row = await readJson<DossierDetail>(`/api/admin/verification/${id}`);
      setDossier(row);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dossier.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    readJson<DossierDetail>(`/api/admin/verification/${id}`)
      .then((row) => {
        if (!active) return;
        setDossier(row);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load dossier.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const updateStatus = async (status: "approved" | "rejected" | "pending") => {
    setSubmitting(true);
    setError(null);
    setStatusMessage(null);
    try {
      await readJson(`/api/admin/verification/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setStatusMessage(`Verification status successfully updated to ${status}.`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update verification status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageFrame title="Dossier review" subtitle="Loading artisan details...">
        <p>Loading...</p>
      </PageFrame>
    );
  }

  if (error && !dossier) {
    return (
      <PageFrame title="Dossier review" subtitle="Artisan dossier unavailable">
        <p className="admin-error" role="alert">{error}</p>
        <div className="admin-actions">
          <Link className="button button-outline" href="/admin/verification">
            Back to queue
          </Link>
        </div>
      </PageFrame>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-breadcrumbs">
        <Link href="/">SabiWork</Link>
        <span>/</span>
        <Link href="/admin/verification">Verification Queue</Link>
        <span>/</span>
        <span>Dossier Review</span>
      </div>

      <header className="admin-header">
        <h1>Artisan Dossier: {dossier?.display_name || id}</h1>
        <p>Evaluate trade credentials and physical workshop verification for {dossier?.primary_trade}.</p>
      </header>

      {dossier ? (
        <div className="admin-dossier-split">
          {/* Main Column: Dossier Details */}
          <div style={{ display: "grid", gap: "20px" }}>
            <article className="admin-card">
              <div className="admin-inline">
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0284c7 0%, #0f172a 100%)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      fontWeight: 700,
                      border: "3px solid #38bdf8",
                      boxShadow: "0 0 12px rgba(56, 189, 248, 0.3)",
                    }}
                  >
                    {dossier.display_name ? dossier.display_name[0].toUpperCase() : dossier.primary_trade[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{dossier.display_name}</h2>
                    <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                      User ID: <code>{dossier.user_id}</code>
                    </p>
                  </div>
                </div>
                <StatusPill text={dossier.verification_status} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginTop: "10px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Contact Phone</span>
                  <div style={{ fontWeight: 600 }}>{dossier.contact_phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Primary Craft</span>
                  <div style={{ fontWeight: 600 }}>{dossier.primary_trade}</div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Experience</span>
                  <div style={{ fontWeight: 600 }}>{dossier.experience_years} years active</div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Workshop Base</span>
                  <div style={{ fontWeight: 600 }}>{dossier.workshop_area}</div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Service Coverage</span>
                  <div style={{ fontWeight: 600 }}>{dossier.coverage_areas.join(", ")}</div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Registered In Neon</span>
                  <div style={{ fontWeight: 600 }}>{formatWat(dossier.created_at)}</div>
                </div>
              </div>
            </article>

            {/* Professional Biography */}
            <article className="admin-card">
              <h3>Professional Biography & Background</h3>
              <p style={{ lineHeight: 1.7, fontSize: "15px" }}>{dossier.bio}</p>
            </article>

            {/* Specialized Skills */}
            <article className="admin-card">
              <h3>Verified Skills & Competencies</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {dossier.skills.map((skill) => (
                  <span key={skill} className="admin-status-pill approved" style={{ fontSize: "13px", padding: "6px 14px" }}>
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </article>
          </div>

          {/* Side Column: Administrative Ruling */}
          <aside style={{ display: "grid", gap: "20px", alignContent: "start" }}>
            <article className="admin-card" style={{ borderLeft: "6px solid var(--primary)" }}>
              <div className="admin-inline">
                <h3>Administrative Ruling</h3>
                <StatusPill text={dossier.verification_status} />
              </div>

              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>
                Granting approval assigns the verified artisan badge across the directory and confirms workshop authenticity to customers.
              </p>

              {error ? <p className="admin-error" role="alert">{error}</p> : null}
              {statusMessage ? <p className="admin-success" role="status">{statusMessage}</p> : null}

              <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={submitting || dossier.verification_status === "approved"}
                  onClick={() => void updateStatus("approved")}
                >
                  {dossier.verification_status === "approved" ? "Badge Granted ✓" : "Approve Verified Badge"}
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  disabled={submitting || dossier.verification_status === "rejected"}
                  onClick={() => void updateStatus("rejected")}
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  className="button button-subtle"
                  disabled={submitting || dossier.verification_status === "pending"}
                  onClick={() => void updateStatus("pending")}
                >
                  Mark Pending Review
                </button>
                <Link className="button button-subtle" href="/admin/verification" style={{ textAlign: "center" }}>
                  ← Back to Queue
                </Link>
              </div>
            </article>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

export function AdminDisputesScreen() {
  return (
    <PageFrame
      title="Dispute arbitration queue"
      subtitle="Administrative mediation service status."
    >
      <article className="admin-card">
        <h2>Dispute arbitration unavailable</h2>
        <p>
          Formal dispute arbitration, evidence lockers, and escrow mediation are currently unavailable in this build.
          Job completion and mutual signoff are coordinated directly between the customer and artisan.
        </p>
        <p style={{ color: "var(--muted)" }}>
          No mock arbitrations or simulated administrative decisions are recorded.
        </p>
        <div className="admin-actions" style={{ marginTop: "12px" }}>
          <Link className="button button-outline" href="/admin/verification">
            Go to verification queue
          </Link>
        </div>
      </article>
    </PageFrame>
  );
}

export function AdminDisputeDetailScreen({ id }: { id: string }) {
  return (
    <PageFrame
      title="Dispute dossier"
      subtitle={`Case reference ${id}`}
    >
      <article className="admin-card">
        <h2>Mediation service unavailable</h2>
        <p>
          Dispute case {id} cannot be arbitrated because dispute resolution is not integrated in this build.
        </p>
        <div className="admin-actions" style={{ marginTop: "12px" }}>
          <Link className="button button-outline" href="/admin/disputes">
            Back to disputes
          </Link>
        </div>
      </article>
    </PageFrame>
  );
}
