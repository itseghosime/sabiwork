import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CategoryDirectory } from "./category-directory";
import ErrorPage from "@/app/(public)/artisans/error";
import { PublicShell } from "@/components/public-shell";
import { ResultsCollection } from "./results-collection";
import { artisans } from "./data";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(cleanup);
describe("discovery interaction and recovery", () => {
  it("combines area shortcuts with profile availability and resets both", () => {
    render(<CategoryDirectory />);
    fireEvent.click(screen.getByRole("button", { name: "GRA" }));
    fireEvent.click(
      screen.getByRole("button", { name: "With sample profiles" }),
    );
    expect(screen.getByRole("status").textContent).toContain("2 trades");
    expect(
      screen
        .getByRole("link", { name: /Plumbing & drainage/ })
        .getAttribute("href"),
    ).toContain("area=GRA");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("status").textContent).toContain("6 trades");
  });
  it("switches result layout without losing records and restores mobile focus on Escape", () => {
    const view = render(<ResultsCollection items={[artisans[0]]} />);
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    expect(
      screen.getByRole("button", { name: "Grid" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole("heading", { name: "Osaze Ighodaro" }),
    ).toBeTruthy();
    view.unmount();
    render(
      <PublicShell>
        <p>Content</p>
      </PublicShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.keyDown(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
      { key: "Escape" },
    );
    const toggle = screen.getByRole("button", { name: "Open navigation" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
  });
  it("filters services by the actual task and recovers from no matches", () => {
    render(<CategoryDirectory />);
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search services" }),
      { target: { value: "cabinet" } },
    );
    expect(screen.getByRole("status").textContent).toContain("1 trade");
    expect(
      screen.getByRole("heading", { name: "Carpentry & furniture" }),
    ).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "zz-no-match" },
    });
    expect(
      screen.getByRole("heading", { name: /No services match/ }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Show all services/ }));
    expect(screen.getByRole("status").textContent).toContain("6 trades");
  });
  it("opens mobile navigation, exposes its state, and closes on selection", () => {
    render(
      <PublicShell>
        <p>Directory content</p>
      </PublicShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(
      screen
        .getByRole("button", { name: "Close navigation" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    const mobile = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    fireEvent.click(mobile.querySelector("a")!);
    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).toBeNull();
  });
  it("retries a failed directory request without swallowing errors or exposing details", () => {
    const retry = vi.fn();
    render(
      <ErrorPage
        error={new Error("sensitive internal detail")}
        retry={retry}
      />,
    );
    expect(screen.getByRole("alert").textContent).not.toContain(
      "sensitive internal detail",
    );
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(retry).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("link", { name: "Back to home" }).getAttribute("href"),
    ).toBe("/");
  });
});
