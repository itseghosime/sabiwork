"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  type ActiveJob,
  type PaymentTransactionRecord,
  defaultActiveJobs,
  defaultTransactions,
  lifecycleDemoService,
} from "./service";
import "./lifecycle.css";

/* ==========================================================================
   S26: Payment History & Transaction Details Screen
   ========================================================================== */

export function PaymentHistoryScreen({
  initialTransactions = defaultTransactions,
}: {
  initialTransactions?: readonly PaymentTransactionRecord[];
}) {
  const [txns] = useState<readonly PaymentTransactionRecord[]>(initialTransactions);

  return (
    <div className="lc-page" data-testid="payment-history-screen">
      <div className="lc-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Payment History & Escrow Ledger (S26)</strong>
      </div>

      <header>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            margin: 0,
            color: "var(--text-dark, #0e294b)",
          }}
        >
          Payment History & Transaction Details
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Itemized milestone escrow deposits and releases under SabiWork SafeTrade.
        </p>
      </header>

      <div style={{ display: "grid", gap: "14px" }}>
        {txns.map((t) => (
          <article key={t.id} className="lc-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <span
                  style={{
                    background: t.status === "LOCKED" ? "#eff6ff" : "#f0fdf4",
                    color: t.status === "LOCKED" ? "#1e40af" : "#166534",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {t.status === "LOCKED" ? "🔒 Escrow Locked" : "✓ Released to Artisan"}
                </span>
                <h2 style={{ margin: "6px 0 2px 0", fontSize: "16px", color: "var(--text-dark, #0e294b)" }}>
                  #{t.id} · {t.jobTitle}
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {t.dateWat} via {t.channel}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--primary)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  ₦{(t.amountKobo / 100).toLocaleString()}
                </span>
                <div style={{ marginTop: "6px" }}>
                  <Link
                    href={`/payments/${t.id}/receipt`}
                    className="button button-outline"
                    style={{ minHeight: "34px", fontSize: "12px", padding: "4px 10px" }}
                  >
                    View Receipt (S23)
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   S27: My Jobs & Active Engagements Screen (Workspace View)
   ========================================================================== */

export function MyJobsListScreen({
  initialJobs = defaultActiveJobs,
}: {
  initialJobs?: readonly ActiveJob[];
}) {
  const [jobs] = useState<readonly ActiveJob[]>(initialJobs);

  return (
    <div className="lc-page" data-testid="my-jobs-screen">
      <div className="lc-breadcrumbs">
        <Link href="/jobs">Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Active Engagements & Jobs (S27)</strong>
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
            My Jobs & Active Engagements
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Track live milestone progress, photo logs, and release balances upon completion.
          </p>
        </div>

        <Link href="/requests/new" className="button button-primary">
          Post Another Job Request
        </Link>
      </header>

      <div style={{ display: "grid", gap: "16px" }}>
        {jobs.map((j) => (
          <article key={j.id} className="lc-card">
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
                    background: j.status === "IN_PROGRESS" ? "#fffbeb" : "#f0fdf4",
                    color: j.status === "IN_PROGRESS" ? "#92400e" : "#166534",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "999px",
                  }}
                >
                  {j.status === "IN_PROGRESS"
                    ? "⚡ Work in Progress (Milestone 1 Active)"
                    : "✓ Awaiting Customer Sign-off"}
                </span>
                <h2 style={{ margin: "6px 0 2px 0", fontSize: "18px", color: "var(--text-dark, #0e294b)" }}>
                  {j.title}
                </h2>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                  Artisan: <strong>{j.artisanName}</strong> · District: {j.district} · Started {j.startDate}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                  Total Contract
                </span>
                <strong style={{ fontSize: "20px", color: "var(--primary)" }}>
                  ₦{(j.totalKobo / 100).toLocaleString()}
                </strong>
                <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                  ₦{(j.depositPaidKobo / 100).toLocaleString()} in Escrow
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "12px",
              }}
            >
              <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>
                {j.updates.length} progress update{j.updates.length === 1 ? "" : "s"} logged
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Link
                  href={`/jobs/${j.id}/progress`}
                  className="button button-outline"
                  style={{ minHeight: "36px", fontSize: "13px" }}
                >
                  View Live Progress (S28)
                </Link>
                {j.status === "AWAITING_SIGNOFF" && (
                  <Link
                    href={`/jobs/${j.id}/signoff`}
                    className="button button-primary"
                    style={{ minHeight: "36px", fontSize: "13px" }}
                  >
                    Sign Off & Release Balance (S30) →
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   S28: Shared Job Detail & Progress Screen
   ========================================================================== */

export function JobProgressDetailScreen({
  initialJob = defaultActiveJobs[0],
}: {
  initialJob?: ActiveJob;
}) {
  const [job] = useState<ActiveJob>(initialJob);

  return (
    <div className="lc-page" data-testid="job-progress-screen">
      <div className="lc-breadcrumbs">
        <Link href="/jobs">My Jobs</Link>
        <span aria-hidden="true">/</span>
        <strong>Job #{job.id} Progress Tracker (S28)</strong>
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
            {job.title}
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Artisan: {job.artisanName} · Customer: {job.customerName}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            href={`/artisan/jobs/${job.id}/update`}
            className="button button-outline"
          >
            + Add Progress Update (S29)
          </Link>
          <Link
            href={`/jobs/${job.id}/signoff`}
            className="button button-primary"
          >
            Complete & Sign Off (S30) →
          </Link>
        </div>
      </header>

      {/* Escrow Health Card */}
      <div className="lc-alert lc-alert-info">
        <ShieldCheck size={24} />
        <div>
          <strong>SabiWork Escrow Protected: Milestone {job.currentMilestone} Active</strong>
          <p>
            Deposit of ₦{(job.depositPaidKobo / 100).toLocaleString()} is held in escrow. Final
            balance of ₦{(job.balanceKobo / 100).toLocaleString()} will be funded upon customer
            inspection sign-off.
          </p>
        </div>
      </div>

      {/* Progress Timeline */}
      <section className="lc-card" aria-labelledby="updates-heading">
        <h2 id="updates-heading" className="lc-card-title">
          <Clock size={20} /> Live Work Verification Log
        </h2>

        <div className="lc-timeline">
          {job.updates.map((upd) => (
            <div key={upd.id} className="lc-timeline-item">
              <div className="lc-timeline-dot" />
              <span className="lc-timeline-title">{upd.title}</span>
              <p className="lc-timeline-sub" style={{ margin: "2px 0 4px 0" }}>
                {upd.note}
              </p>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                Logged by {upd.artisanName} · {upd.timeWat}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ==========================================================================
   S29: Artisan Add Progress Update Screen (Artisan View)
   ========================================================================== */

export function ArtisanAddProgressScreen({
  job = defaultActiveJobs[0],
}: {
  job?: ActiveJob;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("PPR Pressure Joint Vetted & Tested");
  const [note, setNote] = useState(
    "Installed high-pressure sleeve and performed 30-minute static pressure leak test. No drops registered.",
  );
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent, simulateFail = false) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await lifecycleDemoService.addProgressUpdate(job.id, { title, note }, simulateFail);
    setSaving(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
      router.push(`/jobs/${job.id}/progress`);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="lc-page" data-testid="add-progress-screen">
      <div className="lc-breadcrumbs">
        <Link href="/artisan/jobs">Artisan Jobs</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/jobs/${job.id}/progress`}>Job #{job.id}</Link>
        <span aria-hidden="true">/</span>
        <strong>Log Progress Update (S29)</strong>
      </div>

      <header>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            margin: 0,
            color: "var(--text-dark, #0e294b)",
          }}
        >
          Add Work Progress Update
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Log technical milestones and photographic evidence for customer review.
        </p>
      </header>

      {statusMessage && (
        <div
          className={`lc-alert ${
            statusMessage.type === "success" ? "lc-alert-success" : "lc-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} style={{ display: "grid", gap: "20px" }}>
        <section className="lc-card">
          <div className="rq-field-group">
            <label htmlFor="progress-title">Update Milestone Summary</label>
            <input
              id="progress-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="rq-field-group">
            <label htmlFor="progress-note">Detailed Technical Notes</label>
            <textarea
              id="progress-note"
              rows={4}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div
            style={{
              border: "2px dashed var(--border)",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              background: "#f8fafc",
              cursor: "pointer",
            }}
          >
            <Camera size={28} style={{ color: "var(--muted)", margin: "0 auto 6px auto" }} />
            <strong style={{ fontSize: "13px", display: "block" }}>
              Attach Worksite Proof Photograph
            </strong>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              ppr_manifold_joint_pressure_test.jpg (Simulated attachment ready)
            </span>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
          >
            Simulate Timeout
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={saving}
          >
            {saving ? "Broadcasting..." : "Publish Progress Update →"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ==========================================================================
   S30: Customer Review & Completion Sign-off Screen (Customer View)
   ========================================================================== */

export function CustomerSignoffScreen({
  job = defaultActiveJobs[0],
}: {
  job?: ActiveJob;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState(
    "Excellent work by Osaze. Fixed the high pressure pipe burst swiftly without damaging the surrounding floor tiles.",
  );
  const [signingOff, setSigningOff] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSignoff = async (e: React.FormEvent, simulateFail = false) => {
    e.preventDefault();
    setSigningOff(true);
    setStatusMessage(null);

    const res = await lifecycleDemoService.submitCompletionSignoff(
      job.id,
      rating,
      feedback,
      simulateFail,
    );
    setSigningOff(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
      router.push(`/jobs/${job.id}/balance`);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="lc-page" data-testid="customer-signoff-screen">
      <div className="lc-breadcrumbs">
        <Link href="/jobs">My Jobs</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/jobs/${job.id}/progress`}>Job #{job.id}</Link>
        <span aria-hidden="true">/</span>
        <strong>Completion Sign-off (S30)</strong>
      </div>

      <header>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            margin: 0,
            color: "var(--text-dark, #0e294b)",
          }}
        >
          Customer Review & Completion Sign-off
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Authorize final escrow milestone balance release to {job.artisanName} for Job #{job.id}.
        </p>
      </header>

      {statusMessage && (
        <div
          className={`lc-alert ${
            statusMessage.type === "success" ? "lc-alert-success" : "lc-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <form onSubmit={(e) => handleSignoff(e, false)} style={{ display: "grid", gap: "20px" }}>
        <section className="lc-card">
          <h2 className="lc-card-title">Rate Artisan Work Quality</h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "28px",
                  color: star <= rating ? "#f59e0b" : "#cbd5e1",
                  padding: "4px",
                }}
                aria-label={`Rate ${star} star`}
              >
                ★
              </button>
            ))}
            <span style={{ fontWeight: 700, marginLeft: "8px", fontSize: "14px" }}>
              {rating} of 5 Stars
            </span>
          </div>

          <div className="rq-field-group">
            <label htmlFor="signoff-feedback">Customer Testimonial & Review Note</label>
            <textarea
              id="signoff-feedback"
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={(e) => handleSignoff(e, true)}
            disabled={signingOff}
          >
            Simulate Server Decline
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={signingOff}
          >
            {signingOff ? "Signing off..." : "Authorize Escrow Release & Review →"}
          </button>
        </div>
      </form>
    </div>
  );
}
