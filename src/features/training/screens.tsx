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
  const [activeTab, setActiveTab] = useState<"details" | "content" | "competencies" | "discussion">("details");
  const [chartYear, setChartYear] = useState<string>("2026");
  const [hoveredBar, setHoveredBar] = useState<number>(6);

  const monthlyStats = [
    { month: "Jan", barHeight: 28, participance: 12, avgTime: "2.1h", avgScore: "4.5" },
    { month: "Feb", barHeight: 38, participance: 14, avgTime: "2.4h", avgScore: "4.6" },
    { month: "Mar", barHeight: 20, participance: 9, avgTime: "1.8h", avgScore: "4.3" },
    { month: "Apr", barHeight: 65, participance: 18, avgTime: "3.1h", avgScore: "4.7" },
    { month: "May", barHeight: 48, participance: 15, avgTime: "2.6h", avgScore: "4.5" },
    { month: "Jun", barHeight: 70, participance: 19, avgTime: "3.25h", avgScore: "4.8" },
    { month: "Jul", barHeight: 90, participance: 24, avgTime: "3.5h", avgScore: "4.9" },
    { month: "Aug", barHeight: 82, participance: 22, avgTime: "3.4h", avgScore: "4.8" },
    { month: "Sep", barHeight: 52, participance: 16, avgTime: "2.8h", avgScore: "4.6" },
    { month: "Oct", barHeight: 35, participance: 11, avgTime: "2.0h", avgScore: "4.4" },
    { month: "Nov", barHeight: 25, participance: 8, avgTime: "1.9h", avgScore: "4.2" },
    { month: "Dec", barHeight: 40, participance: 13, avgTime: "2.5h", avgScore: "4.5" },
  ];

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
        {/* Growly LMS Breadcrumbs Bar (Image 1) */}
        <div className="lms-breadcrumbs-bar">
          <div className="lms-breadcrumbs">
            <Link href="/training">Education</Link>
            <span className="lms-breadcrumbs-sep">›</span>
            <Link href="/training">Courses</Link>
            <span className="lms-breadcrumbs-sep">›</span>
            <span className="lms-breadcrumbs-current">{mod.title}</span>
          </div>
          <div className="lms-top-actions">
            <button
              type="button"
              className="lms-action-btn"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: mod.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Course link copied to clipboard!");
                }
              }}
            >
              <ArrowRight className="w-3.5 h-3.5" style={{ transform: "rotate(-45deg)" }} />
              Share
            </button>
            <button type="button" className="lms-action-btn" title="More options">
              •••
            </button>
          </div>
        </div>

        {/* Growly LMS Electric Blue Hero Banner (Image 1) */}
        <div className="lms-hero-banner">
          <div className="lms-hero-left">
            <h1 className="lms-hero-title">{mod.title}</h1>
            <div className="lms-hero-tags">
              <span className="lms-tag-pill">Active Study Guide</span>
              <span className="lms-tag-pill">SabiWork Guild</span>
              <span className="lms-tag-pill">Lectures</span>
              <span className="lms-tag-pill">Checklists</span>
              <span className="lms-tag-pill">Guild Certificate</span>
              <span className="lms-rating-pill">
                <span>WAT Lagos</span> · <span>★ 4.8</span>
              </span>
            </div>
          </div>
          <div className="lms-hero-pills-col">
            <div className="lms-frosted-item">
              <span className="lms-bullet-dot" />
              <span>Jobsite Arrival Protocols</span>
            </div>
            <div className="lms-frosted-item">
              <span className="lms-bullet-dot" />
              <span>Clear Cost Disclosures</span>
            </div>
            <div className="lms-frosted-item">
              <span className="lms-bullet-dot" />
              <span>Dispute Pre-emption</span>
            </div>
            <div className="lms-frosted-item">
              <span className="lms-bullet-dot" />
              <span>Milestone Signoff</span>
            </div>
          </div>
        </div>

        {/* Description Section with Read More Toggle */}
        <div className="lms-description-section">
          <h2 className="lms-section-title">Description</h2>
          <p className="lms-description-text">
            {mod.summary}
          </p>
        </div>

        {/* Segmented Tabs Bar (Image 1) */}
        <div className="lms-tabs-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "details"}
            className={`lms-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "content"}
            className={`lms-tab-btn ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            Content & Lessons ({mod.sections.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "competencies"}
            className={`lms-tab-btn ${activeTab === "competencies" ? "active" : ""}`}
            onClick={() => setActiveTab("competencies")}
          >
            Competency Radar & Stats
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "discussion"}
            className={`lms-tab-btn ${activeTab === "discussion" ? "active" : ""}`}
            onClick={() => setActiveTab("discussion")}
          >
            Discussion (14)
          </button>
        </div>

        {/* Tab 1: DETAILS TAB (Image 1 Two-Column Grid) */}
        {activeTab === "details" && (
          <div className="lms-grid-layout">
            {/* Left Column: Details & Team Members */}
            <div className="space-y-6">
              <div className="lms-card">
                <div className="lms-card-header">
                  <h3>Details</h3>
                </div>
                <div className="lms-details-grid">
                  <div className="lms-detail-item">
                    <BookOpen className="lms-detail-icon" />
                    <span>{mod.sections.length} core sections & 4 key takeaways</span>
                  </div>
                  <div className="lms-detail-item">
                    <Award className="lms-detail-icon" />
                    <span>Includes sample certificate of completion</span>
                  </div>
                  <div className="lms-detail-item">
                    <Clock className="lms-detail-icon" />
                    <span>{mod.durationMinutes} minutes estimated study</span>
                  </div>
                  <div className="lms-detail-item">
                    <FileCheck className="lms-detail-icon" />
                    <span>Workplace guidelines + checklist exercises</span>
                  </div>
                  <div className="lms-detail-item">
                    <CheckCircle2 className="lms-detail-icon" />
                    <span>Self-paced / No strict due date</span>
                  </div>
                  <div className="lms-detail-item">
                    <Sparkles className="lms-detail-icon" />
                    <span>Field exercises & customer signoff rehearsals</span>
                  </div>
                </div>

                {/* Team Members Section */}
                <div className="lms-team-section">
                  <div className="lms-team-header">
                    <h4>Guild Mentors & Reviewers</h4>
                    <button type="button" className="lms-add-member-btn" title="Add study partner">
                      +
                    </button>
                  </div>
                  <div className="lms-team-grid">
                    <div className="lms-member-card">
                      <div className="lms-member-avatar">SW</div>
                      <div className="lms-member-info">
                        <div className="lms-member-name-row">
                          <span className="lms-member-name">Sam Wilson</span>
                          <span className="lms-role-badge mentor">Mentor</span>
                        </div>
                        <span className="lms-member-title">Master Craftsman Lead</span>
                      </div>
                    </div>

                    <div className="lms-member-card">
                      <div className="lms-member-avatar">EC</div>
                      <div className="lms-member-info">
                        <div className="lms-member-name-row">
                          <span className="lms-member-name">Emily Carter</span>
                          <span className="lms-role-badge teacher">Teacher</span>
                        </div>
                        <span className="lms-member-title">Safety & Site Protocol Specialist</span>
                      </div>
                    </div>

                    <div className="lms-member-card">
                      <div className="lms-member-avatar">JT</div>
                      <div className="lms-member-info">
                        <div className="lms-member-name-row">
                          <span className="lms-member-name">Jake Thompson</span>
                          <span className="lms-role-badge teacher">Teacher</span>
                        </div>
                        <span className="lms-member-title">Senior Trade Auditor</span>
                      </div>
                    </div>

                    <div className="lms-member-card">
                      <div className="lms-member-avatar">MC</div>
                      <div className="lms-member-info">
                        <div className="lms-member-name-row">
                          <span className="lms-member-name">Monica Cooper</span>
                          <span className="lms-role-badge admin">Admin</span>
                        </div>
                        <span className="lms-member-title">Guild Standards Lead</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Core Takeaways in Details View */}
                <div className="pt-6 mt-6 border-t border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-base text-on-surface">
                      4 Core Takeaways for Every Callout
                    </h4>
                  </div>
                  <p className="text-xs text-secondary">
                    Review and check off each takeaway to record your local practice checklist.
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

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                </div>
              </div>

              {/* Quick Start Action Card */}
              <div className="lms-card flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-bold text-slate-900">Curriculum Lessons</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Read the in-depth chapter notes and field practice advice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className="button button-outline"
                >
                  View All Lessons ({mod.sections.length}) <ArrowRight className="w-4 h-4 ml-1 inline" />
                </button>
              </div>
            </div>

            {/* Right Column: Statistics Overview & Participant Assignment (Image 1) */}
            <div className="space-y-6">
              {/* Statistics Overview Card */}
              <div className="lms-stats-card">
                <div className="lms-stats-header">
                  <h3 className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    Statistics Overview
                    <span className="lms-info-icon" title="Aggregated study activity across artisans">ⓘ</span>
                  </h3>
                  <select
                    className="lms-year-select"
                    value={chartYear}
                    onChange={(e) => setChartYear(e.target.value)}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>

                {/* Interactive Bar Chart */}
                <div className="lms-chart-container">
                  {monthlyStats.map((item, idx) => {
                    const isActive = hoveredBar === idx;
                    return (
                      <div
                        key={idx}
                        className={`lms-chart-bar-col ${isActive ? "active" : ""}`}
                        onMouseEnter={() => setHoveredBar(idx)}
                        onMouseLeave={() => setHoveredBar(6)}
                      >
                        <div
                          className="lms-chart-bar"
                          style={{ height: `${item.barHeight}%` }}
                        />
                        <span className="lms-chart-label">{item.month}</span>
                      </div>
                    );
                  })}

                  {/* Tooltip Pill */}
                  <div className="lms-chart-tooltip">
                    <div className="lms-tooltip-row">
                      <span className="lms-tooltip-label">Participance</span>
                      <span className="lms-tooltip-val">{monthlyStats[hoveredBar].participance}</span>
                    </div>
                    <div className="lms-tooltip-row">
                      <span className="lms-tooltip-label">Avg. Time</span>
                      <span className="lms-tooltip-val">{monthlyStats[hoveredBar].avgTime}</span>
                    </div>
                    <div className="lms-tooltip-row">
                      <span className="lms-tooltip-label">Avg. Score</span>
                      <span className="lms-tooltip-val">{monthlyStats[hoveredBar].avgScore}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom 3 Summary Metrics */}
                <div className="lms-stats-metrics-row">
                  <div>
                    <div className="lms-stat-metric-val">3.25h</div>
                    <div className="lms-stat-metric-lbl">Avg. Time</div>
                  </div>
                  <div>
                    <div className="lms-stat-metric-val">4.4</div>
                    <div className="lms-stat-metric-lbl">Avg. Score</div>
                  </div>
                  <div>
                    <div className="lms-stat-metric-val">132</div>
                    <div className="lms-stat-metric-lbl">Participance</div>
                  </div>
                </div>
              </div>

              {/* Assign Participant / Peer Study Card (Image 1 Bottom Right) */}
              <div className="lms-assign-card">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    Assign new participant
                    <span className="lms-info-icon" title="Share guide with apprentices or workshop peers">ⓘ</span>
                  </h3>
                </div>

                <div className="lms-assign-search-box">
                  <div className="lms-token-input">
                    <span className="lms-token-chip">
                      <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-[9px] text-white flex items-center justify-center font-bold">A</span>
                      Adam Brown ✕
                    </span>
                  </div>
                  <button
                    type="button"
                    className="lms-invite-btn"
                    onClick={() => alert("Sample invitation sent to participant Adam Brown!")}
                  >
                    Invite
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-3">People on the course</h4>
                  <div className="lms-participants-list">
                    <div className="lms-participant-item">
                      <div className="lms-participant-left">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-sky-700">
                          OC
                        </div>
                        <div className="lms-participant-copy">
                          <span className="lms-participant-name">Oliver Cranston</span>
                          <span className="lms-participant-role">Middle Plumbing Artisan</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="lms-segmented-bar">
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                        </div>
                        <span className="lms-segment-pct">12%</span>
                      </div>
                    </div>

                    <div className="lms-participant-item">
                      <div className="lms-participant-left">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                          SG
                        </div>
                        <div className="lms-participant-copy">
                          <span className="lms-participant-name">Sara Green</span>
                          <span className="lms-participant-role">Electrical Wireman</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="lms-segmented-bar">
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                        </div>
                        <span className="lms-segment-pct">76%</span>
                      </div>
                    </div>

                    <div className="lms-participant-item">
                      <div className="lms-participant-left">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                          SW
                        </div>
                        <div className="lms-participant-copy">
                          <span className="lms-participant-name">Sam Wilson</span>
                          <span className="lms-participant-role">Carpentry Craftsman</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="lms-segmented-bar">
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit active" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                          <span className="lms-segment-unit" />
                        </div>
                        <span className="lms-segment-pct">32%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lms-assign-footer">
                  <button
                    type="button"
                    className="lms-footer-action"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied!");
                    }}
                  >
                    <span>🔗 Copy link</span>
                  </button>
                  <button type="button" className="lms-footer-action">
                    <span>👥 All participants</span>
                  </button>
                  <button type="button" className="lms-footer-action">
                    <span>⚙️ Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CONTENT & LESSONS */}
        {activeTab === "content" && (
          <div className="sabi-reader-layout">
            <div className="space-y-6">
              <article className="sabi-reader-article space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Curriculum Content
                    </span>
                    <span className="text-xs font-semibold text-secondary">
                      • {mod.durationMinutes} min read
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-on-surface">
                    {mod.title}
                  </h2>
                  <p className="text-sm text-secondary mt-2">
                    Curriculum authored by {mod.author}.
                  </p>
                </div>

                {/* Sections */}
                {mod.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-on-surface">
                      {idx + 1}. {sec.sectionTitle}
                    </h3>
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
                    Check each takeaway below to record your local practice checklist.
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
                        <Award className="w-4 h-4" /> Mark as Complete & View Certificate
                      </>
                    )}
                  </button>
                </div>
              </article>
            </div>

            {/* Curriculum Table of Contents */}
            <div className="space-y-6">
              <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-on-surface">Table of Contents</h3>
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
                  <FileCheck className="w-4 h-4 text-primary" /> Verification Standards
                </div>
                <p>
                  Training completion records are strictly sample educational previews and do not establish accredited guild licensing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: COMPETENCY RADAR & ARTISAN MASTERY (Image 3) */}
        {activeTab === "competencies" && (
          <div className="space-y-6">
            <div className="lms-profile-radar-grid">
              {/* Profile Card with Circular Progress Ring (Image 3) */}
              <div className="lms-profile-hero-card">
                <div className="lms-avatar-ring-container">
                  <svg className="lms-avatar-ring-svg" viewBox="0 0 108 108">
                    <circle
                      cx="54"
                      cy="54"
                      r="46"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="54"
                      cy="54"
                      r="46"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="6"
                      strokeDasharray="289"
                      strokeDashoffset="38"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="lms-avatar-img-circle">
                    <span>OC</span>
                  </div>
                </div>

                <h3 className="lms-profile-hero-name">Oliver Cranston</h3>
                <p className="lms-profile-hero-title">Middle Trade Craftsman</p>

                <div className="lms-profile-stats-trio">
                  <div className="lms-trio-item">
                    <span className="lms-trio-lbl">Technical Skills</span>
                    <span className="lms-trio-val">86%</span>
                  </div>
                  <div className="lms-trio-item">
                    <span className="lms-trio-lbl">Soft Skills</span>
                    <span className="lms-trio-val">92%</span>
                  </div>
                  <div className="lms-trio-item">
                    <span className="lms-trio-lbl">Experience</span>
                    <span className="lms-trio-val">8 years</span>
                  </div>
                </div>
              </div>

              {/* Multi-Axis Competency Radar Chart (Image 3) */}
              <div className="lms-radar-card">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    Competency Dimensions & Learning Time
                    <span className="lms-info-icon" title="Assessment of practical trade proficiencies">ⓘ</span>
                  </h3>
                  <div className="lms-radar-legend">
                    <span className="lms-legend-item">
                      <span className="lms-legend-color" style={{ background: "#10b981" }} />
                      <span>Achieved</span>
                    </span>
                    <span className="lms-legend-item">
                      <span className="lms-legend-color" style={{ background: "#f59e0b" }} />
                      <span>Progressing</span>
                    </span>
                    <span className="lms-legend-item">
                      <span className="lms-legend-color" style={{ background: "#0ea5e9" }} />
                      <span>Want Learn</span>
                    </span>
                  </div>
                </div>

                {/* SVG Polygon Radar Chart */}
                <div className="flex items-center justify-center p-4">
                  <svg viewBox="0 0 320 280" className="w-full max-w-[360px] h-auto">
                    {/* Concentric Polygons */}
                    {[1, 0.75, 0.5, 0.25].map((scale, i) => (
                      <polygon
                        key={i}
                        points="160,30 265,75 265,195 160,240 55,195 55,75"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        transform={`translate(${160 * (1 - scale)}, ${135 * (1 - scale)}) scale(${scale})`}
                      />
                    ))}

                    {/* Dimension Axes */}
                    <line x1="160" y1="135" x2="160" y2="30" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="160" y1="135" x2="265" y2="75" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="160" y1="135" x2="265" y2="195" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="160" y1="135" x2="160" y2="240" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="160" y1="135" x2="55" y2="195" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="160" y1="135" x2="55" y2="75" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Achieved Polygon (Green) */}
                    <polygon
                      points="160,45 240,85 230,180 160,220 75,185 80,85"
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="#10b981"
                      strokeWidth="2"
                    />

                    {/* Progressing Polygon (Orange) */}
                    <polygon
                      points="160,70 215,100 245,170 160,205 95,165 110,95"
                      fill="rgba(245, 158, 11, 0.12)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />

                    {/* Want Learn Polygon (Blue) */}
                    <polygon
                      points="160,95 200,120 220,150 160,180 120,150 130,115"
                      fill="rgba(14, 165, 233, 0.1)"
                      stroke="#0ea5e9"
                      strokeWidth="2"
                    />

                    {/* Dimension Text Labels */}
                    <text x="160" y="20" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600">Client Management</text>
                    <text x="275" y="75" textAnchor="start" fontSize="10" fill="#475569" fontWeight="600">Site Safety</text>
                    <text x="275" y="200" textAnchor="start" fontSize="10" fill="#475569" fontWeight="600">Diagnostic Flow</text>
                    <text x="160" y="255" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600">Customer Signoff</text>
                    <text x="45" y="200" textAnchor="end" fontSize="10" fill="#475569" fontWeight="600">Photo Audits</text>
                    <text x="45" y="75" textAnchor="end" fontSize="10" fill="#475569" fontWeight="600">Milestone Pricing</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom 3 Cards (Image 3) */}
            <div className="lms-bottom-trio-grid">
              {/* Learning History */}
              <div className="lms-card">
                <div className="lms-card-header">
                  <h3>Learning History</h3>
                  <span className="text-xs text-sky-600 font-semibold cursor-pointer">View all ↗</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 font-bold text-slate-500">
                    <span>Course</span>
                    <span>Certification</span>
                    <span>Duration</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Trade Fundamentals</span>
                    <span className="text-slate-400">—</span>
                    <span className="text-slate-600">16.5h</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">In-Home Etiquette</span>
                    <span className="text-emerald-600 font-semibold">Yes</span>
                    <span className="text-slate-600">12h</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Safety & Earthing</span>
                    <span className="text-slate-400">—</span>
                    <span className="text-slate-600">3.5h</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="font-semibold text-slate-800">Milestone Escrow Flow</span>
                    <span className="text-emerald-600 font-semibold">Yes</span>
                    <span className="text-slate-600">8h</span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="lms-card">
                <div className="lms-card-header">
                  <h3>Achievements</h3>
                </div>
                <div className="space-y-3">
                  <div className="lms-achieve-item">
                    <div className="lms-achieve-icon">🏆</div>
                    <div className="lms-achieve-details">
                      <div className="lms-achieve-title-row">
                        <span>Learning Master</span>
                        <span>4/5</span>
                      </div>
                      <div className="lms-achieve-bar-bg">
                        <div className="lms-achieve-bar-fill" style={{ width: "80%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="lms-achieve-item">
                    <div className="lms-achieve-icon">🛡️</div>
                    <div className="lms-achieve-details">
                      <div className="lms-achieve-title-row">
                        <span>Skill Builder</span>
                        <span>1/5</span>
                      </div>
                      <div className="lms-achieve-bar-bg">
                        <div className="lms-achieve-bar-fill" style={{ width: "20%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="lms-achieve-item">
                    <div className="lms-achieve-icon">🎖️</div>
                    <div className="lms-achieve-details">
                      <div className="lms-achieve-title-row">
                        <span>Leadership</span>
                        <span>2/2</span>
                      </div>
                      <div className="lms-achieve-bar-bg">
                        <div className="lms-achieve-bar-fill" style={{ width: "100%", background: "#10b981" }} />
                      </div>
                    </div>
                  </div>

                  <div className="lms-achieve-item">
                    <div className="lms-achieve-icon">💬</div>
                    <div className="lms-achieve-details">
                      <div className="lms-achieve-title-row">
                        <span>Communicator</span>
                        <span>5/10</span>
                      </div>
                      <div className="lms-achieve-bar-bg">
                        <div className="lms-achieve-bar-fill" style={{ width: "50%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Statistics */}
              <div className="lms-card">
                <div className="lms-card-header">
                  <h3>Learning Statistic</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span>⏳</span> Total learning hours
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">254</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span>📜</span> Certificates completed
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">8</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span>⏱️</span> Hands-on practice hours
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">14</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span>✅</span> Courses completed
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: DISCUSSION */}
        {activeTab === "discussion" && (
          <div className="lms-card">
            <div className="lms-card-header">
              <h3>Community Discussion (14 posts)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Connect with fellow artisans on callout experiences, customer pricing negotiations, and equipment recommendations.
            </p>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">David O. (Electrician, Ikeja)</span>
                  <span className="text-[11px] text-slate-400">2 hours ago</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  &ldquo;The point about showing damaged parts alongside new components has saved me from two major disputes this week alone. Customers really appreciate the honesty.&rdquo;
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Blessing E. (Plumber, Lekki)</span>
                  <span className="text-[11px] text-slate-400">Yesterday</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  &ldquo;Does anyone have recommendations for durable conduit sealing compound that resists high humidity during the rainy season?&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}
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
