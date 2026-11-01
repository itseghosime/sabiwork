"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import {
  BarsChart,
  Donut,
  EmptyState,
  KpiCard,
  PageHeader,
  ProgressBar,
  SampleNotice,
  SectionCard,
  StatusPill,
} from "./admin-ui";
import {
  formatNaira,
  formatNairaCompact,
  formatWat,
  pluralUnit,
  relativeWat,
  type AuditLogEntry,
} from "./admin-data";

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
  verification_status: "unsubmitted" | "pending" | "approved" | "rejected";
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
  disputes: {
    total: number;
    open: number;
    urgent: number;
    awaitingEvidence: number;
    unassigned: number;
    overdue: number;
  };
  escrow: {
    heldKobo: number;
    releaseDueKobo: number;
    releasedKobo: number;
    disputedKobo: number;
    releasedLast7DaysKobo: number;
    dueNow: number;
  };
  activity: AuditLogEntry[];
  desk: { open: number; unclaimed: number };
};

type ApiError = { error?: { message?: string } };

async function readJson<T>(input: RequestInfo): Promise<T> {
  const response = await fetch(input, { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error?.message ?? "Request failed.");
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

const attentionTone: Record<string, "danger" | "warning" | "info"> = {
  danger: "danger",
  warning: "warning",
  info: "info",
};

export function AdminOverviewScreen() {
  const [data, setData] = useState<OverviewData | null>(null);
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
      setError(err instanceof Error ? err.message : "Could not load admin overview.");
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
        setError(err instanceof Error ? err.message : "Could not load admin overview.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const profiles = data?.workProfiles ?? [];
    const users = data?.users ?? [];
    const requests = data?.requests ?? [];
    return {
      pending: profiles.filter((profile) => profile.verification_status === "pending").length,
      approved: profiles.filter((profile) => profile.verification_status === "approved").length,
      rejected: profiles.filter((profile) => profile.verification_status === "rejected").length,
      unsubmitted: profiles.filter((profile) => profile.verification_status === "unsubmitted").length,
      listed: profiles.filter((profile) => profile.is_listed).length,
      artisans: profiles.length,
      customers: users.filter((user) => user.role === "customer").length,
      requests: requests.length,
      openRequests: requests.filter((request) => request.status !== "cancelled").length,
    };
  }, [data]);

  const disputes = data?.disputes ?? { total: 0, open: 0, urgent: 0, awaitingEvidence: 0, unassigned: 0, overdue: 0 };
  const escrow = data?.escrow ?? {
    heldKobo: 0,
    releaseDueKobo: 0,
    releasedKobo: 0,
    disputedKobo: 0,
    releasedLast7DaysKobo: 0,
    dueNow: 0,
  };
  const pipeline = [
    { label: "Pending review", value: counts.pending, tone: "warning" as const },
    { label: "Approved", value: counts.approved, tone: "success" as const },
    { label: "Needs revision", value: counts.rejected, tone: "danger" as const },
    { label: "Not submitted", value: counts.unsubmitted, tone: "neutral" as const },
  ];
  const pipelineTotal = pipeline.reduce((sum, item) => sum + item.value, 0) || 1;

  const escrowSegments = [
    { value: escrow.heldKobo, color: "#006491", label: "Held in escrow" },
    { value: escrow.releaseDueKobo, color: "#38a8e8", label: "Release due" },
    { value: escrow.disputedKobo, color: "#ba1a1a", label: "Disputed" },
  ];

  const escrowSeries = [
    { label: "Held", valueKobo: escrow.heldKobo },
    { label: "Due", valueKobo: escrow.releaseDueKobo },
    { label: "Released", valueKobo: escrow.releasedKobo },
    { label: "Disputed", valueKobo: escrow.disputedKobo },
  ];

  const nowIso = new Date().toISOString();

  const attention: {
    id: string;
    href: string;
    icon: IconName;
    tone: "danger" | "warning" | "info";
    meta: string;
    title: string;
    detail: string;
  }[] = [];

  if (disputes.overdue > 0) {
    attention.push({
      id: "disputes-overdue",
      href: "/admin/disputes",
      icon: "gavel",
      tone: "danger",
      meta: "Disputes",
      title: `${disputes.overdue} ${pluralUnit(disputes.overdue, "case")} past the response SLA`,
      detail: "Open the queue and record a determination.",
    });
  }
  if (disputes.urgent > 0) {
    attention.push({
      id: "disputes-urgent",
      href: "/admin/disputes",
      icon: "alert",
      tone: "warning",
      meta: "Disputes",
      title: `${disputes.urgent} urgent ${pluralUnit(disputes.urgent, "case")} waiting`,
      detail: "Urgent priority is set on these cases.",
    });
  }
  if (escrow.dueNow > 0) {
    attention.push({
      id: "escrow-due",
      href: "/admin/escrow",
      icon: "banknote",
      tone: "info",
      meta: "Payouts",
      title: `${escrow.dueNow} ${pluralUnit(escrow.dueNow, "milestone")} inside a release window`,
      detail: "Signed-off milestones are ready to be recorded.",
    });
  }
  if (counts.pending > 0) {
    attention.push({
      id: "verification-pending",
      href: "/admin/verification",
      icon: "shield",
      tone: "warning",
      meta: "Vetting",
      title: `${counts.pending} ${pluralUnit(counts.pending, "dossier")} awaiting verification`,
      detail: "Review identity and trade evidence.",
    });
  }
  if (data?.desk.unclaimed) {
    attention.push({
      id: "desk-unclaimed",
      href: "/admin/audit",
      icon: "headset",
      tone: "info",
      meta: "Desk",
      title: `${data.desk.unclaimed} new ${pluralUnit(data.desk.unclaimed, "ticket")} unclaimed`,
      detail: "Claim and reply from the support inbox.",
    });
  }

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[{ label: "Admin portal", href: "/admin" }, { label: "Overview" }]}
        title="Operations overview"
        description="A single read on vetting throughput, dispute load, and the escrow position across the Benin City hub."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-ghost"
              onClick={() => void load(true)}
              disabled={refreshing}
              title="Reload live counts from Neon"
            >
              <Icon name="refresh" size={16} />
              <span>{refreshing ? "Syncing…" : "Refresh"}</span>
            </button>
            <Link className="ad-btn ad-btn-primary" href="/admin/verification">
              <Icon name="shield" size={16} />
              <span>Open vetting queue</span>
            </Link>
          </>
        }
        meta={
          <>
            <StatusPill tone="success">Hub online</StatusPill>
            <StatusPill tone="neutral" dot={false}>Edo State · Gateway #BN-04</StatusPill>
            <StatusPill tone="neutral" dot={false}>Live counts: Neon</StatusPill>
          </>
        }
      />

      {error ? (
        <div className="ad-error" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <SampleNotice>
        Every figure on this page is aggregated from the Neon admin API. Parties behind the records are
        fictional, and no payment provider is connected, so settlement values are record-only.
      </SampleNotice>

      <section className="ad-kpi-grid" aria-label="Key operational metrics">
        <KpiCard
          label="Pending verification"
          value={loading ? "—" : String(counts.pending)}
          unit={pluralUnit(counts.pending, "dossier")}
          icon="shield"
          tone="warning"
          chip={<StatusPill tone="warning">Inside 24h SLA</StatusPill>}
          footnote="Live from Neon"
        />
        <KpiCard
          label="Listed artisans"
          value={loading ? "—" : String(counts.listed)}
          unit={`of ${counts.artisans || 0}`}
          icon="users"
          tone="success"
          chip={<StatusPill tone="success">Marketplace visible</StatusPill>}
          footnote="Live from Neon"
        />
        <KpiCard
          label="Escrow held"
          value={formatNairaCompact(escrow.heldKobo + escrow.releaseDueKobo)}
          icon="banknote"
          tone="info"
          chip={<StatusPill tone="info" dot={false}>{escrow.dueNow} due</StatusPill>}
          footnote="Held + release due, live from Neon"
        />
        <KpiCard
          label="Open disputes"
          value={loading ? "—" : String(disputes.open)}
          unit={pluralUnit(disputes.open, "case")}
          icon="gavel"
          tone="danger"
          chip={<StatusPill tone="danger">{disputes.urgent} urgent</StatusPill>}
          footnote="Excludes resolved cases"
        />
      </section>

      <div className="ad-grid-2">
        <SectionCard
          title="Escrow by state"
          description="Recorded milestones grouped by where they sit in the payout pipeline."
          actions={<StatusPill tone="info" dot={false}>Live from Neon</StatusPill>}
        >
          <BarsChart data={escrowSeries} />
          <div className="ad-summary-strip">
            <div>
              <span>Released to artisans</span>
              <strong>{formatNaira(escrow.releasedKobo)}</strong>
            </div>
            <div>
              <span>Released last 7 days</span>
              <strong>{formatNaira(escrow.releasedLast7DaysKobo)}</strong>
            </div>
            <div>
              <span>Release due now</span>
              <strong>{formatNaira(escrow.releaseDueKobo)}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Escrow position"
          description="How held funds split across the release pipeline."
          actions={<StatusPill tone="neutral" dot={false}>Live from Neon</StatusPill>}
        >
          <div className="ad-donut-wrap">
            <Donut
              segments={escrowSegments}
              centerLabel="Total held"
              centerValue={formatNairaCompact(escrow.heldKobo + escrow.releaseDueKobo + escrow.disputedKobo)}
            />
            <ul className="ad-legend">
              {escrowSegments.map((segment) => (
                <li key={segment.label}>
                  <span className="ad-legend-dot" style={{ background: segment.color }} aria-hidden="true" />
                  <span className="ad-legend-label">{segment.label}</span>
                  <strong>{formatNaira(segment.value)}</strong>
                </li>
              ))}
            </ul>
          </div>
          <p className="ad-card-note">
            Released milestones drop out of this split. No payment provider is connected, so a recorded release
            does not move money.
          </p>
        </SectionCard>
      </div>

      <div className="ad-grid-2">
        <SectionCard
          title="Needs attention"
          description="Items closest to breaching an operational target."
          actions={<Link className="ad-link" href="/admin/audit">View audit trail <Icon name="arrowUpRight" size={15} /></Link>}
        >
          {attention.length === 0 ? (
            <EmptyState
              icon="checkCircle"
              title="Nothing is breaching a target"
              message="Disputes, releases, vetting, and the desk are all inside their operational windows."
            />
          ) : (
            <ul className="ad-attention-list">
              {attention.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="ad-attention-item">
                    <span className={`ad-attention-icon ${attentionTone[item.tone]}`}>
                      <Icon name={item.icon} size={18} />
                    </span>
                    <span className="ad-attention-body">
                      <span className="ad-attention-meta">{item.meta}</span>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </span>
                    <Icon name="next" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="Latest administrative events from the audit trail."
          actions={<Link className="ad-link" href="/admin/audit">Open log <Icon name="arrowUpRight" size={15} /></Link>}
        >
          {data?.activity.length ? (
            <ol className="ad-timeline">
              {data.activity.map((item) => (
                <li key={item.id}>
                  <span
                    className={`ad-timeline-dot ${item.severity === "critical" ? "danger" : item.severity === "warning" ? "warning" : "info"}`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="ad-timeline-head">
                      <strong>{item.action}</strong>
                      <span title={formatWat(item.atIso)}>{relativeWat(item.atIso, nowIso)}</span>
                    </div>
                    <p>
                      {item.actor} · {item.actorRole} → {item.target}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon="scroll" title="No audit events yet" message="Administrative actions will appear here as they happen." />
          )}
        </SectionCard>
      </div>

      <div className="ad-grid-2">
        <SectionCard
          title="Verification pipeline"
          description="Live dossier distribution from the Neon vetting queue."
          actions={<Link className="ad-link" href="/admin/verification">Manage <Icon name="arrowUpRight" size={15} /></Link>}
        >
          <div className="ad-pipeline">
            {pipeline.map((item) => (
              <div key={item.label} className="ad-pipeline-row">
                <div className="ad-pipeline-head">
                  <span>{item.label}</span>
                  <strong>{loading ? "—" : item.value}</strong>
                </div>
                <ProgressBar
                  value={loading ? 0 : Math.round((item.value / pipelineTotal) * 100)}
                  tone={item.tone}
                  label={`${item.label}: ${item.value}`}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Hub composition" description="Accounts and open demand in the hub (live counts).">
          <div className="ad-stat-row">
            <div className="ad-stat">
              <span>Artisan accounts</span>
              <strong>{loading ? "—" : counts.artisans}</strong>
            </div>
            <div className="ad-stat">
              <span>Customer accounts</span>
              <strong>{loading ? "—" : counts.customers}</strong>
            </div>
            <div className="ad-stat">
              <span>Request records</span>
              <strong>{loading ? "—" : counts.requests}</strong>
            </div>
            <div className="ad-stat">
              <span>Active requests</span>
              <strong>{loading ? "—" : counts.openRequests}</strong>
            </div>
          </div>
          <div className="ad-quick-links">
            <Link className="ad-quick-link" href="/admin/disputes">
              <Icon name="gavel" size={17} />
              <span>Dispute queue</span>
              <Icon name="next" size={15} />
            </Link>
            <Link className="ad-quick-link" href="/admin/escrow">
              <Icon name="banknote" size={17} />
              <span>Escrow &amp; payouts</span>
              <Icon name="next" size={15} />
            </Link>
            <Link className="ad-quick-link" href="/admin/trades">
              <Icon name="filters" size={17} />
              <span>Rates &amp; tiers</span>
              <Icon name="next" size={15} />
            </Link>
            <Link className="ad-quick-link" href="/admin/audit">
              <Icon name="scroll" size={17} />
              <span>Audit &amp; desk</span>
              <Icon name="next" size={15} />
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
