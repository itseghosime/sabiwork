"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Award,
  Clock,
  ChevronRight,
  ArrowRight,
  Printer,
  ShieldCheck,
  AlertCircle,
  Filter,
  Sparkles,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { WorkspaceShell } from "@/components/workspace-shell";
import {
  type TrainingModule,
  getTrainingModules,
  getTrainingModule,
  getTrainingStats,
  completeModule,
  getModuleCertificate,
} from "./service";
import "./training.css";

// S44: Artisan Training & Master Guides Directory
export function TrainingDirectoryScreen() {
  const [category, setCategory] = useState<string>("all");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const stats = getTrainingStats();
  const modules = getTrainingModules(category, statusTab);

  const filteredModules = modules.filter((m) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(term) ||
      m.summary.toLowerCase().includes(term) ||
      m.topicsCovered.some((t) => t.toLowerCase().includes(term))
    );
  });

  return (
    <WorkspaceShell role="artisan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Screen S44 • Master Craftsman Academy
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Sample learning content
              </span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface mt-1">Artisan Training & Master Guides</h1>
            <p className="text-sm text-secondary">
              Sample guidance for client communication, work photos, safety, and future payment flows. No accreditation is issued by this prototype.
            </p>
          </div>

          <Link href="/artisan" className="sabi-btn-secondary">
            Return to Dashboard
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="sabi-training-stats-grid">
          <div className="sabi-training-stat-card">
            <span className="text-xs font-semibold text-secondary uppercase">Guides Completed</span>
            <div className="sabi-training-stat-val text-emerald-600">{stats.completedCount}</div>
            <div className="text-xs text-secondary mt-1">Sample certificates previewed</div>
          </div>
          <div className="sabi-training-stat-card">
            <span className="text-xs font-semibold text-secondary uppercase">In Progress</span>
            <div className="sabi-training-stat-val text-amber-600">{stats.inProgressCount}</div>
            <div className="text-xs text-secondary mt-1">Active learning modules</div>
          </div>
          <div className="sabi-training-stat-card">
            <span className="text-xs font-semibold text-secondary uppercase">Hours Learned</span>
            <div className="sabi-training-stat-val text-primary">{stats.totalHoursLearned} hrs</div>
            <div className="text-xs text-secondary mt-1">Cumulative hands-on study</div>
          </div>
          <div className="sabi-training-stat-card">
            <span className="text-xs font-semibold text-secondary uppercase">Credentials Earned</span>
            <div className="sabi-training-stat-val text-indigo-600">{stats.certificatesEarned}</div>
            <div className="text-xs text-secondary mt-1">Badges on public profile</div>
          </div>
        </div>

        {/* Filter Bar & Tabs */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`sabi-filter-pill ${category === "all" ? "active" : ""}`}
              >
                All Topics
              </button>
              <button
                type="button"
                onClick={() => setCategory("customer")}
                className={`sabi-filter-pill ${category === "customer" ? "active" : ""}`}
              >
                Customer Relations
              </button>
              <button
                type="button"
                onClick={() => setCategory("safety")}
                className={`sabi-filter-pill ${category === "safety" ? "active" : ""}`}
              >
                Site Safety
              </button>
              <button
                type="button"
                onClick={() => setCategory("escrow")}
                className={`sabi-filter-pill ${category === "escrow" ? "active" : ""}`}
              >
                Quotes & Escrow
              </button>
              <button
                type="button"
                onClick={() => setCategory("proofs")}
                className={`sabi-filter-pill ${category === "proofs" ? "active" : ""}`}
              >
                Technical Proofs
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="Search master guides..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs py-2 px-3 pl-8 rounded-lg border border-outline-variant bg-slate-50 focus:bg-white"
              />
              <Filter className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-outline-variant pb-2 text-xs">
            <button
              type="button"
              onClick={() => setStatusTab("all")}
              className={`font-semibold pb-1 px-2 border-b-2 transition-colors ${
                statusTab === "all" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-black"
              }`}
            >
              All Guides ({stats.completedCount + stats.inProgressCount + stats.availableCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("in_progress")}
              className={`font-semibold pb-1 px-2 border-b-2 transition-colors ${
                statusTab === "in_progress" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-black"
              }`}
            >
              In Progress ({stats.inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("completed")}
              className={`font-semibold pb-1 px-2 border-b-2 transition-colors ${
                statusTab === "completed" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-black"
              }`}
            >
              Completed Archive ({stats.completedCount})
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="sabi-module-grid">
          {filteredModules.map((mod) => (
            <div key={mod.id} className="sabi-module-card">
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {mod.category.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-secondary font-medium">
                      <Clock className="w-3 h-3" /> {mod.durationMinutes} mins
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-on-surface line-clamp-2">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-secondary mt-2 line-clamp-3">
                    {mod.summary}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-secondary mb-1">
                    <span>Progress</span>
                    <span className="font-bold text-on-surface">{mod.progress}%</span>
                  </div>
                  <div className="sabi-module-progress-bar">
                    <div
                      className="sabi-module-progress-fill"
                      style={{ width: `${mod.progress}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    {mod.status === "completed" ? (
                      <Link
                        href={`/training/${mod.id}/certificate`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" /> View Certificate (S46)
                      </Link>
                    ) : (
                      <Link
                        href={`/training/${mod.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        {mod.status === "in_progress" ? "Resume Guide (S45)" : "Start Guide"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <span className="text-[11px] font-medium text-slate-400">
                      {mod.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredModules.length === 0 && (
            <div className="col-span-full py-12 text-center text-secondary bg-white rounded-xl border border-outline-variant">
              <BookOpen className="w-10 h-10 mx-auto text-secondary mb-2" />
              <h3 className="font-bold text-on-surface">No guides match filter criteria</h3>
              <p className="text-xs mt-1">Try switching to &ldquo;All Topics&rdquo; or clearing your search query.</p>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}

// S45: Artisan Guide Reader & Module Completion Screen
export function GuideReaderScreen({ id }: { id: string }) {
  const router = useRouter();
  const [mod] = useState<TrainingModule | undefined>(() =>
    getTrainingModule(id) || getTrainingModules()[0]
  );
  const [checkedTakeaways, setCheckedTakeaways] = useState<number[]>([0, 1]);
  const [isCompleting, setIsCompleting] = useState(false);

  if (!mod) {
    return (
      <WorkspaceShell role="artisan">
        <div className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold">Training Guide Not Found</h2>
          <p className="text-sm text-secondary mt-1">Module reference {id} could not be located.</p>
          <Link href="/training" className="sabi-btn-secondary mt-4">
            Return to Training Directory
          </Link>
        </div>
      </WorkspaceShell>
    );
  }

  const toggleTakeaway = (index: number) => {
    if (checkedTakeaways.includes(index)) {
      setCheckedTakeaways(checkedTakeaways.filter((i) => i !== index));
    } else {
      setCheckedTakeaways([...checkedTakeaways, index]);
    }
  };

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      completeModule(mod.id);
      setIsCompleting(false);
      router.push(`/training/${mod.id}/certificate`);
    }, 900);
  };

  return (
    <WorkspaceShell role="artisan">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Link href="/training" className="hover:text-primary">
            Master Guides Directory (S44)
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-on-surface">{mod.id}</span>
        </div>

        {/* Reader Layout */}
        <div className="sabi-reader-layout">
          {/* Main Article Content */}
          <div className="space-y-6">
            <article className="sabi-reader-article space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Screen S45 • Active Study Guide
                  </span>
                  <span className="text-xs font-semibold text-secondary">
                    • {mod.durationMinutes} min read
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                  {mod.title}
                </h1>
                <p className="text-sm text-secondary mt-2">
                  Published by {mod.author} for Edo State Registered Artisans.
                </p>
              </div>

              {/* Sections */}
              {mod.sections.map((sec, idx) => (
                <div key={idx} className="space-y-4 pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-bold text-on-surface">
                    {idx + 1}. {sec.sectionTitle}
                  </h2>
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm leading-relaxed text-slate-700">
                      {p}
                    </p>
                  ))}
                  {sec.proTip && (
                    <div className="sabi-pro-tip-box">
                      <span className="font-bold block mb-1">Local Practice Advice:</span>
                      {sec.proTip}
                    </div>
                  )}
                </div>
              ))}

              {/* Interactive Checklist: 4 Core Takeaways */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-base text-on-surface">
                    4 Core Takeaways for Every Callout
                  </h3>
                </div>
                <p className="text-xs text-secondary">
                Check each topic to preview a sample completion certificate.
                </p>

                <div className="space-y-2">
                  {mod.keyTakeaways.map((takeaway, i) => {
                    const isChecked = checkedTakeaways.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleTakeaway(i)}
                        className={`sabi-takeaway-item w-full text-left transition-colors cursor-pointer ${
                          isChecked ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isChecked ? "text-primary" : "text-slate-300"
                          }`}
                        />
                        <span className={`text-xs ${isChecked ? "font-semibold text-on-surface" : "text-slate-600"}`}>
                          {takeaway}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Completion Action */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-secondary">
                  Completed {checkedTakeaways.length} of {mod.keyTakeaways.length} key takeaways
                </div>

                <button
                  type="button"
                  disabled={isCompleting || checkedTakeaways.length < 2}
                  onClick={handleComplete}
                  className="sabi-btn-primary w-full sm:w-auto"
                >
                  {isCompleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Recording Completion...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" /> Mark as Complete & Continue (S46)
                    </>
                  )}
                </button>
              </div>
            </article>
          </div>

          {/* Sidebar / Quick Reference */}
          <div className="space-y-6">
            <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-on-surface">Module Topics Overview</h3>
              <div className="space-y-2">
                {mod.topicsCovered.map((topic, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-secondary">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-primary" /> Certificate preview
              </div>
              <p>
                Finishing this guide awards the verified course endorsement on your public artisan profile (S04) and unlocks higher matching priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

// S46: Module Completion & Certificate Screen
export function CertificateScreen({ id }: { id: string }) {
  const mod = getTrainingModule(id) || getTrainingModules()[0];
  const cert = mod.certificate || getModuleCertificate(id) || {
    id: "CERT-SABI-2026-781",
    moduleId: mod.id,
    moduleTitle: mod.title,
    holderName: "Sample learner",
    trade: "Electrical Installation & Solar Inverters",
    serialNumber: "EDO-SABI-COM-2026-0941",
    issuedAt: "2026-10-31T14:30:00Z",
    verificationHash: "sha256-e91b4028fa77610b2c140",
    accreditationBody: "Edo State Ministry of Wealth Creation & SabiWork Academy",
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <WorkspaceShell role="artisan">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Link href="/training" className="hover:text-primary">
            Master Guides (S44)
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/training/${mod.id}`} className="hover:text-primary">
            Guide Reader (S45)
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-on-surface">Certificate of Completion (S46)</span>
        </div>

        {/* Certificate Card Frame */}
        <div className="sabi-certificate-frame text-center">
          <div className="sabi-cert-watermark">SABI</div>

          <div className="relative z-10 space-y-6">
            <div className="sabi-cert-seal">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary">
                SabiWork Craftsman Academy • Edo State Accreditation
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-on-surface mt-2">
                Certificate of Course Completion
              </h1>
              <p className="text-xs text-secondary mt-1">
                Issued in accordance with Edo State Professional Artisan Practice Standards
              </p>
            </div>

            <div className="py-4">
              <span className="text-xs text-secondary uppercase tracking-wider block">This certifies that</span>
              <div className="text-2xl sm:text-3xl font-bold text-on-surface border-b-2 border-slate-300 inline-block px-8 py-2 mt-1">
                {cert.holderName}
              </div>
              <div className="text-xs font-semibold text-primary mt-2">
                {cert.trade} • Benin City Chapter
              </div>
            </div>

            <div className="max-w-lg mx-auto text-sm text-slate-700 leading-relaxed">
              has satisfactorily completed the master training module and demonstrated professional competence in
              <div className="font-bold text-on-surface text-base mt-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                &ldquo;{cert.moduleTitle}&rdquo;
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs">
              <div>
                <span className="text-secondary block">Date of Accreditation</span>
                <span className="font-semibold text-on-surface">
                  {new Date(cert.issuedAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-secondary block">Credential Serial No.</span>
                <span className="font-mono font-bold text-primary">{cert.serialNumber}</span>
              </div>
              <div>
                <span className="text-secondary block">Accrediting Authority</span>
                <span className="font-semibold text-on-surface">{cert.accreditationBody}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={handlePrint}
            className="sabi-btn-primary w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" /> Print / Export Certificate (PDF)
          </button>

          <Link
            href="/artisan/profile"
            className="sabi-btn-secondary w-full sm:w-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> View on Profile (S06)
          </Link>

          <Link
            href="/training"
            className="sabi-btn-secondary w-full sm:w-auto"
          >
            <ArrowRight className="w-4 h-4" /> Next Recommended Module
          </Link>
        </div>
      </div>
    </WorkspaceShell>
  );
}
