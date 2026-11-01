import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  AccountSettingsScreen,
  NewJobRequestScreen,
  JobRequestReviewScreen,
  ArtisanMatchingScreen,
} from "./screens";
import {
  defaultSettings,
  defaultJobDraft,
  type JobRequestDraft,
  type MatchingQuote,
} from "./service";

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
  const reviewDraft: JobRequestDraft = {
    ...defaultJobDraft,
    id: "REQ-001",
    title: "Kitchen sink repair",
    category: "Plumbing",
    tradeSpecialty: "Plumbing",
    budgetGuidanceKobo: 2500000,
    district: "GRA",
    address: "GRA",
    description: "Fix leaking trap and replace connector.",
    createdAt: "Now",
  };
  const matchingQuotes: readonly MatchingQuote[] = [
    {
      id: "quote-01",
      artisanId: "worker-1",
      artisanName: "Sample Worker",
      artisanHeadline: "Work profile available",
      artisanInitials: "SW",
      rating: 4.8,
      reviewCount: 10,
      completedJobsCount: 10,
      totalQuoteKobo: 2200000,
      depositKobo: 1100000,
      balanceKobo: 1100000,
      estimatedHours: "4 hours",
      materialsIncluded: false,
      notes: "Sample",
    },
    {
      id: "quote-02",
      artisanId: "worker-2",
      artisanName: "Sample Worker 2",
      artisanHeadline: "Work profile available",
      artisanInitials: "SW",
      rating: 4.6,
      reviewCount: 6,
      completedJobsCount: 8,
      totalQuoteKobo: 2400000,
      depositKobo: 1200000,
      balanceKobo: 1200000,
      estimatedHours: "6 hours",
      materialsIncluded: true,
      notes: "Sample",
    },
  ];

  it("renders S13 Account Settings with current profile preferences", () => {
    render(<AccountSettingsScreen initialSettings={defaultSettings} />);
    expect(screen.getByRole("heading", { level: 1, name: /Account Settings/i })).toBeDefined();
    expect(screen.getByDisplayValue(defaultSettings.fullName)).toBeDefined();
    expect(screen.getByDisplayValue(defaultSettings.email)).toBeDefined();
  });

  it("updates settings and provides user feedback in S13", async () => {
    render(<AccountSettingsScreen initialSettings={defaultSettings} />);
    const saveBtn = screen.getByRole("button", { name: /Save Preferences/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Settings update saved on this device/i)).toBeDefined();
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
    render(<JobRequestReviewScreen initialDraft={reviewDraft} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Review Your Job Request/i }),
    ).toBeDefined();
    expect(screen.getByText(/₦25,000/i)).toBeDefined();
    expect(screen.getByText(/Prototype limitation/i)).toBeDefined();
  });

  it("renders S16 Matching Quotes and supports simulator state switching", () => {
    render(<ArtisanMatchingScreen jobId={reviewDraft.id} initialQuotes={matchingQuotes} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Artisan Matching & Quotes/i }),
    ).toBeDefined();
    expect(screen.getAllByText(/Sample Worker/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sample Worker 2/i).length).toBeGreaterThan(0);

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
