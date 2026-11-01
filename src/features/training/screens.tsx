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
import { PrototypeNotice } from "@/components/prototype-notice";
import {
  type TrainingModule,
  getTrainingModules,
  getTrainingModule,
  getTrainingStats,
  previewModuleCompletion,
  getSampleCertificatePreview,
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
        <PrototypeNotice>
          Training content and progress are fictional local previews. No training is accredited and no certificate or profile credential is issued.
        </PrototypeNotice>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Sample Training Library
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Sample content
              </span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface mt-1">Artisan Training & Master Guides</h1>
            <p className="text-sm text-secondary">
              Explore sample content on client communication, jobsite photos, safety, and payment milestones.
            </p>
          </div>

          <Link href="/artisan" className="button button-outline">
            Return to Dashboard
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="sabi-training-stats-grid">
          <div className="sabi-training-stat-card">
            <span className="text-xs font-semibold text-secondary uppercase">Sample Guide States</span>
            <div className="sabi-training-stat-val text-emerald-600">{stats.completedCount}</div>
            <div className="text-xs text-secondary mt-1">Sample progress previews</div>
          </div>
          <div className="sabi-training-stat-card">
            <span className="text-xs font-semibold text-secondary uppercase">Sample In-Progress States</span>
            <div className="sabi-training-stat-val text-amber-600">{stats.inProgressCount}</div>
            <div className="text-xs text-secondary mt-1">Active learning modules</div>
          </div>
          <div className="sabi-training-stat-card">
            <span className="text-xs font-semibold text-secondary uppercase">Illustrative Study Time</span>
            <div className="sabi-training-stat-val text-primary">{stats.totalHoursLearned} hrs</div>
            <div className="text-xs text-secondary mt-1">Cumulative hands-on study</div>
          </div>
          <div className="sabi-training-stat-card">
            <span className="text-xs font-semibold text-secondary uppercase">Sample Certificate Previews</span>
            <div className="sabi-training-stat-val text-indigo-600">{stats.sampleCertificatePreviews}</div>
            <div className="text-xs text-secondary mt-1">Not issued or added to profiles</div>
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
              Sample Completed States ({stats.completedCount})
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
                        <Award className="w-3.5 h-3.5" /> View Certificate Status
                      </Link>
                    ) : (
                      <Link
                        href={`/training/${mod.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        {mod.status === "in_progress" ? "Resume Guide" : "Start Guide"}
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
          <Link href="/training" className="button button-outline mt-4">
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
      previewModuleCompletion(mod.id);
      setIsCompleting(false);
      router.push(`/training/${mod.id}/certificate`);
    }, 900);
  };

  return (
    <WorkspaceShell role="artisan">
      <div className="space-y-6">
        <PrototypeNotice>
          This guide is sample content. Checklist progress stays in this page preview; it does not certify training or trigger payment, escrow, or dispute actions.
        </PrototypeNotice>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Link href="/training" className="hover:text-primary">
            Master Guides Directory
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
                    Active Study Guide
                  </span>
                  <span className="text-xs font-semibold text-secondary">
                    • {mod.durationMinutes} min read
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                  {mod.title}
                </h1>
                <p className="text-sm text-secondary mt-2">
                  Sample learning content by {mod.author}.
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
                  Check each sample takeaway to preview the local checklist interaction.
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
                  className="button button-primary w-full sm:w-auto"
                >
                  {isCompleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Recording Completion...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" /> Mark as Complete & Continue
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
                <FileCheck className="w-4 h-4 text-primary" /> Completion Preview
              </div>
              <p>
                Completing this guide only previews a local sample state. It does not issue a certificate, verify skills, or change profile visibility or matching.
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
  const cert = mod.certificatePreview || getSampleCertificatePreview(id) || {
    id: "SAMPLE-CERTIFICATE-NOT-ISSUED",
    moduleId: mod.id,
    moduleTitle: mod.title,
    holderName: "Sample Artisan",
    trade: "Sample trade",
    serialNumber: "NOT ISSUED - SAMPLE",
    issuedAt: "",
    verificationHash: "NOT VERIFIABLE - SAMPLE",
    accreditationBody: "None; no accreditation or credential is issued",
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <WorkspaceShell role="artisan">
      <div className="space-y-6">
        <PrototypeNotice>
          Sample certificate layout only. No course, skill, identity, accreditation, or credential has been verified or issued.
        </PrototypeNotice>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Link href="/training" className="hover:text-primary">
            Master Guides
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/training/${mod.id}`} className="hover:text-primary">
            Guide Reader
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-on-surface">Certificate Preview</span>
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
                SabiWork • Sample Preview
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-on-surface mt-2">
                Sample Certificate Preview — Not Issued
              </h1>
              <p className="text-xs text-secondary mt-1">
                This preview does not certify training or professional competence.
              </p>
            </div>

            <div className="py-4">
              <span className="text-xs text-secondary uppercase tracking-wider block">Illustrative sample for</span>
              <div className="text-2xl sm:text-3xl font-bold text-on-surface border-b-2 border-slate-300 inline-block px-8 py-2 mt-1">
                {cert.holderName}
              </div>
              <div className="text-xs font-semibold text-primary mt-2">
                {cert.trade} • Sample preview
              </div>
            </div>

            <div className="max-w-lg mx-auto text-sm text-slate-700 leading-relaxed">
              This sample does not confirm module completion or demonstrated competence in
              <div className="font-bold text-on-surface text-base mt-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                &ldquo;{cert.moduleTitle}&rdquo;
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs">
              <div>
                <span className="text-secondary block">Issue status</span>
                <span className="font-semibold text-on-surface">Not issued</span>
              </div>
              <div>
                <span className="text-secondary block">Sample reference</span>
                <span className="font-mono font-bold text-primary">{cert.serialNumber}</span>
              </div>
              <div>
                <span className="text-secondary block">Accreditation status</span>
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
            className="button button-primary w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" /> Print / Export Sample Preview
          </button>

          <Link
            href="/artisan/profile"
            className="button button-outline w-full sm:w-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Open Sample Profile Preview
          </Link>

          <Link
            href="/training"
            className="button button-outline w-full sm:w-auto"
          >
            <ArrowRight className="w-4 h-4" /> Next Recommended Module
          </Link>
        </div>
      </div>
    </WorkspaceShell>
  );
}
