import { beforeEach, describe, expect, it } from "vitest";
import { guides } from "./data";
import {
  certificateFor,
  countTopic,
  filterGuides,
  getGuide,
  markStep,
  nextGuide,
  progressFor,
  resetTrainingProgress,
  stepIndexOf,
  trainingMetrics,
  type TrainingFilter,
} from "./service";

const firstId = guides[0].id;
const readyId = guides[2].id;

beforeEach(() => {
  resetTrainingProgress();
});

describe("demo guide progress", () => {
  it("seeds the fixture ticks, computes percent and stays session-only", () => {
    const first = progressFor(guides[0]);
    expect(first.completedCount).toBe(2);
    expect(first.totalSteps).toBe(5);
    expect(first.percent).toBe(40);
    expect(first.status).toBe("in-progress");

    const ready = progressFor(guides[2]);
    expect(ready.status).toBe("completed");
    expect(ready.percent).toBe(100);

    const untouched = progressFor(guides[4]);
    expect(untouched.status).toBe("not-started");
  });

  it("marks parts read through the typed demo adapter", async () => {
    const guide = guides[0];
    const afterOne = await markStep(guide, guide.steps[2].id);
    expect(afterOne.completedStepIds).toHaveLength(3);
    await expect(markStep(guide, "made-up-step")).rejects.toThrow(
      /Unknown step/,
    );
  });
});

describe("certificate derivation", () => {
  it("unlocks only fully-read guides and stays fictional", () => {
    const ready = certificateFor(guides[2]);
    expect(ready.status).toBe("ready");
    if (ready.status === "ready") {
      expect(ready.completedAtUtc).toMatch(/Z$/);
      expect(ready.docket).toMatch(/^SW-TRN-/);
    }

    const locked = certificateFor(guides[0]);
    expect(locked.status).toBe("locked");
    if (locked.status === "locked") {
      expect(locked.progress.completedCount).toBe(2);
      expect(locked.progress.totalSteps).toBe(5);
      // A locked record must carry no completion data at all.
      expect("completedAtUtc" in locked).toBe(false);
      expect("docket" in locked).toBe(false);
    }
  });

  it("derives the first unfinished guide after a given one", () => {
    const next = nextGuide(guides[0]);
    expect(next?.id).toBe(guides[4].id);
    // The last seeded-complete chain: a completed guide still yields a next.
    expect(nextGuide(guides[4])).not.toBeNull();
  });

  it("lookups and indexes are exact", () => {
    expect(getGuide(readyId)?.id).toBe(readyId);
    expect(getGuide("not-a-real-id")).toBeNull();
    expect(stepIndexOf(guides[0], guides[0].steps[1].id)).toBe(1);
  });
});

describe("directory filter, sort and metrics", () => {
  const base: TrainingFilter = { q: "", topic: "all", sort: "recommended" } as const;

  it("filters by topic and search text, keeping the fixture order otherwise", () => {
    const pricing = filterGuides({ ...base, topic: "pricing" });
    expect(pricing.map((guide) => guide.id)).toEqual([
      guides[2].id,
      guides[4].id,
    ]);
    expect(countTopic("pricing")).toBe(2);

    const leaks = filterGuides({ ...base, q: "leak photos" });
    expect(leaks).toHaveLength(1);
    expect(leaks[0].id).toBe(guides[1].id);

    const quotes = filterGuides({ ...base, q: "quotes" });
    expect(quotes.map((guide) => guide.id)).toEqual([
      guides[2].id,
      guides[7].id,
    ]);
  });

  it("sorts by shortest, in-progress and completed-first", () => {
    const shortest = filterGuides({ ...base, sort: "shortest" });
    expect(shortest[0].minutes).toBeLessThanOrEqual(shortest[1].minutes);

    const activeFirst = filterGuides({ ...base, sort: "active-first" });
    expect(progressFor(activeFirst[0]).status).toBe("in-progress");

    const completedFirst = filterGuides({ ...base, sort: "completed" });
    expect(progressFor(completedFirst[0]).status).toBe("completed");
  });

  it("aggregates honest demo metrics from the seeded progress", () => {
    const metrics = trainingMetrics();
    expect(metrics.inProgress).toBe(2);
    expect(metrics.completed).toBe(4);
    expect(metrics.minutesLogged).toBe(49);
    expect(metrics.overallPercent).toBe(59);
  });
});
