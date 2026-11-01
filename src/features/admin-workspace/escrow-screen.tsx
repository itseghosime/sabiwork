"use client";

import { useMemo, useState } from "react";
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
  escrowStatusLabel,
  formatNaira,
  formatWat,
  pluralUnit,
  sampleEscrowHolds,
  type EscrowHold,
  type EscrowStatus,
} from "./admin-data";

const statusTone: Record<EscrowStatus, Tone> = {
  held: "info",
  release_due: "warning",
  released: "success",
  disputed: "danger",
};

type StatusFilter = EscrowStatus | "all";

export function AdminEscrowScreen() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [queued, setQueued] = useState<ReadonlySet<string>>(new Set());
  const [pendingRelease, setPendingRelease] = useState<EscrowHold | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const totals = useMemo(() => {
    const sum = (predicate: (hold: EscrowHold) => boolean) =>
      sampleEscrowHolds.filter(predicate).reduce((total, hold) => total + hold.amountKobo, 0);
    return {
      held: sum((hold) => hold.status === "held" || hold.status === "release_due"),
      releaseDue: sum((hold) => hold.status === "release_due"),
      released: sum((hold) => hold.status === "released"),
      disputed: sum((hold) => hold.status === "disputed"),
      dueToday: sampleEscrowHolds.filter((hold) => hold.status === "release_due").length,
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sampleEscrowHolds.filter((hold) => {
      if (status !== "all" && hold.status !== status) return false;
      if (!needle) return true;
      return [hold.id, hold.title, hold.customerName, hold.artisanName, hold.trade, hold.jobRef]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [status, query]);

  const dueSchedule = sampleEscrowHolds
    .filter((hold) => hold.status === "release_due")
    .slice()
    .sort((a, b) => new Date(a.releaseDueIso).getTime() - new Date(b.releaseDueIso).getTime());

  function confirmRelease() {
    if (!pendingRelease) return;
    setQueued(new Set(queued).add(pendingRelease.id));
    setNotice(
      `Release for ${pendingRelease.id} (${formatNaira(pendingRelease.amountKobo)}) was queued in this preview only — no funds were moved and no provider was called.`,
    );
    setPendingRelease(null);
  }

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[{ label: "Admin portal", href: "/admin" }, { label: "Escrow & payouts" }]}
        title="Escrow &amp; payouts"
        description="Track held milestones, release windows, and payout readiness across active jobs."
        actions={
          <>
            <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setStatus("release_due")}>
              <Icon name="clock" size={16} />
              <span>Release due ({totals.dueToday})</span>
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setNotice("Ledger export is a preview. The signed provider statement is not connected in this build.")}
            >
              <Icon name="download" size={16} />
              <span>Export ledger</span>
            </button>
          </>
        }
        meta={
          <>
            <StatusPill tone="warning">{totals.dueToday} releases due</StatusPill>
            <StatusPill tone="danger" dot={false}>1 disputed hold</StatusPill>
            <StatusPill tone="neutral" dot={false}>Sample ledger</StatusPill>
          </>
        }
      />

      <SampleNotice>{SAMPLE_LEDGER_NOTE} Release actions on this page are previews and never move money.</SampleNotice>

      <section className="ad-kpi-grid" aria-label="Escrow metrics">
        <KpiCard label="Held in escrow" value={formatNaira(totals.held)} icon="banknote" tone="info" chip={<StatusPill tone="info" dot={false}>Sample</StatusPill>} footnote="Held + release due" />
        <KpiCard label="Release due" value={formatNaira(totals.releaseDue)} icon="clock" tone="warning" footnote={`${totals.dueToday} ${pluralUnit(totals.dueToday, "milestone")}`} />
        <KpiCard label="Released" value={formatNaira(totals.released)} icon="checkCircle" tone="success" footnote="Signed off jobs" />
        <KpiCard label="In dispute" value={formatNaira(totals.disputed)} icon="gavel" tone="danger" footnote="Frozen pending review" />
      </section>

      <div className="ad-toolbar">
        <div className="ad-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search hold ref, job, artisan, or trade…"
            aria-label="Search escrow holds"
          />
        </div>
        <FilterTabs
          ariaLabel="Filter escrow holds by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: sampleEscrowHolds.length },
            { value: "held", label: "Held" },
            { value: "release_due", label: "Release due" },
            { value: "released", label: "Released" },
            { value: "disputed", label: "Disputed" },
          ]}
        />
      </div>

      {notice ? (
        <p className="ad-inline-notice ad-inline-notice-wide" role="status">
          <Icon name="alert" size={16} /> {notice}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon="banknote"
          title="No escrow holds match this view"
          message="Try a different status or clear the search field."
          action={
            <button type="button" className="ad-btn ad-btn-ghost" onClick={() => { setStatus("all"); setQuery(""); }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Hold &amp; job</th>
                <th>Parties</th>
                <th>Milestone</th>
                <th>Amount</th>
                <th>Release due</th>
                <th>Status</th>
                <th className="ad-cell-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hold) => {
                const isQueued = queued.has(hold.id);
                return (
                  <tr key={hold.id}>
                    <td>
                      <div className="ad-cell-stack">
                        <span className="ad-cell-strong ad-cell-nowrap">{hold.id}</span>
                        <span className="ad-cell-muted">{hold.title}</span>
                        <span className="ad-cell-muted">{hold.trade} · {hold.area}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ad-cell-stack">
                        <span className="ad-cell-strong">{hold.customerName}</span>
                        <span className="ad-cell-muted">→ {hold.artisanName}</span>
                        <span className="ad-cell-muted">{hold.payoutBank}</span>
                      </div>
                    </td>
                    <td>
                      <StatusPill tone="neutral" dot={false}>{hold.milestone}</StatusPill>
                    </td>
                    <td>
                      <span className="ad-cell-strong">{formatNaira(hold.amountKobo)}</span>
                    </td>
                    <td>
                      <div className="ad-cell-stack">
                        <span className="ad-cell-strong">{formatWat(hold.releaseDueIso)}</span>
                        <span className="ad-cell-muted">{hold.signedOff ? "Signed off" : "Awaiting sign-off"}</span>
                      </div>
                    </td>
                    <td>
                      <StatusPill tone={isQueued ? "info" : statusTone[hold.status]}>
                        {isQueued ? "Queued preview" : escrowStatusLabel[hold.status]}
                      </StatusPill>
                    </td>
                    <td className="ad-cell-right">
                      <button
                        type="button"
                        className="ad-btn ad-btn-ghost ad-btn-sm"
                        disabled={hold.status !== "release_due" || isQueued}
                        onClick={() => setPendingRelease(hold)}
                        title={
                          hold.status !== "release_due"
                            ? "Only milestones due for release can be actioned"
                            : isQueued
                              ? "Already queued in this preview"
                              : "Preview a release"
                        }
                      >
                        {isQueued ? "Queued" : "Release"} <Icon name="next" size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="ad-grid-2">
        <SectionCard title="Release schedule" description="Milestones due next, in WAT.">
          {dueSchedule.length === 0 ? (
            <EmptyState icon="checkCircle" title="Nothing due right now" message="No milestone is inside a release window." />
          ) : (
            <ul className="ad-schedule">
              {dueSchedule.map((hold) => (
                <li key={hold.id}>
                  <span className="ad-schedule-time">
                    <Icon name="clock" size={16} />
                    {formatWat(hold.releaseDueIso)}
                  </span>
                  <div className="ad-schedule-body">
                    <strong>{formatNaira(hold.amountKobo)}</strong>
                    <span>{hold.artisanName} · {hold.payoutBank}</span>
                  </div>
                  <StatusPill tone="warning" dot={false}>{hold.milestone}</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Payout health" description="Sample ledger controls before live payments.">
          <ul className="ad-health-list">
            <li>
              <span className="ad-health-icon is-success"><Icon name="checkCircle" size={17} /></span>
              <div>
                <strong>Bank name matching</strong>
                <p>All sample payslips match the verified artisan identity.</p>
              </div>
              <StatusPill tone="success">Ready</StatusPill>
            </li>
            <li>
              <span className="ad-health-icon is-warning"><Icon name="shieldAlert" size={17} /></span>
              <div>
                <strong>Disputed holds</strong>
                <p>One hold is frozen while dispute DSP-2026-0138 is open.</p>
              </div>
              <StatusPill tone="warning">Review</StatusPill>
            </li>
            <li>
              <span className="ad-health-icon is-danger"><Icon name="alert" size={17} /></span>
              <div>
                <strong>Provider connection</strong>
                <p>Paystack is not connected. No release can settle in this build.</p>
              </div>
              <StatusPill tone="danger">Blocked</StatusPill>
            </li>
          </ul>
        </SectionCard>
      </div>

      {pendingRelease ? (
        <div className="ad-modal-overlay" role="presentation" onClick={() => setPendingRelease(null)}>
          <div
            className="ad-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="release-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ad-modal-head">
              <div>
                <span className="ad-modal-eyebrow">Preview release</span>
                <h2 id="release-modal-title">{formatNaira(pendingRelease.amountKobo)}</h2>
              </div>
              <button type="button" className="ad-modal-close" onClick={() => setPendingRelease(null)} aria-label="Close dialog">
                <Icon name="x" size={18} />
              </button>
            </div>

            <dl className="ad-facts">
              <div><dt>Hold</dt><dd>{pendingRelease.id}</dd></div>
              <div><dt>Job</dt><dd>{pendingRelease.jobRef}</dd></div>
              <div><dt>Artisan</dt><dd>{pendingRelease.artisanName}</dd></div>
              <div><dt>Payout bank</dt><dd>{pendingRelease.payoutBank}</dd></div>
              <div><dt>Milestone</dt><dd>{pendingRelease.milestone}</dd></div>
              <div><dt>Sign-off</dt><dd>{pendingRelease.signedOff ? "Confirmed" : "Not confirmed"}</dd></div>
            </dl>

            <p className="ad-modal-note">
              <Icon name="alert" size={16} /> This action is a preview. No money moves, no provider call is made, and no
              record is persisted.
            </p>

            <div className="ad-modal-actions">
              <button type="button" className="ad-btn ad-btn-primary" onClick={confirmRelease} disabled={!pendingRelease.signedOff}>
                <Icon name="send" size={16} /> Queue release (preview)
              </button>
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setPendingRelease(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
