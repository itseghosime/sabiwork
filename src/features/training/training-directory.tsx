"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { learner, topics } from "./data";
import {
  countTopic,
  filterGuides,
  progressFor,
  sortOptions,
  trainingMetrics,
  type Guide,
  type TrainingFilter,
} from "./service";

const filtersEmpty = { q: "", topic: "all", sort: "recommended" } as const;

export function TrainingDirectory({
  guides,
}: {
  guides: readonly Guide[];
}) {
  const [filters, setFilters] = useState<TrainingFilter>({ ...filtersEmpty });

  const visible = useMemo(
    () => filterGuides(filters, guides),
    [guides, filters],
  );

  const metrics = useMemo(() => trainingMetrics(guides), [guides]);
  const counts = useMemo(
    () =>
      topics.map((topic) => ({
        ...topic,
        count: countTopic(topic.id, guides),
        total: guides.length,
      })),
    [guides],
  );
  const featured = useMemo(
    () => guides.find((guide) => progressFor(guide).status === "in-progress"),
    [guides],
  );
  const featuredProgress = featured ? progressFor(featured) : null;

  const set = (changes: Partial<TrainingFilter>) =>
    setFilters((current) => ({ ...current, ...changes }));

  return (
    <div className="training-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/artisan">Artisan desk</Link>
        <Icon name="next" size={14} />
        <span aria-current="page">Training directory</span>
      </nav>

      <header className="training-heading">
        <div className="training-eyebrow-row">
          <span className="training-scope-chip">{learner.trade}</span>
          <span aria-hidden="true">·</span>
          <span>
            {learner.name} · {learner.area}
          </span>
        </div>
        <h1>Artisan training &amp; master guides</h1>
        <p>
          Practical guides for quotes, client handling, documentation and site
          safety. Progress here is a demo preview and resets when you reload.
        </p>
      </header>

      <div className="training-metrics">
        <article className="training-metric">
          <span className="training-metric-label">In progress</span>
          <strong>{metrics.inProgress} guides</strong>
          <small>Active this session</small>
        </article>
        <article className="training-metric">
          <span className="training-metric-label">Completed</span>
          <strong>{metrics.completed} guides</strong>
          <small>Demo badges only</small>
        </article>
        <article className="training-metric">
          <span className="training-metric-label">Learning time</span>
          <strong>{metrics.minutesLogged} mins</strong>
          <small>Counted from demo progress</small>
        </article>
        <article className="training-metric">
          <span className="training-metric-label">Overall progress</span>
          <strong>{metrics.overallPercent}%</strong>
          <div
            className="training-progress training-progress-thin"
            aria-hidden="true"
          >
            <span style={{ width: `${metrics.overallPercent}%` }} />
          </div>
          <small>Demo percentage across {guides.length} guides</small>
        </article>
      </div>

      {featured && featuredProgress && (
        <section
          key={featured.id}
          className="training-featured"
          aria-label="Resume learning"
        >
          <div>
            <span className="training-featured-chip">
              In progress · {featuredProgress.percent}%
            </span>
            <h2>{featured.title}</h2>
            <p>{featured.summary}</p>
          </div>
          <div className="training-featured-cta">
            <Link
              className="button button-dark"
              href={`/training/${featured.id}`}
            >
              Resume guide <Icon name="arrow" size={17} />
            </Link>
            <span>
              Part {featuredProgress.completedCount + 1} of{" "}
              {featuredProgress.totalSteps} ready
            </span>
          </div>
        </section>
      )}

      <div className="training-toolbar">
        <label className="training-search">
          <Icon name="search" size={18} />
          <input
            type="text"
            value={filters.q}
            onChange={(event) => set({ q: event.target.value.slice(0, 100) })}
            placeholder="Search guides, protocols, billing methods…"
            aria-label="Search training guides"
            maxLength={100}
          />
          {filters.q && (
            <button
              type="button"
              className="training-search-clear"
              onClick={() => set({ q: "" })}
              aria-label="Clear search"
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </label>
        <label className="training-sort input-label">
          Sort
          <select
            value={filters.sort}
            onChange={(event) => set({
              sort: event.target.value as TrainingFilter["sort"],
            })}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="training-pills"
        role="group"
        aria-label="Filter guides by topic"
      >
        <button
          type="button"
          className="training-pill"
          aria-pressed={filters.topic === "all"}
          onClick={() => set({ topic: "all" })}
        >
          All <span>{guides.length}</span>
        </button>
        {counts.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className="training-pill"
            aria-pressed={filters.topic === topic.id}
            onClick={() => set({ topic: topic.id })}
          >
            {topic.label} <span>{topic.count}</span>
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="training-grid">
          {visible.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : (
        <section className="training-empty" role="status">
          <span className="training-empty-icon">
            <Icon name="search" size={30} />
          </span>
          <h2>No training guides found.</h2>
          <p>
            No module matches your search or topic filter. Clear the keywords or
            reset the topic filter to see the full demo catalogue.
          </p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => setFilters({ ...filtersEmpty })}
          >
            Reset filters <Icon name="filters" size={17} />
          </button>
        </section>
      )}

      <aside className="training-support">
        <div>
          <strong>Need hands-on practice?</strong>
          <p>
            Coaching sessions named in these guides are illustrative demo
            content. There are no live hub desks or mentor chats in TEST mode.
          </p>
        </div>
        <span className="demo-tag">Demo content · TEST mode</span>
      </aside>
    </div>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  const progress = progressFor(guide);
  const topicLabel = topics.find((topic) => topic.id === guide.topic)?.label;
  return (
    <article className="training-card">
      <div className="training-card-top">
        <span className={`training-topic-chip chip-${guide.topic}`}>
          {topicLabel}
        </span>
        <span className="training-card-minutes">
          <Icon name="sparkles" size={14} /> {guide.minutes} mins
        </span>
      </div>
      <h3>{guide.title}</h3>
      <p>{guide.summary}</p>
      <div className="training-card-foot">
        {progress.status === "completed" ? (
          <p className="training-done">
            <Icon name="check" size={16} /> Completed · demo badge
          </p>
        ) : progress.status === "in-progress" ? (
          <div>
            <p className="training-progress-label">
              In progress <strong>{progress.percent}%</strong>
            </p>
            <div
              className="training-progress"
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${guide.title} progress`}
            >
              <span style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        ) : (
          <p className="training-new">Not started · {guide.minutes} mins</p>
        )}
        <Link className="button button-primary" href={`/training/${guide.id}`}>
          {progress.status === "completed"
            ? "Review lesson"
            : progress.status === "in-progress"
              ? "Continue guide"
              : "Start guide"}{" "}
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </article>
  );
}
