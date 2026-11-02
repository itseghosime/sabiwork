"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  PhoneCall,
  SlidersHorizontal,
} from "lucide-react";
import {
  type PaymentReceiptData,
  type PaymentVerificationState,
  defaultReceipt,
  paymentsDemoService,
} from "./service";
import "./payments.css";

/* ==========================================================================
   S22: Payment Verification & Status Check Screen
   ========================================================================== */

export function PaymentVerificationScreen({
  initialReceipt = defaultReceipt,
}: {
  initialReceipt?: PaymentReceiptData;
}) {
  const [receipt] = useState<PaymentReceiptData>(initialReceipt);
  const [verifyState, setVerifyState] = useState<PaymentVerificationState>("PENDING_WEBHOOK");

  return (
    <div className="py-page" data-testid="payment-verification-screen">
      <div className="py-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href="/payments">Payment History</Link>
        <span aria-hidden="true">/</span>
        <strong>Payment Status Verification (S22)</strong>
      </div>

      {/* Simulator Bar */}
      <div className="py-simulator-bar">
        <span className="py-simulator-label">
          <SlidersHorizontal size={16} /> Demo status controls (no Paystack request):
        </span>
        <div className="py-simulator-buttons">
          {(["VERIFIED", "PENDING_WEBHOOK", "FAILED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`py-sim-btn ${verifyState === st ? "active" : ""}`}
              onClick={() => setVerifyState(st)}
            >
              {st}
            </button>
          ))}
        </div>
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
          Payment status preview (S22)
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Reference #{receipt.paymentRef} · Paystack TEST Transaction #{receipt.paystackTestRef}
        </p>
      </header>

      {verifyState === "VERIFIED" && (
        <div className="py-alert py-alert-success" role="status">
          <CheckCircle2 size={24} />
          <div>
            <strong>Demo verified state only</strong>
            <p>
              The preview marks ₦{(receipt.amountKobo / 100).toLocaleString()} as verified for this screen only. No gateway request was made, no funds moved, and no artisan was notified.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <Link
                href={`/payments/${receipt.paymentRef}/receipt`}
                className="button button-primary"
              >
                View demo receipt (S23) →
              </Link>
              <Link href="/jobs" className="button button-outline">
                Back to My Jobs
              </Link>
            </div>
          </div>
        </div>
      )}

      {verifyState === "PENDING_WEBHOOK" && (
        <div className="py-alert py-alert-warning" role="status">
          <Clock size={24} />
          <div>
            <strong>Demo pending state</strong>
            <p>
              This preview does not contact Paystack or receive a webhook. Payment verification integration is pending.
            </p>
            <button
              type="button"
              className="button button-outline"
              style={{ marginTop: "12px" }}
              onClick={() => setVerifyState("VERIFIED")}
            >
              Show verified demo state
            </button>
          </div>
        </div>
      )}

      {verifyState === "FAILED" && (
        <div className="py-alert py-alert-error" role="alert">
          <AlertCircle size={24} />
          <div>
            <strong>Demo failed state</strong>
            <p>
              This is a simulated failure state. No transaction was sent to a provider.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <Link
                href={`/payments/${receipt.paymentRef}/recover`}
                className="button button-primary"
              >
                Switch Payment Channel (S24) →
              </Link>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setVerifyState("VERIFIED")}
              >
                Show verified demo state
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Card */}
      <section className="py-card">
        <h2 className="py-card-title">Transaction Details</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            fontSize: "13.5px",
          }}
        >
          <div>
            <span style={{ color: "var(--muted)", display: "block" }}>Job ID / Summary:</span>
            <strong>{receipt.jobId}</strong> · {receipt.jobTitle}
          </div>
          <div>
            <span style={{ color: "var(--muted)", display: "block" }}>Artisan:</span>
            <strong>{receipt.artisanName}</strong>
          </div>
          <div>
            <span style={{ color: "var(--muted)", display: "block" }}>Milestone:</span>
            <strong>Milestone {receipt.milestoneNumber}</strong> ({receipt.milestoneTitle})
          </div>
          <div>
            <span style={{ color: "var(--muted)", display: "block" }}>Amount Paid:</span>
            <strong style={{ color: "var(--primary)", fontSize: "16px" }}>
              ₦{(receipt.amountKobo / 100).toLocaleString()}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ==========================================================================
   S23: Payment Receipt Screen
   ========================================================================== */

export function PaymentReceiptScreen({
  receipt = defaultReceipt,
}: {
  receipt?: PaymentReceiptData;
}) {
  return (
    <div className="py-page" data-testid="payment-receipt-screen">
      <div className="py-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href="/payments">Payment History</Link>
        <span aria-hidden="true">/</span>
        <strong>Demo receipt (S23)</strong>
      </div>

      <div role="note" className="py-alert py-alert-warning">
        Demo receipt for interface preview only. No payment was verified and no funds are held or released.
      </div>

      <div className="py-receipt-paper">
        <header className="py-receipt-header">
          <div>
            <h1 className="py-receipt-title">SabiWork Demo Payment Receipt</h1>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Clear Trade Modern · Demo preview only
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                background: "#e8f5ed",
                color: "#075e46",
                fontWeight: 700,
                fontSize: "12px",
                borderRadius: "999px",
              }}
            >
              Demo only · no escrow
            </span>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              {receipt.dateWat}
            </div>
          </div>
        </header>

        <div style={{ display: "grid", gap: "6px" }}>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Receipt / Payment Ref:</span>
            <span className="py-receipt-value">{receipt.paymentRef}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Paystack TEST Token:</span>
            <span className="py-receipt-value">{receipt.paystackTestRef}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Customer Account:</span>
            <span className="py-receipt-value">{receipt.customerName}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Artisan (sample data):</span>
            <span className="py-receipt-value">{receipt.artisanName}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Job Assignment:</span>
            <span className="py-receipt-value">#{receipt.jobId} · {receipt.jobTitle}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Milestone Specification:</span>
            <span className="py-receipt-value">
              Milestone {receipt.milestoneNumber} ({receipt.milestoneTitle})
            </span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Payment Channel:</span>
            <span className="py-receipt-value">{receipt.channel}</span>
          </div>
        </div>

        <div className="py-receipt-amount-box">
          <div>
            <span style={{ fontSize: "12px", color: "#166534", textTransform: "uppercase", fontWeight: 700 }}>
              Milestone 1 Deposit Amount
            </span>
            <div style={{ fontSize: "11px", color: "#166534" }}>
              Total Job Value: ₦{(receipt.totalContractKobo / 100).toLocaleString()} (50% remaining on signoff)
            </div>
          </div>
          <div className="py-receipt-big-amount">
            ₦{(receipt.amountKobo / 100).toLocaleString()}
          </div>
        </div>

        <footer
          style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            SabiWork Technologies · Benin City Operations Hub
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="button button-outline"
              onClick={() => window.print()}
            >
              Print Receipt
            </button>
            <Link href="/jobs" className="button button-primary">
              Return to Workspace
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ==========================================================================
   S24: Payment Recovery & Alternate Method Screen
   ========================================================================== */

export function PaymentRecoveryScreen({
  receipt = defaultReceipt,
}: {
  receipt?: PaymentReceiptData;
}) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<"bank_transfer" | "ussd" | "card">(
    "bank_transfer",
  );
  const [recovering, setRecovering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleRetry = async (simulateFail = false) => {
    setRecovering(true);
    setStatusMessage(null);

    const res = await paymentsDemoService.processAlternatePayment(
      selectedMethod,
      receipt.amountKobo,
      simulateFail,
    );
    setRecovering(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
      router.push(`/payments/${receipt.paymentRef}/receipt`);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="py-page" data-testid="payment-recovery-screen">
      <div className="py-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href="/payments">Payment History</Link>
        <span aria-hidden="true">/</span>
        <strong>Payment Recovery (S24)</strong>
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
          Alternate Payment Method
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Resolve failed transaction for Job #{receipt.jobId} (₦{(receipt.amountKobo / 100).toLocaleString()})
        </p>
      </header>

      {statusMessage && (
        <div
          className={`py-alert ${
            statusMessage.type === "success" ? "py-alert-success" : "py-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <div className="py-methods-grid">
        <button
          type="button"
          className={`py-method-card ${selectedMethod === "bank_transfer" ? "selected" : ""}`}
          onClick={() => setSelectedMethod("bank_transfer")}
        >
          <Building2 size={24} style={{ color: "#075e46" }} />
          <div>
            <strong>Paystack Virtual Bank Transfer</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>
              Instant transfer to temporary dedicated bank account.
            </p>
          </div>
        </button>

        <button
          type="button"
          className={`py-method-card ${selectedMethod === "card" ? "selected" : ""}`}
          onClick={() => setSelectedMethod("card")}
        >
          <CreditCard size={24} style={{ color: "#075e46" }} />
          <div>
            <strong>Retry with Alternate Debit Card</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>
              Visa, Mastercard, or Verve cards in Paystack TEST Mode.
            </p>
          </div>
        </button>

        <button
          type="button"
          className={`py-method-card ${selectedMethod === "ussd" ? "selected" : ""}`}
          onClick={() => setSelectedMethod("ussd")}
        >
          <PhoneCall size={24} style={{ color: "#075e46" }} />
          <div>
            <strong>USSD Bank Code</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>
              GTBank (*737#), Zenith (*966#), Access (*901#).
            </p>
          </div>
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <button
          type="button"
          className="button button-outline"
          onClick={() => handleRetry(true)}
          disabled={recovering}
        >
          Simulate Alternative Gateway Timeout
        </button>

        <button
          type="button"
          className="button button-primary"
          onClick={() => handleRetry(false)}
          disabled={recovering}
        >
          {recovering ? "Authorizing..." : `Pay ₦${(receipt.amountKobo / 100).toLocaleString()} via ${selectedMethod}`}
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   S25: Milestone Balance Checkout Screen
   ========================================================================== */

export function MilestoneBalanceCheckoutScreen({
  receipt = defaultReceipt,
}: {
  receipt?: PaymentReceiptData;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const balanceKobo = receipt.totalContractKobo - receipt.amountKobo;
  const balanceFormatted = `₦${(balanceKobo / 100).toLocaleString()}`;

  const handlePayBalance = async (simulateFail = false) => {
    setSubmitting(true);
    setStatusMessage(null);

    const res = await paymentsDemoService.processBalanceCheckout(
      receipt.jobId,
      balanceKobo,
      simulateFail,
    );
    setSubmitting(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
      router.push(`/jobs/${receipt.jobId}/review`);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="py-page" data-testid="balance-checkout-screen">
      <div className="py-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/jobs/${receipt.jobId}`}>Job #{receipt.jobId}</Link>
        <span aria-hidden="true">/</span>
        <strong>Milestone 2 Balance Checkout (S25)</strong>
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
          Fund Milestone 2 Completion Balance
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Final payment of {balanceFormatted} for #{receipt.jobId} completed by {receipt.artisanName}
        </p>
      </header>

      {statusMessage && (
        <div
          className={`py-alert ${
            statusMessage.type === "success" ? "py-alert-success" : "py-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <section className="py-card">
        <h2 className="py-card-title">Completion Sign-off & Release Authorization</h2>
        <p style={{ margin: 0, color: "#334155", lineHeight: 1.5 }}>
          By funding this final milestone balance, you confirm that you have physically inspected
          the repair works completed by {receipt.artisanName} and authorize full escrow release to
          the artisan.
        </p>
        <div
          style={{
            background: "#f0fdf4",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #bbf7d0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", color: "#166534", fontWeight: 700 }}>
              Milestone 2 Balance (50%)
            </span>
            <div style={{ fontSize: "11px", color: "#166534" }}>
              Milestone 1 Deposit (₦{(receipt.amountKobo / 100).toLocaleString()}) already fulfilled.
            </div>
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--primary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {balanceFormatted}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={() => handlePayBalance(true)}
            disabled={submitting}
          >
            Simulate Provider Decline
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => handlePayBalance(false)}
            disabled={submitting}
          >
            {submitting ? "Processing..." : `Approve & Pay ${balanceFormatted} via TEST Mode`}
          </button>
        </div>
      </section>
    </div>
  );
}
