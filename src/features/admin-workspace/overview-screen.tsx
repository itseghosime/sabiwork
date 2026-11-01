"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  BarsChart,
  Donut,
  KpiCard,
  PageHeader,
  ProgressBar,
  SampleNotice,
  SectionCard,
  StatusPill,
} from "./admin-ui";
import {
  SAMPLE_LEDGER_NOTE,
  formatNaira,
  formatNairaCompact,
  formatWat,
  pluralUnit,
  relativeWat,
  sampleActivity,
  sampleAttentionQueue,
  sampleDisputes,
  sampleLedger,
  sampleVolumeSeries,
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

  const openDisputes = sampleDisputes.filter((dispute) => dispute.status !== "resolved").length;
  const urgentDisputes = sampleDisputes.filter(
    (dispute) => dispute.priority !== "normal" && dispute.status !== "resolved",
  ).length;

  const pipeline = [
    { label: "Pending review", value: counts.pending, tone: "warning" as const },
    { label: "Approved", value: counts.approved, tone: "success" as const },
    { label: "Needs revision", value: counts.rejected, tone: "danger" as const },
    { label: "Not submitted", value: counts.unsubmitted, tone: "neutral" as const },
  ];
  const pipelineTotal = pipeline.reduce((sum, item) => sum + item.value, 0) || 1;

  const escrowSegments = [
    { value: sampleLedger.escrowHeldKobo, color: "#006491", label: "Held in escrow" },
    { value: sampleLedger.releaseDueKobo, color: "#38a8e8", label: "Release due" },
    { value: sampleLedger.disputedKobo, color: "#ba1a1a", label: "Disputed" },
  ];

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
        Vetting and request counts load from the Neon admin API. Settlement, escrow, and dispute figures are
        fictional samples used to design the ledger views — no payment provider is connected.
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
          value={formatNairaCompact(sampleLedger.escrowHeldKobo)}
          icon="banknote"
          tone="info"
          chip={<StatusPill tone="info" dot={false}>Sample ledger</StatusPill>}
          footnote={`As of ${formatWat(sampleLedger.asOfIso)} WAT`}
        />
        <KpiCard
          label="Open disputes"
          value={String(openDisputes)}
          unit={pluralUnit(openDisputes, "case")}
          icon="gavel"
          tone="danger"
          chip={<StatusPill tone="danger">{urgentDisputes} urgent</StatusPill>}
          footnote="Sample cases"
        />
      </section>

      <div className="ad-grid-2">
        <SectionCard
          title="Settlement volume"
          description="Sample gross value moving through escrow, last seven days."
          actions={<StatusPill tone="info" dot={false}>{formatNaira(sampleLedger.grossVolumeKobo)}</StatusPill>}
        >
          <BarsChart data={sampleVolumeSeries} />
          <div className="ad-summary-strip">
            <div>
              <span>Released to artisans</span>
              <strong>{formatNaira(sampleLedger.releasedKobo)}</strong>
            </div>
            <div>
              <span>Platform commission</span>
              <strong>{formatNaira(sampleLedger.commissionKobo)}</strong>
            </div>
            <div>
              <span>Release due today</span>
              <strong>{formatNaira(sampleLedger.releaseDueKobo)}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Escrow position"
          description="How held funds split across the release pipeline."
          actions={<StatusPill tone="neutral" dot={false}>Sample</StatusPill>}
        >
          <div className="ad-donut-wrap">
            <Donut
              segments={escrowSegments}
              centerLabel="Total held"
              centerValue={formatNairaCompact(sampleLedger.escrowHeldKobo + sampleLedger.releaseDueKobo + sampleLedger.disputedKobo)}
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
          <p className="ad-card-note">{SAMPLE_LEDGER_NOTE}</p>
        </SectionCard>
      </div>

      <div className="ad-grid-2">
        <SectionCard
          title="Needs attention"
          description="Items closest to breaching an operational target."
          actions={<Link className="ad-link" href="/admin/audit">View audit trail <Icon name="arrowUpRight" size={15} /></Link>}
        >
          <ul className="ad-attention-list">
            {sampleAttentionQueue.map((item) => (
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
        </SectionCard>

        <SectionCard title="Recent activity" description="Latest administrative events (sample).">
          <ol className="ad-timeline">
            {sampleActivity.map((item) => (
              <li key={item.id}>
                <span className={`ad-timeline-dot ${item.tone}`} aria-hidden="true" />
                <div>
                  <div className="ad-timeline-head">
                    <strong>{item.title}</strong>
                    <span title={formatWat(item.atIso)}>{relativeWat(item.atIso)}</span>
                  </div>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
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
