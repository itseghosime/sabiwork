import {
  demoCompletedAtUtc,
  demoDocket,
  guides,
  topics,
  type Guide,
  type GuideStep,
  type TopicId,
} from "./data";

// Data-layer re-exports keep presentation code importing only from service.
export type { Guide, GuideStep, TopicId };

export type TrainingFilter = {
  q: string;
  topic: TopicId | "all";
  sort: "recommended" | "active-first" | "completed" | "shortest";
};

export type GuideProgress = {
  completedStepIds: string[];
  totalSteps: number;
  completedCount: number;
  percent: number;
  status: "not-started" | "in-progress" | "completed";
};

export type TrainingMetrics = {
  inProgress: number;
  completed: number;
  minutesLogged: number;
  overallPercent: number;
};

// In-memory preview store. Refreshing the page resets it, which no honest
// screen may hide. Replace these functions (single replacement point) with
// the real guide/completion API owned by the training feature on Saturday.
const sessionSteps = new Map<string, Set<string>>();

function seedSteps(guide: Guide): void {
  if (sessionSteps.has(guide.id)) return;
  sessionSteps.set(
    guide.id,
    new Set(guide.steps.slice(0, guide.seededSteps).map((step) => step.id)),
  );
}

export function progressFor(guide: Guide): GuideProgress {
  seedSteps(guide);
  const ids = guide.steps.map((step) => step.id);
  const completed = ids.filter((id) => sessionSteps.get(guide.id)?.has(id));
  const percent = Math.round((completed.length / ids.length) * 100);
  return {
    completedStepIds: completed,
    totalSteps: ids.length,
    completedCount: completed.length,
    percent,
    status:
      percent === 100
        ? "completed"
        : completed.length > 0
          ? "in-progress"
          : "not-started",
  };
}

/** Demo-only: clear every runtime tick so tests start from the fixture seed. */
export function resetTrainingProgress(): void {
  sessionSteps.clear();
}

export async function markStep(
  guide: Guide,
  stepId: string,
): Promise<GuideProgress> {
  seedSteps(guide);
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (!guide.steps.some((step) => step.id === stepId))
    throw new Error(`Unknown step ${stepId} for guide ${guide.title}`);
  sessionSteps.get(guide.id)?.add(stepId);
  return progressFor(guide);
}

export type Certificate =
  | {
      status: "ready";
      guide: Guide;
      completedAtUtc: string;
      docket: string;
      progress: GuideProgress;
    }
  | { status: "locked"; guide: Guide; progress: GuideProgress };

export function certificateFor(guide: Guide): Certificate {
  const progress = progressFor(guide);
  return progress.status === "completed"
    ? {
        status: "ready",
        guide,
        completedAtUtc: demoCompletedAtUtc,
        docket: demoDocket,
        progress,
      }
    : { status: "locked", guide, progress };
}

export function getGuide(id: string, records: readonly Guide[] = guides) {
  return records.find((guide) => guide.id === id) ?? null;
}

/** First fixture guide after the given one that is not yet fully read. */
export function nextGuide(guide: Guide, records: readonly Guide[] = guides) {
  const index = records.findIndex((item) => item.id === guide.id);
  return (
    records
      .slice(index + 1)
      .find((item) => progressFor(item).status !== "completed") ?? null
  );
}

export function filterGuides(
  filters: TrainingFilter,
  records: readonly Guide[] = guides,
): Guide[] {
  const query = filters.q.trim().toLocaleLowerCase("en-NG");
  const filtered = records.filter((guide) => {
    const topicLabel = topics.find((topic) => topic.id === guide.topic)?.label;
    const haystack = [guide.title, guide.summary, topicLabel ?? ""]
      .join(" ")
      .toLocaleLowerCase("en-NG");
    return (
      (filters.topic === "all" || guide.topic === filters.topic) &&
      (!query || haystack.includes(query))
    );
  });
  const sorted = [...filtered];
  if (filters.sort === "active-first")
    sorted.sort(
      (a, b) =>
        Number(progressFor(b).status === "in-progress") -
        Number(progressFor(a).status === "in-progress"),
    );
  if (filters.sort === "completed")
    sorted.sort(
      (a, b) =>
        Number(progressFor(b).status === "completed") -
        Number(progressFor(a).status === "completed"),
    );
  if (filters.sort === "shortest") sorted.sort((a, b) => a.minutes - b.minutes);
  return sorted;
}

export function countTopic(
  topic: TopicId,
  records: readonly Guide[] = guides,
): number {
  return records.filter((guide) => guide.topic === topic).length;
}

export function trainingMetrics(
  records: readonly Guide[] = guides,
): TrainingMetrics {
  let inProgress = 0;
  let completed = 0;
  let minutesLogged = 0;
  let percentTotal = 0;
  for (const guide of records) {
    const progress = progressFor(guide);
    if (progress.status === "completed") completed += 1;
    else if (progress.status === "in-progress") inProgress += 1;
    minutesLogged += Math.round(
      progress.completedCount === 0
        ? 0
        : (guide.minutes * progress.completedCount) / progress.totalSteps,
    );
    percentTotal += progress.percent;
  }
  return {
    inProgress,
    completed,
    minutesLogged,
    overallPercent: Math.round(percentTotal / Math.max(1, records.length)),
  };
}

export const sortOptions: readonly { value: TrainingFilter["sort"]; label: string }[] =
  [
    { value: "recommended", label: "Recommended" },
    { value: "active-first", label: "In progress first" },
    { value: "completed", label: "Completed first" },
    { value: "shortest", label: "Shortest duration" },
  ];

/** TEST-mode list adapter: the single replacement point for Saturday's server. */
export async function listGuides(
  filters: TrainingFilter,
  records: readonly Guide[] = guides,
): Promise<Guide[]> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return filterGuides(filters, records);
}

export function stepIndexOf(guide: Guide, stepId: string): number {
  return guide.steps.findIndex((step: GuideStep) => step.id === stepId);
}
