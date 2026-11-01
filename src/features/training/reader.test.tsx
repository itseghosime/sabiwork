import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GuideReader } from "./guide-reader";
import { guides } from "./data";
import { progressFor, resetTrainingProgress } from "./service";

const markState = vi.hoisted(() => ({ fail: false }));
vi.mock("./service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./service")>();
  return {
    ...actual,
    // Failure switch used by the demo-save error assertions below.
    markStep: async (...args: Parameters<typeof actual.markStep>) => {
      if (markState.fail) throw new Error("demo failure");
      return actual.markStep(...args);
    },
  };
});

const { fail } = markState;

beforeEach(() => {
  fail.value = false;
  resetTrainingProgress();
});

afterEach(() => {
  cleanup();
  fail.value = false;
  resetTrainingProgress();
});

describe("guide reader (S45 demo)", () => {
  it("renders the seeded parts, the sidebar ring and honest sample assets", () => {
    render(<GuideReader guide={guides[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: guides[0].title }),
    ).toBeTruthy();
    expect(screen.getAllByText(/Part 3 of 5/).length).toBeGreaterThan(0);
    // Sidebar checklist mirrors the curriculum with seeded tick 2 of 5.
    expect(screen.getByText("2 of 5 parts read in this demo session.")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /^Mark part/ }).length).toBe(3);
    expect(
      screen.getAllByText("PDF asset · unavailable in TEST mode").length,
    ).toBe(2);
    // Progress percentage shown for remaining action.
    expect(
      screen.getByRole("button", { name: "Finish guide (2/5)" }),
    ).toBeTruthy();
  });

  it("marks a single part read with a saving state and honest toast", async () => {
    render(<GuideReader guide={guides[0]} />);
    const button = screen.getByRole("button", { name: "Mark part 3 read" });
    fireEvent.click(button);
    expect(screen.getByText("Saving (demo)…")).toBeTruthy();
    expect(
      await screen.findByText(
        "Part marked as read (demo). Nothing is saved to a server.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("3 of 5 parts read in this demo session.")).toBeTruthy();
    expect(screen.getByText("Part 3 marked read (demo)")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Mark part 3 read" })).toBeNull();
  });

  it("finishes the whole guide and unlocks the certificate view banner", async () => {
    render(<GuideReader guide={guides[0]} />);
    fireEvent.click(screen.getByRole("button", { name: "Finish guide (2/5)" }));
    expect(
      await screen.findByText(
        "Guide finished (demo). The certificate view is now unlocked.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(/All 5 parts are marked read/),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: /Open certificate view/ })
        .getAttribute("href"),
    ).toBe(`/training/${guides[0].id}/certificate`);
    expect(screen.getByText("5 of 5 parts read in this demo session.")).toBeTruthy();
    expect(progressFor(guides[0]).percent).toBe(100);
  });

  it("recovers from a failed demo save without losing reading state", async () => {
    fail.value = true;
    render(<GuideReader guide={guides[0]} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark part 3 read" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Demo save failed");
    expect(alert.textContent).toContain("try again");
    // The part is still marked unread, so the learner can just retry.
    expect(
      screen.queryByRole("button", { name: "Mark part 3 read" }),
    ).not.toBeNull();
    fail.value = false;
    fireEvent.click(screen.getByRole("button", { name: "Mark part 3 read" }));
    expect(
      await screen.findByText(
        "Part marked as read (demo). Nothing is saved to a server.",
      ),
    ).toBeTruthy();
  });
});
