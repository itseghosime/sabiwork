"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { PrototypeNotice } from "@/components/prototype-notice";
import {
  type CustomerSettings,
  type JobRequestDraft,
  type MatchingQuote,
  defaultSettings,
  defaultJobDraft,
  defaultQuotes,
  requestsDemoService,
} from "./service";
import "./requests.css";

function RequestsPrototypeNotice() {
  return (
    <PrototypeNotice>
      Customer settings, job requests, quotes, and matching results are fictional local previews. No backend account data is saved, no artisans are contacted, and no payment or escrow is connected.
    </PrototypeNotice>
  );
}

/* ==========================================================================
   S13: Customer Account Settings Screen
   ========================================================================== */

export function AccountSettingsScreen({
  initialSettings = defaultSettings,
}: {
  initialSettings?: CustomerSettings;
}) {
  const [settings, setSettings] = useState<CustomerSettings>(initialSettings);
  const [fullName, setFullName] = useState(settings.fullName);
  const [email] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [district, setDistrict] = useState(settings.primaryDistrict);
  const [smsNotifications, setSmsNotifications] = useState(settings.smsNotifications);
  const [emailReceipts, setEmailReceipts] = useState(settings.emailReceipts);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async (e: React.FormEvent, simulateFail = false) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await requestsDemoService.updateSettings(
      {
        fullName,
        phone,
        primaryDistrict: district,
        smsNotifications,
        emailReceipts,
      },
      simulateFail,
    );

    setSaving(false);
    if (res.ok && res.settings) {
      setSettings(res.settings);
      setStatusMessage({ type: "success", text: res.message });
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="rq-page" data-testid="account-settings-screen">
      <RequestsPrototypeNotice />
      <div className="rq-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Account Settings (S13)</strong>
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
            Account Settings
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Preview sample profile fields, service area, and notification preferences.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={(e) => handleSave(e, true)}
            disabled={saving}
          >
            Simulate Timeout
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={(e) => handleSave(e, false)}
            disabled={saving}
          >
            {saving ? "Saving Changes..." : "Save Preferences"}
          </button>
        </div>
      </header>

      {statusMessage && (
        <div
          className={`rq-alert ${
            statusMessage.type === "success" ? "rq-alert-success" : "rq-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <form onSubmit={(e) => handleSave(e, false)} style={{ display: "grid", gap: "20px" }}>
        {/* Profile Card */}
        <section className="rq-card" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="rq-card-title">
            <User size={20} /> Profile & Personal Identity
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="rq-field-group">
              <label htmlFor="settings-fullname">Full Customer Name</label>
              <input
                id="settings-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="rq-field-group">
              <label htmlFor="settings-email">Email Address</label>
              <input id="settings-email" type="email" value={email} disabled readOnly />
              <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                Sample email only; no account or email verification exists.
              </span>
            </div>

            <div className="rq-field-group">
              <label htmlFor="settings-phone">WhatsApp / Phone Number</label>
              <input
                id="settings-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Regional Preferences Card */}
        <section className="rq-card" aria-labelledby="regional-heading">
          <h2 id="regional-heading" className="rq-card-title">
            <MapPin size={20} /> Regional & Dispatch Preferences
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="rq-field-group">
              <label htmlFor="settings-district">Primary Benin City District</label>
              <select
                id="settings-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="GRA / Ihama Road">GRA / Ihama Road</option>
                <option value="Airport Road / Boundary">Airport Road / Boundary</option>
                <option value="Ugbowo / UNIBEN Axis">Ugbowo / UNIBEN Axis</option>
                <option value="Ikpoba Hill">Ikpoba Hill</option>
                <option value="Aduwawa / Ramat Park">Aduwawa / Ramat Park</option>
              </select>
            </div>

            <div className="rq-field-group">
              <label htmlFor="settings-currency">Display Currency</label>
              <input id="settings-currency" type="text" value="NGN (₦) · Nigerian Naira" disabled readOnly />
            </div>
          </div>
        </section>

        {/* Notifications Card */}
        <section className="rq-card" aria-labelledby="notifications-heading">
          <h2 id="notifications-heading" className="rq-card-title">
            <CheckCircle2 size={20} /> Notification Preferences
          </h2>
          <div style={{ display: "grid", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
              />
              <span style={{ fontSize: "13.5px" }}>
                Sample preference only. No SMS, WhatsApp, or quote notifications are sent.
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={emailReceipts}
                onChange={(e) => setEmailReceipts(e.target.checked)}
              />
              <span style={{ fontSize: "13.5px" }}>
                Sample preference only. No receipts or escrow notifications are sent.
              </span>
            </label>
          </div>
        </section>
      </form>
    </div>
  );
}

/* ==========================================================================
   S14: New Job Request Screen (Wizard / Intake)
   ========================================================================== */

export function NewJobRequestScreen() {
  const router = useRouter();
  const [title, setTitle] = useState(defaultJobDraft.title);
  const [category, setCategory] = useState("Plumbing");
  const [tradeSpecialty, setTradeSpecialty] = useState(defaultJobDraft.tradeSpecialty);
  const [urgency, setUrgency] = useState<"flexible" | "standard" | "emergency">("standard");
  const [budgetNaira, setBudgetNaira] = useState("25000");
  const [district, setDistrict] = useState("GRA / Boundary Rd");
  const [address, setAddress] = useState(defaultJobDraft.address);
  const [description, setDescription] = useState(defaultJobDraft.description);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleCreateDraft = async (e: React.FormEvent, simulateFail = false) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const budgetKobo = Math.round(Number(budgetNaira || "0") * 100);

    const res = await requestsDemoService.createJobDraft(
      {
        title,
        category,
        tradeSpecialty,
        urgency,
        budgetGuidanceKobo: budgetKobo,
        district,
        address,
        description,
      },
      simulateFail,
    );

    setSaving(false);
    if (res.ok && res.draft) {
      setStatusMessage({ type: "success", text: res.message });
      router.push(`/requests/${res.draft.id}/review`);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="rq-page" data-testid="new-job-request-screen">
      <RequestsPrototypeNotice />
      <div className="rq-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Post a New Job Request (S14)</strong>
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
          Post a New Job Request
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Preview a fictional request form. No artisan is vetted, contacted, or sent a request.
        </p>
      </header>

      {statusMessage && (
        <div
          className={`rq-alert ${
            statusMessage.type === "success" ? "rq-alert-success" : "rq-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <form onSubmit={(e) => handleCreateDraft(e, false)} style={{ display: "grid", gap: "20px" }}>
        {/* 1. Classification & Scope */}
        <section className="rq-card">
          <h2 className="rq-card-title">1. Job Classification & Scope</h2>
          <div className="rq-field-group">
            <label htmlFor="job-title">Job Title / Summary</label>
            <input
              id="job-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PPR Water Pipe Burst & Overhead Tank Balancing in GRA"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="rq-field-group">
              <label htmlFor="job-category">Trade Category</label>
              <select
                id="job-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Plumbing">Plumbing & Water Systems</option>
                <option value="Electrical">Electrical & Power Systems</option>
                <option value="Carpentry">Carpentry & Cabinetry</option>
                <option value="Welding">Welding & Metal Fabrication</option>
                <option value="Masonry">Masonry & Tiling</option>
              </select>
            </div>

            <div className="rq-field-group">
              <label htmlFor="job-specialty">Technical Sub-Specialty</label>
              <input
                id="job-specialty"
                type="text"
                value={tradeSpecialty}
                onChange={(e) => setTradeSpecialty(e.target.value)}
              />
            </div>
          </div>

          <div className="rq-field-group">
            <label htmlFor="job-desc">Detailed Work Description</label>
            <textarea
              id="job-desc"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </section>

        {/* 2. Timeline & Budget Guidance */}
        <section className="rq-card">
          <h2 className="rq-card-title">2. Preferred Timeline & Budget Guidance</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="rq-field-group">
              <label htmlFor="job-urgency">Urgency / Timing</label>
              <select
                id="job-urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as "flexible" | "standard" | "emergency")}
              >
                <option value="standard">Standard (Next 24 - 48 Hours)</option>
                <option value="emergency">Emergency / Priority Dispatch</option>
                <option value="flexible">Flexible (Within this week)</option>
              </select>
            </div>

            <div className="rq-field-group">
              <label htmlFor="job-budget">Estimated Budget Guidance (₦ NGN)</label>
              <input
                id="job-budget"
                type="number"
                step="1000"
                min="5000"
                required
                value={budgetNaira}
                onChange={(e) => setBudgetNaira(e.target.value)}
              />
              <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                Example amount only. Quotes and milestones are non-binding samples.
              </span>
            </div>
          </div>
        </section>

        {/* 3. Location */}
        <section className="rq-card">
          <h2 className="rq-card-title">3. Sample Service Area</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="rq-field-group">
              <label htmlFor="job-district">Benin City District</label>
              <select
                id="job-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="GRA / Boundary Rd">GRA / Boundary Rd</option>
                <option value="Ihama Road / Airport">Ihama Road / Airport</option>
                <option value="Ugbowo / UNIBEN Axis">Ugbowo / UNIBEN Axis</option>
                <option value="Ikpoba Hill">Ikpoba Hill</option>
                <option value="Aduwawa">Aduwawa</option>
              </select>
            </div>

            <div className="rq-field-group">
              <label htmlFor="job-address">Sample Service Area (no street address)</label>
              <input
                id="job-address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Sample service area, Benin City"
              />
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={(e) => handleCreateDraft(e, true)}
            disabled={saving}
          >
            Simulate Validation Error
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={saving}
          >
            {saving ? "Preparing preview..." : "Continue to Sample Review (S15) →"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ==========================================================================
   S15: Job Request Review Screen
   ========================================================================== */

export function JobRequestReviewScreen({
  initialDraft = defaultJobDraft,
}: {
  initialDraft?: JobRequestDraft;
}) {
  const router = useRouter();
  const [draft] = useState<JobRequestDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const formattedBudget = `₦${(draft.budgetGuidanceKobo / 100).toLocaleString()}`;

  const handleDispatch = async (simulateFail = false) => {
    setSubmitting(true);
    setStatusMessage(null);

    const res = await requestsDemoService.submitJobRequest(draft.id, simulateFail);
    setSubmitting(false);

    if (res.ok) {
      setStatusMessage({ type: "success", text: res.message });
      router.push(`/requests/${draft.id}/quotes`);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="rq-page" data-testid="job-request-review-screen">
      <RequestsPrototypeNotice />
      <div className="rq-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href="/requests/new">New Request</Link>
        <span aria-hidden="true">/</span>
        <strong>Review Job Request (S15)</strong>
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
            Review Your Job Request
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Sample reference {draft.id} · Review fictional details only; no dispatch is available.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={() => handleDispatch(true)}
            disabled={submitting}
          >
            Simulate Dispatch Error
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => handleDispatch(false)}
            disabled={submitting}
          >
            {submitting ? "Preparing preview..." : "Preview Request →"}
          </button>
        </div>
      </header>

      {statusMessage && (
        <div
          className={`rq-alert ${
            statusMessage.type === "success" ? "rq-alert-success" : "rq-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      {/* Review Details Cards */}
      <div style={{ display: "grid", gap: "20px" }}>
        <section className="rq-card">
          <h2 className="rq-card-title">1. Scope & Description</h2>
          <div>
            <strong style={{ fontSize: "16px", color: "var(--text-dark, #0e294b)" }}>
              {draft.title}
            </strong>
            <p style={{ marginTop: "6px", color: "#475569", lineHeight: 1.5 }}>
              {draft.description}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
              <span
                style={{
                  background: "#e8f5ed",
                  color: "#075e46",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Trade: {draft.category}
              </span>
              <span
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Specialty: {draft.tradeSpecialty}
              </span>
            </div>
          </div>
        </section>

        <section className="rq-card">
          <h2 className="rq-card-title">2. Location & Preferred Timing</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                District Coverage:
              </span>
              <strong style={{ fontSize: "14px" }}>{draft.district}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                Street Address / Landmark:
              </span>
              <strong style={{ fontSize: "14px" }}>{draft.address}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                Urgency:
              </span>
              <strong style={{ fontSize: "14px", textTransform: "capitalize" }}>
                {draft.urgency}
              </strong>
            </div>
          </div>
        </section>

        <section className="rq-card">
          <h2 className="rq-card-title">3. Sample Budget</h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              background: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                Customer Budget Guidance
              </span>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {formattedBudget}
              </span>
            </div>
            <div style={{ maxWidth: "420px", fontSize: "12.5px", color: "#64748b" }}>
              <ShieldCheck size={20} style={{ color: "#075e46", marginBottom: "4px" }} />
              <strong>Prototype limitation:</strong> This amount is illustrative. No payment provider, escrow, or financial protection is connected.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ==========================================================================
   S16: Artisan Matching & Quotes Screen
   ========================================================================== */

export function ArtisanMatchingScreen({
  jobId = defaultJobDraft.id,
  initialQuotes = defaultQuotes,
}: {
  jobId?: string;
  initialQuotes?: readonly MatchingQuote[];
}) {
  const [quotes] = useState<readonly MatchingQuote[]>(initialQuotes);
  const [viewState, setViewState] = useState<
    "received" | "awaiting" | "loading" | "error"
  >("received");

  if (viewState === "loading") {
    return (
      <div className="rq-page" data-testid="matching-loading">
        <RequestsPrototypeNotice />
        <div className="rq-simulator-bar">
          <span className="rq-simulator-label">
            <SlidersHorizontal size={16} /> Matching State Simulator:
          </span>
          <div className="rq-simulator-buttons">
            {(["received", "awaiting", "loading", "error"] as const).map((st) => (
              <button
                key={st}
                type="button"
                className={`rq-sim-btn ${viewState === st ? "active" : ""}`}
                onClick={() => setViewState(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
        <div className="rq-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Clock size={32} style={{ margin: "0 auto", color: "var(--primary)" }} />
          <h2 style={{ margin: "12px 0 6px 0", fontSize: "20px" }}>
            Sample matching loading state...
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            This state is simulated. No queue is queried and no quote is incoming.
          </p>
        </div>
      </div>
    );
  }

  if (viewState === "error") {
    return (
      <div className="rq-page" data-testid="matching-error">
        <RequestsPrototypeNotice />
        <div className="rq-simulator-bar">
          <span className="rq-simulator-label">
            <SlidersHorizontal size={16} /> Matching State Simulator:
          </span>
          <div className="rq-simulator-buttons">
            {(["received", "awaiting", "loading", "error"] as const).map((st) => (
              <button
                key={st}
                type="button"
                className={`rq-sim-btn ${viewState === st ? "active" : ""}`}
                onClick={() => setViewState(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
        <div className="rq-alert rq-alert-error" role="alert">
          <AlertCircle size={24} />
          <div>
            <strong>Sample matching error state</strong>
            <p>
              No dispatch service is connected. Use the state controls to preview another sample.
            </p>
            <button
              type="button"
              className="button button-outline"
              style={{ marginTop: "10px" }}
              onClick={() => setViewState("received")}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === "awaiting") {
    return (
      <div className="rq-page" data-testid="matching-awaiting">
        <RequestsPrototypeNotice />
        <div className="rq-simulator-bar">
          <span className="rq-simulator-label">
            <SlidersHorizontal size={16} /> Matching State Simulator:
          </span>
          <div className="rq-simulator-buttons">
            {(["received", "awaiting", "loading", "error"] as const).map((st) => (
              <button
                key={st}
                type="button"
                className={`rq-sim-btn ${viewState === st ? "active" : ""}`}
                onClick={() => setViewState(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
        <div className="rq-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Send size={32} style={{ margin: "0 auto", color: "var(--primary)" }} />
          <h2 style={{ margin: "12px 0 6px 0", fontSize: "20px" }}>
            Sample request waiting state
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", maxWidth: "480px", margin: "0 auto" }}>
            No request was broadcast and no artisan was contacted. This state only previews the waiting layout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rq-page" data-testid="artisan-matching-screen">
      <RequestsPrototypeNotice />
      <div className="rq-breadcrumbs">
        <Link href="/jobs">Customer Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/jobs/${jobId}`}>Job #{jobId}</Link>
        <span aria-hidden="true">/</span>
        <strong>Artisan Matching & Quotes (S16)</strong>
      </div>

      {/* State Switcher Bar */}
      <div className="rq-simulator-bar">
        <span className="rq-simulator-label">
          <SlidersHorizontal size={16} /> Matching State Simulator:
        </span>
        <div className="rq-simulator-buttons">
          {(["received", "awaiting", "loading", "error"] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`rq-sim-btn ${viewState === st ? "active" : ""}`}
              onClick={() => setViewState(st)}
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
          Artisan Matching & Quotes
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          {quotes.length} sample quote records for request {jobId}. No artisans responded.
        </p>
      </header>

      {/* Quotes Cards Grid */}
      <div className="rq-quotes-grid">
        {quotes.map((q) => {
          const totalFormatted = `₦${(q.totalQuoteKobo / 100).toLocaleString()}`;
          const depositFormatted = `₦${(q.depositKobo / 100).toLocaleString()}`;
          const balanceFormatted = `₦${(q.balanceKobo / 100).toLocaleString()}`;

          return (
            <article key={q.id} className="rq-quote-card">
              <div className="rq-quote-header">
                <div className="rq-quote-artisan">
                  <div className="rq-quote-avatar">{q.artisanInitials}</div>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        color: "var(--text-dark, #0e294b)",
                      }}
                    >
                      {q.artisanName}
                    </h2>
                    <p style={{ margin: "2px 0 4px 0", fontSize: "13px", color: "var(--muted)" }}>
                      {q.artisanHeadline}
                    </p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "12px" }}>
                      <span style={{ color: "#b45309", fontWeight: 700 }}>
                        ★ {q.rating} ({q.reviewCount} reviews)
                      </span>
                      <span>·</span>
                      <span style={{ color: "var(--muted)" }}>
                        {q.completedJobsCount} jobs completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rq-quote-pricing">
                  <span style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase" }}>
                    Total Labor Quote
                  </span>
                  <span className="rq-quote-amount">{totalFormatted}</span>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    Est. Duration: {q.estimatedHours}
                  </span>
                </div>
              </div>

              {/* Milestone Breakdown */}
              <div className="rq-milestone-ledger">
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>
                    Sample Milestone 1 Amount (50%)
                  </span>
                  <strong style={{ color: "var(--primary)", fontSize: "14px" }}>
                    {depositFormatted}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>
                    Sample Milestone 2 Amount (50%)
                  </span>
                  <strong style={{ color: "var(--text-dark, #0e294b)", fontSize: "14px" }}>
                    {balanceFormatted}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>
                    Materials
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {q.materialsIncluded ? "Sample includes materials" : "Sample excludes materials"}
                  </span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: "13.5px", color: "#334155", lineHeight: 1.5 }}>
                {q.notes}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "14px",
                }}
              >
                <Link
                  href={`/artisans/${q.artisanId}`}
                  className="button button-outline"
                  style={{ minHeight: "38px", fontSize: "13px" }}
                >
                  View Full Profile (S04)
                </Link>
                <Link
                  href={`/jobs/${jobId}/review`}
                  className="button button-primary"
                  style={{ minHeight: "38px", fontSize: "13px" }}
                >
                  Preview Quote Acceptance →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
