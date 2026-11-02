"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Check,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { PrototypeNotice } from "@/components/prototype-notice";
import {
  type ArtisanDashboardData,
  type ArtisanWorkOrder,
  type EarningsLedgerEntry,
  type DayAvailability,
  defaultArtisanDashboard,
  defaultArtisanOrders,
  defaultLedgerEntries,
  defaultSchedule,
  artisanOperationsDemoService,
} from "./service";
import "./artisan-ops.css";

/* ==========================================================================
   S36: Artisan Dashboard Overview Screen
   ========================================================================== */

export function ArtisanDashboardScreen({
  initialData = defaultArtisanDashboard,
}: {
  initialData?: ArtisanDashboardData;
}) {
  const [data] = useState<ArtisanDashboardData>(initialData);

  return (
    <div className="ao-page" data-testid="artisan-dashboard-screen">
      <PrototypeNotice>
        Dashboard totals, requests, jobs, and reviews are fictional samples. No work or payment activity is recorded.
      </PrototypeNotice>
      <div className="ao-breadcrumbs">
        <Link href="/artisan">Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Dashboard Overview (S36)</strong>
      </div>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "28px",
              margin: 0,
              color: "var(--text-dark, #0e294b)",
            }}
          >
            Welcome, {data.artisanName}
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            {data.artisanTrade} · Sample operations preview
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/artisan/requests" className="button button-outline">
            Browse Open Requests
          </Link>
          <Link href="/artisan/profile" className="button button-primary">
            Edit Trade Profile (S06)
          </Link>
        </div>
      </header>

      {/* KPI Metrics Grid */}
      <div className="ao-metrics-grid">
        <div className="ao-metric-card">
          <span className="ao-metric-label">Sample Work Order Previews</span>
          <span className="ao-metric-value">{data.activeJobsCount}</span>
          <span className="ao-metric-sub">Illustrative count only · no job is assigned</span>
        </div>

        <div className="ao-metric-card">
          <span className="ao-metric-label">Sample Open Requests</span>
          <span className="ao-metric-value">{data.openRequestsInDistrict}</span>
          <span className="ao-metric-sub">No customers are waiting or contacted</span>
        </div>

        <div className="ao-metric-card">
          <span className="ao-metric-label">Pending payment previews</span>
          <span className="ao-metric-value" style={{ color: "var(--primary)" }}>
            ₦{(data.pendingPaymentsKobo / 100).toLocaleString()}
          </span>
          <span className="ao-metric-sub">Demo amounts only · no funds are held</span>
        </div>

        <div className="ao-metric-card">
          <span className="ao-metric-label">Sample Client Rating</span>
          <span className="ao-metric-value" style={{ color: "#b45309" }}>
            ★ {data.ratingAverage}
          </span>
          <span className="ao-metric-sub">Across {data.totalReviews} sample reviews</span>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        <section className="ao-card">
          <h2 className="ao-card-title">
            <Wrench size={20} /> Sample Work Orders (S37)
          </h2>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#475569" }}>
            Preview fictional work-order and milestone states; no jobs are assigned.
          </p>
          <Link href="/artisan/jobs" className="button button-primary">
            View Work Orders (S37) →
          </Link>
        </section>

        <section className="ao-card">
          <h2 className="ao-card-title">
            <TrendingUp size={20} /> Earnings Ledger (S38)
          </h2>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#475569" }}>
            Review sample ledger entries and preview a payout interaction.
          </p>
          <Link href="/artisan/earnings" className="button button-primary">
            View Earnings (S38) →
          </Link>
        </section>

        <section className="ao-card">
          <h2 className="ao-card-title">
            <Calendar size={20} /> Availability Schedule (S39)
          </h2>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#475569" }}>
            Update your daily working hours and dispatch capacity in Benin City.
          </p>
          <Link href="/artisan/availability" className="button button-primary">
            Manage Availability (S39) →
          </Link>
        </section>
      </div>
    </div>
  );
}

/* ==========================================================================
   S37: Artisan My Jobs & Work Orders Screen
   ========================================================================== */

export function ArtisanWorkOrdersScreen({
  initialOrders = defaultArtisanOrders,
}: {
  initialOrders?: readonly ArtisanWorkOrder[];
}) {
  const [orders] = useState<readonly ArtisanWorkOrder[]>(initialOrders);

  return (
    <div className="ao-page" data-testid="artisan-work-orders-screen">
      <PrototypeNotice>
        Work orders, locations, and amounts are fictional. No job is assigned, active, or saved.
      </PrototypeNotice>
      <div className="ao-breadcrumbs">
        <Link href="/artisan">Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Sample Work Order Previews (S37)</strong>
      </div>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "28px",
              margin: 0,
              color: "var(--text-dark, #0e294b)",
            }}
          >
            Sample Work Order Previews
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            {orders.length} fictional records; no customer jobs are allocated.
          </p>
        </div>

        <Link href="/artisan/requests" className="button button-primary">
          Browse Open Requests (S17)
        </Link>
      </header>

      <div style={{ display: "grid", gap: "16px" }}>
        {orders.map((ord) => (
          <article key={ord.id} className="ao-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span
                  style={{
                    background: "#f0fdf4",
                    color: "#166534",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "999px",
                  }}
                >
                  {ord.status === "ACTIVE_MILESTONE_1"
                    ? "Sample Milestone 1 State · not paid"
                    : "Sample Milestone 2 State · not paid"}
                </span>
                <h2 style={{ margin: "6px 0 2px 0", fontSize: "18px", color: "var(--text-dark, #0e294b)" }}>
                  #{ord.id} · {ord.title}
                </h2>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                  Sample customer: <strong>{ord.customerName}</strong> · Service area: {ord.address}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>
                  Sample contract amount
                </span>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--primary)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  ₦{(ord.payoutKobo / 100).toLocaleString()}
                </div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Sample date: {ord.dueDate}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "12px",
              }}
            >
              <Link
                href={`/artisan/jobs/${ord.id}/update`}
                className="button button-outline"
                style={{ minHeight: "36px", fontSize: "13px" }}
              >
                Log Technical Update (S29)
              </Link>
              <Link
                href={`/jobs/${ord.id}/progress`}
                className="button button-primary"
                style={{ minHeight: "36px", fontSize: "13px" }}
              >
                View Job Audit (S28) →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   S38: Sample Artisan Earnings Ledger
   ========================================================================== */

export function ArtisanEarningsLedgerScreen({
  initialLedger = defaultLedgerEntries,
}: {
  initialLedger?: readonly EarningsLedgerEntry[];
}) {
  const [ledger] = useState<readonly EarningsLedgerEntry[]>(initialLedger);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleTestPayout = async (simulateFail = false) => {
    setRequestingPayout(true);
    setStatusMessage(null);

    const res = await artisanOperationsDemoService.requestTestPayout(3000000, simulateFail);
    setRequestingPayout(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="ao-page" data-testid="artisan-earnings-screen">
      <PrototypeNotice>
        Earnings and payout actions are previews only. No bank details are stored and no funds move.
      </PrototypeNotice>
      <div className="ao-breadcrumbs">
        <Link href="/artisan">Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Sample Earnings Ledger (S38)</strong>
      </div>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "28px",
              margin: 0,
              color: "var(--text-dark, #0e294b)",
            }}
          >
            Sample Artisan Earnings Ledger
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Preview fictional ledger entries and payout feedback states.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={() => handleTestPayout(true)}
            disabled={requestingPayout}
          >
            Preview payout error
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => handleTestPayout(false)}
            disabled={requestingPayout}
          >
            {requestingPayout ? "Preparing preview..." : "Preview ₦30,000 payout"}
          </button>
        </div>
      </header>

      {statusMessage && (
        <div
          className={`ao-alert ${
            statusMessage.type === "success" ? "ao-alert-success" : "ao-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      {/* Available Balance Banner */}
      <div className="ao-card" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "12px", color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>
              Sample Balance Preview
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)" }}>
              ₦30,000.00
            </div>
          </div>
          <span style={{ fontSize: "12.5px", color: "#166534" }}>
            No payment provider or bank account is connected.
          </span>
        </div>
      </div>

      {/* Ledger list */}
      <section className="ao-card">
        <h2 className="ao-card-title">Sample Ledger Entries</h2>
        <div style={{ display: "grid", gap: "10px" }}>
          {ledger.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                borderBottom: "1px solid #f1f5f9",
                fontSize: "13.5px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <strong>{entry.jobTitle}</strong>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  #{entry.id} · {entry.dateWat}
                </div>
              </div>
              <strong style={{ color: "var(--primary)", fontSize: "16px" }}>
                Sample amount · ₦{(entry.amountKobo / 100).toLocaleString()}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ==========================================================================
   S39: Artisan Availability & Calendar Schedule Screen
   ========================================================================== */

export function ArtisanAvailabilityScreen({
  initialSchedule = defaultSchedule,
}: {
  initialSchedule?: readonly DayAvailability[];
}) {
  const [schedule, setSchedule] = useState<readonly DayAvailability[]>(initialSchedule);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const toggleDay = (dayName: string) => {
    setSchedule(
      schedule.map((item) =>
        item.day === dayName ? { ...item, active: !item.active } : item,
      ),
    );
  };

  const handleSaveSchedule = async (simulateFail = false) => {
    setSaving(true);
    setStatusMessage(null);

    const res = await artisanOperationsDemoService.updateSchedule(schedule, simulateFail);
    setSaving(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="ao-page" data-testid="artisan-availability-screen">
      <PrototypeNotice>
        Availability changes stay in local page state only; no schedule is saved or broadcast.
      </PrototypeNotice>
      <div className="ao-breadcrumbs">
        <Link href="/artisan">Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Availability & Calendar Schedule (S39)</strong>
      </div>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "28px",
              margin: 0,
              color: "var(--text-dark, #0e294b)",
            }}
          >
            Weekly Dispatch Availability
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Set active days and hours when you can receive field job broadcasts in Benin City.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={() => handleSaveSchedule(true)}
            disabled={saving}
          >
            Simulate Sync Error
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => handleSaveSchedule(false)}
            disabled={saving}
          >
            {saving ? "Updating..." : "Save Weekly Schedule"}
          </button>
        </div>
      </header>

      {statusMessage && (
        <div
          className={`ao-alert ${
            statusMessage.type === "success" ? "ao-alert-success" : "ao-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <div className="ao-schedule-grid">
        {schedule.map((item) => (
          <div
            key={item.day}
            className={`ao-schedule-row ${item.active ? "active" : ""}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="checkbox"
                id={`check-${item.day}`}
                checked={item.active}
                onChange={() => toggleDay(item.day)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label
                htmlFor={`check-${item.day}`}
                style={{ fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
              >
                {item.day}
              </label>
            </div>

            <div style={{ fontSize: "13px", color: item.active ? "var(--text)" : "var(--muted)" }}>
              {item.timeSlot}
            </div>

            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Capacity: {item.maxJobs} job{item.maxJobs === 1 ? "" : "s"} max
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
