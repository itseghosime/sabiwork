import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  AccountSettingsScreen,
  NewJobRequestScreen,
  JobRequestReviewScreen,
  ArtisanMatchingScreen,
} from "./screens";
import { defaultSettings, defaultJobDraft, defaultQuotes } from "./service";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => "/requests",
}));

afterEach(() => {
  cleanup();
  nav.push.mockClear();
  nav.replace.mockClear();
});

describe("Customer Requests & Matching (S13, S14, S15, S16)", () => {
  it("renders S13 Account Settings with current profile preferences", () => {
    render(<AccountSettingsScreen initialSettings={defaultSettings} />);
    expect(screen.getByRole("heading", { level: 1, name: /Account Settings/i })).toBeDefined();
    expect(screen.getByDisplayValue("Osamudiamen Osazuwa")).toBeDefined();
    expect(screen.getByDisplayValue("o.osazuwa@example.com")).toBeDefined();
  });

  it("updates settings and provides user feedback in S13", async () => {
    render(<AccountSettingsScreen initialSettings={defaultSettings} />);
    const saveBtn = screen.getByRole("button", { name: /Save Preferences/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Customer preferences and notifications updated successfully/i)).toBeDefined();
    });
  });

  it("renders S14 New Job Request form with scope and budget guidance", () => {
    render(<NewJobRequestScreen />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Post a New Job Request/i }),
    ).toBeDefined();
    expect(screen.getByLabelText(/Job Title \/ Summary/i)).toBeDefined();
    expect(screen.getByLabelText(/Estimated Budget Guidance/i)).toBeDefined();
  });

  it("renders S15 Job Request Review screen with formatted budget and escrow advice", () => {
    render(<JobRequestReviewScreen initialDraft={defaultJobDraft} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Review Your Job Request/i }),
    ).toBeDefined();
    expect(screen.getByText(/₦25,000/i)).toBeDefined();
    expect(screen.getByText(/Paystack TEST Mode SafeTrade/i)).toBeDefined();
  });

  it("renders S16 Matching Quotes and supports simulator state switching", () => {
    render(<ArtisanMatchingScreen jobId={defaultJobDraft.id} initialQuotes={defaultQuotes} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Artisan Matching & Quotes/i }),
    ).toBeDefined();
    expect(screen.getByText(/Osaze Ighodaro/i)).toBeDefined();
    expect(screen.getByText(/Victor E. Edosa/i)).toBeDefined();

    // Switch to awaiting state
    const awaitingBtn = screen.getByRole("button", { name: "awaiting" });
    fireEvent.click(awaitingBtn);
    expect(screen.getByTestId("matching-awaiting")).toBeDefined();

    // Switch to loading state
    const loadingBtn = screen.getByRole("button", { name: "loading" });
    fireEvent.click(loadingBtn);
    expect(screen.getByTestId("matching-loading")).toBeDefined();

    // Switch to error state
    const errorBtn = screen.getByRole("button", { name: "error" });
    fireEvent.click(errorBtn);
    expect(screen.getByTestId("matching-error")).toBeDefined();
  });
});
