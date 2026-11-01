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
      <PageFrame title="Verification queue" subtitle="Loading artisan dossiers from Neon...">
        <p>Loading...</p>
      </PageFrame>
    );
  }

  const profiles = data?.workProfiles || [];
  const pendingCount = profiles.filter((p) => p.verification_status === "pending").length;
  const approvedCount = profiles.filter((p) => p.verification_status === "approved").length;

  const filtered = profiles.filter((p) => {
    if (filter === "all") return true;
    return p.verification_status === filter;
  });

  return (
    <PageFrame
      title="Admin verification queue"
      subtitle="Review artisan credentials, evaluate workshop bases, and grant verified marketplace badges."
    >
      {error ? <p className="admin-error" role="alert">{error}</p> : null}

      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span className="metric-label">Total registered users</span>
          <span className="metric-value">{data?.users?.length ?? 0}</span>
        </div>
        <div className="admin-metric-card">
          <span className="metric-label">Work profiles</span>
          <span className="metric-value">{profiles.length}</span>
        </div>
        <div className="admin-metric-card">
          <span className="metric-label">Pending review</span>
          <span className="metric-value" style={{ color: "#d97706" }}>{pendingCount}</span>
        </div>
        <div className="admin-metric-card">
          <span className="metric-label">Approved badges</span>
          <span className="metric-value" style={{ color: "#059669" }}>{approvedCount}</span>
        </div>
      </div>

      <div className="admin-inline" style={{ marginTop: "12px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", "pending", "unsubmitted", "approved", "rejected"].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`button ${filter === opt ? "button-primary" : "button-subtle"}`}
              onClick={() => setFilter(opt)}
            >
              {opt[0].toUpperCase() + opt.slice(1)} ({opt === "all" ? profiles.length : profiles.filter((p) => p.verification_status === opt).length})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No artisan profiles found for filter &ldquo;{filter}&rdquo;.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Artisan / User ID</th>
                <th>Trade</th>
                <th>Coverage areas</th>
                <th>Listing status</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile) => (
                <tr key={profile.user_id}>
                  <td>
                    <code>{profile.user_id.slice(0, 16)}...</code>
                  </td>
                  <td><strong>{profile.primary_trade}</strong></td>
                  <td>{profile.coverage_areas.slice(0, 2).join(", ")}</td>
                  <td>{profile.is_listed ? "Listed" : "Hidden"}</td>
                  <td><StatusPill text={profile.verification_status} /></td>
                  <td>
                    <Link className="button button-outline" style={{ minHeight: "36px", padding: "6px 12px" }} href={`/admin/verification/${profile.user_id}`}>
                      Inspect dossier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageFrame>
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
    <PageFrame
      title={`Dossier: ${dossier?.display_name || id}`}
      subtitle={`Review trade credentials and physical workshop verification for ${dossier?.primary_trade}.`}
    >
      {dossier ? (
        <div className="admin-list">
          <article className="admin-card">
            <div className="admin-inline">
              <h2>Applicant information</h2>
              <StatusPill text={dossier.verification_status} />
            </div>
            <p><strong>Name:</strong> {dossier.display_name}</p>
            <p><strong>User ID:</strong> <code>{dossier.user_id}</code></p>
            <p><strong>Contact phone:</strong> {dossier.contact_phone}</p>
            <p><strong>Primary craft:</strong> {dossier.primary_trade}</p>
            <p><strong>Experience:</strong> {dossier.experience_years} years active</p>
            <p><strong>Workshop location:</strong> {dossier.workshop_area}</p>
            <p><strong>Service coverage:</strong> {dossier.coverage_areas.join(", ")}</p>
            <p><strong>Specialized skills:</strong> {dossier.skills.join(", ")}</p>
            <p><strong>Registered:</strong> {formatWat(dossier.created_at)}</p>
          </article>

          <article className="admin-card">
            <h3>Professional biography</h3>
            <p>{dossier.bio}</p>
          </article>

          <article className="admin-card" style={{ borderLeft: "4px solid var(--primary, #059669)" }}>
            <h3>Admin verification ruling</h3>
            <p>
              Granting approval assigns the verified artisan badge across the directory and confirms trade credibility to customers.
              Rejecting disqualifies the profile from quoting until revised.
            </p>

            {error ? <p className="admin-error" role="alert">{error}</p> : null}
            {statusMessage ? <p className="admin-success" role="status">{statusMessage}</p> : null}

            <div className="admin-actions" style={{ marginTop: "12px" }}>
              <button
                type="button"
                className="button button-primary"
                disabled={submitting || dossier.verification_status === "approved"}
                onClick={() => void updateStatus("approved")}
              >
                {dossier.verification_status === "approved" ? "Approved ✓" : "Approve verified badge"}
              </button>
              <button
                type="button"
                className="button button-outline"
                disabled={submitting || dossier.verification_status === "rejected"}
                onClick={() => void updateStatus("rejected")}
              >
                Reject application
              </button>
              <button
                type="button"
                className="button button-subtle"
                disabled={submitting || dossier.verification_status === "pending"}
                onClick={() => void updateStatus("pending")}
              >
                Mark pending review
              </button>
              <Link className="button button-subtle" href="/admin/verification">
                Back to queue
              </Link>
            </div>
          </article>
        </div>
      ) : null}
    </PageFrame>
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
