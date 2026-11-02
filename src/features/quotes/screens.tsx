"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  type OpenRequest,
  type QuoteItem,
  defaultOpenRequests,
  defaultDetailedQuotes,
  quotesDemoService,
} from "./service";
import "./quotes.css";

/* ==========================================================================
   S17: Open Requests Feed & Details Screen (Artisan Workspace)
   ========================================================================== */

export function OpenRequestsFeedScreen({
  initialRequests = defaultOpenRequests,
}: {
  initialRequests?: readonly OpenRequest[];
}) {
  const [requests] = useState<readonly OpenRequest[]>(initialRequests);
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  const filtered =
    selectedDistrict === "all"
      ? requests
      : requests.filter((r) => r.district.toLowerCase().includes(selectedDistrict));

  return (
    <div className="qt-page" data-testid="open-requests-feed-screen">
      <div className="qt-breadcrumbs">
        <Link href="/artisan">Artisan Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Open Requests Feed (S17)</strong>
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
            Open Customer Requests in Benin City
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Direct broadcast jobs waiting for verified artisan milestone quotes.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label htmlFor="filter-district" style={{ fontSize: "13px", fontWeight: 600 }}>
            Filter District:
          </label>
          <select
            id="filter-district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              fontSize: "13px",
            }}
          >
            <option value="all">All Districts (Edo State)</option>
            <option value="gra">GRA / Boundary Rd</option>
            <option value="airport">Airport Road</option>
            <option value="ugbowo">Ugbowo Axis</option>
          </select>
        </div>
      </header>

      <div style={{ display: "grid", gap: "16px" }}>
        {filtered.map((req) => (
          <article key={req.id} className="qt-card">
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      background: "#e8f5ed",
                      color: "#075e46",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    {req.category}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>• {req.postedTime}</span>
                </div>
                <h2 style={{ margin: "4px 0", fontSize: "18px", color: "var(--text-dark, #0e294b)" }}>
                  {req.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--muted)" }}>
                  <MapPin size={14} /> {req.address}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>
                  Budget Guidance
                </span>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--primary)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  ₦{(req.budgetGuidanceKobo / 100).toLocaleString()}
                </div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {req.quotesCount} quote{req.quotesCount === 1 ? "" : "s"} submitted
                </span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: "13.5px", color: "#334155", lineHeight: 1.5 }}>
              {req.description}
            </p>

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
                href={`/artisan/requests/${req.id}/quote`}
                className="button button-primary"
                style={{ minHeight: "38px", fontSize: "13px" }}
              >
                Send Itemized Quote (S18) →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   S18: Send Itemized Quote Screen (Artisan Workspace)
   ========================================================================== */

export function SendItemizedQuoteScreen({
  request = defaultOpenRequests[0],
}: {
  request?: OpenRequest;
}) {
  const router = useRouter();
  const [totalQuoteNaira, setTotalQuoteNaira] = useState("22000");
  const [estimatedHours, setEstimatedHours] = useState("4 - 6 hours");
  const [materialsIncluded, setMaterialsIncluded] = useState(true);
  const [notes, setNotes] = useState(
    "Includes digital acoustic leak detection, PPR fusion sleeve installation, and replacement of pressure check valves.",
  );

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const totalKobo = Math.round(Number(totalQuoteNaira || "0") * 100);
  const depositKobo = Math.round(totalKobo / 2);
  const balanceKobo = totalKobo - depositKobo;

  const handleSubmit = async (e: React.FormEvent, simulateFail = false) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await quotesDemoService.submitItemizedQuote(
      {
        requestId: request.id,
        totalQuoteKobo: totalKobo,
        depositKobo,
        balanceKobo,
        estimatedHours,
        materialsIncluded,
        notes,
      },
      simulateFail,
    );

    setSaving(false);
    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
      router.push(`/requests/${request.id}/compare`);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="qt-page" data-testid="send-itemized-quote-screen">
      <div className="qt-breadcrumbs">
        <Link href="/artisan">Artisan Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href="/artisan/requests">Open Requests</Link>
        <span aria-hidden="true">/</span>
        <strong>Send Itemized Quote (S18)</strong>
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
          Send Itemized Quote
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Responding to #{request.id}: {request.title}
        </p>
      </header>

      {statusMessage && (
        <div
          className={`qt-alert ${
            statusMessage.type === "success" ? "qt-alert-success" : "qt-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} style={{ display: "grid", gap: "20px" }}>
        {/* Quote Pricing Card */}
        <section className="qt-card">
          <h2 className="qt-card-title">1. Total Labor & Material Pricing</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="qt-field-group">
              <label htmlFor="quote-total">Total Quote Amount (₦ NGN)</label>
              <input
                id="quote-total"
                type="number"
                step="500"
                min="5000"
                required
                value={totalQuoteNaira}
                onChange={(e) => setTotalQuoteNaira(e.target.value)}
              />
            </div>

            <div className="qt-field-group">
              <label htmlFor="quote-duration">Estimated Job Duration</label>
              <input
                id="quote-duration"
                type="text"
                required
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                Milestone 1 (50% Deposit upon start):
              </span>
              <strong style={{ fontSize: "16px", color: "var(--primary)" }}>
                ₦{(depositKobo / 100).toLocaleString()}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                Milestone 2 (50% Balance on completion):
              </span>
              <strong style={{ fontSize: "16px", color: "var(--text-dark, #0e294b)" }}>
                ₦{(balanceKobo / 100).toLocaleString()}
              </strong>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={materialsIncluded}
              onChange={(e) => setMaterialsIncluded(e.target.checked)}
            />
            <span style={{ fontSize: "13.5px" }}>
              Materials and replacement fittings included in total quote.
            </span>
          </label>
        </section>

        {/* Technical notes */}
        <section className="qt-card">
          <h2 className="qt-card-title">2. Scope & Execution Plan</h2>
          <div className="qt-field-group">
            <label htmlFor="quote-notes">Work Methodology & Guarantees</label>
            <textarea
              id="quote-notes"
              rows={4}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
            {saving ? "Submitting Quote..." : "Submit Binding Quote →"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ==========================================================================
   S19: Quote Comparison Screen (Customer View)
   ========================================================================== */

export function QuoteComparisonScreen({
  request = defaultOpenRequests[0],
  quotes = defaultDetailedQuotes,
}: {
  request?: OpenRequest;
  quotes?: readonly QuoteItem[];
}) {
  return (
    <div className="qt-page" data-testid="quote-comparison-screen">
      <div className="qt-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/jobs/${request.id}`}>Job #{request.id}</Link>
        <span aria-hidden="true">/</span>
        <strong>Quote Comparison Matrix (S19)</strong>
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
          Compare Artisan Quotes
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Review competing offers side-by-side for Job #{request.id}. All deposits are protected
          under SabiWork SafeTrade.
        </p>
      </header>

      <div className="qt-comparison-table-wrapper">
        <table className="qt-table">
          <thead>
            <tr>
              <th>Artisan Details</th>
              <th>Rating & Jobs</th>
              <th>Total Quote</th>
              <th>Deposit (Milestone 1)</th>
              <th>Duration</th>
              <th>Materials</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id}>
                <td>
                  <strong>{q.artisanName}</strong>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{q.artisanHeadline}</div>
                </td>
                <td>
                  <span style={{ color: "#b45309", fontWeight: 700 }}>★ {q.artisanRating}</span>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>({q.artisanReviewCount} reviews)</div>
                </td>
                <td>
                  <strong style={{ color: "var(--primary)", fontSize: "15px" }}>
                    ₦{(q.totalQuoteKobo / 100).toLocaleString()}
                  </strong>
                </td>
                <td>₦{(q.depositKobo / 100).toLocaleString()}</td>
                <td>{q.estimatedHours}</td>
                <td>{q.materialsIncluded ? "✓ Included" : "Client Supplies"}</td>
                <td>
                  <Link
                    href={`/requests/${request.id}/quotes/${q.id}`}
                    className="button button-primary"
                    style={{ minHeight: "36px", padding: "6px 12px", fontSize: "12.5px" }}
                  >
                    View Details (S20) →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   S20: Quote Details & Acceptance Screen (Customer View)
   ========================================================================== */

export function QuoteDetailsAcceptanceScreen({
  quote = defaultDetailedQuotes[0],
}: {
  quote?: QuoteItem;
}) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAccept = async (simulateFail = false) => {
    setAccepting(true);
    setStatusMessage(null);

    const res = await quotesDemoService.acceptQuoteAndLockMilestone(quote.id, simulateFail);
    setAccepting(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
      router.push(`/requests/${quote.requestId}/checkout/${quote.id}`);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="qt-page" data-testid="quote-details-screen">
      <div className="qt-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/requests/${quote.requestId}/compare`}>Quotes</Link>
        <span aria-hidden="true">/</span>
        <strong>Quote Acceptance (S20)</strong>
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
            Quote from {quote.artisanName}
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Quote #{quote.id} for Job #{quote.requestId}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={() => handleAccept(true)}
            disabled={accepting}
          >
            Simulate Lock Error
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => handleAccept(false)}
            disabled={accepting}
          >
            {accepting ? "Locking Quote..." : "Accept Quote & Proceed to Escrow (S21) →"}
          </button>
        </div>
      </header>

      {statusMessage && (
        <div
          className={`qt-alert ${
            statusMessage.type === "success" ? "qt-alert-success" : "qt-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      {/* Two-Milestone Escrow Ledger */}
      <section className="qt-card">
        <h2 className="qt-card-title">Milestone Payment Breakdown (Paystack TEST Mode)</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              border: "2px solid var(--primary)",
              borderRadius: "8px",
              padding: "18px",
              background: "#f0fdf4",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#075e46",
                letterSpacing: "0.04em",
              }}
            >
              Milestone 1 · Mobilization Deposit (50%)
            </span>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--primary)",
                margin: "4px 0",
              }}
            >
              ₦{(quote.depositKobo / 100).toLocaleString()}
            </div>
            <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
              {quote.milestone1Title}
            </p>
            <span style={{ fontSize: "11.5px", color: "var(--muted)", display: "block", marginTop: "8px" }}>
              Deposited into escrow upon acceptance. Held securely until artisan arrives and starts.
            </span>
          </div>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "18px",
              background: "#f8fafc",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#64748b",
                letterSpacing: "0.04em",
              }}
            >
              Milestone 2 · Completion Balance (50%)
            </span>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text-dark, #0e294b)",
                margin: "4px 0",
              }}
            >
              ₦{(quote.balanceKobo / 100).toLocaleString()}
            </div>
            <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
              {quote.milestone2Title}
            </p>
            <span style={{ fontSize: "11.5px", color: "var(--muted)", display: "block", marginTop: "8px" }}>
              Released only after you inspect and sign off on completed work.
            </span>
          </div>
        </div>
      </section>

      {/* Scope Details */}
      <section className="qt-card">
        <h2 className="qt-card-title">Artisan Guarantee & Methodology</h2>
        <p style={{ lineHeight: 1.6, color: "#334155", margin: 0 }}>{quote.notes}</p>
      </section>
    </div>
  );
}

/* ==========================================================================
   S21: Milestone Deposit Checkout Screen (Customer View)
   ========================================================================== */

export function MilestoneDepositCheckoutScreen({
  quote = defaultDetailedQuotes[0],
}: {
  quote?: QuoteItem;
}) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const depositFormatted = `₦${(quote.depositKobo / 100).toLocaleString()}`;

  const handleDeposit = async (simulateFail = false) => {
    setProcessing(true);
    setStatusMessage(null);

    const res = await quotesDemoService.processMilestoneCheckout(
      quote.id,
      quote.depositKobo,
      simulateFail,
    );
    setProcessing(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
      router.push("/jobs");
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="qt-page" data-testid="milestone-checkout-screen">
      <div className="qt-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/requests/${quote.requestId}/compare`}>Quotes</Link>
        <span aria-hidden="true">/</span>
        <strong>Milestone Deposit Checkout (S21)</strong>
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
          Fund Milestone 1 Escrow Deposit
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Paystack TEST Mode · Escrow deposit of {depositFormatted} for Job #{quote.requestId}
        </p>
      </header>

      {statusMessage && (
        <div
          className={`qt-alert ${
            statusMessage.type === "success" ? "qt-alert-success" : "qt-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <div className="qt-checkout-grid">
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Payment Method Card */}
          <section className="qt-card">
            <h2 className="qt-card-title">Select Payment Channel</h2>
            <div className="qt-payment-method-card">
              <CreditCard size={28} style={{ color: "#075e46" }} />
              <div>
                <strong>Paystack TEST Mode Card / Bank Transfer</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>
                  Zero live bank charges. Test tokens automatically verified.
                </p>
              </div>
            </div>
          </section>

          {/* Escrow Terms Banner */}
          <div className="qt-alert qt-alert-info">
            <ShieldCheck size={24} />
            <div>
              <strong>Funds Held in Neutral SabiWork Escrow</strong>
              <p>
                The artisan does not receive these funds directly until work milestone 1 has been
                validated. You can raise a dispute at any point under SabiWork SafeTrade.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <aside className="qt-order-summary">
          <h2 style={{ margin: 0, fontSize: "16px", color: "var(--text-dark, #0e294b)" }}>
            Order Summary
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
            <span>Artisan:</span>
            <strong>{quote.artisanName}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
            <span>Total Contract Value:</span>
            <span>₦{(quote.totalQuoteKobo / 100).toLocaleString()}</span>
          </div>
          <div
            style={{
              borderTop: "1px solid #e2e8f0",
              paddingTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700 }}>Due Today (50% Deposit):</span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {depositFormatted}
            </span>
          </div>

          <button
            type="button"
            className="button button-outline"
            onClick={() => handleDeposit(true)}
            disabled={processing}
          >
            Simulate Card Decline
          </button>

          <button
            type="button"
            className="button button-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => handleDeposit(false)}
            disabled={processing}
          >
            {processing ? "Authorizing Paystack..." : `Pay ${depositFormatted} via TEST Mode`}
          </button>
        </aside>
      </div>
    </div>
  );
}
