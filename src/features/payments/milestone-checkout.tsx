"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import "./milestone-checkout.css";
import { useEffect, useState } from "react";
import {
  readJson,
  formatMoney,
  formatWat,
} from "@/features/customer-workspace/service";

interface PaymentRecord {
  id: string;
  job_id: string;
  reference: string;
  milestone: "deposit" | "balance";
  amount_kobo: number;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  paid_at: string | null;
  failure_reason?: string | null;
}

export function MilestoneCheckout({
  jobId,
  milestone,
}: {
  jobId: string;
  milestone: "deposit" | "balance";
}) {
  const [job, setJob] = useState<{
    title: string;
    total_quote_kobo: number;
    signed_off_at: string | null;
    payments: PaymentRecord[];
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void readJson<typeof job>(`/api/jobs/${jobId}`)
      .then((data) => {
        if (active) setJob(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [jobId]);
  const amount = job
    ? milestone === "deposit"
      ? Math.floor(job.total_quote_kobo / 2)
      : job.total_quote_kobo - Math.floor(job.total_quote_kobo / 2)
    : 0;
  const paid = job?.payments.find(
    (p) => p.milestone === milestone && p.status === "confirmed",
  );
  async function start() {
    setBusy(true);
    setError("");
    try {
      const checkout = await readJson<{ authorizationUrl: string }>(
        "/api/payments/deposit/initialize",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, milestone }),
        },
      );
      window.location.assign(checkout.authorizationUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open checkout.");
      setBusy(false);
    }
  }
  return (
    <section className="hire-page">
      <h1>
        {milestone === "deposit" ? "Booking deposit" : "Completion balance"}
      </h1>
      <p>Paystack test mode only. No real funds or escrow guarantee.</p>
      {error ? <p role="alert">{error}</p> : null}
      {job ? (
        <article className="hire-card">
          <h2>{job.title}</h2>
          <p>{formatMoney(amount)} · 50% of the agreed quote</p>
          {paid ? (
            <>
              <p>Confirmed by Paystack.</p>
              <Link
                className="button button-primary"
                href={`/payments/${paid.reference}/receipt`}
              >
                View receipt
              </Link>
            </>
          ) : milestone === "balance" && !job.signed_off_at ? (
            <>
              <p>Sign off the completed work before paying the balance.</p>
              <Link
                className="button button-primary"
                href={`/jobs/${jobId}/signoff`}
              >
                Inspect &amp; sign off
              </Link>
            </>
          ) : (
            <button
              className="button button-primary"
              disabled={busy}
              onClick={() => void start()}
            >
              {busy
                ? "Opening checkout…"
                : `Pay ${formatMoney(amount)} in test mode`}
            </button>
          )}
        </article>
      ) : !error ? (
        <p>Loading booking…</p>
      ) : null}
      <Link className="button button-subtle" href={`/jobs/${jobId}`}>
        Back to booking
      </Link>
    </section>
  );
}

export function MilestoneReceipt({
  reference,
  verify = false,
}: {
  reference: string;
  verify?: boolean;
}) {
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function check() {
    setBusy(true);
    setError("");
    try {
      setPayment(
        await readJson<PaymentRecord>("/api/payments/deposit/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not verify this payment.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    const load = verify
      ? readJson<PaymentRecord>("/api/payments/deposit/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        })
      : readJson<PaymentRecord[]>("/api/payments").then((rows) => {
          const row = rows.find((p) => p.reference === reference);
          if (!row) throw new Error("Payment not found.");
          return row;
        });
    void load
      .then((row) => {
        if (active) setPayment(row);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [reference, verify]);

  const isConfirmed = payment?.status === "confirmed";
  const isFailed = payment?.status === "failed" || payment?.status === "cancelled";
  const statusLabel = isConfirmed
    ? "Payment confirmed"
    : payment?.status === "pending"
      ? "Confirmation pending"
      : payment?.status === "cancelled"
        ? "Payment cancelled"
        : "Payment not confirmed";
  const heading = isConfirmed
    ? "Your payment is confirmed"
    : payment?.status === "pending"
      ? "We’re checking your payment"
      : payment
        ? "This payment wasn’t confirmed"
        : "Payment details";

  return (
    <section className="pay-receipt-page" aria-labelledby="payment-receipt-title">
      <nav className="pay-receipt-crumbs" aria-label="Breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span aria-hidden="true">›</span>
        <Link href="/payments">Payments</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{verify ? "Verification" : "Payment details"}</span>
      </nav>

      {error ? (
        <div className="pay-receipt-error" role="alert">
          <strong>We couldn’t load this payment</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {payment ? (
        <div className="pay-receipt-layout">
          <article className="pay-receipt-card">
            <div className="pay-receipt-topline">
              <div className="pay-receipt-brand">
                <span className="pay-receipt-mark" aria-hidden="true">
                  <Icon name="receipt" size={21} />
                </span>
                <span>
                  SabiWork
                  <small>Payment receipt</small>
                </span>
              </div>
              <span className="pay-receipt-test">Paystack TEST</span>
            </div>

            <div className="pay-receipt-hero">
              <span className={`pay-receipt-icon ${isConfirmed ? "confirmed" : payment.status === "pending" ? "pending" : payment.status}`} aria-hidden="true">
                <Icon
                  name={isConfirmed ? "checkCircle" : payment.status === "pending" ? "clock" : "alertCircle"}
                  size={27}
                />
              </span>
              <div>
                <p className="pay-receipt-eyebrow">
                  {isConfirmed ? "Payment received" : payment.status === "pending" ? "Payment status" : "Payment incomplete"}
                </p>
                <h1 id="payment-receipt-title">
                  {isConfirmed ? "Test payment receipt" : heading}
                </h1>
                <p className="pay-receipt-description">
                  {isConfirmed
                    ? "Only server-verified Paystack test transactions count as paid. This payment is recorded in test mode; no real money was charged."
                    : payment.status === "pending"
                      ? "We haven’t received server confirmation yet. Please don’t pay again while we check this transaction."
                      : "Paystack did not confirm this payment, so it has not been marked as paid. You can review the booking before retrying."}
                </p>
              </div>
            </div>

            <div className="pay-receipt-amount">
              <div className="pay-receipt-amount-copy">
                <span className="pay-receipt-label">{isConfirmed ? "Amount paid" : "Amount"}</span>
                <strong>{formatMoney(payment.amount_kobo)}</strong>
              </div>
              <span className="pay-receipt-milestone">
                {payment.milestone === "deposit" ? "Deposit" : "Final balance"}
              </span>
            </div>

            <dl className="pay-receipt-details">
              <div>
                <dt>Payment status</dt>
                <dd>
                  <span className={`pay-receipt-status ${payment.status}`} role="status">
                    {isConfirmed ? <Icon name="checkCircle" size={15} /> : null}
                    {statusLabel}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Booking</dt>
                <dd>#{payment.job_id.slice(0, 8).toUpperCase()}</dd>
              </div>
              <div>
                <dt>Payment reference</dt>
                <dd className="pay-receipt-reference">{payment.reference}</dd>
              </div>
              <div>
                <dt>Paid on</dt>
                <dd>{payment.paid_at ? formatWat(payment.paid_at) : "Not recorded yet"}</dd>
              </div>
            </dl>

            {payment.failure_reason ? (
              <p className="pay-receipt-error" role="alert">{payment.failure_reason}</p>
            ) : null}

            <aside className="pay-receipt-notice">
              <span aria-hidden="true"><Icon name="alertCircle" size={17} /></span>
              <div>
                <strong>Test mode transaction</strong>
                <p>This is a demonstration payment. It does not move real funds, and SabiWork does not hold funds in escrow.</p>
              </div>
            </aside>

            <div className="pay-receipt-actions">
              {isConfirmed ? (
                <>
                  <Link className="button button-primary" href={`/jobs/${payment.job_id}`}>
                    View booking <span aria-hidden="true">→</span>
                  </Link>
                  <Link className="button button-subtle" href="/payments">Payment history</Link>
                  <button className="button button-subtle" type="button" onClick={() => window.print()}>
                    Print receipt
                  </button>
                </>
              ) : isFailed ? (
                <>
                  <Link className="button button-primary" href={`/jobs/${payment.job_id}/payments/${payment.milestone}`}>
                    Retry checkout <span aria-hidden="true">→</span>
                  </Link>
                  <Link className="button button-subtle" href={`/jobs/${payment.job_id}`}>View booking</Link>
                  <Link className="button button-subtle" href="/payments">Payment history</Link>
                </>
              ) : (
                <>
                  <button className="button button-primary" type="button" disabled={busy} onClick={() => void check()}>
                    {busy ? "Checking…" : "Check payment status"}
                  </button>
                  <Link className="button button-subtle" href={`/jobs/${payment.job_id}`}>View booking</Link>
                </>
              )}
            </div>
          </article>

          <aside className="pay-receipt-aside">
            <p className="pay-receipt-aside-label">What happens next</p>
            <h2>{isConfirmed ? "Your booking is ready to continue" : isFailed ? "Your booking is unchanged" : "You can safely leave this page"}</h2>
            <p>
              {isConfirmed
                ? "Your confirmed deposit is linked to this booking. Follow the artisan’s progress from the booking details. The remaining balance is due at the agreed final milestone."
                : isFailed
                  ? "No payment is recorded as confirmed. Review the booking before deciding whether to retry."
                  : "The payment will appear as confirmed only after the server verifies it. Check this page again later if needed."}
            </p>
          </aside>
        </div>
      ) : !error ? (
        <div className="pay-receipt-loading" role="status">Loading payment details…</div>
      ) : (
        <div className="pay-receipt-actions">
          <button className="button button-primary" type="button" disabled={busy} onClick={() => void check()}>
            {busy ? "Checking…" : "Check payment status"}
          </button>
          <Link className="button button-subtle" href="/payments">Payment history</Link>
        </div>
      )}
    </section>
  );
}
