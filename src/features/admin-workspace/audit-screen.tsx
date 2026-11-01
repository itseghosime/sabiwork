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
  SAMPLE_NOW_ISO,
  deskStatusLabel,
  formatWat,
  hoursBetween,
  pluralUnit,
  relativeWat,
  sampleAuditLogs,
  sampleDeskTickets,
  type AuditSeverity,
  type DeskTicketStatus,
} from "./admin-data";

const severityTone: Record<AuditSeverity, Tone> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

const deskTone: Record<DeskTicketStatus, Tone> = {
  new: "danger",
  open: "warning",
  waiting: "info",
  resolved: "success",
};

type AuditFilter = AuditSeverity | "all";

export function AdminAuditScreen() {
  const [view, setView] = useState<"audit" | "desk">("audit");
  const [severity, setSeverity] = useState<AuditFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(sampleDeskTickets[0]?.id ?? "");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, DeskTicketStatus>>({});
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const logs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sampleAuditLogs.filter((log) => {
      if (severity !== "all" && log.severity !== severity) return false;
      if (!needle) return true;
      return [log.id, log.actor, log.action, log.target, log.gateway]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [severity, query]);

  const metrics = useMemo(() => {
    const today = sampleAuditLogs.filter((log) => hoursBetween(log.atIso, SAMPLE_NOW_ISO) <= 24);
    return {
      today: today.length,
      critical: today.filter((log) => log.severity === "critical").length,
      warning: today.filter((log) => log.severity === "warning").length,
      openTickets: sampleDeskTickets.filter(
        (ticket) => (statusOverrides[ticket.id] ?? ticket.status) !== "resolved",
      ).length,
    };
  }, [statusOverrides]);

  const selectedTicket =
    sampleDeskTickets.find((ticket) => ticket.id === selectedTicketId) ?? sampleDeskTickets[0];

  function exportCsv() {
    const header = ["Event ID", "Timestamp (UTC)", "Actor", "Role", "Action", "Target", "Gateway", "Severity"];
    const rows = logs.map((log) => [
      log.id,
      log.atIso,
      `"${log.actor}"`,
      log.actorRole,
      log.action,
      `"${log.target}"`,
      log.gateway,
      log.severity,
    ]);
    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sabiwork-admin-audit-sample-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice("Exported the filtered sample audit log to CSV. These are fictional events.");
  }

  function setTicketStatus(ticketId: string, status: DeskTicketStatus) {
    setStatusOverrides((current) => ({ ...current, [ticketId]: status }));
    setNotice(`Ticket ${ticketId} marked ${deskStatusLabel[status]} in this preview. No backend record changed.`);
  }

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[{ label: "Admin portal", href: "/admin" }, { label: "Audit logs & desk" }]}
        title="Audit logs &amp; desk"
        description="Trace every administrative action and triage the support inbox in one place."
        actions={
          view === "audit" ? (
            <button type="button" className="ad-btn ad-btn-primary" onClick={exportCsv}>
              <Icon name="download" size={16} />
              <span>Export CSV</span>
            </button>
          ) : (
            <button type="button" className="ad-btn ad-btn-primary" onClick={() => setView("audit")}>
              <Icon name="scroll" size={16} />
              <span>Open audit log</span>
            </button>
          )
        }
        meta={
          <>
            <StatusPill tone="danger">{metrics.critical} critical today</StatusPill>
            <StatusPill tone="warning">{metrics.openTickets} desk tickets open</StatusPill>
            <StatusPill tone="neutral" dot={false}>Sample events</StatusPill>
          </>
        }
      />

      <SampleNotice>
        {SAMPLE_LEDGER_NOTE} Audit events, tickets, replies, and status changes are fictional and local to this
        preview.
      </SampleNotice>

      <section className="ad-kpi-grid" aria-label="Audit and desk metrics">
        <KpiCard label="Events today" value={String(metrics.today)} unit={pluralUnit(metrics.today, "event")} icon="scroll" tone="info" footnote="Sample, last 24h" />
        <KpiCard label="Critical events" value={String(metrics.critical)} unit={pluralUnit(metrics.critical, "event")} icon="alert" tone="danger" footnote="SLA or auth anomalies" />
        <KpiCard label="Warnings" value={String(metrics.warning)} unit={pluralUnit(metrics.warning, "event")} icon="shieldAlert" tone="warning" footnote="Needs a second look" />
        <KpiCard label="Desk tickets" value={String(metrics.openTickets)} unit="open" icon="headset" tone="info" footnote="Across all channels" />
      </section>

      <div className="ad-view-switch" role="tablist" aria-label="Audit or desk view">
        <button type="button" role="tab" aria-selected={view === "audit"} className={view === "audit" ? "active" : ""} onClick={() => setView("audit")}>
          <Icon name="scroll" size={16} /> Audit log
        </button>
        <button type="button" role="tab" aria-selected={view === "desk"} className={view === "desk" ? "active" : ""} onClick={() => setView("desk")}>
          <Icon name="headset" size={16} /> Desk
        </button>
      </div>

      {notice ? (
        <p className="ad-inline-notice ad-inline-notice-wide" role="status">
          <Icon name="alert" size={16} /> {notice}
        </p>
      ) : null}

      {view === "audit" ? (
        <>
          <div className="ad-toolbar">
            <div className="ad-search">
              <Icon name="search" size={17} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search actor, action, target, or event id…"
                aria-label="Search audit log"
              />
            </div>
            <FilterTabs
              ariaLabel="Filter audit events by severity"
              value={severity}
              onChange={setSeverity}
              options={[
                { value: "all", label: "All", count: sampleAuditLogs.length },
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "critical", label: "Critical" },
              ]}
            />
          </div>

          {logs.length === 0 ? (
            <EmptyState
              icon="scroll"
              title="No events match this filter"
              message="Try a different severity or clear the search field."
              action={<button type="button" className="ad-btn ad-btn-ghost" onClick={() => { setSeverity("all"); setQuery(""); }}>Clear filters</button>}
            />
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table ad-table-audit">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>When (WAT)</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Gateway</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="ad-cell-nowrap"><span className="ad-cell-mono">{log.id}</span></td>
                      <td>
                        <div className="ad-cell-stack">
                          <span className="ad-cell-strong">{formatWat(log.atIso)}</span>
                          <span className="ad-cell-muted">{relativeWat(log.atIso)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ad-cell-stack">
                          <span className="ad-cell-strong">{log.actor}</span>
                          <span className="ad-cell-muted">{log.actorRole}</span>
                        </div>
                      </td>
                      <td className="ad-cell-nowrap"><span className="ad-cell-mono">{log.action}</span></td>
                      <td><span className="ad-cell-muted">{log.target}</span></td>
                      <td className="ad-cell-nowrap"><span className="ad-cell-mono">{log.gateway}</span></td>
                      <td><StatusPill tone={severityTone[log.severity]}>{log.severity}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="ad-desk">
          <SectionCard
            title="Support inbox"
            description="Sample tickets across email, chat, and phone."
            className="ad-desk-list"
          >
            <ul className="ad-ticket-list">
              {sampleDeskTickets.map((ticket) => {
                const status = statusOverrides[ticket.id] ?? ticket.status;
                return (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      className={`ad-ticket ${selectedTicket?.id === ticket.id ? "active" : ""}`}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      aria-pressed={selectedTicket?.id === ticket.id}
                    >
                      <span className="ad-ticket-top">
                        <span className="ad-cell-mono">{ticket.id}</span>
                        <StatusPill tone={deskTone[status]}>{deskStatusLabel[status]}</StatusPill>
                      </span>
                      <strong>{ticket.subject}</strong>
                      <span className="ad-cell-muted">{ticket.from}</span>
                      <span className="ad-ticket-meta">
                        <span className={`ad-channel is-${ticket.channel}`}>{ticket.channel}</span>
                        <span>{relativeWat(ticket.updatedAtIso)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard
            title={selectedTicket?.subject ?? "No ticket selected"}
            description={selectedTicket ? `${selectedTicket.from} · ${formatWat(selectedTicket.updatedAtIso)}` : undefined}
            className="ad-desk-detail"
            actions={selectedTicket ? <StatusPill tone={deskTone[statusOverrides[selectedTicket.id] ?? selectedTicket.status]}>{deskStatusLabel[statusOverrides[selectedTicket.id] ?? selectedTicket.status]}</StatusPill> : null}
          >
            {selectedTicket ? (
              <>
                <p className="ad-lead">{selectedTicket.summary}</p>

                <div className="ad-desk-meta">
                  <div><span>Ticket</span><strong>{selectedTicket.id}</strong></div>
                  <div><span>Channel</span><strong>{selectedTicket.channel}</strong></div>
                  <div><span>Priority</span><strong>{selectedTicket.priority}</strong></div>
                  <div><span>Updated</span><strong>{relativeWat(selectedTicket.updatedAtIso)}</strong></div>
                </div>

                <label className="ad-field">
                  <span>Reply (preview only)</span>
                  <textarea
                    rows={4}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Write a reply to the requester…"
                  />
                </label>

                <div className="ad-action-row">
                  <button
                    type="button"
                    className="ad-btn ad-btn-primary"
                    onClick={() => {
                      setNotice(`Reply to ${selectedTicket.id} staged in this preview. No message was sent.`);
                      setReply("");
                    }}
                    disabled={!reply.trim()}
                  >
                    <Icon name="send" size={16} /> Stage reply
                  </button>
                  <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setTicketStatus(selectedTicket.id, "waiting")}>
                    Mark waiting
                  </button>
                  <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setTicketStatus(selectedTicket.id, "resolved")}>
                    Mark resolved
                  </button>
                </div>

                <p className="ad-card-note">
                  Replies and status changes are local previews. Email/chat delivery and ticket persistence are not
                  connected in this build.
                </p>
              </>
            ) : (
              <EmptyState icon="headset" title="Select a ticket" message="Choose a ticket from the inbox to open it." />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
