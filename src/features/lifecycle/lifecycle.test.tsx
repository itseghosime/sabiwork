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
  it("renders S26 sample Payment History without claiming escrow records", () => {
    render(<PaymentHistoryScreen initialTransactions={defaultTransactions} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Sample Payment History/i,
      }),
    ).toBeDefined();
    expect(screen.getByText(new RegExp(defaultTransactions[0]!.id, "i"))).toBeDefined();
    expect(screen.getAllByText(/Sample payment preview · not paid/i)).toHaveLength(
      defaultTransactions.length,
    );
  });

  it("renders S27 sample job statuses and milestones", () => {
    render(<MyJobsListScreen initialJobs={defaultActiveJobs} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /My Jobs & Active Engagements/i }),
    ).toBeDefined();
    expect(screen.getByText(defaultActiveJobs[0]!.title)).toBeDefined();
    expect(screen.getByText(/Sample in-progress state/i)).toBeDefined();
  });

  it("renders S28 Shared Job Detail & Progress tracker with audit log", () => {
    render(<JobProgressDetailScreen initialJob={defaultActiveJobs[0]} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: new RegExp(defaultActiveJobs[0]!.title, "i"),
      }),
    ).toBeDefined();
    expect(screen.getByText(/Sample Work Progress Log/i)).toBeDefined();
    expect(screen.getByText(/Sample milestone 1 status/i)).toBeDefined();
  });

  it("renders S29 Artisan Add Progress Update form and posts technical update", async () => {
    render(<ArtisanAddProgressScreen job={defaultActiveJobs[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Add Work Progress Update/i }),
    ).toBeDefined();

    const publishBtn = screen.getByRole("button", {
      name: /Preview Progress Update/i,
    });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(screen.getByText(/Progress update posted/i)).toBeDefined();
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
      name: /Preview Sign-off & Review/i,
    });
    fireEvent.click(signoffBtn);

    await waitFor(() => {
      expect(screen.getByText(/Job marked as completed/i)).toBeDefined();
    });
  });
});
