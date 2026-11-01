"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { demoDocket, topics } from "./data";
import { markStep, progressFor, type Guide, type GuideProgress } from "./service";

export function GuideReader({ guide }: { guide: Guide }) {
  const [progress, setProgress] = useState<GuideProgress>(() =>
    progressFor(guide),
  );
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    setProgress(progressFor(guide));
    setJustCompleted(false);
    setError(null);
  }, [guide]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  const topicLabel = topics.find((topic) => topic.id === guide.topic)?.label;
  const currentIndex = useMemo(
    () => guide.steps.findIndex((step) => !progress.completedStepIds.includes(step.id)),
    [guide, progress.completedStepIds],
  );
  const allComplete = progress.status === "completed";

  const saveStep = async (stepId: string) => {
    if (pending) return;
    setPending(stepId);
    setError(null);
    try {
      setProgress(await markStep(guide, stepId));
      setToast("Part marked as read (demo). Nothing is saved to a server.");
    } catch {
      setError(
        "The demo save for that part could not finish. Your reading is still here; try again.",
      );
    } finally {
      setPending(null);
    }
  };

  const finishGuide = async () => {
    const remaining = guide.steps.filter(
      (step) => !progress.completedStepIds.includes(step.id),
    );
    for (const step of remaining) {
      if (pending) return;
      setPending(step.id);
      setError(null);
      try {
        setProgress(await markStep(guide, step.id));
      } catch {
        setError(
          "The demo save could not finish. Your reading is still on the page; try again.",
        );
        setPending(null);
        return;
      }
    }
    setJustCompleted(true);
    setToast("Guide finished (demo). The certificate view is now unlocked.");
  };

  return (
    <div className="reader-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/training">Training directory</Link>
        <Icon name="next" size={14} />
        <span aria-current="page">{guide.title}</span>
      </nav>

      {error && (
        <div role="alert" className="reader-banner reader-banner-error">
          <Icon name="wrench" size={22} />
          <div>
            <strong>Demo save failed</strong>
            <p>{error}</p>
          </div>
        </div>
      )}
      {allComplete && justCompleted && (
        <div role="status" className="reader-banner reader-banner-done">
          <Icon name="check" size={22} />
          <div>
            <strong>Guide complete (demo)</strong>
            <p>
              All {progress.totalSteps} parts are marked read. The certificate
              view is unlocked for this session only.
            </p>
            <Link
              className="button button-primary"
              href={`/training/${guide.id}/certificate`}
            >
              Open certificate view <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      )}

      <header className="reader-header">
        <div className="reader-eyebrow-row">
          <span className={`training-topic-chip chip-${guide.topic}`}>
            {topicLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span>{guide.minutes} min read</span>
          <span aria-hidden="true">·</span>
          <span className="reader-part">
            Part {Math.min(currentIndex + 1, progress.totalSteps)} of{" "}
            {progress.totalSteps}
          </span>
        </div>
        <h1>{guide.title}</h1>
        <div className="reader-byline">
          <span className="reader-byline-badge" aria-hidden="true">
            SW
          </span>
          <div>
            <strong>SabiWork training desk</strong>
            <p>Fictional sample guide · demo content · updated October 2026</p>
          </div>
        </div>
        <div className="reader-steps" aria-label="Guide parts progress">
          {guide.steps.map((step, index) => {
            const done = progress.completedStepIds.includes(step.id);
            const current = index === currentIndex && !done;
            return (
              <div key={step.id}>
                <span
                  className={`reader-step-bar${done ? " is-done" : current ? " is-current" : ""}`}
                  aria-hidden="true"
                />
                <span
                  className={`reader-step-label${done ? " is-done" : current ? " is-current" : ""}`}
                >
                  {done && <Icon name="check" size={12} />}
                  {index + 1}. {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      <div className="reader-layout">
        <div className="reader-main">
          {guide.steps.map((step, index) => {
            const done = progress.completedStepIds.includes(step.id);
            return (
              <section key={step.id} className="reader-section">
                <span className="reader-section-num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="reader-section-head">
                  <h2>{step.title}</h2>
                  <p>{step.intro}</p>
                </div>
                {step.tips && (
                  <div className="reader-tips">
                    {step.tips.map((tip) => (
                      <article key={tip.title} className="reader-tip">
                        <strong>{tip.title}</strong>
                        <p>{tip.text}</p>
                      </article>
                    ))}
                  </div>
                )}
                {step.callout && (
                  <aside className="reader-callout">
                    <Icon name="sparkles" size={20} />
                    <div>
                      <strong>{step.callout.title}</strong>
                      <p>{step.callout.text}</p>
                    </div>
                  </aside>
                )}
                {step.comparisons && (
                  <div className="reader-comparisons">
                    {step.comparisons.map((pair) => (
                      <div className="reader-comparison" key={pair.avoid}>
                        <div className="reader-comp-avoid">
                          <strong>{pair.avoidLabel}</strong>
                          <p>{pair.avoid}</p>
                          <small>{pair.avoidNote}</small>
                        </div>
                        <div className="reader-comp-plain">
                          <strong>{pair.plainLabel}</strong>
                          <p>{pair.plain}</p>
                          <small>{pair.plainNote}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {step.flow && (
                  <div className="reader-flow">
                    <strong>Three-step explanation flow</strong>
                    <div>
                      {step.flow.map((stage) => (
                        <article key={stage.stage}>
                          <span>{stage.stage}</span>
                          <strong>{stage.title}</strong>
                          <p>{stage.text}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
                {step.takeaways && (
                  <div className="reader-takeaways">
                    <strong>Core takeaways for every callout</strong>
                    <div>
                      {step.takeaways.map((item) => (
                        <article key={item.title}>
                          <Icon name="check" size={16} />
                          <div>
                            <strong>{item.title}</strong>
                            <p>{item.text}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
                <div className="reader-section-foot">
                  {done ? (
                    <p className="reader-part-done">
                      <Icon name="check" size={16} /> Part {index + 1} marked
                      read (demo)
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="button button-outline"
                      disabled={Boolean(pending)}
                      onClick={() => saveStep(step.id)}
                    >
                      {pending === step.id ? "Saving (demo)…" : `Mark part ${index + 1} read`}
                    </button>
                  )}
                </div>
              </section>
            );
          })}

          <div className="reader-actionbar">
            <div>
              <strong>{guide.title} · certificate</strong>
              <p>
                Finish all {progress.totalSteps} parts to unlock the certificate
                view (demo, session only).
              </p>
            </div>
            <div className="reader-actionbar-buttons">
              <Link className="button button-outline" href="/training">
                Back to guides
              </Link>
              {allComplete ? (
                <Link
                  className="button button-primary"
                  href={`/training/${guide.id}/certificate`}
                >
                  Open certificate <Icon name="arrow" size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  disabled={Boolean(pending)}
                  onClick={finishGuide}
                >
                  {pending
                    ? "Saving (demo)…"
                    : `Finish guide (${progress.completedCount}/${progress.totalSteps})`}
                </button>
              )}
            </div>
          </div>

          <aside className="reader-legal">
            <Icon name="lock" size={16} />
            <p>
              <strong>Demo disclosure:</strong> reading progress and completion
              badges are simulated in memory for TEST mode and never persisted.
              Guides are internal platform samples and confer no accredited or
              government certification.
            </p>
          </aside>
        </div>

        <aside className="reader-side">
          <div className="reader-card">
            <div className="reader-card-head">
              <strong>Curriculum progress (demo)</strong>
              <span>{progress.percent}%</span>
            </div>
            <div className="reader-ring-row">
              <Ring percent={progress.percent} />
              <p>
                {progress.completedCount} of {progress.totalSteps} parts read
                in this demo session.
              </p>
            </div>
            <ul className="reader-checklist">
              {guide.steps.map((step, index) => {
                const done = progress.completedStepIds.includes(step.id);
                const current = index === currentIndex && !done;
                return (
                  <li
                    key={step.id}
                    className={done ? "is-done" : current ? "is-current" : ""}
                  >
                    <span className="reader-check-icon">
                      {done ? (
                        <Icon name="check" size={15} />
                      ) : current ? (
                        <Icon name="sparkles" size={15} />
                      ) : (
                        <span aria-hidden="true" className="reader-check-dot" />
                      )}
                    </span>
                    <span className="reader-check-title">{step.title}</span>
                    <span className="reader-check-meta">
                      {done
                        ? "Read"
                        : current
                          ? "Current"
                          : `${step.minutes} min`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="reader-card">
            <strong>Sample field aids</strong>
            <p className="reader-card-note">
              Downloadable assets are placeholder rows — no real files exist in
              TEST mode.
            </p>
            <button type="button" className="reader-asset" disabled>
              <Icon name="wrench" size={18} />
              <span>
                <span>Etiquette checklist (sample)</span>
                <small>PDF asset · unavailable in TEST mode</small>
              </span>
            </button>
            <button type="button" className="reader-asset" disabled>
              <Icon name="sparkles" size={18} />
              <span>
                <span>Water isolation quick card (sample)</span>
                <small>PDF asset · unavailable in TEST mode</small>
              </span>
            </button>
          </div>

          <div className="reader-card">
            <strong>Training desk (demo)</strong>
            <p className="reader-card-note">
              Practical coaching schedules shown in earlier prototypes are
              illustrative content; no live sessions or chats exist in TEST
              mode.
            </p>
            <p className="reader-card-note">
              Reference <code>{demoDocket}</code> is a fictional internal
              identifier for this demo guide.
            </p>
          </div>
        </aside>
      </div>

      {toast && (
        <div className="demo-toast" role="status">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Ring({ percent }: { percent: number }) {
  return (
    <svg viewBox="0 0 36 36" className="reader-ring" aria-hidden="true">
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        className="reader-ring-track"
        strokeWidth="3.6"
      />
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        className="reader-ring-value"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeDasharray={`${percent} 100`}
      />
    </svg>
  );
}
