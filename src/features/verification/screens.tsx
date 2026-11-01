"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  MapPin,
  User,
  Briefcase,
  Phone,
  Mail,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Download,
  RefreshCw,
  X,
  ExternalLink,
  Award,
  Filter,
} from "lucide-react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { PublicShell } from "@/components/public-shell";
import {
  type VerificationDossier,
  getVerificationDossiers,
  getVerificationDossier,
  getDossierMetrics,
  approveDossier,
  rejectDossier,
  registerArtisan,
  type ArtisanRegistrationDraft,
} from "./service";
import "./verification.css";

const BENIN_LOCATIONS = [
  "GRA",
  "Airport Road",
  "Uselu",
  "Ikpoba Hill",
  "Ring Road",
  "Ekenwan",
  "Ugbowo",
  "Sapele Road",
];

const TRADES = [
  "Electrical Installation & Solar Inverters",
  "Plumbing & Borehole Systems",
  "Carpentry & Custom Cabinetry",
  "Welding & Metal Fabrication",
  "Painting & Decorative Screeding",
  "Commercial Tiling & Masonry",
  "HVAC & Air Conditioning Repair",
  "Auto-Mechanic & Diagnostician",
];

// S08: Artisan Signup & Onboarding Screen
export function ArtisanSignupScreen() {
  const [step, setStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedRef, setAssignedRef] = useState<string>("VET-BEN-4099");

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+234 ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trade, setTrade] = useState(TRADES[0]);
  const [experienceYears, setExperienceYears] = useState(5);
  const [coverageAreas, setCoverageAreas] = useState<string[]>(["GRA", "Airport Road"]);
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [bio, setBio] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [formError, setFormError] = useState("");

  const toggleLocation = (loc: string) => {
    if (coverageAreas.includes(loc)) {
      setCoverageAreas(coverageAreas.filter((a) => a !== loc));
    } else {
      setCoverageAreas([...coverageAreas, loc]);
    }
  };

  const validateStep1 = () => {
    if (!fullName.trim()) {
      setFormError("Please enter your full legal name as it appears on your ID.");
      return false;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setFormError("Please enter a valid Nigerian telephone number (e.g., +234 803 123 4567).");
      return false;
    }
    if (!email.includes("@")) {
      setFormError("Please provide a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return false;
    }
    setFormError("");
    return true;
  };

  const validateStep2 = () => {
    if (coverageAreas.length === 0) {
      setFormError("Select at least one Edo State service coverage zone.");
      return false;
    }
    if (!workshopAddress.trim()) {
      setFormError("Please specify your workshop or base operating address in Benin City.");
      return false;
    }
    setFormError("");
    return true;
  };

  const validateStep3 = () => {
    if (!ninNumber.trim() || ninNumber.trim().length < 8) {
      setFormError("Please provide your 11-digit National Identity Number (NIN).");
      return false;
    }
    if (!bio.trim()) {
      setFormError("Please provide a brief summary of your trade expertise and past work.");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setFormError("");
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const draft: ArtisanRegistrationDraft = {
        fullName,
        phone,
        email,
        trade,
        experienceYears,
        coverageAreas,
        workshopAddress,
        bio,
      };
      const res = registerArtisan(draft);
      setAssignedRef(res.dossierId);
      setIsSubmitting(false);
      setStep(5);
    }, 800);
  };

  return (
    <PublicShell>
      <div className="sabi-verif-container">
        <div className="sabi-wizard-card">
          {/* Header */}
          <div className="sabi-wizard-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Screen S08 • Artisan Registration
                </span>
                <h1 className="text-xl font-bold text-on-surface">
                  Join SabiWork as a Verified Artisan
                </h1>
              </div>
              <span className="text-sm font-medium text-secondary">
                Step {step} of 5
              </span>
            </div>

            {/* Stepper progress */}
            <div className="sabi-wizard-stepper" aria-label="Registration steps">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`sabi-wizard-step-pill ${
                    s === step ? "active" : s < step ? "completed" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Body */}
          <div className="sabi-wizard-body">
            <div role="status" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Demo preview only. Do not enter real passwords or identity numbers. This screen does not create an account or securely submit identity evidence; authentication and upload services are pending.
            </div>
            {formError && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{formError}</span>
              </div>
            )}

            {/* STEP 1: Account & Contact */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Step 1: Account Credentials</h2>
                  <p className="text-sm text-secondary">
                    Create your login credentials and provide verified contact details for client callouts.
                  </p>
                </div>

                <div className="sabi-form-grid sabi-form-grid-2">
                  <div className="sabi-input-group">
                    <label htmlFor="artisan-name">Full Legal Name</label>
                    <input
                      id="artisan-name"
                      type="text"
                      placeholder="e.g. Osahon Victor Ighodaro"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="sabi-input-group">
                    <label htmlFor="artisan-phone">Benin City Phone Number</label>
                    <input
                      id="artisan-phone"
                      type="tel"
                      placeholder="+234 803 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sabi-form-grid sabi-form-grid-2">
                  <div className="sabi-input-group">
                    <label htmlFor="artisan-email">Email Address</label>
                    <input
                      id="artisan-email"
                      type="email"
                      placeholder="artisan@sabiwork.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="sabi-input-group">
                    <label htmlFor="artisan-password">Secure Password</label>
                    <div className="relative">
                      <input
                        id="artisan-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-secondary hover:text-on-surface"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Trade & Coverage */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Step 2: Trade Specialization & Coverage</h2>
                  <p className="text-sm text-secondary">
                    Define your core trade competency and select which Benin City neighborhoods you serve.
                  </p>
                </div>

                <div className="sabi-form-grid sabi-form-grid-2">
                  <div className="sabi-input-group">
                    <label htmlFor="artisan-trade">Primary Trade Category</label>
                    <select
                      id="artisan-trade"
                      value={trade}
                      onChange={(e) => setTrade(e.target.value)}
                    >
                      {TRADES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sabi-input-group">
                    <label htmlFor="artisan-exp">Years of Hands-on Experience</label>
                    <input
                      id="artisan-exp"
                      type="number"
                      min={1}
                      max={45}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="sabi-input-group">
                  <label>Benin City Coverage Zones (Select all that apply)</label>
                  <div className="sabi-chip-grid mt-1">
                    {BENIN_LOCATIONS.map((loc) => {
                      const isSelected = coverageAreas.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          className={`sabi-chip-label ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleLocation(loc)}
                        >
                          <MapPin className="w-4 h-4 shrink-0 text-primary" />
                          <span>{loc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sabi-input-group">
                  <label htmlFor="artisan-workshop">Workshop or Operating Base Address</label>
                  <input
                    id="artisan-workshop"
                    type="text"
                    placeholder="e.g. 14 Boundary Road, GRA, Benin City"
                    value={workshopAddress}
                    onChange={(e) => setWorkshopAddress(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Identity & Portfolio */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Step 3: Identity & Trade Verification Evidence</h2>
                  <p className="text-sm text-secondary">
                    Submit your government-issued identity and workshop evidence for Edo desk officer vetting.
                  </p>
                </div>

                <div className="sabi-form-grid sabi-form-grid-2">
                  <div className="sabi-input-group">
                    <label htmlFor="artisan-nin">National Identity Number (NIN)</label>
                    <input
                      id="artisan-nin"
                      type="text"
                      placeholder="11-digit NIN (e.g. 67219840231)"
                      value={ninNumber}
                      onChange={(e) => setNinNumber(e.target.value)}
                    />
                  </div>

                  <div className="sabi-input-group">
                    <label>Trade Certificate / Union Membership (Optional)</label>
                    <div className="sabi-dropzone">
                      <FileText className="w-6 h-6 text-primary mx-auto mb-1" />
                      <span className="text-xs text-secondary block font-medium">
                        Demo preview only. Secure document upload is pending.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sabi-input-group">
                  <label htmlFor="artisan-bio">Professional Bio & Scope of Work</label>
                  <textarea
                    id="artisan-bio"
                    rows={4}
                    placeholder="Describe your apprenticeship, major projects completed in Edo State, and the tools you use..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Demo preview:</span> Physical inspection scheduling is not connected. A live verification process would need to explain any inspection before collecting an address.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Terms */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Step 4: Review Registration Details</h2>
                  <p className="text-sm text-secondary">
                    Review your application summary before sending it to the Edo Desk Verification Queue.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-secondary font-medium">Applicant Name</span>
                    <span className="font-semibold text-on-surface">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-secondary font-medium">Phone Number</span>
                    <span className="font-semibold text-on-surface">{phone}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-secondary font-medium">Email</span>
                    <span className="font-semibold text-on-surface">{email}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-secondary font-medium">Specialization</span>
                    <span className="font-semibold text-on-surface">{trade} ({experienceYears} yrs)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-secondary font-medium">Coverage Zones</span>
                    <span className="font-semibold text-on-surface">{coverageAreas.join(", ")}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-secondary font-medium">Workshop Base</span>
                    <span className="font-semibold text-on-surface">{workshopAddress}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-secondary font-medium">NIN Reference</span>
                    <span className="font-mono text-on-surface">Demo entry (not submitted)</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Demo disclosure:</span> Continue adds a temporary mock dossier for screen preview only. No account, secure submission, dashboard access, or persistence is created.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Success & Assigned Dossier */}
            {step === 5 && (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Demo application preview complete</h2>
                  <p className="text-secondary text-sm max-w-md mx-auto mt-2">
                    A temporary mock dossier was added to this browser session for preview. It has not been sent to a verification officer.
                  </p>
                </div>

                <div className="inline-block bg-slate-100 border border-slate-300 rounded-lg px-6 py-3">
                  <span className="text-xs text-secondary uppercase font-semibold block">Dossier Tracking Reference</span>
                  <span className="text-xl font-mono font-bold text-primary">{assignedRef}</span>
                </div>

                <div className="max-w-md mx-auto text-left bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 space-y-2">
                  <div className="font-bold text-sm">Next Steps for Verification:</div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Identity checks are not connected in this demo; do not provide a real NIN.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Workshop checks and applicant contact are not connected in this demo.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Badge decisions and public profile updates are not connected in this demo.</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/artisan" className="sabi-btn-primary">
                    <Briefcase className="w-4 h-4" /> Go to Artisan Workspace (S36)
                  </Link>
                  <Link href="/artisans" className="sabi-btn-secondary">
                    <User className="w-4 h-4" /> View Public Directory (S03)
                  </Link>
                </div>
              </div>
            )}

            {/* Wizard Navigation Actions (Steps 1-4) */}
            {step < 5 && (
              <div className="sabi-wizard-actions">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setStep((prev) => Math.max(prev - 1, 1));
                    }}
                    className="sabi-btn-secondary"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <Link href="/signup/customer" className="text-sm text-secondary hover:text-primary">
                    Looking for services instead? Customer Signup
                  </Link>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="sabi-btn-primary"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="sabi-btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Submit for Desk Vetting
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

// S42: Admin Verification Queue Screen
export function AdminVerificationQueueScreen() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const metrics = getDossierMetrics();
  const dossiers = getVerificationDossiers(filter);

  const filteredDossiers = dossiers.filter((d) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      d.fullName.toLowerCase().includes(term) ||
      d.trade.toLowerCase().includes(term) ||
      d.location.toLowerCase().includes(term) ||
      d.id.toLowerCase().includes(term)
    );
  });

  return (
    <WorkspaceShell role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Screen S42 • Desk Operations
              </span>
              <span className="sabi-status-pill approved">Demo queue</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface mt-1">Artisan Verification Queue</h1>
            <p className="text-sm text-secondary">
              Fictional sample dossiers for the verification workflow preview. No identity checks or admin access controls are connected.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const rows = [
                ["Dossier", "Applicant", "Trade", "Location", "Status", "Submitted"],
                ...filteredDossiers.map((item) => [item.id, item.fullName, item.trade, item.location, item.status, item.submittedAt]),
              ];
              const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
              const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
              const link = document.createElement("a");
              link.href = url;
              link.download = "sabiwork-demo-verification-queue.csv";
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="sabi-btn-secondary"
          >
            <Download className="w-4 h-4" /> Download demo queue CSV
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="sabi-metrics-grid">
          <div className="sabi-metric-card">
            <span className="text-xs font-semibold text-secondary uppercase">Pending Reviews</span>
            <div className="sabi-metric-val text-amber-600">{metrics.pending}</div>
            <div className="sabi-metric-sub">Requires desk officer examination</div>
          </div>
          <div className="sabi-metric-card">
            <span className="text-xs font-semibold text-secondary uppercase">Demo approvals</span>
            <div className="sabi-metric-val text-emerald-600">{metrics.approved}</div>
            <div className="sabi-metric-sub">Mock status only; no verification completed</div>
          </div>
          <div className="sabi-metric-card">
            <span className="text-xs font-semibold text-secondary uppercase">Determinations Rejected</span>
            <div className="sabi-metric-val text-red-600">{metrics.rejected}</div>
            <div className="sabi-metric-sub">Needs document revision or re-inspection</div>
          </div>
          <div className="sabi-metric-card">
            <span className="text-xs font-semibold text-secondary uppercase">Average SLA Turnaround</span>
            <div className="sabi-metric-val text-primary">{metrics.averageTurnaroundHours} hrs</div>
            <div className="sabi-metric-sub">Illustrative demo value; not a live service measure</div>
          </div>
        </div>

        {/* Controls Bar: Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-outline-variant">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                filter === "all" ? "bg-primary text-white" : "bg-slate-100 text-secondary hover:bg-slate-200"
              }`}
            >
              All ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                filter === "pending" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Pending ({metrics.pending})
            </button>
            <button
              type="button"
              onClick={() => setFilter("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                filter === "approved" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              Approved ({metrics.approved})
            </button>
            <button
              type="button"
              onClick={() => setFilter("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                filter === "rejected" ? "bg-red-600 text-white" : "bg-red-50 text-red-800 hover:bg-red-100"
              }`}
            >
              Rejected ({metrics.rejected})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Filter by name, trade or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs py-2 px-3 pl-8 rounded-lg border border-outline-variant bg-slate-50 focus:bg-white"
            />
            <Filter className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Dossiers Table */}
        <div className="sabi-dossier-table-wrapper">
          <table className="sabi-dossier-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Trade & Competency</th>
                <th>Benin City Base</th>
                <th>Evidence Items</th>
                <th>Submission (WAT)</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDossiers.map((dossier) => (
                <tr key={dossier.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-primary text-xs">
                        {dossier.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{dossier.fullName}</div>
                        <div className="text-xs font-mono text-secondary">{dossier.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-on-surface">{dossier.trade}</div>
                    <div className="text-xs text-secondary">{dossier.experienceYears} years experience</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-xs text-on-surface font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{dossier.location}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-xs text-secondary">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{dossier.documents.length} verified items</span>
                    </div>
                  </td>
                  <td className="text-xs text-secondary whitespace-nowrap">
                    {new Date(dossier.submittedAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span className={`sabi-status-pill ${dossier.status}`}>
                      {dossier.status === "approved" && <Award className="w-3 h-3" />}
                      {dossier.status === "pending" && <Clock className="w-3 h-3" />}
                      {dossier.status === "rejected" && <AlertCircle className="w-3 h-3" />}
                      {dossier.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/verification/${dossier.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-[#004e73] transition-colors"
                    >
                      <span>Inspect Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredDossiers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-secondary">
                    <div className="max-w-sm mx-auto space-y-2">
                      <ShieldCheck className="w-8 h-8 text-secondary mx-auto" />
                      <div className="font-semibold text-on-surface">No dossiers match current filter criteria</div>
                      <p className="text-xs">Adjust your search term or tab filter above to review active records.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </WorkspaceShell>
  );
}

// S43: Admin Dossier Verification & Review Screen
export function AdminDossierReviewScreen({ id }: { id: string }) {
  const [dossier, setDossier] = useState<VerificationDossier | undefined>(() =>
    getVerificationDossier(id)
  );
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [officerNote, setOfficerNote] = useState("");
  const [rejectionChecklist, setRejectionChecklist] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!dossier) {
    return (
      <WorkspaceShell role="admin">
        <div className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold">Dossier Not Found</h2>
          <p className="text-sm text-secondary mt-1">Dossier reference {id} could not be located.</p>
          <Link href="/admin/verification" className="sabi-btn-secondary mt-4">
            Return to Queue
          </Link>
        </div>
      </WorkspaceShell>
    );
  }

  const toggleRejectReason = (reason: string) => {
    if (rejectionChecklist.includes(reason)) {
      setRejectionChecklist(rejectionChecklist.filter((r) => r !== reason));
    } else {
      setRejectionChecklist([...rejectionChecklist, reason]);
    }
  };

  const handleApprove = () => {
    const res = approveDossier(dossier.id, officerNote || "Demo review decision.");
    if (res.success && res.dossier) {
      setDossier(res.dossier);
      setIsApproveOpen(false);
      setMessage({ type: "success", text: `Demo only: approval recorded for ${dossier.fullName}. No official status or badge was issued.` });
    }
  };

  const handleReject = () => {
    if (rejectionChecklist.length === 0) {
      alert("Please select at least one adverse determination reason.");
      return;
    }
    const res = rejectDossier(dossier.id, rejectionChecklist, officerNote);
    if (res.success && res.dossier) {
      setDossier(res.dossier);
      setIsRejectOpen(false);
      setMessage({ type: "error", text: `Demo only: dossier ${dossier.id} marked rejected. No applicant notification was sent.` });
    }
  };

  return (
    <WorkspaceShell role="admin">
      <div className="space-y-6">
        <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Demo review only. This route has no authentication or admin access enforcement; decisions change temporary mock data only.
        </div>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Link href="/admin/verification" className="hover:text-primary">
            Verification Queue (S42)
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-on-surface">Dossier {dossier.id}</span>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg flex items-center justify-between text-sm ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <span>{message.text}</span>
            <button type="button" onClick={() => setMessage(null)} className="text-secondary hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dossier Header Card */}
        <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xl text-primary shrink-0">
                {dossier.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-on-surface">{dossier.fullName}</h1>
                  <span className={`sabi-status-pill ${dossier.status}`}>
                    {dossier.status === "approved" && <Award className="w-3.5 h-3.5" />}
                    {dossier.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-medium text-secondary">{dossier.trade}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-secondary mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {dossier.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" /> {dossier.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {dossier.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {dossier.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => setIsApproveOpen(true)}
                  className="sabi-btn-primary"
                >
                  <Award className="w-4 h-4" /> Simulate approval
                </button>
              )}
              {dossier.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(true)}
                  className="sabi-btn-danger"
                >
                  <AlertCircle className="w-4 h-4" /> Request Revision / Reject
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dossier Grid Layout */}
        <div className="sabi-dossier-grid">
          {/* Left Column: Evidence & Documents */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-on-surface mb-1">
                Uploaded Evidence Dossier ({dossier.documents.length} Specimens)
              </h2>
              <p className="text-xs text-secondary mb-4">
                Verify each submitted document against NIMC national identity and Edo State commercial registries.
              </p>

              <div className="space-y-4">
                {dossier.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`sabi-evidence-card ${doc.verified ? "verified" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-bold text-on-surface">{doc.label}</h3>
                          {doc.verified && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              VERIFIED
                            </span>
                          )}
                        </div>
                        {doc.identifier && (
                          <div className="text-xs font-mono text-secondary">{doc.identifier}</div>
                        )}
                        {doc.notes && (
                          <div className="text-xs text-secondary italic">{doc.notes}</div>
                        )}
                      </div>

                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
                      >
                        <span>View Document</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Declared Competencies */}
            <div className="bg-white border border-outline-variant rounded-xl p-5">
              <h2 className="text-base font-bold text-on-surface mb-2">Declared Competencies & Trade Testing</h2>
              <div className="space-y-2">
                {dossier.competencies.map((comp, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-on-surface">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Workshop & Audit History */}
          <div className="space-y-6">
            <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
              <h2 className="text-base font-bold text-on-surface">Physical Workshop Inspection</h2>
              <div className="text-xs space-y-2 text-secondary">
                <div>
                  <span className="font-semibold text-on-surface block">Declared Workshop Address:</span>
                  <span>{dossier.workshopAddress}</span>
                </div>
                <div>
                  <span className="font-semibold text-on-surface block">Verification Protocol:</span>
                  <span>Physical visit or high-resolution geotagged workshop frontage required for SabiWork badge.</span>
                </div>
              </div>
            </div>

            {/* Submission History / Audit Trail */}
            <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
              <h2 className="text-base font-bold text-on-surface">Audit History & Trail</h2>
              <div className="space-y-3 text-xs">
                <div className="border-l-2 border-primary pl-3 py-1">
                  <div className="font-semibold text-on-surface">Application Submitted</div>
                  <div className="text-secondary">
                    {new Date(dossier.submittedAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {dossier.decidedAt && (
                  <div className="border-l-2 border-emerald-500 pl-3 py-1">
                    <div className="font-semibold text-on-surface">Determination Decided</div>
                    <div className="text-secondary">
                      {new Date(dossier.decidedAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    {dossier.reviewerNotes && (
                      <div className="mt-1 text-slate-700 bg-slate-50 p-2 rounded">
                        Note: {dossier.reviewerNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Approve Modal */}
        {isApproveOpen && (
          <div className="sabi-modal-overlay">
            <div className="sabi-modal">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-bold text-base text-on-surface">Simulate demo approval</h3>
                <button type="button" onClick={() => setIsApproveOpen(false)}>
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>
              <div className="py-4 space-y-3 text-sm text-secondary">
                <p>
                  This changes mock data in this browser session only. No official verification status or badge will be issued for <strong className="text-on-surface">{dossier.fullName}</strong>.
                </p>
                <div className="sabi-input-group">
                  <label htmlFor="officer-notes">Demo review notes (in-memory only)</label>
                  <textarea
                    id="officer-notes"
                    rows={3}
                    placeholder="e.g. NIMC slip validated via portal. Workshop at Boundary Road verified."
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsApproveOpen(false)} className="sabi-btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleApprove} className="sabi-btn-primary">
                  <Award className="w-4 h-4" /> Save demo decision
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {isRejectOpen && (
          <div className="sabi-modal-overlay">
            <div className="sabi-modal">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-bold text-base text-red-600">Adverse Determination / Request Revision</h3>
                <button type="button" onClick={() => setIsRejectOpen(false)}>
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>
              <div className="py-4 space-y-3 text-sm text-secondary">
                <p>Select all grounds that apply for rejecting or requesting revision:</p>
                <div className="space-y-2">
                  {[
                    "Illegible or low-resolution NIN identity document",
                    "Workshop address proof does not match declared Benin City location",
                    "Expired or unverifiable trade certification credentials",
                    "Failed telephone verification interview",
                  ].map((reason) => (
                    <label key={reason} className="flex items-start gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rejectionChecklist.includes(reason)}
                        onChange={() => toggleRejectReason(reason)}
                        className="mt-0.5"
                      />
                      <span className="text-on-surface">{reason}</span>
                    </label>
                  ))}
                </div>
                <div className="sabi-input-group mt-3">
                  <label htmlFor="reject-notes">Instructions for Applicant</label>
                  <textarea
                    id="reject-notes"
                    rows={3}
                    placeholder="Detail specific corrections required before re-submitting..."
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsRejectOpen(false)} className="sabi-btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleReject} className="sabi-btn-danger">
                  <AlertCircle className="w-4 h-4" /> Reject Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
