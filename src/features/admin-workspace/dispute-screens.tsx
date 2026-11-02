"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  EmptyState,
  FilterTabs,
  KpiCard,
  PageHeader,
  SampleNotice,
  SectionCard,
  StatusPill,
  type Tone,
} from "./admin-ui";
import {
  SAMPLE_LEDGER_NOTE,
  disputeStatusLabel,
  formatNaira,
  formatWat,
  pluralUnit,
  type DisputeCase,
  type DisputePriority,
  type DisputeStatus,
} from "./admin-data";

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

const statusTone: Record<DisputeStatus, Tone> = {
  open: "info",
  under_review: "warning",
  awaiting_evidence: "warning",
  escalated: "danger",
  resolved: "success",
};

const priorityTone: Record<DisputePriority, Tone> = {
  urgent: "danger",
  high: "warning",
  normal: "neutral",
};

type StatusFilter = DisputeStatus | "all";

type DisputeCaseRecord = DisputeCase & {
  slaDueAtIso: string;
  determination: string | null;
  determinationNote: string | null;
};

const DETERMINATION_OPTIONS = [
  "Release escrow to artisan",
  "Refund the customer",
  "Split the disputed amount",
  "No action required",
] as const;

export function AdminDisputesScreen() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<DisputePriority | "all">("all");
  const [query, setQuery] = useState("");
  const [cases, setCases] = useState<DisputeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const next = await readJson<{ cases: DisputeCase[] }>("/api/admin/disputes");
      setCases(next.cases);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dispute cases.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    readJson<{ cases: DisputeCase[] }>("/api/admin/disputes")
      .then((next) => {
        if (!active) return;
        setCases(next.cases);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load dispute cases.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const open = cases.filter((dispute) => dispute.status !== "resolved");
    return {
      open: open.length,
      urgent: open.filter((dispute) => dispute.priority === "urgent").length,
      awaiting: cases.filter((dispute) => dispute.status === "awaiting_evidence").length,
      value: open.reduce((sum, dispute) => sum + dispute.amountKobo, 0),
    };
  }, [cases]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cases.filter((dispute) => {
      if (status !== "all" && dispute.status !== status) return false;
      if (priority !== "all" && dispute.priority !== priority) return false;
      if (!needle) return true;
      return [
        dispute.id,
        dispute.title,
        dispute.trade,
        dispute.area,
        dispute.customerName,
        dispute.artisanName,
        dispute.jobRef,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [cases, status, priority, query]);

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[{ label: "Admin portal", href: "/admin" }, { label: "Disputes" }]}
        title="Dispute cases"
        description="Mediate customer–artisan disagreements, track evidence, and watch the response SLA."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-ghost"
              onClick={() => load(true)}
              disabled={refreshing}
            >
              <Icon name="refresh" size={16} />
              <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
            <Link className="ad-btn ad-btn-ghost" href="/admin/audit">
              <Icon name="scroll" size={16} />
              <span>Audit trail</span>
            </Link>
            <Link className="ad-btn ad-btn-primary" href="/admin/verification">
              <Icon name="shield" size={16} />
              <span>Vetting queue</span>
            </Link>
          </>
        }
        meta={
          <>
            <StatusPill tone="danger">{counts.urgent} urgent</StatusPill>
            <StatusPill tone="warning">{counts.awaiting} awaiting evidence</StatusPill>
            <StatusPill tone="neutral" dot={false}>Neon records</StatusPill>
          </>
        }
      />

      <SampleNotice>
        {SAMPLE_LEDGER_NOTE} Cases below are stored in the Neon database but describe fictional parties.
        Status changes persist; no payment provider is connected, so no funds move.
      </SampleNotice>

      {error ? (
        <p className="ad-inline-notice is-danger" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      ) : null}

      <section className="ad-kpi-grid" aria-label="Dispute metrics">
        <KpiCard label="Open cases" value={String(counts.open)} unit={pluralUnit(counts.open, "case")} icon="gavel" tone="danger" footnote="Excludes resolved cases" />
        <KpiCard label="Urgent" value={String(counts.urgent)} unit={pluralUnit(counts.urgent, "case")} icon="alert" tone="warning" footnote="Priority flag set" />
        <KpiCard label="Awaiting evidence" value={String(counts.awaiting)} unit={pluralUnit(counts.awaiting, "case")} icon="file" tone="info" footnote="Artisan response pending" />
        <KpiCard label="Disputed value" value={formatNaira(counts.value)} icon="banknote" tone="info" chip={<StatusPill tone="info" dot={false}>Demo</StatusPill>} footnote="Across open cases" />
      </section>

      <div className="ad-toolbar">
        <div className="ad-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search case ref, parties, trade, or area…"
            aria-label="Search dispute cases"
          />
        </div>
        <FilterTabs
          ariaLabel="Filter by case status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: cases.length },
            { value: "open", label: "Open" },
            { value: "under_review", label: "Under review" },
            { value: "awaiting_evidence", label: "Awaiting evidence" },
            { value: "escalated", label: "Escalated" },
            { value: "resolved", label: "Resolved" },
          ]}
        />
        <label className="ad-select-wrap">
          <span className="ad-sr-only">Filter by priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value as DisputePriority | "all")}>
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="ad-loading" role="status">
          Retrieving dispute cases from Neon…
        </p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="gavel"
          title="No cases match this view"
          message="Adjust the status, priority, or search term to see more dispute cases."
          action={
            <button type="button" className="ad-btn ad-btn-ghost" onClick={() => { setStatus("all"); setPriority("all"); setQuery(""); }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Parties</th>
                <th>Trade &amp; area</th>
                <th>Amount</th>
                <th>SLA</th>
                <th>Status</th>
                <th className="ad-cell-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dispute) => (
                <tr key={dispute.id}>
                  <td>
                    <div className="ad-cell-stack">
                      <Link className="ad-cell-strong" href={`/admin/disputes/${dispute.id}`}>
                        {dispute.id}
                      </Link>
                      <span className="ad-cell-muted">{dispute.title}</span>
                      <StatusPill tone={priorityTone[dispute.priority]} dot={dispute.priority === "urgent"}>
                        {dispute.priority} priority
                      </StatusPill>
                    </div>
                  </td>
                  <td className="ad-cell-nowrap">
                    <div className="ad-cell-stack">
                      <span className="ad-cell-strong">{dispute.customerName}</span>
                      <span className="ad-cell-muted">vs {dispute.artisanName}</span>
                      <span className="ad-cell-muted">Job {dispute.jobRef}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ad-cell-stack">
                      <span className="ad-cell-strong">{dispute.trade}</span>
                      <span className="ad-cell-muted">{dispute.area}</span>
                    </div>
                  </td>
                  <td>
                    <span className="ad-cell-strong">{formatNaira(dispute.amountKobo)}</span>
                  </td>
                  <td>
                    {dispute.status === "resolved" ? (
                      <span className="ad-cell-muted">Closed</span>
                    ) : dispute.slaHoursLeft <= 6 ? (
                      <StatusPill tone="danger">{dispute.slaHoursLeft}h left</StatusPill>
                    ) : (
                      <span className="ad-cell-muted">{dispute.slaHoursLeft}h left</span>
                    )}
                  </td>
                  <td>
                    <StatusPill tone={statusTone[dispute.status]}>{disputeStatusLabel[dispute.status]}</StatusPill>
                  </td>
                  <td className="ad-cell-right">
                    <Link className="ad-btn ad-btn-ghost ad-btn-sm" href={`/admin/disputes/${dispute.id}`}>
                      Review <Icon name="next" size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionCard
        title="Mediation protocol"
        description="How the hub handles a disagreement once a case is opened."
      >
        <ol className="ad-steps">
          <li>
            <span className="ad-step-num">1</span>
            <div>
              <strong>Log and notify</strong>
              <p>The case is opened with both parties notified. A 48-hour response window starts immediately.</p>
            </div>
          </li>
          <li>
            <span className="ad-step-num">2</span>
            <div>
              <strong>Collect evidence</strong>
              <p>Photographs, quotes, and written statements are attached and reviewed by the assigned officer.</p>
            </div>
          </li>
          <li>
            <span className="ad-step-num">3</span>
            <div>
              <strong>Determine and record</strong>
              <p>A ruling requires an officer’s written rationale. In this build, rulings are previews only and are not persisted.</p>
            </div>
          </li>
        </ol>
      </SectionCard>
    </div>
  );
}

export function AdminDisputeDetailScreen({ id }: { id: string }) {
  const [dispute, setDispute] = useState<DisputeCaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({ statements: false, evidence: false, policy: false });
  const [note, setNote] = useState("");
  const [determination, setDetermination] = useState<string>(DETERMINATION_OPTIONS[0]);
  const [officerDraft, setOfficerDraft] = useState("");
  const [priorityDraft, setPriorityDraft] = useState<DisputePriority>("normal");

  const applyCase = useCallback((next: DisputeCaseRecord) => {
    setDispute(next);
    setOfficerDraft(next.officer ?? "");
    setPriorityDraft(next.priority);
    setNote(next.determinationNote ?? "");
    setDetermination(next.determination ?? DETERMINATION_OPTIONS[0]);
  }, []);

  useEffect(() => {
    let active = true;
    readJson<{ case: DisputeCaseRecord }>(`/api/admin/disputes/${id}`)
      .then((next) => {
        if (!active) return;
        applyCase(next.case);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load this dispute case.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, applyCase]);

  async function patch(body: Record<string, unknown>, message: string, key: string) {
    setSubmitting(key);
    setError(null);
    setNotice(null);
    try {
      const next = await readJson<{ case: DisputeCaseRecord }>(`/api/admin/disputes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      applyCase(next.case);
      setNotice(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this dispute case.");
    } finally {
      setSubmitting(null);
    }
  }

  async function commitDetermination() {
    const rationale = note.trim();
    if (rationale.length < 10) {
      setNotice(null);
      setError("A determination needs a rationale of at least 10 characters.");
      return;
    }
    await patch(
      { determination, determinationNote: rationale, status: "resolved" },
      "Determination recorded in Neon and the case marked resolved. No payment provider is connected, so no funds moved.",
      "determine",
    );
  }

  async function saveAssignment() {
    await patch(
      { officer: officerDraft.trim() || null, priority: priorityDraft },
      "Case assignment saved in Neon.",
      "assign",
    );
  }

  if (loading) {
    return (
      <div className="ad-page">
        <p className="ad-loading" role="status">
          Retrieving dispute case from Neon…
        </p>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="ad-page">
        <EmptyState
          icon="gavel"
          title={`Case ${id} could not be opened`}
          message={error ?? "This case reference is not in the dispute queue."}
          action={
            <Link className="ad-btn ad-btn-primary" href="/admin/disputes">
              <Icon name="back" size={16} /> Back to dispute queue
            </Link>
          }
        />
      </div>
    );
  }

  const checked = Object.values(checklist).filter(Boolean).length;
  const busy = submitting !== null;
  const resolved = dispute.status === "resolved";

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[
          { label: "Admin portal", href: "/admin" },
          { label: "Disputes", href: "/admin/disputes" },
          { label: dispute.id },
        ]}
        title={dispute.title}
        description={`Case ${dispute.id} · Job ${dispute.jobRef} · ${dispute.trade} · ${dispute.area}`}
        actions={
          <Link className="ad-btn ad-btn-ghost" href="/admin/disputes">
            <Icon name="back" size={16} /> Back to queue
          </Link>
        }
        meta={
          <>
            <StatusPill tone={statusTone[dispute.status]}>{disputeStatusLabel[dispute.status]}</StatusPill>
            <StatusPill tone={priorityTone[dispute.priority]} dot={dispute.priority === "urgent"}>
              {dispute.priority} priority
            </StatusPill>
            {resolved ? (
              <StatusPill tone="success" dot={false}>Determination recorded</StatusPill>
            ) : (
              <StatusPill tone={dispute.slaHoursLeft <= 6 ? "danger" : "neutral"} dot={false}>
                {dispute.slaHoursLeft}h left on SLA
              </StatusPill>
            )}
          </>
        }
      />

      <SampleNotice>
        {SAMPLE_LEDGER_NOTE} This case is stored in the Neon database and describes fictional parties. Status
        changes, assignments, and determinations persist; no payment provider is connected, so no funds move.
      </SampleNotice>

      {error ? (
        <p className="ad-inline-notice is-danger" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      ) : null}

      <div className="ad-kpi-grid ad-kpi-grid-3">
        <KpiCard label="Disputed amount" value={formatNaira(dispute.amountKobo)} icon="banknote" tone="info" footnote="Frozen for the case" />
        <KpiCard label="Opened" value={formatWatDateShort(dispute.openedAtIso)} icon="clock" tone="neutral" footnote={formatWat(dispute.openedAtIso)} />
        <KpiCard label="Case officer" value={dispute.officer ?? "Unassigned"} icon="user" tone={dispute.officer ? "success" : "warning"} footnote={dispute.officer ? "Assigned" : "Needs assignment"} />
      </div>

      <div className="ad-split">
        <div className="ad-stack">
          <SectionCard title="Case summary">
            <p className="ad-lead">{dispute.summary}</p>
          </SectionCard>

          <div className="ad-grid-2">
            <SectionCard title="Customer statement" description={dispute.customerName}>
              <p className="ad-quote">“{dispute.customerStatement}”</p>
            </SectionCard>
            <SectionCard title="Artisan statement" description={dispute.artisanName}>
              <p className="ad-quote">“{dispute.artisanStatement}”</p>
            </SectionCard>
          </div>

          <SectionCard title="Evidence locker" description={`${dispute.evidence.length} items submitted`}>
            <ul className="ad-evidence-list">
              {dispute.evidence.map((item) => (
                <li key={item.id}>
                  <span className="ad-evidence-icon" aria-hidden="true">
                    <Icon name={item.kind.toLowerCase().includes("photo") ? "paintbrush" : "file"} size={18} />
                  </span>
                  <div className="ad-evidence-body">
                    <strong>{item.name}</strong>
                    <span>
                      {item.kind} · {item.submittedBy} · {formatWat(item.submittedAtIso)}
                    </span>
                  </div>
                  <StatusPill tone={item.verified ? "success" : "warning"}>
                    {item.verified ? "Verified" : "Unverified"}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Case timeline">
            <ol className="ad-timeline ad-timeline-lg">
              {dispute.timeline.map((entry, index) => (
                <li key={`${entry.atIso}-${index}`}>
                  <span className={`ad-timeline-dot ${index === dispute.timeline.length - 1 ? "info" : "neutral"}`} aria-hidden="true" />
                  <div>
                    <div className="ad-timeline-head">
                      <strong>{entry.label}</strong>
                      <span>{formatWat(entry.atIso)}</span>
                    </div>
                    <p>{entry.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        <aside className="ad-stack">
          <SectionCard
            title="Determination panel"
            description="Recording a ruling writes it to Neon and closes the case."
            className="ad-sticky"
          >
            <div className="ad-checklist">
              <label>
                <input type="checkbox" checked={checklist.statements} onChange={(event) => setChecklist({ ...checklist, statements: event.target.checked })} />
                <span>Both party statements reviewed</span>
              </label>
              <label>
                <input type="checkbox" checked={checklist.evidence} onChange={(event) => setChecklist({ ...checklist, evidence: event.target.checked })} />
                <span>Evidence authenticated</span>
              </label>
              <label>
                <input type="checkbox" checked={checklist.policy} onChange={(event) => setChecklist({ ...checklist, policy: event.target.checked })} />
                <span>Fair-trade policy checked</span>
              </label>
            </div>

            <div className="ad-checklist-meter">
              <span>{checked} of 3 checks complete</span>
              <div className="ad-progress is-success" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={checked}>
                <span style={{ width: `${(checked / 3) * 100}%` }} />
              </div>
            </div>

            <label className="ad-field">
              <span>Ruling</span>
              <select value={determination} onChange={(event) => setDetermination(event.target.value)} disabled={busy}>
                {DETERMINATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="ad-field">
              <span>Officer rationale</span>
              <textarea
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write the reasoning that accompanies this ruling…"
                disabled={busy}
              />
            </label>

            <div className="ad-action-stack">
              <button
                type="button"
                className="ad-btn ad-btn-primary"
                onClick={commitDetermination}
                disabled={busy || checked < 3}
                title={checked < 3 ? "Complete all three checks first." : undefined}
              >
                <Icon name="checkCircle" size={16} /> {submitting === "determine" ? "Recording…" : resolved ? "Update determination" : "Record determination"}
              </button>
              <button
                type="button"
                className="ad-btn ad-btn-ghost"
                onClick={() => patch({ status: "awaiting_evidence" }, "Case marked awaiting evidence in Neon.", "evidence")}
                disabled={busy || dispute.status === "awaiting_evidence"}
              >
                <Icon name="file" size={16} /> Request more evidence
              </button>
              <button
                type="button"
                className="ad-btn ad-btn-ghost"
                onClick={() => patch({ status: "escalated" }, "Case escalated to a senior officer in Neon.", "escalate")}
                disabled={busy || dispute.status === "escalated"}
              >
                <Icon name="arrowUpRight" size={16} /> Escalate to senior officer
              </button>
              <button
                type="button"
                className="ad-btn ad-btn-ghost"
                onClick={() =>
                  patch(
                    { status: resolved ? "open" : "under_review" },
                    resolved ? "Case reopened in Neon." : "Review started in Neon.",
                    "status",
                  )
                }
                disabled={busy || dispute.status === "under_review"}
              >
                <Icon name="refresh" size={16} /> {resolved ? "Reopen case" : "Start review"}
              </button>
            </div>

            {notice ? (
              <p className="ad-inline-notice" role="status">
                <Icon name="checkCircle" size={16} /> {notice}
              </p>
            ) : null}
          </SectionCard>

          <SectionCard title="Assignment" description="Who owns this case and how fast it must move.">
            <label className="ad-field">
              <span>Case officer</span>
              <input
                type="text"
                value={officerDraft}
                onChange={(event) => setOfficerDraft(event.target.value)}
                placeholder="Unassigned"
                maxLength={100}
                disabled={busy}
              />
            </label>
            <label className="ad-field">
              <span>Priority</span>
              <select
                value={priorityDraft}
                onChange={(event) => setPriorityDraft(event.target.value as DisputePriority)}
                disabled={busy}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </label>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={saveAssignment}
              disabled={busy}
            >
              <Icon name="user" size={16} /> {submitting === "assign" ? "Saving…" : "Save assignment"}
            </button>
          </SectionCard>

          <SectionCard title="Case facts">
            <dl className="ad-facts">
              <div>
                <dt>Case reference</dt>
                <dd>{dispute.id}</dd>
              </div>
              <div>
                <dt>Job reference</dt>
                <dd>{dispute.jobRef}</dd>
              </div>
              <div>
                <dt>Trade</dt>
                <dd>{dispute.trade}</dd>
              </div>
              <div>
                <dt>Area</dt>
                <dd>{dispute.area}</dd>
              </div>
              <div>
                <dt>Opened</dt>
                <dd>{formatWat(dispute.openedAtIso)}</dd>
              </div>
              <div>
                <dt>SLA due</dt>
                <dd>{formatWat(dispute.slaDueAtIso)}</dd>
              </div>
              <div>
                <dt>Determination</dt>
                <dd>{dispute.determination ?? "Not yet recorded"}</dd>
              </div>
              <div>
                <dt>Records note</dt>
                <dd>Stored in Neon · fictional parties</dd>
              </div>
            </dl>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}

function formatWatDateShort(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(iso));
}
