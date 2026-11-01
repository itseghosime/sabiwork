import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
import {
  ArtisanSignupScreen,
  AdminVerificationQueueScreen,
  AdminDossierReviewScreen,
} from "./screens";
import {
  getVerificationDossiers,
  getVerificationDossier,
  getDossierMetrics,
  approveDossier,
  rejectDossier,
  registerArtisan,
} from "./service";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/admin/verification",
}));

describe("Verification Service", () => {
  it("returns all dossiers and metrics", () => {
    const dossiers = getVerificationDossiers();
    expect(dossiers.length).toBeGreaterThan(0);
    const metrics = getDossierMetrics();
    expect(metrics.total).toBe(dossiers.length);
    expect(metrics.averageTurnaroundHours).toBe(18);
  });

  it("filters dossiers by status", () => {
    const pending = getVerificationDossiers("pending");
    expect(pending.every((d) => d.status === "pending")).toBe(true);
  });

  it("approves a dossier and issues badge", () => {
    const res = approveDossier("VET-BEN-4081", "Approved via automated test");
    expect(res.success).toBe(true);
    expect(res.dossier?.status).toBe("approved");
    expect(res.dossier?.badgeIssued).toBe(true);
  });

  it("rejects a dossier with reasons", () => {
    const res = rejectDossier("VET-BEN-4082", ["Low resolution NIN"], "Please re-upload");
    expect(res.success).toBe(true);
    expect(res.dossier?.status).toBe("rejected");
    expect(res.dossier?.badgeIssued).toBe(false);
  });

  it("registers a new artisan draft into the queue", () => {
    const res = registerArtisan({
      fullName: "Test Artisan",
      phone: "+234 800 000 0000",
      email: "artisan@example.test",
      trade: "Carpentry",
      experienceYears: 4,
      coverageAreas: ["GRA"],
      workshopAddress: "GRA district (sample location)",
      bio: "Skilled carpenter",
      ninNumber: "00000000000",
    });
    expect(res.success).toBe(true);
    expect(res.dossierId).toContain("VET-BEN-");
    const found = getVerificationDossier(res.dossierId);
    expect(found).toBeDefined();
    expect(found?.fullName).toBe("Test Artisan");
  });
});

describe("Verification Screens UI", () => {
  it("renders S08 Artisan Signup and validates required step fields", () => {
    render(<ArtisanSignupScreen />);
    expect(screen.getByText(/Create an artisan account/i)).toBeDefined();
    expect(screen.getByText(/Step 1 of 5/i)).toBeDefined();

    // Click continue with empty inputs to trigger validation error
    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueBtn);
    expect(screen.getByText(/Please enter your full legal name/i)).toBeDefined();

    // Fill Step 1
    const nameInput = screen.getByLabelText(/Full Legal Name/i);
    const phoneInput = screen.getByLabelText(/Benin City Phone Number/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Secure Password/i);

    fireEvent.change(nameInput, { target: { value: "Sample Artisan" } });
    fireEvent.change(phoneInput, { target: { value: "+234 800 000 0000" } });
    fireEvent.change(emailInput, { target: { value: "artisan@example.test" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(continueBtn);
    expect(screen.getByText(/Step 2: Trade Specialization & Coverage/i)).toBeDefined();
  });

  it("renders S42 Admin Verification Queue and filters list", () => {
    render(<AdminVerificationQueueScreen />);
    expect(screen.getByText(/Artisan Verification Queue/i)).toBeDefined();
    expect(screen.getByText(/Prototype queue/i)).toBeDefined();
    expect(screen.getByText(/Export sample CSV/i)).toBeDefined();

    // Click Pending filter tab
    const pendingTab = screen.getByRole("button", { name: /Pending \(/i });
    fireEvent.click(pendingTab);
    expect(pendingTab).toBeDefined();
  });

  it("renders S43 Admin Dossier Review and shows competencies", () => {
    render(<AdminDossierReviewScreen id="VET-BEN-4085" />);
    expect(screen.getByText(/Dossier VET-BEN-4085/i)).toBeDefined();
    expect(screen.getByText(/Declared Competencies & Trade Testing/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Issue Pro Badge/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Request Revision \/ Reject/i })).toBeDefined();
  });
});
