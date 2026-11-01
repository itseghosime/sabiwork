"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { PrototypeNotice } from "@/components/prototype-notice";
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
  const [verifyState, setVerifyState] = useState<PaymentVerificationState>("SAMPLE_SUCCESS");

  return (
    <div className="py-page" data-testid="payment-verification-screen">
      <PrototypeNotice>
        Payment states are interactive samples only. No provider, webhook, transaction, escrow, or artisan notification is connected.
      </PrototypeNotice>
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
          <SlidersHorizontal size={16} /> Sample State:
        </span>
        <div className="py-simulator-buttons">
          {(["SAMPLE_SUCCESS", "SAMPLE_PENDING", "SAMPLE_FAILED"] as const).map((st) => (
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
          Payment Status Preview
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Sample reference {receipt.paymentRef} · No payment provider connected
        </p>
      </header>

      {verifyState === "SAMPLE_SUCCESS" && (
        <div className="py-alert py-alert-success" role="status">
          <CheckCircle2 size={24} />
          <div>
            <strong>Sample payment preview</strong>
            <p>
              ₦{(receipt.amountKobo / 100).toLocaleString()} is illustrative only. No money was paid,
              no escrow was created, and no artisan was notified.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <Link
                href={`/payments/${receipt.paymentRef}/receipt`}
                className="button button-primary"
              >
                View Sample Receipt (S23) →
              </Link>
              <Link href="/jobs" className="button button-outline">
                Back to My Jobs
              </Link>
            </div>
          </div>
        </div>
      )}

      {verifyState === "SAMPLE_PENDING" && (
        <div className="py-alert py-alert-warning" role="status">
          <Clock size={24} />
          <div>
            <strong>Sample pending state</strong>
            <p>
              This is a preview state only. No payment authorization or webhook exists.
            </p>
            <button
              type="button"
              className="button button-outline"
              style={{ marginTop: "12px" }}
              onClick={() => setVerifyState("SAMPLE_SUCCESS")}
            >
              Preview success state
            </button>
          </div>
        </div>
      )}

      {verifyState === "SAMPLE_FAILED" && (
        <div className="py-alert py-alert-error" role="alert">
          <AlertCircle size={24} />
          <div>
            <strong>Sample failure state</strong>
            <p>
              No transaction was attempted. You can preview another local payment state.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <Link
                href={`/payments/${receipt.paymentRef}/recover`}
                className="button button-primary"
              >
                View Payment Method Preview (S24) →
              </Link>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setVerifyState("SAMPLE_SUCCESS")}
              >
                Preview success
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
            <span style={{ color: "var(--muted)", display: "block" }}>Sample amount:</span>
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
      <PrototypeNotice>
        This sample receipt is not evidence of payment. No transaction, provider reference, escrow, or payout exists.
      </PrototypeNotice>
      <div className="py-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href="/payments">Payment History</Link>
        <span aria-hidden="true">/</span>
        <strong>Sample Receipt Preview (S23)</strong>
      </div>

      <div className="py-receipt-paper">
        <header className="py-receipt-header">
          <div>
            <h1 className="py-receipt-title">Sample Payment Receipt Preview</h1>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              No payment provider connected
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
              SAMPLE ONLY · NOT PAID
            </span>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              {receipt.dateWat}
            </div>
          </div>
        </header>

        <div style={{ display: "grid", gap: "6px" }}>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Sample reference:</span>
            <span className="py-receipt-value">{receipt.paymentRef}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Provider reference:</span>
            <span className="py-receipt-value">{receipt.paystackTestRef}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Sample customer:</span>
            <span className="py-receipt-value">{receipt.customerName}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Sample artisan:</span>
            <span className="py-receipt-value">{receipt.artisanName}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Sample request:</span>
            <span className="py-receipt-value">#{receipt.jobId} · {receipt.jobTitle}</span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Milestone Specification:</span>
            <span className="py-receipt-value">
              Milestone {receipt.milestoneNumber} ({receipt.milestoneTitle})
            </span>
          </div>
          <div className="py-receipt-row">
            <span className="py-receipt-label">Sample payment method:</span>
            <span className="py-receipt-value">{receipt.channel}</span>
          </div>
        </div>

        <div className="py-receipt-amount-box">
          <div>
            <span style={{ fontSize: "12px", color: "#166534", textTransform: "uppercase", fontWeight: 700 }}>
              Sample milestone amount
            </span>
            <div style={{ fontSize: "11px", color: "#166534" }}>
              Sample request value: ₦{(receipt.totalContractKobo / 100).toLocaleString()} (illustrative)
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
            SabiWork UI prototype · sample receipt only
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="button button-outline"
              onClick={() => window.print()}
            >
              Print Sample Preview
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
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="py-page" data-testid="payment-recovery-screen">
      <PrototypeNotice>
        Alternate methods are display samples only. No bank, card network, USSD service, or payment provider is contacted.
      </PrototypeNotice>
      <div className="py-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href="/payments">Payment History</Link>
        <span aria-hidden="true">/</span>
        <strong>        Payment Method Preview (S24)</strong>
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
          Alternate Payment Method Preview
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Preview methods for sample request {receipt.jobId} (₦{(receipt.amountKobo / 100).toLocaleString()})
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
            <strong>Sample bank transfer option</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>
              No bank account is created or contacted.
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
            <strong>Sample card option</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>
              Card payments are not connected in this prototype.
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
            <strong>Sample USSD option</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>
              No bank code or USSD service is contacted.
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
          Preview a sample error
        </button>

        <button
          type="button"
          className="button button-primary"
          onClick={() => handleRetry(false)}
          disabled={recovering}
        >
          {recovering ? "Preparing preview..." : `Preview ₦${(receipt.amountKobo / 100).toLocaleString()} via ${selectedMethod}`}
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
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="py-page" data-testid="balance-checkout-screen">
      <PrototypeNotice>
        This checkout is a sample interaction only. No payment, inspection, sign-off, escrow, or release occurs.
      </PrototypeNotice>
      <div className="py-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/jobs/${receipt.jobId}`}>Job #{receipt.jobId}</Link>
        <span aria-hidden="true">/</span>
        <strong>Sample Balance Checkout (S25)</strong>
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
          Preview Milestone 2 Balance Checkout
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Illustrative amount {balanceFormatted} for sample request {receipt.jobId}
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
        <h2 className="py-card-title">Sample Completion Preview</h2>
        <p style={{ margin: 0, color: "#334155", lineHeight: 1.5 }}>
          This button only previews a local result. It does not confirm work, record sign-off, process
          a payment, or release funds to an artisan.
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
              Sample Balance Amount
            </span>
            <div style={{ fontSize: "11px", color: "#166534" }}>
              Sample milestone amount: ₦{(receipt.amountKobo / 100).toLocaleString()} (not paid).
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
            Preview sample decline
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => handlePayBalance(false)}
            disabled={submitting}
          >
            {submitting ? "Preparing preview..." : `Preview ${balanceFormatted} checkout`}
          </button>
        </div>
      </section>
    </div>
  );
}
