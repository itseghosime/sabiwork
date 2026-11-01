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
  previewDossierApproval,
  previewDossierRevision,
  previewArtisanRegistration,
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

  it("previews an approval without verifying documents or issuing a badge", () => {
    const res = previewDossierApproval("SAMPLE-VERIFY-001", "Sample approval preview");
    expect(res.success).toBe(true);
    expect(res.dossier?.status).toBe("approved");
    expect(res.dossier?.documents.every((document) => document.verified !== true)).toBe(true);
  });

  it("previews a revision request without contacting an applicant", () => {
    const res = previewDossierRevision("SAMPLE-VERIFY-002", ["Sample document placeholder"], "Sample revision preview");
    expect(res.success).toBe(true);
    expect(res.dossier?.status).toBe("rejected");
  });

  it("returns a fixed registration preview without creating a dossier", () => {
    const countBefore = getVerificationDossiers().length;
    const res = previewArtisanRegistration();
    expect(res.previewed).toBe(true);
    expect(res.reference).toBe("SAMPLE-REGISTRATION-PREVIEW");
    expect(getVerificationDossier(res.reference)).toBeUndefined();
    expect(getVerificationDossiers()).toHaveLength(countBefore);
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
    expect(screen.getByText(/Enter a sample name to preview the form/i)).toBeDefined();

    // Fill Step 1
    const nameInput = screen.getByLabelText(/Sample Name/i);
    const phoneInput = screen.getByLabelText(/Sample Contact Value/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Secure Password/i);

    fireEvent.change(nameInput, { target: { value: "Sample Artisan" } });
    fireEvent.change(phoneInput, { target: { value: "sample-contact-001" } });
    fireEvent.change(emailInput, { target: { value: "artisan@example.test" } });
    fireEvent.change(passwordInput, { target: { value: "sample-password" } });

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
    render(<AdminDossierReviewScreen id="SAMPLE-VERIFY-005" />);
    expect(screen.getByText(/Dossier SAMPLE-VERIFY-005/i)).toBeDefined();
    expect(screen.getByText(/Sample Skills \(Not Tested\)/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Preview sample approval/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Preview revision request/i })).toBeDefined();
  });
});
