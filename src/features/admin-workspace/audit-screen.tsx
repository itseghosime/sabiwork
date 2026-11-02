"use client";

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
  deskStatusLabel,
  formatWat,
  hoursBetween,
  pluralUnit,
  relativeWat,
  type AuditLogEntry,
  type AuditSeverity,
  type DeskTicket,
  type DeskTicketStatus,
} from "./admin-data";

type ApiError = { error?: { code?: string; message?: string } };

type DeskReply = { id: string; author: string; body: string; createdAtIso: string };

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error?.message ?? "Request failed.");
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

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
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [tickets, setTickets] = useState<DeskTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [thread, setThread] = useState<{ ticketId: string; replies: DeskReply[] }>({ ticketId: "", replies: [] });
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const applyAudit = useCallback((next: { logs: AuditLogEntry[]; tickets: DeskTicket[] }) => {
    setLogs(next.logs);
    setTickets(next.tickets);
    setSelectedTicketId((current) =>
      next.tickets.some((ticket) => ticket.id === current) ? current : (next.tickets[0]?.id ?? ""),
    );
    setError(null);
    setLoading(false);
  }, []);

  const load = useCallback(async () => {
    try {
      applyAudit(await readJson<{ logs: AuditLogEntry[]; tickets: DeskTicket[] }>("/api/admin/audit"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the audit trail.");
    }
  }, [applyAudit]);

  useEffect(() => {
    let active = true;
    readJson<{ logs: AuditLogEntry[]; tickets: DeskTicket[] }>("/api/admin/audit")
      .then((next) => {
        if (!active) return;
        applyAudit(next);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load the audit trail.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applyAudit]);

  useEffect(() => {
    if (!selectedTicketId) return;
    let active = true;
    readJson<{ ticket: DeskTicket; replies: DeskReply[] }>(`/api/admin/desk/${selectedTicketId}`)
      .then((next) => {
        if (!active) return;
        setThread({ ticketId: selectedTicketId, replies: next.replies });
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load the desk ticket.");
      });
    return () => {
      active = false;
    };
  }, [selectedTicketId]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (severity !== "all" && log.severity !== severity) return false;
      if (!needle) return true;
      return [log.id, log.actor, log.action, log.target, log.gateway]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [logs, severity, query]);

  const metrics = useMemo(() => {
    const now = new Date().toISOString();
    const today = logs.filter((log) => hoursBetween(log.atIso, now) <= 24);
    return {
      today: today.length,
      critical: today.filter((log) => log.severity === "critical").length,
      warning: today.filter((log) => log.severity === "warning").length,
      openTickets: tickets.filter((ticket) => ticket.status !== "resolved").length,
    };
  }, [logs, tickets]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0];
  const replies = thread.ticketId === selectedTicket?.id ? thread.replies : [];
  const nowIso = new Date().toISOString();

  function exportCsv() {
    const header = ["Event ID", "Timestamp (UTC)", "Actor", "Role", "Action", "Target", "Gateway", "Severity"];
    const rows = filtered.map((log) => [
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
    link.download = `sabiwork-admin-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice(`Exported ${filtered.length} ${pluralUnit(filtered.length, "event")} to CSV.`);
  }

  async function setTicketStatus(ticketId: string, status: DeskTicketStatus) {
    setBusy(`status-${ticketId}`);
    setError(null);
    setNotice(null);
    try {
      const next = await readJson<{ ticket: DeskTicket }>(`/api/admin/desk/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? next.ticket : ticket)));
      setNotice(`Ticket ${ticketId} marked ${deskStatusLabel[status].toLowerCase()} in Neon.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the desk ticket.");
    } finally {
      setBusy(null);
    }
  }

  async function sendReply() {
    if (!selectedTicket) return;
    const message = reply.trim();
    if (message.length < 2) {
      setError("Write a reply before sending.");
      return;
    }
    setBusy("reply");
    setError(null);
    setNotice(null);
    try {
      const next = await readJson<{ ticket: DeskTicket; reply: DeskReply }>(`/api/admin/desk/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message }),
      });
      setThread((current) => ({
        ticketId: selectedTicket.id,
        replies: [...(current.ticketId === selectedTicket.id ? current.replies : []), next.reply],
      }));
      setTickets((current) =>
        current.map((ticket) => (ticket.id === selectedTicket.id ? next.ticket : ticket)),
      );
      setReply("");
      setNotice(`Reply recorded on ${selectedTicket.id}. No email or chat delivery is connected.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reply.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="ad-page">
        <p className="ad-loading" role="status">
          Retrieving the audit trail from Neon…
        </p>
      </div>
    );
  }

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[{ label: "Admin portal", href: "/admin" }, { label: "Audit logs & desk" }]}
        title="Audit logs &amp; desk"
        description="Trace every administrative action and triage the support inbox in one place."
        actions={
          view === "audit" ? (
            <button type="button" className="ad-btn ad-btn-primary" onClick={exportCsv} disabled={!filtered.length}>
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
            <StatusPill tone="neutral" dot={false}>Neon records</StatusPill>
          </>
        }
      />

      <SampleNotice>
        Every admin action recorded in this build is listed here with its target and severity. Parties named in
        these events are fictional.
      </SampleNotice>

      {error ? (
        <p className="ad-inline-notice is-danger" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      ) : null}

      <section className="ad-kpi-grid" aria-label="Audit and desk metrics">
        <KpiCard label="Events today" value={String(metrics.today)} unit={pluralUnit(metrics.today, "event")} icon="scroll" tone="info" footnote="Last 24 hours" />
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
          <Icon name="checkCircle" size={16} /> {notice}
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
                { value: "all", label: "All", count: logs.length },
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "critical", label: "Critical" },
              ]}
            />
          </div>

          {filtered.length === 0 ? (
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
                  {filtered.map((log) => (
                    <tr key={log.id}>
                      <td className="ad-cell-nowrap"><span className="ad-cell-mono">{log.id}</span></td>
                      <td>
                        <div className="ad-cell-stack">
                          <span className="ad-cell-strong">{formatWat(log.atIso)}</span>
                          <span className="ad-cell-muted">{relativeWat(log.atIso, nowIso)}</span>
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
            description="Tickets across email, chat, and phone."
            className="ad-desk-list"
          >
            {tickets.length === 0 ? (
              <EmptyState icon="headset" title="No tickets yet" message="Desk tickets appear here once a request arrives." />
            ) : (
              <ul className="ad-ticket-list">
                {tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      className={`ad-ticket ${selectedTicket?.id === ticket.id ? "active" : ""}`}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      aria-pressed={selectedTicket?.id === ticket.id}
                    >
                      <span className="ad-ticket-top">
                        <span className="ad-cell-mono">{ticket.id}</span>
                        <StatusPill tone={deskTone[ticket.status]}>{deskStatusLabel[ticket.status]}</StatusPill>
                      </span>
                      <strong>{ticket.subject}</strong>
                      <span className="ad-cell-muted">{ticket.from}</span>
                      <span className="ad-ticket-meta">
                        <span className={`ad-channel is-${ticket.channel}`}>{ticket.channel}</span>
                        <span>{relativeWat(ticket.updatedAtIso, nowIso)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title={selectedTicket?.subject ?? "No ticket selected"}
            description={selectedTicket ? `${selectedTicket.from} · ${formatWat(selectedTicket.updatedAtIso)}` : undefined}
            className="ad-desk-detail"
            actions={selectedTicket ? <StatusPill tone={deskTone[selectedTicket.status]}>{deskStatusLabel[selectedTicket.status]}</StatusPill> : null}
          >
            {selectedTicket ? (
              <>
                <p className="ad-lead">{selectedTicket.summary}</p>

                <div className="ad-desk-meta">
                  <div><span>Ticket</span><strong>{selectedTicket.id}</strong></div>
                  <div><span>Channel</span><strong>{selectedTicket.channel}</strong></div>
                  <div><span>Priority</span><strong>{selectedTicket.priority}</strong></div>
                  <div><span>Updated</span><strong>{relativeWat(selectedTicket.updatedAtIso, nowIso)}</strong></div>
                </div>

                {replies.length ? (
                  <ul className="ad-thread">
                    {replies.map((entry) => (
                      <li key={entry.id}>
                        <div className="ad-thread-head">
                          <strong>{entry.author}</strong>
                          <span>{relativeWat(entry.createdAtIso, nowIso)}</span>
                        </div>
                        <p>{entry.body}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ad-card-note">No replies recorded on this ticket yet.</p>
                )}

                <label className="ad-field">
                  <span>Reply</span>
                  <textarea
                    rows={4}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Write a reply to the requester…"
                    disabled={busy === "reply"}
                  />
                </label>

                <div className="ad-action-row">
                  <button
                    type="button"
                    className="ad-btn ad-btn-primary"
                    onClick={sendReply}
                    disabled={!reply.trim() || busy === "reply"}
                  >
                    <Icon name="send" size={16} /> {busy === "reply" ? "Sending…" : "Send reply"}
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost"
                    onClick={() => setTicketStatus(selectedTicket.id, "waiting")}
                    disabled={selectedTicket.status === "waiting" || busy !== null}
                  >
                    Mark waiting
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost"
                    onClick={() => setTicketStatus(selectedTicket.id, "resolved")}
                    disabled={selectedTicket.status === "resolved" || busy !== null}
                  >
                    Mark resolved
                  </button>
                </div>

                <p className="ad-card-note">
                  Replies and status changes are recorded against the ticket in Neon. Email and chat delivery are
                  not connected.
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
