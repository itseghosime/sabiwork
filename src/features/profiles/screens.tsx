"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Clock,
  FileCheck2,
  FileText,
  Home,
  Info,
  SlidersHorizontal,
  Star,
  Upload,
  User,
} from "lucide-react";
import {
  type ArtisanProfile,
  type VerificationApplication,
  defaultArtisan,
  defaultVerification,
  profilesDemoService,
} from "./service";
import "./profiles.css";

/* ==========================================================================
   S04: Artisan Profile Screen (Public View)
   ========================================================================== */

export function ArtisanProfileScreen({
  initialArtisan = defaultArtisan,
}: {
  initialArtisan?: ArtisanProfile;
}) {
  const [artisan] = useState<ArtisanProfile>(initialArtisan);
  const [viewState, setViewState] = useState<
    "default" | "pending" | "empty-portfolio" | "skeleton" | "error"
  >("default");

  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteDistrict, setQuoteDistrict] = useState("GRA / Ihama Road");
  const [quoteDetails, setQuoteDetails] = useState("");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const formattedStartingPrice = `₦${(artisan.startingPriceKobo / 100).toLocaleString()}`;

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteTitle.trim()) return;
    setQuoteSubmitted(true);
  };

  if (viewState === "skeleton") {
    return (
      <div className="pf-page" data-testid="profile-skeleton">
        <div className="pf-simulator-bar">
          <span className="pf-simulator-label">
            <SlidersHorizontal size={16} /> Interactive View State:
          </span>
          <div className="pf-simulator-buttons">
            {(["default", "pending", "empty-portfolio", "skeleton", "error"] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  className={`pf-sim-btn ${viewState === st ? "active" : ""}`}
                  onClick={() => setViewState(st)}
                >
                  {st}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="pf-hero-card" style={{ opacity: 0.6 }}>
          <div style={{ height: "40px", background: "#e2e8f0", borderRadius: "8px" }} />
          <div style={{ height: "80px", background: "#f1f5f9", borderRadius: "8px" }} />
        </div>
        <div className="pf-card" style={{ height: "200px", opacity: 0.5 }}>
          <p>Loading artisan profile details...</p>
        </div>
      </div>
    );
  }

  if (viewState === "error") {
    return (
      <div className="pf-page" data-testid="profile-error">
        <div className="pf-simulator-bar">
          <span className="pf-simulator-label">
            <SlidersHorizontal size={16} /> Interactive View State:
          </span>
          <div className="pf-simulator-buttons">
            {(["default", "pending", "empty-portfolio", "skeleton", "error"] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  className={`pf-sim-btn ${viewState === st ? "active" : ""}`}
                  onClick={() => setViewState(st)}
                >
                  {st}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="pf-alert pf-alert-error" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Unable to Load Artisan Profile</strong>
            <p>
              We encountered a network timeout while retrieving this profile from the Benin City Hub
              directory. Please check your connection and retry.
            </p>
            <button
              type="button"
              className="button button-outline"
              style={{ marginTop: "12px" }}
              onClick={() => setViewState("default")}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPending = viewState === "pending";
  const displayPortfolio =
    viewState === "empty-portfolio" ? [] : artisan.portfolio;

  return (
    <div className="pf-page" data-testid="artisan-profile-screen">
      {/* State Switcher Simulator */}
      <div className="pf-simulator-bar">
        <span className="pf-simulator-label">
          <SlidersHorizontal size={16} /> Interactive View State:
        </span>
        <div className="pf-simulator-buttons">
          {(["default", "pending", "empty-portfolio", "skeleton", "error"] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                className={`pf-sim-btn ${viewState === st ? "active" : ""}`}
                onClick={() => setViewState(st)}
              >
                {st}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="pf-breadcrumbs" aria-label="Breadcrumbs">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/artisans">Artisans</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/artisans?category=${encodeURIComponent(artisan.category)}`}>
          {artisan.category}
        </Link>
        <span aria-hidden="true">/</span>
        <strong>{artisan.name}</strong>
      </nav>

      {/* Pending Banner if applicable */}
      {isPending && (
        <div className="pf-alert pf-alert-warning" role="status">
          <AlertCircle size={20} />
          <div>
            <strong>Verification Under Review</strong>
            <p>
              This artisan profile is currently undergoing credentials review by the Benin City Hub
              desk. Profile review and quote submission are prototype interactions.
            </p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="pf-hero-card" aria-label="Artisan Profile Header">
        <div className="pf-hero-top">
          <div className="pf-hero-profile">
            <div className="pf-avatar-large" aria-hidden="true">
              {artisan.initials}
            </div>
            <div className="pf-hero-info">
              <div className="pf-hero-title-row">
                <h1 className="pf-hero-title">{artisan.name}</h1>
                <div className="pf-badge-cluster">
                  <span className="pf-badge-master">Master Artisan</span>
                  {isPending ? (
                    <span className="pf-badge-pending">Pending Admin Review</span>
                  ) : (
                    <span className="pf-badge-reviewed">Admin-Reviewed Profile</span>
                  )}
                  <span className="pf-badge-testmode">Sample profile</span>
                </div>
              </div>
              <p style={{ margin: "4px 0 8px 0", color: "#475569", fontWeight: 500 }}>
                {artisan.headline}
              </p>
              <div className="pf-hero-meta">
                <span className="pf-rating-pill" aria-label={`Rating: ${artisan.rating} out of 5`}>
                  ★ {artisan.rating.toFixed(1)} ({artisan.reviewCount} reviews)
                </span>
                <span className="pf-meta-item">
                  <Check size={16} /> {artisan.completedJobsCount} jobs completed
                </span>
                <span className="pf-meta-item">
                  <Home size={16} /> {artisan.area}
                </span>
              </div>
            </div>
          </div>

          <div className="pf-hero-pricing-box">
            <span className="pf-price-label">Starting Labor Benchmark</span>
            <span className="pf-price-value">{formattedStartingPrice}</span>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Sample profile · payments not connected
            </span>
          </div>
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="pf-layout-grid">
        <div className="pf-main-col">
          {/* About Section */}
          <section className="pf-card" aria-labelledby="about-heading">
            <h2 id="about-heading" className="pf-card-title">
              <User size={20} /> About & Specialization
            </h2>
            <p style={{ lineHeight: 1.6, color: "var(--text)", margin: 0 }}>{artisan.bio}</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                marginTop: "12px",
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <div>
                <strong style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                  Workshop Address:
                </strong>
                <span style={{ fontSize: "13.5px", fontWeight: 600 }}>
                  {artisan.workshopAddress}
                </span>
              </div>
              <div>
                <strong style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                  Experience:
                </strong>
                <span style={{ fontSize: "13.5px", fontWeight: 600 }}>
                  {artisan.experienceYears} Years in Benin City
                </span>
              </div>
            </div>
          </section>

          {/* Verified Skills */}
          <section className="pf-card" aria-labelledby="skills-heading">
            <h2 id="skills-heading" className="pf-card-title">
              <Check size={20} /> Verified Core Skillsets
            </h2>
            <div className="pf-skills-grid">
              {artisan.skills.map((skill) => (
                <span key={skill} className="pf-skill-pill vetted">
                  <Check size={14} /> {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Portfolio Showcase */}
          <section className="pf-card" aria-labelledby="portfolio-heading">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <h2 id="portfolio-heading" className="pf-card-title">
                <FileCheck2 size={20} /> Portfolio Showcase
              </h2>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                {displayPortfolio.length} photographic proof jobs
              </span>
            </div>

            {displayPortfolio.length === 0 ? (
              <div
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1",
                }}
              >
                <FileCheck2 size={32} />
                <p style={{ fontWeight: 600, marginTop: "8px", color: "var(--text-dark, #0e294b)" }}>
                  No Portfolio Items Uploaded Yet
                </p>
                <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                  This artisan has not published work proof photos to their showcase.
                </p>
              </div>
            ) : (
              <div className="pf-portfolio-grid">
                {displayPortfolio.map((item) => (
                  <Link
                    key={item.id}
                    href={`/artisans/${artisan.id}/portfolio/${item.id}`}
                    className="pf-portfolio-card"
                  >
                    <div className="pf-portfolio-thumb">
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#0e294b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontSize: "13px",
                          fontWeight: 600,
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        [Photo: {item.title}]
                      </div>
                      <span className="pf-portfolio-thumb-overlay">
                        {item.completedDate}
                      </span>
                    </div>
                    <div className="pf-portfolio-body">
                      <h3 className="pf-portfolio-title">{item.title}</h3>
                      <span className="pf-portfolio-meta">
                        <Home size={14} /> {item.location}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Customer Reviews */}
          <section className="pf-card" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="pf-card-title">
              <Star size={20} /> Verified Customer Reviews
            </h2>
            <div className="pf-reviews-list">
              {artisan.reviews.map((rev) => (
                <article key={rev.id} className="pf-review-item">
                  <div className="pf-review-header">
                    <div>
                      <span className="pf-reviewer-name">{rev.reviewerName}</span>
                      <span className="pf-reviewer-sub"> · {rev.area}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="pf-rating-pill">★ {rev.rating}</span>
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>{rev.date}</span>
                    </div>
                  </div>
                  <p className="pf-review-comment">{rev.comment}</p>
                  <div style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
                    ✓ Milestone Verified Job · Ref #{rev.jobRef}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Sticky Quote Form */}
        <div className="pf-side-col">
          <section className="pf-sticky-quote" aria-labelledby="quote-heading">
            <h2 id="quote-heading" className="pf-card-title">
              <FileText size={20} /> Request a Quote
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
              Send a sample inquiry to {artisan.name}. This prototype does not process or hold payments.
            </p>

            {quoteSubmitted ? (
              <div className="pf-alert pf-alert-success" role="alert">
                <Check size={20} />
                <div>
                  <strong>Quote Request Submitted!</strong>
                  <p>
                    {artisan.name} has been notified and will respond via the SabiWork messaging
                    desk.
                  </p>
                  <button
                    type="button"
                    className="button button-outline"
                    style={{ marginTop: "10px", width: "100%" }}
                    onClick={() => {
                      setQuoteSubmitted(false);
                      setQuoteTitle("");
                      setQuoteDetails("");
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} style={{ display: "grid", gap: "14px" }}>
                <div className="pf-quote-field">
                  <label htmlFor="quote-job-title">Job Summary / Issue Title</label>
                  <input
                    id="quote-job-title"
                    type="text"
                    required
                    placeholder="e.g. PPR Pipe Burst in Master Bath"
                    value={quoteTitle}
                    onChange={(e) => setQuoteTitle(e.target.value)}
                  />
                </div>

                <div className="pf-quote-field">
                  <label htmlFor="quote-district">Location in Benin City</label>
                  <select
                    id="quote-district"
                    value={quoteDistrict}
                    onChange={(e) => setQuoteDistrict(e.target.value)}
                  >
                    <option value="GRA / Ihama Road">GRA / Ihama Road</option>
                    <option value="Airport Road / Boundary">Airport Road / Boundary</option>
                    <option value="Ugbowo / UNIBEN Axis">Ugbowo / UNIBEN Axis</option>
                    <option value="Ikpoba Hill">Ikpoba Hill</option>
                    <option value="Aduwawa / Ramat Park">Aduwawa / Ramat Park</option>
                  </select>
                </div>

                <div className="pf-quote-field">
                  <label htmlFor="quote-details">Description & Required Timing</label>
                  <textarea
                    id="quote-details"
                    rows={3}
                    placeholder="Describe what needs repair, access details, and preferred schedule..."
                    value={quoteDetails}
                    onChange={(e) => setQuoteDetails(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="button button-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={isPending}
                >
                  {isPending ? "Direct Quotes Paused" : "Send Quote Request"}
                </button>
              </form>
            )}
          </section>

          {/* Safety & Compliance Card */}
          <div className="pf-card" style={{ background: "#f8fafc" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#0e294b" }}>
              Prototype preview
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                fontSize: "12.5px",
                color: "#475569",
                display: "grid",
                gap: "8px",
              }}
            >
              <li>Artisan profiles use sample data</li>
              <li>Payment and dispute services are not connected</li>
              <li>Verification decisions require backend support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   S05: Portfolio Viewer Modal / Screen
   ========================================================================== */

export function PortfolioViewerScreen({
  artisan = defaultArtisan,
  initialPhotoId = "photo-01",
}: {
  artisan?: ArtisanProfile;
  initialPhotoId?: string;
}) {
  const [selectedPhotoId, setSelectedPhotoId] = useState(initialPhotoId);
  const [viewerState, setViewerState] = useState<"default" | "skeleton" | "error">("default");

  const currentItem =
    artisan.portfolio.find((p) => p.id === selectedPhotoId) || artisan.portfolio[0];

  return (
    <div className="pf-page" data-testid="portfolio-viewer-screen">
      <div className="pf-breadcrumbs">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/artisans/${artisan.id}`}>{artisan.name}</Link>
        <span aria-hidden="true">/</span>
        <strong>Portfolio Photo Inspection</strong>
      </div>

      {/* Simulator Bar */}
      <div className="pf-simulator-bar">
        <span className="pf-simulator-label">
          <SlidersHorizontal size={16} /> Viewer Simulator:
        </span>
        <div className="pf-simulator-buttons">
          {(["default", "skeleton", "error"] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`pf-sim-btn ${viewerState === st ? "active" : ""}`}
              onClick={() => setViewerState(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="pf-modal-dialog" style={{ margin: "0 auto", width: "100%" }}>
        <header className="pf-modal-header">
          <div>
            <h1 className="pf-modal-title">{artisan.name} · Proof of Work</h1>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              High-Resolution Milestone & Workshop Verification Inspection
            </span>
          </div>
          <Link
            href={`/artisans/${artisan.id}`}
            className="button button-outline"
            style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
          >
            ← Back to Profile
          </Link>
        </header>

        <div className="pf-modal-body">
          {viewerState === "skeleton" && (
            <div
              className="pf-viewer-stage"
              style={{ background: "#cbd5e1" }}
              data-testid="viewer-skeleton"
            >
              <p style={{ color: "#475569", fontWeight: 600 }}>Loading proof photograph...</p>
            </div>
          )}

          {viewerState === "error" && (
            <div
              className="pf-viewer-stage"
              style={{ background: "#fef2f2", color: "#991b1b" }}
              data-testid="viewer-error"
            >
              <div style={{ textAlign: "center", padding: "20px" }}>
                <AlertCircle size={32} />
                <p style={{ fontWeight: 700, margin: "8px 0" }}>
                  Failed to Load High-Res Proof Photo
                </p>
                <p style={{ fontSize: "13px" }}>
                  The image asset could not be retrieved from the storage vault.
                </p>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setViewerState("default")}
                  style={{ marginTop: "12px" }}
                >
                  Retry Image Load
                </button>
              </div>
            </div>
          )}

          {viewerState === "default" && currentItem && (
            <>
              <div className="pf-viewer-stage" data-testid="viewer-stage">
                <div
                  style={{
                    color: "#ffffff",
                    textAlign: "center",
                    padding: "24px",
                    maxWidth: "500px",
                  }}
                >
                  <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>{currentItem.title}</h2>
                  <p style={{ fontSize: "13.5px", color: "#94a3b8" }}>
                    {currentItem.description}
                  </p>
                  <div
                    style={{
                      marginTop: "16px",
                      display: "inline-flex",
                      gap: "8px",
                      background: "rgba(255,255,255,0.1)",
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "12px",
                    }}
                  >
                    <span>📍 {currentItem.location}</span>
                    <span>•</span>
                    <span>📅 {currentItem.completedDate}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnails row */}
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--muted)",
                  }}
                >
                  All Showcase Jobs ({artisan.portfolio.length})
                </span>
                <div className="pf-viewer-thumbs">
                  {artisan.portfolio.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pf-viewer-thumb-btn ${
                        selectedPhotoId === item.id ? "active" : ""
                      }`}
                      onClick={() => setSelectedPhotoId(item.id)}
                      aria-label={`View photo ${item.title}`}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: selectedPhotoId === item.id ? "#075e46" : "#0e294b",
                          color: "#ffffff",
                          fontSize: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        {item.title.slice(0, 15)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Metadata and tags */}
              <div className="pf-card" style={{ background: "#f8fafc" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-dark, #0e294b)" }}>
                      Job Technical Verification Notes
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--muted)", margin: "4px 0 0 0" }}>
                      Completed by {artisan.name} · Verified by SabiWork Field Inspector Desk
                    </p>
                  </div>
                  <Link
                    href={`/artisans/${artisan.id}`}
                    className="button button-primary"
                  >
                    Request Similar Job Quote
                  </Link>
                </div>

                <div className="pf-skills-grid" style={{ marginTop: "12px" }}>
                  {currentItem.tags.map((t) => (
                    <span key={t} className="pf-skill-pill">
                      🏷️ {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   S06: Artisan Profile Editor Screen (Workspace View)
   ========================================================================== */

export function ArtisanProfileEditorScreen({
  initialProfile = defaultArtisan,
}: {
  initialProfile?: ArtisanProfile;
}) {
  const [profile, setProfile] = useState<ArtisanProfile>(initialProfile);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [workshopAddress, setWorkshopAddress] = useState(profile.workshopAddress);
  const [startingPriceKobo, setStartingPriceKobo] = useState(profile.startingPriceKobo);
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears);

  // Simulation states
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async (e: React.FormEvent, simulateFail = false) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await profilesDemoService.updateProfile(
      {
        headline,
        bio,
        workshopAddress,
        startingPriceKobo: Number(startingPriceKobo),
        experienceYears: Number(experienceYears),
      },
      simulateFail,
    );

    setSaving(false);
    if (res.ok && res.profile) {
      setProfile(res.profile);
      setStatusMessage({ type: "success", text: res.message });
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="pf-page" data-testid="artisan-profile-editor-screen">
      <div className="pf-breadcrumbs">
        <Link href="/artisan">Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Edit Trade Profile (S06)</strong>
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
            Edit Trade Profile
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Update your public profile, workshop location, and labor pricing benchmarks in Benin
            City.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={(e) => handleSave(e, true)}
            disabled={saving}
          >
            Simulate Server Error
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={(e) => handleSave(e, false)}
            disabled={saving}
          >
            {saving ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`pf-alert ${
            statusMessage.type === "success" ? "pf-alert-success" : "pf-alert-error"
          }`}
          role="status"
        >
          {statusMessage.type === "success" ? (
            <Check size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <form onSubmit={(e) => handleSave(e, false)} className="pf-form-grid">
        {/* Profile Identity Card */}
        <div className="pf-form-card">
          <h2 className="pf-form-section-title">Identity & Qualifications</h2>
          <div className="pf-quote-field">
            <label htmlFor="artisan-name">Full Legal Trade Name</label>
            <input id="artisan-name" type="text" value={profile.name} disabled readOnly />
            <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
              Sample identity details only. Do not enter real NIN or BVN data in this prototype.
            </span>
          </div>

          <div className="pf-quote-field">
            <label htmlFor="artisan-headline">Professional Headline</label>
            <input
              id="artisan-headline"
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="pf-quote-field">
            <label htmlFor="artisan-years">Years of Experience in Benin City</label>
            <input
              id="artisan-years"
              type="number"
              min="1"
              max="50"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
            />
          </div>

          <div className="pf-quote-field">
            <label htmlFor="artisan-bio">Professional Biography</label>
            <textarea
              id="artisan-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        {/* Workshop & Service Areas */}
        <div className="pf-form-card">
          <h2 className="pf-form-section-title">Service Coverage & Workshop</h2>
          <div className="pf-quote-field">
            <label htmlFor="artisan-workshop">Physical Workshop / Base Address</label>
            <input
              id="artisan-workshop"
              type="text"
              required
              value={workshopAddress}
              onChange={(e) => setWorkshopAddress(e.target.value)}
            />
            <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
              Vetted during physical hub inspection in Edo State.
            </span>
          </div>

          <div style={{ marginTop: "8px" }}>
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                display: "block",
                marginBottom: "8px",
              }}
            >
              Active Coverage Districts
            </span>
            <div className="pf-area-checkbox-group">
              <label className="pf-checkbox-label">
                <input type="checkbox" defaultChecked />
                <div>
                  <span className="pf-checkbox-title">GRA Axis & Ihama Rd</span>
                  <span className="pf-checkbox-sub">Primary priority zone (&lt; 20 min)</span>
                </div>
              </label>
              <label className="pf-checkbox-label">
                <input type="checkbox" defaultChecked />
                <div>
                  <span className="pf-checkbox-title">Airport Rd & Ekenwan</span>
                  <span className="pf-checkbox-sub">Standard service zone</span>
                </div>
              </label>
              <label className="pf-checkbox-label">
                <input type="checkbox" defaultChecked />
                <div>
                  <span className="pf-checkbox-title">Ugbowo / UNIBEN Area</span>
                  <span className="pf-checkbox-sub">Extended radius (+₦1,500 logistics)</span>
                </div>
              </label>
              <label className="pf-checkbox-label">
                <input type="checkbox" />
                <div>
                  <span className="pf-checkbox-title">Ikpoba Hill</span>
                  <span className="pf-checkbox-sub">Scheduled visits only</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Labor Pricing Benchmark */}
        <div className="pf-form-card" style={{ gridColumn: "1 / -1" }}>
          <h2 className="pf-form-section-title">Labor Pricing Benchmark (Integer Kobo)</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="pf-quote-field">
              <label htmlFor="starting-kobo">Minimum Starting Labor Benchmark (Kobo)</label>
              <input
                id="starting-kobo"
                type="number"
                step="100000"
                min="100000"
                value={startingPriceKobo}
                onChange={(e) => setStartingPriceKobo(Number(e.target.value))}
              />
              <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                Current preview: ₦{(startingPriceKobo / 100).toLocaleString()} (Stored in UTC/Kobo)
              </span>
            </div>
            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12.5px",
                color: "#475569",
              }}
            >
              <strong style={{ color: "var(--text-dark, #0e294b)" }}>Pricing Integrity Note:</strong>
              <p style={{ margin: "4px 0 0 0" }}>
                Starting prices are sample guidance. This prototype does not create contracts or
                accept milestone payments.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ==========================================================================
   S40: Artisan Verification & Submission Screen
   ========================================================================== */

export function ArtisanVerificationScreen() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [ninNumber, setNinNumber] = useState("");
  const [tradeGuild, setTradeGuild] = useState("Benin Plumbing Guild (Edo State Chapter)");
  const [certificateRef, setCertificateRef] = useState("");
  const [masterCraftsman, setMasterCraftsman] = useState("");
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [declarationChecked, setDeclarationChecked] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    ok: boolean;
    message: string;
    ref?: string;
  } | null>(null);

  const handleSubmit = async (simulateError = false) => {
    setSubmitting(true);
    setSubmissionResult(null);

    const res = await profilesDemoService.submitVerification({
      ninNumber,
      certificateRef,
      workshopAddress,
      declarationChecked,
      simulateError,
    });

    setSubmitting(false);
    setSubmissionResult(res);
  };

  return (
    <div className="pf-page" data-testid="artisan-verification-screen">
      <div className="pf-breadcrumbs">
        <Link href="/artisan">Workspace</Link>
        <span aria-hidden="true">/</span>
        <strong>Artisan Verification & Credentials Intake (S40)</strong>
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
          Artisan Verification & Credentials Submission
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
          Add sample profile details and work photos. Verification is a prototype flow; do not
          submit real identity documents here.
        </p>
      </header>

      {/* 4 Steps Indicator */}
      <div className="pf-steps-nav" aria-label="Verification Steps">
        <div className={`pf-step-tab ${currentStep === 1 ? "active" : ""}`}>
          <span className="pf-step-num">1</span>
          <span>Profile Confirmation</span>
        </div>
        <div className={`pf-step-tab ${currentStep === 2 ? "active" : ""}`}>
          <span className="pf-step-num">2</span>
          <span>Trade & Guild</span>
        </div>
        <div className={`pf-step-tab ${currentStep === 3 ? "active" : ""}`}>
          <span className="pf-step-num">3</span>
          <span>Evidence & NIN</span>
        </div>
        <div className={`pf-step-tab ${currentStep === 4 ? "active" : ""}`}>
          <span className="pf-step-num">4</span>
          <span>Declaration & Submit</span>
        </div>
      </div>

      {submissionResult && (
        <div
          className={`pf-alert ${
            submissionResult.ok ? "pf-alert-success" : "pf-alert-error"
          }`}
          role="status"
        >
          {submissionResult.ok ? (
            <Check size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <div>
            <strong>
              {submissionResult.ok ? "Submission Successful!" : "Submission Incomplete"}
            </strong>
            <p>{submissionResult.message}</p>
            {submissionResult.ok && (
              <Link
                href="/artisan/verification/status"
                className="button button-primary"
                style={{ marginTop: "12px" }}
              >
                Track Review Status in S41 →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Wizard Steps */}
      <div className="pf-card">
        {currentStep === 1 && (
          <div style={{ display: "grid", gap: "16px" }}>
            <h2 className="pf-form-section-title">Step 1: Artisan Profile Confirmation</h2>
            <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
              Ensure your registered profile matches your government identification details.
            </p>
            <div className="pf-quote-field">
              <label htmlFor="ver-name">Artisan Legal Name</label>
              <input id="ver-name" type="text" value={defaultArtisan.name} readOnly disabled />
            </div>
            <div className="pf-quote-field">
              <label htmlFor="ver-workshop">Workshop Base Address</label>
              <input
                id="ver-workshop"
                type="text"
                value={workshopAddress}
                onChange={(e) => setWorkshopAddress(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setCurrentStep(2)}
              >
                Continue to Trade & Guild →
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ display: "grid", gap: "16px" }}>
            <h2 className="pf-form-section-title">Step 2: Trade Skills & Guild Affiliation</h2>
            <div className="pf-quote-field">
              <label htmlFor="ver-guild">Recognized Guild or Association</label>
              <input
                id="ver-guild"
                type="text"
                value={tradeGuild}
                onChange={(e) => setTradeGuild(e.target.value)}
              />
            </div>
            <div className="pf-quote-field">
              <label htmlFor="ver-cert">Apprenticeship / Certificate Ref Number</label>
              <input
                id="ver-cert"
                type="text"
                value={certificateRef}
                onChange={(e) => setCertificateRef(e.target.value)}
              />
            </div>
            <div className="pf-quote-field">
              <label htmlFor="ver-craftsman">Master Craftsman Endorsement</label>
              <input
                id="ver-craftsman"
                type="text"
                value={masterCraftsman}
                onChange={(e) => setMasterCraftsman(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setCurrentStep(1)}
              >
                ← Back
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setCurrentStep(3)}
              >
                Continue to Evidence & NIN →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ display: "grid", gap: "16px" }}>
            <h2 className="pf-form-section-title">Step 3: Work Evidence & Identity Upload</h2>
            <div className="pf-quote-field">
              <label htmlFor="ver-nin">National Identity Number (NIN)</label>
              <input
                id="ver-nin"
                type="text"
                maxLength={11}
                value={ninNumber}
                onChange={(e) => setNinNumber(e.target.value)}
              />
              <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                Must be an 11-digit number. Verified via local hub intake registry.
              </span>
            </div>

            <div style={{ display: "grid", gap: "12px", marginTop: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                Upload Documentation (Images or PDF)
              </span>
              <div className="pf-upload-slot">
                <Upload size={28} />
                <span style={{ fontWeight: 600 }}>Government ID Slip / NIN Card</span>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  nin_slip_osaze_ighodaro.pdf (Attached)
                </span>
              </div>
              <div className="pf-upload-slot">
                <FileCheck2 size={28} />
                <span style={{ fontWeight: 600 }}>Workshop Verification Signboard Photo</span>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  workshop_signboard_airport_rd.jpg (Attached)
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setCurrentStep(2)}
              >
                ← Back
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setCurrentStep(4)}
              >
                Continue to Legal Declaration →
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={{ display: "grid", gap: "16px" }}>
            <h2 className="pf-form-section-title">Step 4: Legal Declaration & Submission</h2>
            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              <p style={{ margin: "0 0 10px 0" }}>
                I hereby declare that all information submitted, including trade certifications,
                workshop addresses, and identity credentials, is authentic and truthful to the best
                of my knowledge.
              </p>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                />
                I accept the SabiWork artisan code of conduct and verification terms.
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setCurrentStep(3)}
              >
                ← Back
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                >
                  Simulate Error
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? "Lodging Application..." : "Submit Verification Dossier"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   S41: Artisan Verification Status & Badge Review Screen
   ========================================================================== */

export function ArtisanVerificationStatusScreen({
  initialApplication = defaultVerification,
}: {
  initialApplication?: VerificationApplication;
}) {
  const [app, setApp] = useState<VerificationApplication>(initialApplication);
  const [statusState, setStatusState] = useState<
    "UNDER_REVIEW" | "APPROVED" | "CHANGES_REQUESTED"
  >(app.status);

  return (
    <div className="pf-page" data-testid="verification-status-screen">
      <div className="pf-breadcrumbs">
        <Link href="/artisan">Workspace</Link>
        <span aria-hidden="true">/</span>
        <Link href="/artisan/verification">Verification</Link>
        <span aria-hidden="true">/</span>
        <strong>Application Status & Audit (S41)</strong>
      </div>

      {/* Status Switcher Simulator */}
      <div className="pf-simulator-bar">
        <span className="pf-simulator-label">
          <SlidersHorizontal size={16} /> Audit Status Simulator:
        </span>
        <div className="pf-simulator-buttons">
          {(["UNDER_REVIEW", "APPROVED", "CHANGES_REQUESTED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`pf-sim-btn ${statusState === st ? "active" : ""}`}
              onClick={() => {
                setStatusState(st);
                setApp({ ...app, status: st });
              }}
            >
              {st}
            </button>
          ))}
        </div>
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
            Verification Status & Badge Review
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Application #{app.applicationRef} · Lodged on {app.lodgedDate}
          </p>
        </div>

        <div>
          {statusState === "APPROVED" && (
            <span className="pf-badge-reviewed" style={{ fontSize: "13px", padding: "6px 14px" }}>
              ✓ Verified Master Artisan Badge Active
            </span>
          )}
          {statusState === "UNDER_REVIEW" && (
            <span className="pf-badge-pending" style={{ fontSize: "13px", padding: "6px 14px" }}>
              ⏳ Desk Review In Progress
            </span>
          )}
          {statusState === "CHANGES_REQUESTED" && (
            <span className="pf-badge-pending" style={{ fontSize: "13px", padding: "6px 14px" }}>
              ⚠️ Action Required: Revisions Requested
            </span>
          )}
        </div>
      </header>

      {/* Main Status Layout */}
      <div className="pf-layout-grid">
        <div className="pf-main-col">
          {/* Status Details Banner */}
          {statusState === "APPROVED" && (
            <div className="pf-alert pf-alert-success" role="status">
              <Check size={24} />
              <div>
                <strong>Congratulations! Your Verification Badge is Active</strong>
                <p>
                  Your credentials have been certified by the Benin City Hub Desk. Your public
                  profile (S04) now displays the verified badge and appears in priority search
                  results (S03).
                </p>
              </div>
            </div>
          )}

          {statusState === "UNDER_REVIEW" && (
            <div className="pf-alert pf-alert-info" role="status">
              <Info size={24} />
              <div>
                <strong>Review in progress by Benin City Hub Desk</strong>
                <p>
                  Our field officers are reviewing your trade guild certificate and workshop
                  location. Average review turnaround is 48 business hours.
                </p>
              </div>
            </div>
          )}

          {statusState === "CHANGES_REQUESTED" && (
            <div className="pf-alert pf-alert-warning" role="alert">
              <AlertCircle size={24} />
              <div>
                <strong>Updates needed before your Pro Badge can be issued</strong>
                <p>
                  The reviewer has left feedback regarding your proof documents. Please re-upload a
                  clearer photo of your workshop signboard.
                </p>
                <Link
                  href="/artisan/verification"
                  className="button button-primary"
                  style={{ marginTop: "10px" }}
                >
                  Resubmit Credentials in S40 →
                </Link>
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <section className="pf-card" aria-labelledby="timeline-heading">
            <h2 id="timeline-heading" className="pf-card-title">
              <Clock size={20} /> Administrative Verification Workflow
            </h2>
            <div className="pf-timeline">
              {app.timeline.map((item, idx) => (
                <div key={idx} className={`pf-timeline-item ${item.state}`}>
                  <div className="pf-timeline-dot" />
                  <span className="pf-timeline-title">{item.title}</span>
                  <span className="pf-timeline-sub">{item.detail}</span>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Submitted Files Dossier */}
          <section className="pf-card" aria-labelledby="dossier-heading">
            <h2 id="dossier-heading" className="pf-card-title">
              <FileText size={20} /> Submitted Dossier Snapshot
            </h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {app.submittedFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>📄 {file.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>
                    {file.type}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Review Info */}
        <div className="pf-side-col">
          <div className="pf-card">
            <h3 style={{ margin: 0, fontSize: "15px", color: "var(--text-dark, #0e294b)" }}>
              Benin City Hub Desk
            </h3>
            <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "var(--muted)" }}>
              Vetting Officer: Engr. A. Omoregie (Hub Lead)
            </p>
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "12.5px",
              }}
            >
              <strong>Reviewer Notes:</strong>
              <p style={{ margin: "4px 0 0 0", color: "#334155" }}>{app.reviewNotes}</p>
            </div>
          </div>

          <div className="pf-card" style={{ background: "#f8fafc" }}>
            <h3 style={{ margin: 0, fontSize: "14px", color: "var(--text-dark, #0e294b)" }}>
              Badge Benefits
            </h3>
            <ul
              style={{
                margin: "8px 0 0 0",
                paddingLeft: "18px",
                fontSize: "12px",
                color: "#475569",
                display: "grid",
                gap: "6px",
              }}
            >
              <li>Priority placement on search results (S03)</li>
              <li>&ldquo;Admin-Reviewed&rdquo; badge on profile & quote cards</li>
              <li>Eligible for commercial milestone jobs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
