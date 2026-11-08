import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PublicShell } from "./public-shell";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("@/features/accounts/sign-out-button", () => ({
  SignOutButton: () => <button type="button">Sign out</button>,
}));

afterEach(() => {
  cleanup();
  navigation.pathname = "/";
});

describe("public authenticated navigation", () => {
  it("shows the signed-in customer workspace instead of login and signup", () => {
    render(
      <PublicShell
        account={{
          name: "Abdulrahman",
          workspaceHref: "/jobs",
          workspaceLabel: "Customer workspace",
        }}
      >
        <p>Public directory</p>
      </PublicShell>,
    );

    const header = document.querySelector("header")!;
    expect(within(header).getByText("Abdulrahman")).toBeTruthy();
    expect(within(header).getByText("Signed in")).toBeTruthy();
    expect(
      within(header)
        .getByRole("link", { name: /Customer workspace/ })
        .getAttribute("href"),
    ).toBe("/jobs");
    expect(within(header).queryByRole("link", { name: "Log in" })).toBeNull();
    expect(within(header).queryByRole("link", { name: "Sign up" })).toBeNull();
    expect(
      within(document.querySelector("footer")!).queryByRole("link", {
        name: "Log in",
      }),
    ).toBeNull();

    fireEvent.click(within(header).getByRole("button", { name: "Open navigation" }));
    const mobileNav = screen.getByRole("navigation", { name: "Mobile navigation" });
    expect(within(mobileNav).getByText("Abdulrahman")).toBeTruthy();
    expect(within(mobileNav).getByText("Signed in")).toBeTruthy();
    expect(within(mobileNav).queryByRole("link", { name: "Log in" })).toBeNull();
    expect(within(mobileNav).queryByRole("link", { name: "Sign up" })).toBeNull();
  });

  it("does not offer signup when a session lookup is temporarily unavailable", () => {
    render(
      <PublicShell sessionUnavailable>
        <p>Public directory</p>
      </PublicShell>,
    );

    const header = document.querySelector("header")!;
    expect(within(header).getByRole("status").textContent).toContain(
      "Account temporarily unavailable",
    );
    expect(within(header).queryByRole("link", { name: "Log in" })).toBeNull();
    expect(within(header).queryByRole("link", { name: "Sign up" })).toBeNull();
  });
});
