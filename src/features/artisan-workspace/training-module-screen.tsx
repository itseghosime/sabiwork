"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { readJson } from "./api";
import { trainingSectionId } from "@/features/training/progress";
import type { ArtisanTrainingModule, ArtisanTrainingProgress } from "./training-types";
import { Crumbs, Head, Badge } from "./ui";

export function ArtisanTrainingModuleScreen({ module }: { module: ArtisanTrainingModule }) {
  const [completedSectionIds, setCompletedSectionIds] = useState(module.completedSectionIds);
  const [completedAt, setCompletedAt] = useState(module.completedAt);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [error, setError] = useState("");
  const completedCount = module.sections.filter((section) =>
    completedSectionIds.includes(trainingSectionId(section.sectionTitle)),
  ).length;
  const progress = module.sections.length ? Math.round(completedCount / module.sections.length * 100) : 0;
  const status = progress === 100 ? "completed" : completedCount ? "in_progress" : "not_started";

  async function toggleSection(sectionTitle: string, checked: boolean) {
    const sectionId = trainingSectionId(sectionTitle);
    setSavingSection(sectionId);
    setError("");
    try {
      const result = await readJson<ArtisanTrainingProgress>(
        `/api/artisan/training/${encodeURIComponent(module.id)}/progress`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionTitle, completed: checked }),
        },
      );
      setCompletedSectionIds(result.completedSectionIds);
      setCompletedAt(result.completedAt);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your progress.");
    } finally {
      setSavingSection(null);
    }
  }

  return (
    <div className="aw-page">
      <Crumbs trail={[
        { label: "SabiWork", href: "/" },
        { label: "Artisan workspace", href: "/artisan" },
        { label: "Training", href: "/artisan/training" },
        { label: module.title },
      ]} />
      <Head title={module.title} subtitle={module.summary}>
        <Link className="aw-btn aw-btn-ghost" href="/artisan/training">
          <Icon name="back" size={15} /> All guides
        </Link>
      </Head>
      <p className="aw-alert aw-alert-info" role="status">
        Lesson progress saves to your artisan account. Completion records are for learning progress only; they are not accredited qualifications.
      </p>
      <section className="aw-panel">
        <div className="aw-course-head">
          <div>
            <p className="aw-course-meta">{module.level} · {module.durationMinutes} minutes · {module.sections.length} lessons</p>
            <p className="aw-course-summary">{module.summary}</p>
          </div>
          <Badge tone={status === "completed" ? "success" : status === "in_progress" ? "info" : "neutral"}>
            {status === "completed" ? "Completed" : status === "in_progress" ? "In progress" : "Not started"}
          </Badge>
        </div>
        <div className="aw-progress" role="progressbar" aria-label="Guide completion"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="aw-progress-track"><div className="aw-progress-fill" style={{ width: `${progress}%` }} /></div>
          <span className="aw-progress-value">{progress}%</span>
        </div>
        <p className="aw-course-meta">{completedCount} of {module.sections.length} lessons complete</p>
        {error ? <p className="aw-alert aw-alert-error" role="alert">{error}</p> : null}
      </section>
      {module.keyTakeaways.length ? (
        <section className="aw-panel">
          <h2 className="aw-panel-title">What you’ll learn</h2>
          <ul className="aw-course-topics">
            {module.keyTakeaways.map((takeaway) => <li className="aw-tag" key={takeaway}>{takeaway}</li>)}
          </ul>
        </section>
      ) : null}
      <div className="aw-course-grid">
        {module.sections.map((section, index) => {
          const sectionId = trainingSectionId(section.sectionTitle);
          const checked = completedSectionIds.includes(sectionId);
          return (
            <article className="aw-course" key={sectionId}>
              <div className="aw-course-head">
                <span className="aw-course-thumb"><Icon name={checked ? "checkCircle" : "file"} size={18} /></span>
                <div className="aw-course-title">
                  <p className="aw-course-meta">Lesson {index + 1} of {module.sections.length}</p>
                  <h2>{section.sectionTitle}</h2>
                </div>
                {checked ? <Badge tone="success">Done</Badge> : null}
              </div>
              <div className="aw-course-summary">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
                {section.proTip ? <p className="aw-alert aw-alert-info"><strong>Field note:</strong> {section.proTip}</p> : null}
              </div>
              <label className="aw-course-foot">
                <span>
                  <input type="checkbox" checked={checked} disabled={savingSection === sectionId}
                    onChange={(event) => void toggleSection(section.sectionTitle, event.target.checked)} />
                  {savingSection === sectionId ? "Saving…" : checked ? "Mark lesson not complete" : "Mark lesson complete"}
                </span>
              </label>
            </article>
          );
        })}
      </div>
      {completedAt ? (
        <section className="aw-alert aw-alert-success" role="status">
          <div>
            <strong>Guide completed.</strong> Your completion is saved to your account.
          </div>
          <Link className="aw-btn aw-btn-primary aw-btn-sm" href={`/artisan/training/${encodeURIComponent(module.id)}/certificate`}>
            View completion record <Icon name="arrow" size={15} />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
