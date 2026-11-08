"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import type { TrainingModule, TrainingCategory } from "@/features/training/service";
import { Badge, Crumbs, Empty, Head, Kpi, PanelHead, type Tone } from "./ui";
import type { ArtisanTrainingModule, ArtisanTrainingStats } from "./training-types";

const categories: readonly { id: TrainingCategory; label: string }[] = [
  { id: "all", label: "All guides" },
  { id: "customer", label: "Client relations" },
  { id: "safety", label: "Site safety" },
  { id: "escrow", label: "Quotes & pricing" },
  { id: "proofs", label: "Work records" },
];

const statusTabs = [
  { id: "all", label: "All progress" },
  { id: "not_started", label: "Not started" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
] as const;

const statusTone: Record<TrainingModule["status"], Tone> = {
  not_started: "neutral",
  in_progress: "info",
  completed: "success",
};
const statusLabel: Record<TrainingModule["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};
const categoryIcon: Record<TrainingCategory, IconName> = {
  all: "graduation",
  customer: "users",
  safety: "shield",
  escrow: "wallet",
  proofs: "file",
};

function duration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} hr`;
}

function CourseCard({ module }: { module: ArtisanTrainingModule }) {
  const href = `/artisan/training/${encodeURIComponent(module.id)}`;
  return (
    <article className="aw-course">
      <div className="aw-course-head">
        <span className="aw-course-thumb">
          <Icon name={categoryIcon[module.category]} size={18} />
        </span>
        <div className="aw-course-title">
          <h3><Link href={href}>{module.title}</Link></h3>
          <div className="aw-course-meta">
            <span>{module.level}</span><span aria-hidden="true">·</span>
            <span>{duration(module.durationMinutes)}</span><span aria-hidden="true">·</span>
            <span>{module.sections.length} lessons</span>
          </div>
        </div>
        <Badge tone={statusTone[module.status]}>{statusLabel[module.status]}</Badge>
      </div>
      <p className="aw-course-summary">{module.summary}</p>
      {module.topicsCovered.length > 0 ? (
        <div className="aw-course-topics">
          {module.topicsCovered.slice(0, 3).map((topic) => (
            <span className="aw-tag" key={topic}>{topic}</span>
          ))}
        </div>
      ) : null}
      <div className="aw-progress" aria-label={`Guide progress ${module.progress}%`}>
        <div className="aw-progress-track">
          <div className="aw-progress-fill" style={{ width: `${module.progress}%` }} />
        </div>
        <span className="aw-progress-value">{module.progress}%</span>
      </div>
      <div className="aw-course-foot">
        <Link className="aw-btn aw-btn-primary aw-btn-sm" href={href}>
          {module.status === "not_started" ? "Start guide" : "Continue guide"}
          <Icon name="next" size={14} />
        </Link>
        {module.completedAt ? (
          <Link className="aw-btn aw-btn-ghost aw-btn-sm" href={`${href}/certificate`}>
            Completion record <Icon name="file" size={14} />
          </Link>
        ) : <span className="aw-course-author">By {module.author}</span>}
      </div>
    </article>
  );
}

export function ArtisanTrainingScreen({
  modules,
  stats,
}: {
  modules: readonly ArtisanTrainingModule[];
  stats: ArtisanTrainingStats;
}) {
  const [category, setCategory] = useState<TrainingCategory>("all");
  const [statusTab, setStatusTab] = useState<(typeof statusTabs)[number]["id"]>("all");
  const [search, setSearch] = useState("");
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("en-NG");
    return modules.filter((module) => {
      const categoryMatches = category === "all" || module.category === category;
      const statusMatches = statusTab === "all" || module.status === statusTab;
      const textMatches = !term || [
        module.title, module.summary, ...module.topicsCovered,
      ].join(" ").toLocaleLowerCase("en-NG").includes(term);
      return categoryMatches && statusMatches && textMatches;
    });
  }, [category, modules, search, statusTab]);

  return (
    <div className="aw-page">
      <Crumbs trail={[
        { label: "SabiWork", href: "/" },
        { label: "Artisan workspace", href: "/artisan" },
        { label: "Training" },
      ]} />
      <Head
        title="Training & master guides"
        subtitle="Build safer work habits, stronger client communication and clearer quotes with short, practical lessons."
      >
        <Link className="aw-btn aw-btn-ghost" href="/artisan">Back to overview</Link>
      </Head>
      <p className="aw-alert aw-alert-info" role="note">
        Your lesson progress saves to your artisan account in Neon. These learning records are not accredited qualifications or proof of trade competence.
      </p>
      <div className="aw-kpi-strip">
        <Kpi icon="checkCircle" label="Completed" value={stats.completedCount} foot="Guides finished" />
        <Kpi icon="clock" label="In progress" value={stats.inProgressCount} foot="Resume where you left off" />
        <Kpi icon="list" label="Available" value={stats.availableCount} foot="Ready to begin" />
        <Kpi icon="graduation" label="Estimated study" value={`${stats.totalHoursLearned} hrs`} foot="Based on completed lesson content" />
      </div>
      <section className="aw-panel">
        <PanelHead title="Find a guide" note="Filter by topic, progress or a skill you want to improve." />
        <div className="aw-toolbar">
          <label className="aw-search">
            <Icon name="search" size={16} />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guides, lessons or takeaways" aria-label="Search training guides" />
          </label>
          <div className="aw-filters" role="group" aria-label="Guide progress filter">
            {statusTabs.map((tab) => (
              <button key={tab.id} type="button" className="aw-filter"
                data-active={statusTab === tab.id ? "true" : "false"}
                aria-pressed={statusTab === tab.id} onClick={() => setStatusTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="aw-filters" role="group" aria-label="Guide topic filter">
          {categories.map((item) => (
            <button key={item.id} type="button" className="aw-filter"
              data-active={category === item.id ? "true" : "false"}
              aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>
      {visible.length === 0 ? (
        <Empty icon="graduation" title="No guides match that filter"
          body="Try a different topic, clear the search, or widen the progress filter."
          action={<button type="button" className="aw-btn aw-btn-ghost"
            onClick={() => { setCategory("all"); setStatusTab("all"); setSearch(""); }}>
            Reset filters
          </button>} />
      ) : (
        <div className="aw-course-grid">{visible.map((module) => <CourseCard key={module.id} module={module} />)}</div>
      )}
    </div>
  );
}
