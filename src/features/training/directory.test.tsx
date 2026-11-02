import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TrainingDirectory } from "./training-directory";
import { guides } from "./data";
import { resetTrainingProgress } from "./service";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

beforeEach(() => {
  resetTrainingProgress();
});

afterEach(() => {
  cleanup();
  resetTrainingProgress();
  nav.pathname = "/";
});

const cardCount = (container: HTMLElement): number =>
  container.querySelectorAll(".training-card").length;

describe("training directory (S44 demo)", () => {
  it("renders the full catalogue with honest demo metrics", () => {
    const view = render(<TrainingDirectory guides={guides} />);
    expect(screen.getByRole("heading", { level: 1, name: /training/i })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /guide/i }).length).toBeGreaterThan(
      0,
    );
    // Seeded fixture: four completed, two in progress, 49 demo minutes.
    expect(screen.getByText("4 guides")).toBeTruthy();
    expect(screen.getByText("2 guides")).toBeTruthy();
    expect(screen.getByText("49 mins")).toBeTruthy();
    expect(screen.getByText("59%")).toBeTruthy();
    expect(cardCount(view.container)).toBe(guides.length);
  });

  it("features the first in-progress guide and links its reader", () => {
    render(<TrainingDirectory guides={guides} />);
    const featured = screen.getByLabelText("Resume learning");
    expect(featured.textContent).toContain(guides[0].title);
    expect(featured.textContent).toContain("Part 3 of 5");
    expect(
      screen.getByRole("link", { name: /Resume guide/ }).getAttribute("href"),
    ).toBe(`/training/${guides[0].id}`);
  });

  it("searches, clears and falls back to an honest empty state", () => {
    const view = render(<TrainingDirectory guides={guides} />);
    fireEvent.change(screen.getByLabelText("Search training guides"), {
      target: { value: "leak photos" },
    });
    expect(cardCount(view.container)).toBe(1);
    expect(
      screen.getByRole("heading", { name: /Documenting jobsite proofs/ }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(cardCount(view.container)).toBe(guides.length);
    fireEvent.change(screen.getByLabelText("Search training guides"), {
      target: { value: "zz-no-match" },
    });
    expect(
      screen.getByRole("heading", { name: "No training guides found." }),
    ).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(
      "demo catalogue",
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Reset filters/ }),
    );
    expect(cardCount(view.container)).toBe(guides.length);
  });

  it("filters by topic pills with pressed state", () => {
    const view = render(<TrainingDirectory guides={guides} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Pricing & quotes\s*2/ }),
    );
    expect(
      screen
        .getByRole("button", { name: /Pricing & quotes\s*2/ })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(cardCount(view.container)).toBe(2);
    fireEvent.click(screen.getByRole("button", { name: /^All 8/ }));
    expect(cardCount(view.container)).toBe(guides.length);
  });

  it("changes the sort order without losing rows", () => {
    const view = render(<TrainingDirectory guides={guides} />);
    fireEvent.change(screen.getByLabelText(/Sort/), {
      target: { value: "shortest" },
    });
    const first = view.container.querySelector(".training-card h3");
    expect(first?.textContent).toContain("De-escalating scope creep");
    expect(cardCount(view.container)).toBe(guides.length);
  });
});
