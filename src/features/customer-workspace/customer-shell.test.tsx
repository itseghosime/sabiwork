import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { CustomerShell, boardNav } from "./customer-shell";

const navigationMocks = vi.hoisted(() => ({ pathname: "/dashboard" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: { signOut: vi.fn() },
}));

function renderShell(pathname = "/dashboard") {
  navigationMocks.pathname = pathname;
  return render(
    <CustomerShell displayName="Ada Okafor">
      <p>Board content</p>
    </CustomerShell>,
  );
}

beforeEach(() => {
  navigationMocks.pathname = "/dashboard";
});

afterEach(() => {
  cleanup();
});

describe("CustomerShell navigation", () => {
  it("shows the five primary destinations in the top bar", () => {
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Customer board" });

    expect(within(nav).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Dashboard",
      "Explore",
      "Requests",
      "Bookings",
      "Payments",
    ]);
    expect(boardNav).toHaveLength(5);
  });

  it("moves reviews and support into the account menu", () => {
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Customer board" });
    expect(within(nav).queryByRole("link", { name: "Reviews" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /customer|ada/i }));

    const menu = screen.getByRole("group", { name: "Account menu" });
    expect(
      within(menu).getByRole("link", { name: /Reviews/ }).textContent?.trim(),
    ).toBe("Reviews");
    expect(
      within(menu).getByRole("link", { name: /Help & support/ }).textContent?.trim(),
    ).toBe("Help & support");
  });

  it("keeps the section active on nested routes", () => {
    renderShell("/jobs/job_01");
    const nav = screen.getByRole("navigation", { name: "Customer board" });

    expect(
      within(nav).getByRole("link", { name: "Bookings" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(
      within(nav)
        .getByRole("link", { name: "Dashboard" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("offers the post-a-request call to action", () => {
    renderShell();
    expect(
      screen.getAllByRole("link", { name: /Post a request/ }).length,
    ).toBeGreaterThan(0);
  });

  it("no longer mentions Paystack", () => {
    renderShell();
    expect(document.body.textContent).not.toMatch(/paystack/i);
  });

  it("renders the page content it wraps", () => {
    renderShell();
    expect(screen.getByText("Board content").textContent).toBe("Board content");
  });
});
