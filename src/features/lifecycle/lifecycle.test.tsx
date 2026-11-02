import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  PaymentHistoryScreen,
  MyJobsListScreen,
  JobProgressDetailScreen,
  ArtisanAddProgressScreen,
  CustomerSignoffScreen,
} from "./screens";
import { defaultActiveJobs, defaultTransactions } from "./service";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => "/jobs",
}));

afterEach(() => {
  cleanup();
  nav.push.mockClear();
  nav.replace.mockClear();
});

describe("Job Lifecycle & Work Progress (S26, S27, S28, S29, S30)", () => {
  it("renders S26 Payment History with escrow status pills", () => {
    render(<PaymentHistoryScreen initialTransactions={defaultTransactions} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Payment History & Transaction Details/i,
      }),
    ).toBeDefined();
    expect(screen.getByText(/TXN-8819/i)).toBeDefined();
    expect(screen.getByText(/Escrow Locked/i)).toBeDefined();
  });

  it("renders S27 My Jobs list with active jobs and milestones", () => {
    render(<MyJobsListScreen initialJobs={defaultActiveJobs} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /My Jobs & Active Engagements/i }),
    ).toBeDefined();
    expect(screen.getByText(/PPR Water Pipe Burst/i)).toBeDefined();
    expect(screen.getByText(/Work in Progress/i)).toBeDefined();
  });

  it("renders S28 Shared Job Detail & Progress tracker with audit log", () => {
    render(<JobProgressDetailScreen initialJob={defaultActiveJobs[0]} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /PPR Water Pipe Burst & Overhead Tank Balancing in GRA/i,
      }),
    ).toBeDefined();
    expect(screen.getByText(/Live Work Verification Log/i)).toBeDefined();
    expect(screen.getByText(/Acoustic Leak Tracing Complete/i)).toBeDefined();
  });

  it("renders S29 Artisan Add Progress Update form and posts technical update", async () => {
    render(<ArtisanAddProgressScreen job={defaultActiveJobs[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Add Work Progress Update/i }),
    ).toBeDefined();

    const publishBtn = screen.getByRole("button", {
      name: /Publish Progress Update/i,
    });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(screen.getByText(/Work progress logged/i)).toBeDefined();
    });
  });

  it("renders S30 Customer Review & Sign-off screen and submits release authorization", async () => {
    render(<CustomerSignoffScreen job={defaultActiveJobs[0]} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Customer Review & Completion Sign-off/i,
      }),
    ).toBeDefined();

    const signoffBtn = screen.getByRole("button", {
      name: /Authorize Escrow Release & Review/i,
    });
    fireEvent.click(signoffBtn);

    await waitFor(() => {
      expect(screen.getByText(/signed off successfully/i)).toBeDefined();
    });
  });
});
