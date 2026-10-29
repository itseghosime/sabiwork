import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CategoryDirectory } from "./category-directory";
import ErrorPage from "@/app/(public)/artisans/error";
import { PublicShell } from "@/components/public-shell";
import { ResultsCollection } from "./results-collection";
import { artisans } from "./data";
import { parseFilters } from "./service";

const nav = vi.hoisted(() => ({ pathname: "/", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ replace: nav.replace }),
}));
afterEach(() => {
  cleanup();
  nav.pathname = "/";
  nav.replace.mockClear();
});
describe("discovery interaction and recovery", () => {
  it("combines area shortcuts with profile availability and resets both", () => {
    render(<CategoryDirectory />);
    fireEvent.click(screen.getByRole("button", { name: "GRA" }));
    expect(screen.getByRole("status").textContent).toContain("2 trades");
    fireEvent.click(
      screen.getByRole("button", { name: "With sample profiles" }),
    );
    expect(
      screen
        .getByRole("link", { name: /Plumbing & drainage/ })
        .getAttribute("href"),
    ).toContain("area=GRA");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("status").textContent).toContain("6 trades");
  });
  it("switches result layout without losing records and restores mobile focus on Escape", () => {
    const view = render(
      <ResultsCollection items={[artisans[0]]} filters={parseFilters({})} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    expect(
      screen.getByRole("button", { name: "Grid" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole("heading", { name: "Osaze Ighodaro" }),
    ).toBeTruthy();
    expect(view.container.querySelector(".artisan-grid")).not.toBeNull();
    expect(view.container.querySelector(".artisan-list")).toBeNull();
    expect(nav.replace).toHaveBeenCalledWith("/artisans?view=grid", {
      scroll: false,
    });
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
  it("finds occupation aliases and does not resurrect menus after route changes", () => {
    const directory = render(<CategoryDirectory />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "electrician" },
    });
    expect(screen.getByRole("status").textContent).toContain("1 trade");
    directory.unmount();
    const shell = render(
      <PublicShell>
        <p>Content</p>
      </PublicShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.keyDown(
      screen.getByRole("button", { name: "Close navigation" }),
      { key: "Escape" },
    );
    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    nav.pathname = "/categories";
    shell.rerender(
      <PublicShell>
        <p>Categories</p>
      </PublicShell>,
    );
    nav.pathname = "/";
    shell.rerender(
      <PublicShell>
        <p>Home</p>
      </PublicShell>,
    );
    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).toBeNull();
    expect(
      shell.container.querySelector("#main-content")?.getAttribute("tabindex"),
    ).toBe("-1");
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
