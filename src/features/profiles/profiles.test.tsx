import { afterEach, describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

afterEach(cleanup);
import {
  ArtisanProfileScreen,
  PortfolioViewerScreen,
  ArtisanProfileEditorScreen,
  ArtisanVerificationScreen,
  ArtisanVerificationStatusScreen,
} from "./screens";
import { defaultArtisan, defaultVerification } from "./service";

describe("Artisan Profiles & Verification (S04, S05, S06, S40, S41)", () => {
  it("renders S04 Artisan Profile screen with name, starting price, and badges", () => {
    render(<ArtisanProfileScreen initialArtisan={defaultArtisan} />);
    expect(screen.getByRole("heading", { level: 1, name: /Osaze Ighodaro/i })).toBeDefined();
    expect(screen.getByText(/₦10,000/i)).toBeDefined();
    expect(screen.getByText(/Master Artisan/i)).toBeDefined();
    expect(screen.getByText(/Admin-Reviewed Profile/i)).toBeDefined();
  });

  it("handles state switching on S04 (pending, skeleton, error)", async () => {
    const { container } = render(<ArtisanProfileScreen initialArtisan={defaultArtisan} />);

    // Switch to skeleton
    const skeletonBtn = container.querySelector(".pf-sim-btn:nth-child(4)") as HTMLButtonElement;
    fireEvent.click(skeletonBtn);
    expect(screen.getByTestId("profile-skeleton")).toBeDefined();

    // Switch to error
    const errorBtn = container.querySelector(".pf-sim-btn:nth-child(5)") as HTMLButtonElement;
    fireEvent.click(errorBtn);
    expect(screen.getByTestId("profile-error")).toBeDefined();

    // Switch back to default
    const defaultBtn = container.querySelector(".pf-sim-btn:nth-child(1)") as HTMLButtonElement;
    fireEvent.click(defaultBtn);
    expect(screen.getByTestId("artisan-profile-screen")).toBeDefined();
  });

  it("renders S05 Portfolio Viewer and allows selecting different proof photos", () => {
    render(
      <PortfolioViewerScreen artisan={defaultArtisan} initialPhotoId="photo-01" />,
    );
    expect(screen.getByTestId("portfolio-viewer-screen")).toBeDefined();
    expect(
      screen.getByText(/Dual Pressure PPR Piping & Manifold Installation/i),
    ).toBeDefined();

    // Click next photo thumbnail
    const nextThumb = screen.getByRole("button", {
      name: /View photo Concealed Wall Vanity/i,
    });
    fireEvent.click(nextThumb);
    expect(screen.getByText(/Concealed Wall Vanity & Trap Replacement/i)).toBeDefined();
  });

  it("renders S06 Profile Editor and simulates profile update", async () => {
    render(<ArtisanProfileEditorScreen initialProfile={defaultArtisan} />);
    expect(screen.getByRole("heading", { level: 1, name: /Edit Trade Profile/i })).toBeDefined();

    const saveBtn = screen.getByRole("button", { name: /Save Profile Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeDefined();
    });
  });

  it("handles step progression and validation in S40 Verification intake", async () => {
    render(<ArtisanVerificationScreen />);
    expect(
      screen.getByRole("heading", { level: 2, name: /Step 1: Artisan Profile Confirmation/i }),
    ).toBeDefined();

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole("button", { name: /Continue to Trade & Guild/i }));
    expect(
      screen.getByRole("heading", { level: 2, name: /Step 2: Trade Skills & Guild Affiliation/i }),
    ).toBeDefined();

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole("button", { name: /Continue to Evidence & NIN/i }));
    expect(
      screen.getByRole("heading", { level: 2, name: /Step 3: Work Evidence & Identity Upload/i }),
    ).toBeDefined();

    // Step 3 -> Step 4
    fireEvent.click(screen.getByRole("button", { name: /Continue to Legal Declaration/i }));
    expect(
      screen.getByRole("heading", { level: 2, name: /Step 4: Legal Declaration & Submission/i }),
    ).toBeDefined();
  });

  it("renders S41 Verification Status tracker with audit timeline", () => {
    render(<ArtisanVerificationStatusScreen initialApplication={defaultVerification} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Verification Status & Badge Review/i }),
    ).toBeDefined();
    expect(screen.getByText(/Application Submitted/i)).toBeDefined();
    expect(screen.getAllByText(/Benin City Hub Desk/i).length).toBeGreaterThan(0);
  });
});
