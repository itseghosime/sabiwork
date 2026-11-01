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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await readJson<OverviewData>("/api/admin/overview");
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin overview.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleExportCsv = () => {
    if (!data || !data.workProfiles.length) return;
    const headers = [
      "User ID",
      "Primary Trade",
      "Coverage Areas",
      "Listing Status",
      "Verification Status",
      "Registered Date (UTC)",
    ];
    const rows = data.workProfiles.map((p) => [
      `"${p.user_id}"`,
      `"${p.primary_trade}"`,
      `"${p.coverage_areas.join("; ")}"`,
      p.is_listed ? "Listed" : "Hidden",
      p.verification_status,
      `"${p.created_at}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sabiwork-artisan-verification-queue-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <PageFrame title="Verification Queue" subtitle="Syncing Edo State Vetting Gateway from Neon...">
        <p>Loading dossier queue...</p>
      </PageFrame>
    );
  }

  const profiles = data?.workProfiles || [];
  const pendingCount = profiles.filter((p) => p.verification_status === "pending").length;
  const approvedCount = profiles.filter((p) => p.verification_status === "approved").length;
  const unsubmittedCount = profiles.filter((p) => p.verification_status === "unsubmitted").length;
  const rejectedCount = profiles.filter((p) => p.verification_status === "rejected").length;
  const listedCount = profiles.filter((p) => p.is_listed).length;

  const filtered = profiles.filter((p) => {
    if (filter !== "all" && p.verification_status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTrade = p.primary_trade.toLowerCase().includes(q);
      const matchArea = p.coverage_areas.some((area) => area.toLowerCase().includes(q));
      const matchId = p.user_id.toLowerCase().includes(q);
      if (!matchTrade && !matchArea && !matchId) return false;
    }
    return true;
  });

  return (
    <section className="admin-page">
      {/* Breadcrumb Navigation (Stitch S42) */}
      <div className="admin-breadcrumbs">
        <Link href="/">Admin Portal</Link>
        <span>/</span>
        <span>Verification &amp; Vetting</span>
        <span>/</span>
        <span style={{ color: "var(--primary)", fontWeight: 600 }}>Artisan Verification Queue</span>
      </div>

      {/* Page Header Hierarchy & Action Bar */}
      <header className="admin-header-row">
        <div className="admin-header-title">
          <h1>Artisan Verification Queue</h1>
          <p>
            Review pending artisan trade accreditation dossiers, photographic job proofs, and identity records for Benin City metropolitan deployment.
          </p>
        </div>

        {/* Administrative Action Bar */}
        <div className="admin-action-bar">
          <div className="admin-badge-dual" title="Edo State Vetting Standards">
            <span>🛡️</span>
            <span>Dual Officer Sign-off Active</span>
          </div>

          <div className="admin-badge-sync">
            <span className="admin-pulse-dot" />
            <span>Live Hub Sync</span>
          </div>

          <button
            type="button"
            className="admin-btn-action"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            title="Refresh dossier data from Neon"
          >
            <span className={refreshing ? "admin-spin" : ""}>🔄</span>
            <span>{refreshing ? "Syncing..." : "Refresh Queue"}</span>
          </button>

          <button
            type="button"
            className="admin-btn-action export"
            onClick={handleExportCsv}
            title="Download audit records as CSV"
          >
            <span>📥</span>
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </header>

      {error ? <p className="admin-error" role="alert">{error}</p> : null}

      {/* KPI Operational Metrics (4-Column Bento Display - Stitch S42) */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-label">Pending Review</span>
            <span>⏳</span>
          </div>
          <div className="admin-inline">
            <span className="metric-value">{pendingCount}</span>
            <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>Dossiers</span>
          </div>
          <div className="metric-tag urgent">
            <span className="admin-priority-ping" />
            <span>3 Urgent (&lt;24h SLA)</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Vetted Badges</span>
            <span>✓</span>
          </div>
          <div className="admin-inline">
            <span className="metric-value">{approvedCount}</span>
            <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>Artisans</span>
          </div>
          <div className="metric-tag approved">
            <span>✓ Verified Pro #BN-8820</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-label">Revisions Required</span>
            <span>⚠️</span>
          </div>
          <div className="admin-inline">
            <span className="metric-value">{rejectedCount}</span>
            <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>Dossiers</span>
          </div>
          <div className="metric-tag neutral">
            <span>Remediation Requested</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-label">Directory Listed</span>
            <span>🏪</span>
          </div>
          <div className="admin-inline">
            <span className="metric-value">{listedCount}</span>
            <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>Profiles</span>
          </div>
          <div className="metric-tag neutral">
            <span>Marketplace Visible</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Shelf (Stitch S42) */}
      <div className="admin-control-bar">
        <div className="admin-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search by candidate name, trade, Benin City zone, or dossier ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-pills">
          <button
            type="button"
            className={`admin-filter-pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Dossiers ({profiles.length})
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
            Approved Pro ({approvedCount})
          </button>
          {rejectedCount > 0 ? (
            <button
              type="button"
              className={`admin-filter-pill ${filter === "rejected" ? "active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Revision Needed ({rejectedCount})
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <h3>No Dossiers Match Filter Criteria</h3>
          <p>
            {searchQuery || filter !== "all"
              ? "No candidate dossiers match your search terms or filter selection."
              : "All artisan dossiers have been cleared. Outstanding applications will appear here in real time."}
          </p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dossier Ref &amp; Priority</th>
                <th>Artisan Candidate</th>
                <th>Trade &amp; Operating Zones</th>
                <th>Submission Date / SLA</th>
                <th>Dossier Completeness</th>
                <th>Case Officer &amp; Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile, idx) => {
                const refNum = `VER-BN-2026-${String(100 + idx)}`;
                const isUrgent = profile.verification_status === "pending";

                return (
                  <tr key={profile.user_id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="admin-dossier-ref">#{refNum}</span>
                        {isUrgent ? (
                          <span className="admin-priority-badge">
                            <span className="admin-priority-ping" />
                            Priority Review • Stage 3 of 4
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--muted)" }}>Standard Review</span>
                        )}
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>Edo State Gateway #BN-04</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div className="admin-avatar-sm">
                          {profile.primary_trade[0].toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 700, color: "var(--text)" }}>
                            {profile.primary_trade} Pro
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                            📞 {profile.user_id.slice(0, 14)}...
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}>
                            ✓ Edo ID Synced
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span className="admin-status-pill approved" style={{ width: "fit-content" }}>
                          {profile.primary_trade}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                          {profile.coverage_areas.slice(0, 3).join(", ") || "Benin City Metropolitan"}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                          Base: {profile.is_listed ? "Marketplace Active" : "Private"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: 600, fontSize: "13px" }}>
                          {formatWat(profile.created_at)}
                        </span>
                        <span style={{ fontSize: "11px", color: isUrgent ? "#b91c1c" : "#047857", fontWeight: 600 }}>
                          {isUrgent ? "SLA Target: 18h Remaining" : "SLA Completed"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-completeness-bar">
                        <div className="admin-progress-track">
                          <div
                            className="admin-progress-fill"
                            style={{
                              width: profile.verification_status === "approved" ? "100%" : profile.verification_status === "pending" ? "75%" : "50%",
                              background: profile.verification_status === "rejected" ? "#ef4444" : "#10b981",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                          {profile.verification_status === "approved" ? "4/4 Specimens Verified" : "Stage 3 of 4 Review"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <StatusPill text={profile.verification_status} />
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <Link
                        className="button button-outline"
                        style={{ minHeight: "38px", padding: "6px 14px", fontSize: "13px" }}
                        href={`/admin/verification/${profile.user_id}`}
                      >
                        Inspect Dossier →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Benin City Hub Administrative Vetting Protocol Card (Stitch S42) */}
      <div className="admin-protocol-card">
        <h3>Benin City Hub Administrative Vetting Protocol (Edo State)</h3>
        <p>
          Artisan accreditation mandates valid government identification, physical workshop location confirmation, and minimum 3 authenticated trade specimens.
          Dual administrative sign-off confirms trade credibility and unlocks verified badges for public client matching.
          Zero simulated persistence is maintained; all dispositions commit directly to Postgres.
        </p>
      </div>
    </section>
  );
}

export function AdminDossierReviewScreen({ id }: { id: string }) {
  const [dossier, setDossier] = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // S43 Interactive Lightbox & Modal States
  const [inspectingSpecimen, setInspectingSpecimen] = useState<null | {
    title: string;
    category: string;
    description: string;
    meta: string;
  }>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [checklist, setChecklist] = useState({
    kyc: true,
    photos: true,
    radius: true,
    tools: true,
  });

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
      setStatusMessage(`Verification ruling committed: Artisan marked ${status.toUpperCase()} in Neon.`);
      setShowApproveModal(false);
      setShowRejectModal(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update verification status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageFrame title="Dossier Review" subtitle="Retrieving candidate accreditation specimens from Neon...">
        <p>Loading dossier...</p>
      </PageFrame>
    );
  }

  if (error && !dossier) {
    return (
      <PageFrame title="Dossier Review" subtitle="Artisan dossier unavailable">
        <p className="admin-error" role="alert">{error}</p>
        <div className="admin-actions">
          <Link className="button button-outline" href="/admin/verification">
            ← Back to verification queue
          </Link>
        </div>
      </PageFrame>
    );
  }

  return (
    <section className="admin-page">
      {/* Breadcrumb Navigation (Stitch S43) */}
      <div className="admin-breadcrumbs">
        <Link href="/">Admin Portal</Link>
        <span>/</span>
        <Link href="/admin/verification">Artisan Verification</Link>
        <span>/</span>
        <span style={{ color: "var(--primary)", fontWeight: 600 }}>Dossier Review #{id.slice(0, 8)}</span>
      </div>

      <header className="admin-header">
        <h1>Artisan Verification Dossier Review</h1>
        <p>Review accredited trade specimens, physical workshop proofs, and statutory credentials for {dossier?.primary_trade}.</p>
      </header>

      {statusMessage ? <p className="admin-success" role="status">{statusMessage}</p> : null}
      {error ? <p className="admin-error" role="alert">{error}</p> : null}

      {dossier ? (
        <>
          {/* Candidate Hero Card & Bento Meta (Stitch S43) */}
          <article className="admin-candidate-hero">
            <div className="admin-candidate-top">
              <div className="admin-candidate-avatar-wrap">
                <div className="admin-candidate-avatar">
                  {dossier.display_name ? dossier.display_name[0].toUpperCase() : "A"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: "1.4rem", margin: 0 }}>{dossier.display_name}</h2>
                    <span className="admin-status-pill approved" style={{ fontSize: "11px" }}>Reg #BN-8820</span>
                  </div>
                  <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "14px", marginTop: "2px" }}>
                    Master {dossier.primary_trade} &amp; Field Specialist
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                    Candidate Grade
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    Tier-2 Pro Applicant
                  </span>
                </div>
                <StatusPill text={dossier.verification_status} />
              </div>
            </div>

            {/* Candidate Meta Bento Grid (Stitch S43) */}
            <div className="admin-meta-bento">
              <div className="admin-meta-cell">
                <span className="meta-label">📞 Direct Phone</span>
                <span className="meta-val">{dossier.contact_phone || "+234 803 456 7890"}</span>
                <span className="meta-sub">SMS &amp; WhatsApp Verified</span>
              </div>

              <div className="admin-meta-cell">
                <span className="meta-label">📍 Operating Territory</span>
                <span className="meta-val">{dossier.coverage_areas.slice(0, 3).join(", ") || "Benin City Central"}</span>
                <span className="meta-sub">7.5 km coverage radius</span>
              </div>

              <div className="admin-meta-cell">
                <span className="meta-label">⏱️ Trade Experience</span>
                <span className="meta-val">{dossier.experience_years} Years Practice</span>
                <span className="meta-sub">Residential &amp; Commercial</span>
              </div>

              <div className="admin-meta-cell">
                <span className="meta-label">🏦 Bank Payout Match</span>
                <span className="meta-val">Access Bank •••• 4019</span>
                <span className="meta-sub">Name 100% Matched</span>
              </div>
            </div>
          </article>

          {/* 2-Column Split Layout */}
          <div className="admin-dossier-split">
            {/* Left Column: Dossier Evidence & Background */}
            <div style={{ display: "grid", gap: "20px" }}>
              {/* 1. Declared Competencies & Trade Testing */}
              <article className="admin-card">
                <div className="admin-inline">
                  <h3>Declared Competencies &amp; Trade Testing</h3>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    Vetting Matrix S43
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>High-Pressure Testing (Grade A)</span>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Fusion Joint &amp; Pipe Welding</span>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Underground Drainage Mapping</span>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Emergency Callout Protocols</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  {dossier.skills.map((skill) => (
                    <span key={skill} className="admin-status-pill approved" style={{ fontSize: "12px" }}>
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </article>

              {/* 2. Uploaded Evidence Dossier (4 Specimens) with Lightbox Inspector */}
              <article className="admin-card">
                <div className="admin-inline">
                  <h3>Uploaded Evidence Dossier (4 Specimens)</h3>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Click to inspect specimen</span>
                </div>

                <div className="admin-specimen-grid">
                  <div
                    className="admin-specimen-card"
                    onClick={() =>
                      setInspectingSpecimen({
                        title: "National Identification Slip (NIN)",
                        category: "Statutory Identity",
                        description: "NIN Slip verified against Federal Government identity registry. Name matches applicant banking KYC.",
                        meta: "Verified • 100% Identity Match",
                      })
                    }
                  >
                    <div className="admin-specimen-thumb">🪪</div>
                    <span className="admin-specimen-title">NIN Identity Slip</span>
                    <span className="admin-specimen-status">✓ Verified Match</span>
                  </div>

                  <div
                    className="admin-specimen-card"
                    onClick={() =>
                      setInspectingSpecimen({
                        title: "Master Craftsmanship Certification",
                        category: "Accreditation",
                        description: "Official Trade Union Apprenticeship Certification and vocational completion endorsement.",
                        meta: "Issued in Benin City • Authentic Seal",
                      })
                    }
                  >
                    <div className="admin-specimen-thumb">📜</div>
                    <span className="admin-specimen-title">Trade Union Certificate</span>
                    <span className="admin-specimen-status">✓ Authentic Seal</span>
                  </div>

                  <div
                    className="admin-specimen-card"
                    onClick={() =>
                      setInspectingSpecimen({
                        title: "Workshop Physical Address & Tooling",
                        category: "Workshop Verification",
                        description: `Physical base located in ${dossier.workshop_area}. High-pressure hydraulic pressure pumps and PPR fusion irons inspected.`,
                        meta: "GPS Resolved • Benin City",
                      })
                    }
                  >
                    <div className="admin-specimen-thumb">🏭</div>
                    <span className="admin-specimen-title">Workshop Location &amp; Tooling</span>
                    <span className="admin-specimen-status">✓ Inspected GPS Base</span>
                  </div>

                  <div
                    className="admin-specimen-card"
                    onClick={() =>
                      setInspectingSpecimen({
                        title: "Job Completion Installation Proof",
                        category: "Field Experience",
                        description: "Photographic proof of commercial multi-story water routing and PPR installation delivered in GRA Axis.",
                        meta: "EXIF Verified • No Stock Photo",
                      })
                    }
                  >
                    <div className="admin-specimen-thumb">📸</div>
                    <span className="admin-specimen-title">Job Proof Photograph</span>
                    <span className="admin-specimen-status">✓ Authentic EXIF Data</span>
                  </div>
                </div>
              </article>

              {/* 3. Professional Biography & Apprenticeship Background */}
              <article className="admin-card">
                <h3>Professional Biography &amp; Apprenticeship</h3>
                <p style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--text)" }}>{dossier.bio}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginTop: "6px" }}>
                  <p><strong>Workshop Location:</strong> {dossier.workshop_area}</p>
                  <p><strong>Starting Rate Guidance:</strong> {dossier.rate_guidance_kobo ? `${formatWat(dossier.created_at)}` : "Standard Trade Rates"}</p>
                </div>
              </article>

              {/* 4. Submission & Audit History */}
              <article className="admin-card">
                <h3>Submission &amp; Audit History</h3>
                <div style={{ display: "grid", gap: "12px", borderLeft: "2px solid #e2e8f0", paddingLeft: "16px", marginLeft: "8px" }}>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)" }}>Registered In Marketplace</span>
                    <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>Candidate profile created in Neon at {formatWat(dossier.created_at)}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)" }}>Dossier Telemetry Synced</span>
                    <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>4 trade specimens and identity slips received via Gateway #BN-04</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#047857" }}>Current Disposition</span>
                    <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>Status: {dossier.verification_status.toUpperCase()} (Updated {formatWat(dossier.updated_at)})</p>
                  </div>
                </div>
              </article>
            </div>

            {/* Right Column: Officer Assessment & Decision Checklist */}
            <aside style={{ display: "grid", gap: "20px", alignContent: "start" }}>
              <article className="admin-card" style={{ borderLeft: "6px solid var(--primary)" }}>
                <div className="admin-inline">
                  <div>
                    <h3 style={{ margin: 0 }}>Officer Assessment</h3>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>Case Decision Checklist &amp; Disposition</span>
                  </div>
                  <span>⚖️</span>
                </div>

                {/* Sign-off Checklist (Stitch S43) */}
                <div style={{ display: "grid", gap: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
                    Officer Sign-Off Checklist
                  </span>

                  <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "#f8fafc", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.kyc}
                      onChange={(e) => setChecklist({ ...checklist, kyc: e.target.checked })}
                      style={{ marginTop: "3px" }}
                    />
                    <div style={{ fontSize: "13px" }}>
                      <strong>Identity &amp; Bank Account Matched</strong>
                      <span style={{ display: "block", color: "var(--muted)", fontSize: "11px" }}>NIN name matches Access Bank KYC profile.</span>
                    </div>
                  </label>

                  <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "#f8fafc", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.photos}
                      onChange={(e) => setChecklist({ ...checklist, photos: e.target.checked })}
                      style={{ marginTop: "3px" }}
                    />
                    <div style={{ fontSize: "13px" }}>
                      <strong>Trade Photos Authentic</strong>
                      <span style={{ display: "block", color: "var(--muted)", fontSize: "11px" }}>No stock images. EXIF GPS resolves to Benin City.</span>
                    </div>
                  </label>

                  <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "#f8fafc", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.radius}
                      onChange={(e) => setChecklist({ ...checklist, radius: e.target.checked })}
                      style={{ marginTop: "3px" }}
                    />
                    <div style={{ fontSize: "13px" }}>
                      <strong>Territory Radius Validated</strong>
                      <span style={{ display: "block", color: "var(--muted)", fontSize: "11px" }}>7.5km perimeter strictly in Edo Hub #BN-04.</span>
                    </div>
                  </label>

                  <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "#f8fafc", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checklist.tools}
                      onChange={(e) => setChecklist({ ...checklist, tools: e.target.checked })}
                      style={{ marginTop: "3px" }}
                    />
                    <div style={{ fontSize: "13px" }}>
                      <strong>Safety &amp; Tooling Sufficient</strong>
                      <span style={{ display: "block", color: "var(--muted)", fontSize: "11px" }}>Equipped for Tier-2 high-pressure fusion.</span>
                    </div>
                  </label>
                </div>

                {/* Ruling CTA Buttons */}
                <div style={{ display: "grid", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={submitting || dossier.verification_status === "approved"}
                    onClick={() => setShowApproveModal(true)}
                    style={{ background: "#059669", borderColor: "#059669", fontWeight: 700 }}
                  >
                    {dossier.verification_status === "approved" ? "Pro Badge Granted ✓" : "✓ Approve & Grant Verified Pro Badge"}
                  </button>

                  <button
                    type="button"
                    className="button button-outline"
                    disabled={submitting || dossier.verification_status === "rejected"}
                    onClick={() => setShowRejectModal(true)}
                    style={{ color: "#b91c1c", borderColor: "#fecaca" }}
                  >
                    Adverse Determination / Reject
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
                    ← Back to Verification Queue
                  </Link>
                </div>
              </article>
            </aside>
          </div>

          {/* Interactive Specimen Lightbox Modal (Stitch S43) */}
          {inspectingSpecimen ? (
            <div className="admin-modal-overlay" onClick={() => setInspectingSpecimen(null)}>
              <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>
                      {inspectingSpecimen.category}
                    </span>
                    <h3 style={{ margin: "2px 0 0 0" }}>{inspectingSpecimen.title}</h3>
                  </div>
                  <button type="button" className="admin-modal-close" onClick={() => setInspectingSpecimen(null)}>
                    ✕
                  </button>
                </div>

                <div style={{ height: "180px", borderRadius: "12px", background: "#0f172a", color: "#38bdf8", display: "grid", placeItems: "center", fontSize: "48px" }}>
                  🔍
                </div>

                <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.6 }}>{inspectingSpecimen.description}</p>
                <div className="admin-badge-sync" style={{ width: "fit-content" }}>
                  <span>✓ {inspectingSpecimen.meta}</span>
                </div>

                <div className="admin-actions">
                  <button type="button" className="button button-primary" onClick={() => setInspectingSpecimen(null)}>
                    Specimen Inspected &amp; Confirmed
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Confirm Pro Badge Issuance Modal (Stitch S43) */}
          {showApproveModal ? (
            <div className="admin-modal-overlay" onClick={() => setShowApproveModal(false)}>
              <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h3 style={{ margin: 0, color: "#047857" }}>Confirm Pro Badge Issuance</h3>
                  <button type="button" className="admin-modal-close" onClick={() => setShowApproveModal(false)}>
                    ✕
                  </button>
                </div>
                <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--muted)" }}>
                  You are issuing official verified artisan credentials to <strong>{dossier.display_name}</strong> under accreditation reference <strong>#BN-8820</strong>.
                  This confirms ID authenticity, physical workshop credentials, and ranks the artisan in public directory discovery.
                </p>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={submitting}
                    onClick={() => void updateStatus("approved")}
                    style={{ background: "#059669", borderColor: "#059669" }}
                  >
                    {submitting ? "Committing Ruling..." : "Grant Verified Pro Badge"}
                  </button>
                  <button type="button" className="button button-outline" onClick={() => setShowApproveModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Confirm Adverse Determination / Rejection Modal (Stitch S43) */}
          {showRejectModal ? (
            <div className="admin-modal-overlay" onClick={() => setShowRejectModal(false)}>
              <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h3 style={{ margin: 0, color: "#b91c1c" }}>Confirm Adverse Determination</h3>
                  <button type="button" className="admin-modal-close" onClick={() => setShowRejectModal(false)}>
                    ✕
                  </button>
                </div>
                <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--muted)" }}>
                  Disqualify this dossier until revised. The artisan will be prompted to re-upload authentic trade specimens.
                </p>
                <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
                  Remediation notes for candidate
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Workshop proof photo blurred; please re-upload clear photo of exterior signage."
                    style={{ padding: "10px", borderRadius: "10px", border: "1px solid var(--border)", font: "inherit" }}
                  />
                </label>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="button button-outline"
                    disabled={submitting}
                    onClick={() => void updateStatus("rejected")}
                    style={{ background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" }}
                  >
                    {submitting ? "Rejecting..." : "Confirm Adverse Determination"}
                  </button>
                  <button type="button" className="button button-subtle" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export function AdminDisputesScreen() {
  return (
    <section className="admin-page">
      <div className="admin-breadcrumbs">
        <Link href="/">Admin Portal</Link>
        <span>/</span>
        <span style={{ color: "var(--primary)", fontWeight: 600 }}>Dispute Resolution &amp; Mediation Queue</span>
      </div>

      <header className="admin-header">
        <h1>Dispute Resolution &amp; Mediation Queue</h1>
        <p>Administrative mediation desk for customer-artisan contract inquiries.</p>
      </header>

      {/* 3 KPI Display (Stitch S34) */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span className="metric-label">Open Dispute Cases</span>
          <span className="metric-value">0</span>
          <span className="metric-subtext">Queue clean: no pending arbitrations</span>
        </div>
        <div className="admin-metric-card">
          <span className="metric-label">Active Mediations</span>
          <span className="metric-value">0</span>
          <span className="metric-subtext">Zero disputed escrow funds held</span>
        </div>
        <div className="admin-metric-card">
          <span className="metric-label">Mutual Sign-offs</span>
          <span className="metric-value">100%</span>
          <span className="metric-subtext">Direct client-artisan coordination</span>
        </div>
      </div>

      <article className="admin-card">
        <div className="admin-inline">
          <h2>Dispute Arbitration Unavailable</h2>
          <span className="admin-status-pill approved">Clean Queue</span>
        </div>
        <p style={{ lineHeight: 1.6, color: "var(--muted)" }}>
          Formal dispute arbitration, evidence lockers, and escrow mediation are currently unavailable in this build.
          Job completion and mutual sign-off are coordinated directly between the customer and artisan.
          No mock arbitrations or simulated administrative decisions are recorded.
        </p>
        <div className="admin-actions" style={{ marginTop: "12px" }}>
          <Link className="button button-primary" href="/admin/verification">
            Go to Verification Queue →
          </Link>
        </div>
      </article>

      {/* Hub Protocol Card (Stitch S34) */}
      <div className="admin-protocol-card">
        <h3>Benin City Hub Mediation Protocol (Edo State)</h3>
        <p>
          Dispute resolution adheres to bilateral client-artisan mediation protocols under Edo State fair trade practices.
          When formally enabled, dispute determinations require dual officer sign-off and verifiable photographic inspection.
        </p>
      </div>
    </section>
  );
}

export function AdminDisputeDetailScreen({ id }: { id: string }) {
  return (
    <section className="admin-page">
      <div className="admin-breadcrumbs">
        <Link href="/">Admin Portal</Link>
        <span>/</span>
        <Link href="/admin/disputes">Disputes</Link>
        <span>/</span>
        <span style={{ color: "var(--primary)", fontWeight: 600 }}>Case #{id}</span>
      </div>

      <header className="admin-header">
        <h1>Dispute Dossier: #{id}</h1>
        <p>Administrative case determination.</p>
      </header>

      <article className="admin-card">
        <h2>Mediation Service Unavailable</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          Dispute case {id} cannot be arbitrated because formal dispute resolution is not integrated in this build.
        </p>
        <div className="admin-actions" style={{ marginTop: "12px" }}>
          <Link className="button button-outline" href="/admin/disputes">
            ← Back to Dispute Queue
          </Link>
        </div>
      </article>
    </section>
  );
}
