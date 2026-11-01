import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  TrainingDirectoryScreen,
  GuideReaderScreen,
  CertificateScreen,
} from "./screens";
import {
  getTrainingModules,
  getTrainingModule,
  getTrainingStats,
  previewModuleCompletion,
  getSampleCertificatePreview,
} from "./service";

afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/training",
}));

describe("Training Service", () => {
  it("returns training modules and statistics", () => {
    const modules = getTrainingModules();
    expect(modules.length).toBeGreaterThan(0);
    const stats = getTrainingStats();
    expect(stats.totalHoursLearned).toBe(8.5);
    expect(stats.completedCount).toBeGreaterThan(0);
  });

  it("filters modules by category", () => {
    const safetyModules = getTrainingModules("safety");
    expect(safetyModules.every((m) => m.category === "safety")).toBe(true);
  });

  it("fetches single module and marks complete with certificate", () => {
    const mod = getTrainingModule("SAMPLE-MODULE-05");
    expect(mod).toBeDefined();
    const res = previewModuleCompletion("SAMPLE-MODULE-05");
    expect(res.previewed).toBe(true);
    expect(res.module?.status).toBe("completed");
    expect(res.module?.certificatePreview).toBeDefined();
    expect(res.module?.certificatePreview?.serialNumber).toBe("NOT ISSUED - SAMPLE");
  });

  it("fetches certificate for completed module", () => {
    const cert = getSampleCertificatePreview("SAMPLE-MODULE-01");
    expect(cert).toBeDefined();
    expect(cert?.holderName).toBe("Sample Artisan");
  });
});

describe("Training Screens UI", () => {
  it("renders S44 Training Directory with filter pills and modules", () => {
    render(<TrainingDirectoryScreen />);
    expect(screen.getByText(/Artisan Training & Master Guides/i)).toBeDefined();
    expect(screen.getAllByText(/Sample content/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Site Safety/i)).toBeDefined();

    // Click filter pill
    const safetyBtn = screen.getByRole("button", { name: /Site Safety/i });
    fireEvent.click(safetyBtn);
    expect(safetyBtn).toBeDefined();
  });

  it("renders S45 Guide Reader and displays sections and takeaways", () => {
    render(<GuideReaderScreen id="SAMPLE-MODULE-01" />);
    expect(screen.getByText(/Active Study Guide/i)).toBeDefined();
    expect(screen.getByText(/4 Core Takeaways for Every Callout/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Mark as Complete & Continue/i })).toBeDefined();
  });

  it("renders S46 Certificate of Course Completion", () => {
    render(<CertificateScreen id="SAMPLE-MODULE-01" />);
    expect(screen.getByText(/Sample Certificate Preview — Not Issued/i)).toBeDefined();
    expect(screen.getByText(/Sample Artisan/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Print \/ Export Sample Preview/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Open Sample Profile Preview/i })).toBeDefined();
  });
});
