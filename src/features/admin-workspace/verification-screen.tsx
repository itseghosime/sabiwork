"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  EmptyState,
  FilterTabs,
  KpiCard,
  PageHeader,
  SectionCard,
  StatusPill,
  type Tone,
} from "./admin-ui";
import { formatNaira, formatWat, pluralUnit, relativeWat } from "./admin-data";

type VerificationStatus = "unsubmitted" | "pending" | "approved" | "rejected";

type UserSummary = {
  user_id: string;
  role: string;
  display_name: string;
  created_at: string;
};

type WorkProfileSummary = {
  user_id: string;
  primary_trade: string;
  coverage_areas: string[];
  is_listed: boolean;
  verification_status: VerificationStatus;
  created_at: string;
};

type OverviewData = {
  users: UserSummary[];
  workProfiles: WorkProfileSummary[];
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
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
};

type ApiError = { error?: { code?: string; message?: string } };

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error?.message ?? "Request failed.");
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

const statusTone: Record<VerificationStatus, Tone> = {
  unsubmitted: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const statusLabel: Record<VerificationStatus, string> = {
  unsubmitted: "Not submitted",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Needs revision",
};

type StatusFilter = VerificationStatus | "all";
type ListingFilter = "all" | "listed" | "hidden";

export function AdminVerificationQueueScreen() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [listing, setListing] = useState<ListingFilter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const next = await readJson<OverviewData>("/api/admin/overview");
      setData(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the verification queue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    readJson<OverviewData>("/api/admin/overview")
      .then((next) => {
        if (!active) return;
        setData(next);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load the verification queue.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const profiles = useMemo(() => data?.workProfiles ?? [], [data]);

  const displayNames = useMemo(
    () => new Map((data?.users ?? []).map((user) => [user.user_id, user.display_name])),
    [data],
  );

  const counts = useMemo(() => {
    const byStatus = (value: VerificationStatus) =>
      profiles.filter((profile) => profile.verification_status === value).length;
    return {
      total: profiles.length,
      pending: byStatus("pending"),
      approved: byStatus("approved"),
      rejected: byStatus("rejected"),
      unsubmitted: byStatus("unsubmitted"),
      listed: profiles.filter((profile) => profile.is_listed).length,
    };
  }, [profiles]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return profiles.filter((profile) => {
      if (status !== "all" && profile.verification_status !== status) return false;
      if (listing === "listed" && !profile.is_listed) return false;
      if (listing === "hidden" && profile.is_listed) return false;
      if (!needle) return true;
      return [
        profile.user_id,
        displayNames.get(profile.user_id) ?? "",
        profile.primary_trade,
        profile.coverage_areas.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [displayNames, listing, profiles, query, status]);

  function exportCsv() {
    if (!filtered.length) return;
    const header = [
      "User ID",
      "Artisan",
      "Primary trade",
      "Coverage areas",
      "Listing status",
      "Verification status",
      "Registered (UTC)",
    ];
    const rows = filtered.map((profile) => [
      `"${profile.user_id}"`,
      `"${displayNames.get(profile.user_id) ?? ""}"`,
      `"${profile.primary_trade}"`,
      `"${profile.coverage_areas.join("; ")}"`,
      profile.is_listed ? "Listed" : "Hidden",
      profile.verification_status,
      `"${profile.created_at}"`,
    ]);
    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sabiwork-verification-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[{ label: "Admin portal", href: "/admin" }, { label: "Artisan verification" }]}
        title="Artisan verification"
        description="Work the vetting queue, open a dossier, and commit a ruling against the Neon artisan record."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-ghost"
              onClick={() => void load(true)}
              disabled={refreshing}
              title="Reload the queue from Neon"
            >
              <Icon name="refresh" size={16} />
              <span>{refreshing ? "Syncing…" : "Refresh"}</span>
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={exportCsv}
              disabled={!filtered.length}
              title="Download the current view as CSV"
            >
              <Icon name="download" size={16} />
              <span>Export CSV</span>
            </button>
          </>
        }
        meta={
          <>
            <StatusPill tone={counts.pending ? "warning" : "success"}>
              {counts.pending} awaiting ruling
            </StatusPill>
            <StatusPill tone="neutral" dot={false}>Live from Neon</StatusPill>
            <StatusPill tone="neutral" dot={false}>Edo State · Gateway #BN-04</StatusPill>
          </>
        }
      />

      {error ? (
        <div className="ad-error" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="ad-kpi-grid" aria-label="Vetting metrics">
        <KpiCard
          label="Pending review"
          value={loading ? "—" : String(counts.pending)}
          unit={pluralUnit(counts.pending, "dossier")}
          icon="shield"
          tone="warning"
          footnote="Live from Neon"
        />
        <KpiCard
          label="Approved"
          value={loading ? "—" : String(counts.approved)}
          unit={pluralUnit(counts.approved, "artisan")}
          icon="checkCircle"
          tone="success"
          footnote="Cleared to work"
        />
        <KpiCard
          label="Needs revision"
          value={loading ? "—" : String(counts.rejected)}
          unit={pluralUnit(counts.rejected, "dossier")}
          icon="xCircle"
          tone="danger"
          footnote="Ruling sent back"
        />
        <KpiCard
          label="Listed artisans"
          value={loading ? "—" : String(counts.listed)}
          unit={`of ${counts.total}`}
          icon="users"
          tone="info"
          footnote="Visible in marketplace"
        />
      </section>

      <div className="ad-toolbar">
        <div className="ad-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search artisan, trade, or coverage area…"
            aria-label="Search the verification queue"
          />
        </div>
        <FilterTabs
          ariaLabel="Filter dossiers by verification status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: counts.total },
            { value: "pending", label: "Pending", count: counts.pending },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "rejected", label: "Revision", count: counts.rejected },
            { value: "unsubmitted", label: "Not submitted", count: counts.unsubmitted },
          ]}
        />
        <label className="ad-select-wrap">
          <span className="ad-sr-only">Filter by marketplace listing</span>
          <select value={listing} onChange={(event) => setListing(event.target.value as ListingFilter)}>
            <option value="all">Any listing</option>
            <option value="listed">Listed only</option>
            <option value="hidden">Hidden only</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="ad-loading" role="status">
          Loading the dossier queue from Neon…
        </p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="shield"
          title="No dossiers match this view"
          message="Adjust the status, listing, or search term to see more artisans."
          action={
            <button
              type="button"
              className="ad-btn ad-btn-ghost"
              onClick={() => {
                setStatus("all");
                setListing("all");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Artisan</th>
                <th>Trade &amp; coverage</th>
                <th>Listing</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="ad-cell-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile) => (
                <tr key={profile.user_id}>
                  <td>
                    <div className="ad-cell-stack">
                      <Link className="ad-cell-strong" href={`/admin/verification/${profile.user_id}`}>
                        {displayNames.get(profile.user_id) ?? "Unnamed artisan"}
                      </Link>
                      <span className="ad-cell-mono ad-cell-nowrap">{profile.user_id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ad-cell-stack">
                      <span className="ad-cell-strong">{profile.primary_trade}</span>
                      <span className="ad-cell-muted">
                        {profile.coverage_areas.length
                          ? profile.coverage_areas.join(", ")
                          : "No coverage areas declared"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusPill tone={profile.is_listed ? "info" : "neutral"} dot={false}>
                      {profile.is_listed ? "Listed" : "Hidden"}
                    </StatusPill>
                  </td>
                  <td>
                    <div className="ad-cell-stack">
                      <span className="ad-cell-strong">{formatWat(profile.created_at)}</span>
                      <span className="ad-cell-muted">{relativeWat(profile.created_at)}</span>
                    </div>
                  </td>
                  <td>
                    <StatusPill tone={statusTone[profile.verification_status]}>
                      {statusLabel[profile.verification_status]}
                    </StatusPill>
                  </td>
                  <td className="ad-cell-right">
                    <Link className="ad-btn ad-btn-ghost ad-btn-sm" href={`/admin/verification/${profile.user_id}`}>
                      Open <Icon name="next" size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionCard
        title="Vetting protocol"
        description="How a dossier moves from submission to a listed profile."
      >
        <ol className="ad-steps">
          <li>
            <span className="ad-step-num">1</span>
            <div>
              <strong>Dossier submitted</strong>
              <p>
                The artisan supplies trade, coverage areas, workshop location, and rate guidance. The record lands in
                this queue as pending.
              </p>
            </div>
          </li>
          <li>
            <span className="ad-step-num">2</span>
            <div>
              <strong>Officer review</strong>
              <p>
                Identity, workshop proof, credentials, and declared coverage are checked against the trade standards
                before any ruling.
              </p>
            </div>
          </li>
          <li>
            <span className="ad-step-num">3</span>
            <div>
              <strong>Ruling committed</strong>
              <p>
                Approving or rejecting writes the status straight to the Neon artisan profile. Approval is what makes a
                listing eligible to appear to customers.
              </p>
            </div>
          </li>
        </ol>
      </SectionCard>
    </div>
  );
}

export function AdminDossierReviewScreen({ id }: { id: string }) {
  const [dossier, setDossier] = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "approve" | "reject">(null);
  const [reason, setReason] = useState("");
  const [checks, setChecks] = useState({
    identity: false,
    workshop: false,
    credentials: false,
    coverage: false,
  });

  const load = useCallback(async () => {
    try {
      const row = await readJson<DossierDetail>(`/api/admin/verification/${id}`);
      setDossier(row);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this dossier.");
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
        setError(err instanceof Error ? err.message : "Could not load this dossier.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const checksDone = Object.values(checks).filter(Boolean).length;
  const allChecked = checksDone === 4;

  async function commitRuling(next: VerificationStatus) {
    setSubmitting(true);
    setError(null);
    setStatusMessage(null);
    try {
      await readJson(`/api/admin/verification/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setStatusMessage(`Ruling committed: artisan marked ${statusLabel[next].toLowerCase()} in Neon.`);
      setModal(null);
      setReason("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the verification status.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="ad-page">
        <p className="ad-loading" role="status">
          Retrieving the dossier from Neon…
        </p>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="ad-page">
        <EmptyState
          icon="shield"
          title="Dossier unavailable"
          message={error ?? "This artisan dossier could not be loaded."}
          action={
            <Link className="ad-btn ad-btn-primary" href="/admin/verification">
              <Icon name="back" size={16} /> Back to verification queue
            </Link>
          }
        />
      </div>
    );
  }

  const coverage = dossier.coverage_areas ?? [];
  const skills = dossier.skills ?? [];

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[
          { label: "Admin portal", href: "/admin" },
          { label: "Artisan verification", href: "/admin/verification" },
          { label: `Dossier ${dossier.user_id.slice(0, 8)}` },
        ]}
        title={dossier.display_name}
        description={`${dossier.primary_trade} · ${dossier.workshop_area} · submitted ${formatWat(dossier.created_at)}`}
        actions={
          <Link className="ad-btn ad-btn-ghost" href="/admin/verification">
            <Icon name="back" size={16} /> Back to queue
          </Link>
        }
        meta={
          <>
            <StatusPill tone={statusTone[dossier.verification_status]}>
              {statusLabel[dossier.verification_status]}
            </StatusPill>
            <StatusPill tone="neutral" dot={false}>{dossier.experience_years} yrs experience</StatusPill>
            <StatusPill tone="neutral" dot={false}>
              {dossier.rate_guidance_kobo === null ? "No rate guidance" : formatNaira(dossier.rate_guidance_kobo)}
            </StatusPill>
          </>
        }
      />

      {statusMessage ? (
        <p className="ad-inline-notice ad-inline-notice-wide" role="status">
          <Icon name="checkCircle" size={16} /> {statusMessage}
        </p>
      ) : null}

      {error ? (
        <div className="ad-error" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="ad-split">
        <div className="ad-stack">
          <SectionCard title="Identity &amp; credentials" description="As declared by the artisan on submission.">
            <dl className="ad-facts">
              <div>
                <dt>Artisan account</dt>
                <dd className="ad-cell-mono">{dossier.user_id}</dd>
              </div>
              <div>
                <dt>Contact phone</dt>
                <dd>{dossier.contact_phone || "Not provided"}</dd>
              </div>
              <div>
                <dt>Primary trade</dt>
                <dd>{dossier.primary_trade}</dd>
              </div>
              <div>
                <dt>Workshop area</dt>
                <dd>{dossier.workshop_area || "Not provided"}</dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>{dossier.experience_years} years</dd>
              </div>
              <div>
                <dt>Rate guidance</dt>
                <dd>{dossier.rate_guidance_kobo === null ? "Not provided" : formatNaira(dossier.rate_guidance_kobo)}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{formatWat(dossier.created_at)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{relativeWat(dossier.updated_at)}</dd>
              </div>
            </dl>
          </SectionCard>

          <div className="ad-grid-2">
            <SectionCard title="Coverage areas" description={`${coverage.length} declared`}>
              {coverage.length ? (
                <ul className="ad-chips">
                  {coverage.map((area) => (
                    <li key={area} className="ad-chip">
                      <Icon name="pin" size={14} /> {area}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ad-card-note">No coverage areas were declared. Confirm the service radius before approving.</p>
              )}
            </SectionCard>

            <SectionCard title="Skills claimed" description={`${skills.length} listed`}>
              {skills.length ? (
                <ul className="ad-chips">
                  {skills.map((skill) => (
                    <li key={skill} className="ad-chip">
                      <Icon name="hammer" size={14} /> {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ad-card-note">No skills were listed on this dossier.</p>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Self-description" description="Free-text bio submitted with the dossier.">
            {dossier.bio ? (
              <p className="ad-lead">{dossier.bio}</p>
            ) : (
              <p className="ad-card-note">The artisan did not submit a written description.</p>
            )}
          </SectionCard>
        </div>

        <aside className="ad-stack">
          <SectionCard
            title="Ruling panel"
            description="Approval and rejection write to the Neon profile."
            className="ad-sticky"
          >
            <div className="ad-checklist">
              <label>
                <input
                  type="checkbox"
                  checked={checks.identity}
                  onChange={(event) => setChecks({ ...checks, identity: event.target.checked })}
                />
                <span>Identity and contact confirmed</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checks.workshop}
                  onChange={(event) => setChecks({ ...checks, workshop: event.target.checked })}
                />
                <span>Workshop location verified</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checks.credentials}
                  onChange={(event) => setChecks({ ...checks, credentials: event.target.checked })}
                />
                <span>Trade credentials checked</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checks.coverage}
                  onChange={(event) => setChecks({ ...checks, coverage: event.target.checked })}
                />
                <span>Coverage areas plausible for the trade</span>
              </label>
            </div>

            <div className="ad-checklist-meter">
              <span>{checksDone} of 4 checks complete</span>
              <div
                className="ad-progress is-success"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={checksDone}
                aria-label="Dossier checks complete"
              >
                <span style={{ width: `${(checksDone / 4) * 100}%` }} />
              </div>
            </div>

            <div className="ad-action-stack">
              <button
                type="button"
                className="ad-btn ad-btn-primary"
                disabled={!allChecked || submitting}
                onClick={() => setModal("approve")}
                title={allChecked ? "Approve this artisan" : "Complete all four checks first"}
              >
                <Icon name="checkCircle" size={16} /> Approve artisan
              </button>
              <button
                type="button"
                className="ad-btn ad-btn-ghost"
                disabled={!allChecked || submitting}
                onClick={() => setModal("reject")}
                title={allChecked ? "Send the dossier back" : "Complete all four checks first"}
              >
                <Icon name="xCircle" size={16} /> Request revision
              </button>
              {dossier.verification_status !== "pending" ? (
                <button
                  type="button"
                  className="ad-btn ad-btn-ghost"
                  disabled={submitting}
                  onClick={() => void commitRuling("pending")}
                >
                  <Icon name="refresh" size={16} /> Return to pending
                </button>
              ) : null}
            </div>

            <p className="ad-card-note">
              {allChecked
                ? "Rulings are written to the artisan profile immediately and take effect for the marketplace."
                : "Complete all four checks to unlock the approve and revision rulings."}
            </p>
          </SectionCard>

          <SectionCard title="Record facts">
            <dl className="ad-facts">
              <div>
                <dt>Current status</dt>
                <dd>{statusLabel[dossier.verification_status]}</dd>
              </div>
              <div>
                <dt>Data source</dt>
                <dd>Neon · artisan_profiles</dd>
              </div>
              <div>
                <dt>Trade</dt>
                <dd>{dossier.primary_trade}</dd>
              </div>
            </dl>
          </SectionCard>
        </aside>
      </div>

      {modal === "approve" ? (
        <div className="ad-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div
            className="ad-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ad-modal-head">
              <div>
                <span className="ad-modal-eyebrow">Approve dossier</span>
                <h2 id="approve-modal-title">{dossier.display_name}</h2>
              </div>
              <button type="button" className="ad-modal-close" onClick={() => setModal(null)} aria-label="Close dialog">
                <Icon name="x" size={18} />
              </button>
            </div>

            <dl className="ad-facts">
              <div><dt>Artisan account</dt><dd className="ad-cell-mono">{dossier.user_id}</dd></div>
              <div><dt>Trade</dt><dd>{dossier.primary_trade}</dd></div>
              <div><dt>Coverage</dt><dd>{coverage.length ? coverage.join(", ") : "None declared"}</dd></div>
              <div><dt>Checks complete</dt><dd>{checksDone} of 4</dd></div>
            </dl>

            <p className="ad-modal-note">
              <Icon name="alert" size={16} /> This writes <strong>approved</strong> to the artisan profile in Neon.
              It does not list the artisan in the marketplace on its own — listing stays a separate flag.
            </p>

            <div className="ad-modal-actions">
              <button
                type="button"
                className="ad-btn ad-btn-primary"
                onClick={() => void commitRuling("approved")}
                disabled={submitting}
              >
                <Icon name="checkCircle" size={16} /> {submitting ? "Committing…" : "Confirm approval"}
              </button>
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modal === "reject" ? (
        <div className="ad-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div
            className="ad-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ad-modal-head">
              <div>
                <span className="ad-modal-eyebrow">Request revision</span>
                <h2 id="reject-modal-title">{dossier.display_name}</h2>
              </div>
              <button type="button" className="ad-modal-close" onClick={() => setModal(null)} aria-label="Close dialog">
                <Icon name="x" size={18} />
              </button>
            </div>

            <label className="ad-field">
              <span>Reason for revision</span>
              <textarea
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="State what the artisan must correct before resubmitting…"
              />
            </label>

            <p className="ad-modal-note">
              <Icon name="alert" size={16} /> Only the status change is persisted. The reason stays in this session —
              artisan notification is not connected in this build.
            </p>

            <div className="ad-modal-actions">
              <button
                type="button"
                className="ad-btn ad-btn-primary"
                onClick={() => void commitRuling("rejected")}
                disabled={submitting || !reason.trim()}
              >
                <Icon name="send" size={16} /> {submitting ? "Committing…" : "Send back for revision"}
              </button>
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
