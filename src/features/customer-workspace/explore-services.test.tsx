import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Artisan } from "@/features/search/data";
import { ExploreServicesScreen } from "./screens";

const listedArtisans: Artisan[] = [
  {
    id: "artisan-db-001",
    name: "Ifeanyi Okoro",
    category: "electrical",
    skills: ["electrical"],
    area: "Ugbowo, GRA",
    headline: "Solar and home-wiring electrician",
    bio: "Residential wiring, inverter installation and electrical repairs.",
    rating: 0,
    reviewCount: 0,
    startingPriceKobo: 0,
    profileReviewed: false,
    portrait: null,
    initials: "IO",
  },
];

afterEach(cleanup);

describe("ExploreServicesScreen", () => {
  it("renders listed artisan data instead of fixture profiles", () => {
    render(<ExploreServicesScreen initialArtisans={listedArtisans} />);

    expect(
      screen.getByRole("heading", { name: "Ifeanyi Okoro" }),
    ).toBeTruthy();
    expect(screen.getByText("No reviews yet")).toBeTruthy();
    expect(screen.getByText("Request a quote")).toBeTruthy();
    expect(screen.getByText("Ugbowo, GRA")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "View profile" }).getAttribute("href"),
    ).toBe("/explore/artisan-db-001");
    expect(screen.queryByText(/Sample Artisan/)).toBeNull();
    expect(screen.getByText(/listed Neon work profiles/)).toBeTruthy();
  });

  it("searches the supplied profiles and reports no matches honestly", () => {
    render(<ExploreServicesScreen initialArtisans={listedArtisans} />);
    const search = screen.getByRole("searchbox", {
      name: "Search trades and artisans",
    });

    fireEvent.change(search, { target: { value: "inverter" } });
    expect(
      screen.getByRole("heading", { name: "Ifeanyi Okoro" }),
    ).toBeTruthy();

    fireEvent.change(search, { target: { value: "no-such-artisan" } });
    expect(
      screen.getByRole("heading", { name: "No profiles match those filters" }),
    ).toBeTruthy();
  });

  it("does not fall back to fixture artisans when there are no live listings", () => {
    render(<ExploreServicesScreen initialArtisans={[]} />);

    expect(
      screen.getByRole("heading", { name: "No listed artisan profiles yet" }),
    ).toBeTruthy();
    expect(screen.queryByText(/Sample Artisan/)).toBeNull();
    expect(
      screen.getByText(/will appear here when artisans publish them/i),
    ).toBeTruthy();
  });

  it("discloses when development presentation seed profiles are shown", () => {
    render(
      <ExploreServicesScreen
        initialArtisans={listedArtisans}
        isPresentationData
      />,
    );

    expect(
      screen.getByText(/fictional seeded profiles are not real artisans/i),
    ).toBeTruthy();
  });
});
