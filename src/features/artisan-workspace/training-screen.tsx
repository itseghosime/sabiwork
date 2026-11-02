"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import {
  getTrainingModules,
  getTrainingStats,
  type TrainingModule,
  type TrainingCategory,
} from "@/features/training/service";
import { Badge, Crumbs, Empty, Head, Kpi, PanelHead, type Tone } from "./ui";

const categories: readonly { id: TrainingCategory; label: string }[] = [
  { id: "all", label: "All guides" },
  { id: "customer", label: "Client relations" },
  { id: "safety", label: "Site safety" },
  { id: "escrow", label: "Quotes & escrow" },
  { id: "proofs", label: "Job proofs" },
];

const statusTabs: readonly { id: string; label: string }[] = [
  { id: "all", label: "Any progress" },
  { id: "not_started", label: "Not started" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
];

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

function CourseCard({ module }: { module: TrainingModule }) {
  return (
    <article className="aw-course">
      <div className="aw-course-head">
        <span className="aw-course-thumb">
          <Icon name={categoryIcon[module.category]} size={18} />
        </span>
        <div className="aw-course-title">
          <h3>
            <Link href={`/training/${module.id}`}>{module.title}</Link>
          </h3>
          <div className="aw-course-meta">
            <span>{module.level}</span>
            <span aria-hidden="true">·</span>
            <span>{duration(module.durationMinutes)}</span>
            <span aria-hidden="true">·</span>
            <span>{module.sections.length} sections</span>
          </div>
        </div>
        <Badge tone={statusTone[module.status]}>{statusLabel[module.status]}</Badge>
      </div>

      <p className="aw-course-summary">{module.summary}</p>

      {module.topicsCovered.length > 0 ? (
        <div className="aw-course-topics">
          {module.topicsCovered.slice(0, 3).map((topic) => (
            <span className="aw-tag" key={topic}>
              {topic}
            </span>
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
        <Link className="aw-btn aw-btn-primary aw-btn-sm" href={`/training/${module.id}`}>
          {module.status === "not_started" ? "Start guide" : "Continue guide"}
          <Icon name="next" size={14} />
        </Link>
        <span className="aw-course-author">By {module.author}</span>
      </div>
    </article>
  );
}

export function ArtisanTrainingScreen() {
  const [category, setCategory] = useState<TrainingCategory>("all");
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");

  const stats = getTrainingStats();
  const modules = getTrainingModules(category, statusTab);
  const term = search.trim().toLowerCase();
  const visible = term
    ? modules.filter(
        (module) =>
          module.title.toLowerCase().includes(term) ||
          module.summary.toLowerCase().includes(term) ||
          module.topicsCovered.some((topic) => topic.toLowerCase().includes(term)),
      )
    : modules;

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Training" },
        ]}
      />

      <Head
        title="Training & master guides"
        subtitle="Trade craft, client etiquette and payment discipline — picked for the work you take on."
      >
        <Link className="aw-btn aw-btn-ghost" href="/artisan">
          Back to overview
        </Link>
      </Head>

      <p className="aw-alert aw-alert-info">
        Guides and progress figures are local sample content. No certificate is issued and nothing is
        added to your public profile.
      </p>

      <div className="aw-kpi-strip">
        <Kpi icon="checkCircle" label="Completed" value={stats.completedCount} foot="Guides finished" />
        <Kpi icon="clock" label="In progress" value={stats.inProgressCount} foot="Pick up where you left off" />
        <Kpi icon="list" label="Available" value={stats.availableCount} foot="Not started yet" />
        <Kpi icon="graduation" label="Study time" value={`${stats.totalHoursLearned} hrs`} foot="Across all guides" />
      </div>

      <section className="aw-panel">
        <PanelHead title="Find a guide" note="Filter by topic or by how far you have gone." />

        <div className="aw-toolbar">
          <label className="aw-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guides, topics or takeaways"
              aria-label="Search training guides"
            />
          </label>

          <div className="aw-filters" role="group" aria-label="Guide progress filter">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="aw-filter"
                data-active={statusTab === tab.id ? "true" : "false"}
                aria-pressed={statusTab === tab.id}
                onClick={() => setStatusTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="aw-filters" role="group" aria-label="Guide topic filter">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className="aw-filter"
              data-active={category === item.id ? "true" : "false"}
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {visible.length === 0 ? (
        <Empty
          icon="graduation"
          title="No guides match that filter"
          body="Try a different topic, clear the search box, or widen the progress filter."
          action={
            <button
              type="button"
              className="aw-btn aw-btn-ghost"
              onClick={() => {
                setCategory("all");
                setStatusTab("all");
                setSearch("");
              }}
            >
              Reset filters
            </button>
          }
        />
      ) : (
        <div className="aw-course-grid">
          {visible.map((module) => (
            <CourseCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}
