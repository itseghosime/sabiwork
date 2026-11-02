"use client";

import Link from "next/link";
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
      setError(
        e instanceof Error ? e.message : "Could not verify this payment.",
      );
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
  return (
    <section className="hire-page">
      <h1>
        {payment?.status === "confirmed"
          ? "Test payment receipt"
          : "Payment status"}
      </h1>
      <p>Only server-verified Paystack test transactions count as paid.</p>
      {error ? <p role="alert">{error}</p> : null}
      {payment ? (
        <article className="hire-card">
          <p role="status">{payment.status}</p>
          <p>
            {formatMoney(payment.amount_kobo)} · {payment.milestone}
          </p>
          <p>Reference: {payment.reference}</p>
          {payment.paid_at ? <p>Paid {formatWat(payment.paid_at)}</p> : null}
          {payment.failure_reason ? <p>{payment.failure_reason}</p> : null}
          <Link
            className="button button-primary"
            href={`/jobs/${payment.job_id}`}
          >
            View booking
          </Link>
          {payment.status === "failed" || payment.status === "cancelled" ? (
            <Link
              className="button button-subtle"
              href={`/jobs/${payment.job_id}/payments/${payment.milestone}`}
            >
              Retry checkout
            </Link>
          ) : null}
        </article>
      ) : !error ? (
        <p>Loading payment…</p>
      ) : null}
      {payment?.status !== "confirmed" ? (
        <button
          className="button button-subtle"
          disabled={busy}
          onClick={() => void check()}
        >
          {busy ? "Checking…" : "Check payment status"}
        </button>
      ) : null}
      <Link className="button button-subtle" href="/payments">
        Payment history
      </Link>
    </section>
  );
}
