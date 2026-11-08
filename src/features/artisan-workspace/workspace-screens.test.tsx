import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ArtisanTrainingScreen } from "./training-screen";
import { getTrainingModules } from "@/features/training/service";
import { ArtisanSettingsScreen } from "./settings-screen";
import { defaultArtisanPreferences } from "./device-settings";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks,
  usePathname: () => "/artisan/settings",
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: { signOut: vi.fn() },
}));

const fetchMock = vi.hoisted(() => vi.fn());

const jsonResponse = (status: number, body: unknown = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const envelope = (data: unknown) => jsonResponse(200, { data });

const trainingModules = getTrainingModules().map((module) => ({
  ...module,
  completedSectionIds: [],
  completedAt: null,
  status: "not_started" as const,
  progress: 0,
}));
const trainingStats = {
  completedCount: 0,
  inProgressCount: 0,
  availableCount: trainingModules.length,
  totalHoursLearned: 0,
};
const renderTrainingScreen = () =>
  render(<ArtisanTrainingScreen modules={trainingModules} stats={trainingStats} />);

beforeEach(() => {
  fetchMock.mockReset();
  window.localStorage.clear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Artisan training screen (S46)", () => {
  it("lists guides with progress and links into the guide reader", () => {
    renderTrainingScreen();

    expect(screen.getByRole("heading", { level: 1, name: /Training & master guides/i })).toBeDefined();
    expect(screen.getAllByRole("link", { name: /guide/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Completed|In progress|Not started/).length).toBeGreaterThan(0);
  });

  it("filters by search term and can reset to the full catalogue", () => {
    renderTrainingScreen();
    const searchBox = screen.getByLabelText(/Search training guides/i);
    const allCards = document.querySelectorAll(".aw-course").length;

    fireEvent.change(searchBox, { target: { value: "zzzz-no-match" } });

    expect(screen.getByText(/No guides match that filter/i)).toBeDefined();
    expect(document.querySelectorAll(".aw-course").length).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: /Reset filters/i }));

    expect(document.querySelectorAll(".aw-course").length).toBe(allCards);
  });

  it("filters by progress state", () => {
    renderTrainingScreen();

    fireEvent.click(screen.getByRole("button", { name: /^Not started$/ }));
    const cards = [...document.querySelectorAll(".aw-course")];

    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      expect(card.textContent).toContain("Not started");
    });
  });
});

describe("Artisan settings screen (S45)", () => {
  const account = { role: "artisan", display_name: "Chidi Okeke", email: "chidi@example.com" };

  it("loads the account profile and saves a new display name", async () => {
    fetchMock.mockImplementation((input: RequestInfo) => {
      if (String(input) === "/api/account/profile") {
        return Promise.resolve(envelope(account));
      }
      return Promise.resolve(jsonResponse(404));
    });

    render(<ArtisanSettingsScreen />);

    const nameInput = (await screen.findByDisplayValue("Chidi Okeke")) as HTMLInputElement;
    expect(screen.getByDisplayValue("chidi@example.com")).toBeDefined();

    fireEvent.change(nameInput, { target: { value: "Chidi O. Okeke" } });

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(envelope({ display_name: "Chidi O. Okeke" })),
    );

    fireEvent.click(screen.getByRole("button", { name: /Save profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/Display name updated/i)).toBeDefined();
    });

    const post = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(post).toBeDefined();
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ display_name: "Chidi O. Okeke" });
  });

  it("surfaces a load failure with a retry affordance", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { error: { code: "PROFILE_REQUIRED", message: "Profile missing." } }),
    );

    render(<ArtisanSettingsScreen />);

    expect(await screen.findByText("Profile missing.")).toBeDefined();
    expect(screen.getByRole("button", { name: /Try again/i })).toBeDefined();
  });

  it("writes artisan alert preferences under the artisan-only storage key", async () => {
    fetchMock.mockResolvedValue(envelope(account));

    render(<ArtisanSettingsScreen />);
    await screen.findByDisplayValue("Chidi Okeke");

    fireEvent.click(screen.getByRole("checkbox", { name: /Training suggestions/i }));

    const stored = JSON.parse(window.localStorage.getItem("sabiwork.artisan.preferences") ?? "{}");
    expect(stored).toEqual({ ...defaultArtisanPreferences, trainingNudges: true });
    expect(window.localStorage.getItem("sabiwork.customer.preferences")).toBeNull();
  });

  it("links to the artisan-scoped work and training pages", async () => {
    fetchMock.mockResolvedValue(envelope(account));

    render(<ArtisanSettingsScreen />);
    await screen.findByDisplayValue("Chidi Okeke");

    expect(screen.getByRole("link", { name: /Open training/i }).getAttribute("href")).toBe(
      "/artisan/training",
    );
    expect(screen.getByRole("link", { name: /Set availability/i }).getAttribute("href")).toBe(
      "/artisan/availability",
    );
  });
});
