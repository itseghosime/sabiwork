import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  OpenRequestsFeedScreen,
  SendItemizedQuoteScreen,
  QuoteComparisonScreen,
  QuoteDetailsAcceptanceScreen,
  MilestoneDepositCheckoutScreen,
} from "./screens";
import { defaultOpenRequests, defaultDetailedQuotes, type QuoteItem } from "./service";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => "/artisan/requests",
}));

afterEach(() => {
  cleanup();
  nav.push.mockClear();
  nav.replace.mockClear();
});

describe("Quotes & Escrow Deposits (S17, S18, S19, S20, S21)", () => {
  it("renders S17 Open Requests Feed and filters by district", () => {
    const requests = [
      defaultOpenRequests[0]!,
      {
        ...defaultOpenRequests[0]!,
        id: "SAMPLE-REQUEST-002",
        title: "Airport electrical rewiring",
        district: "Airport Road",
        address: "Airport Road",
      },
    ];
    render(<OpenRequestsFeedScreen initialRequests={requests} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Open Customer Requests in Benin City/i }),
    ).toBeDefined();
    expect(screen.getByText(defaultOpenRequests[0]!.title)).toBeDefined();

    // Select Airport Road filter
    const select = screen.getByLabelText(/Filter District:/i);
    fireEvent.change(select, { target: { value: "airport" } });
    expect(screen.getByText(/Airport electrical rewiring/i)).toBeDefined();
  });

  it("renders S18 itemized quote preview with sample milestone calculations", () => {
    render(<SendItemizedQuoteScreen request={defaultOpenRequests[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Preview Itemized Quote/i }),
    ).toBeDefined();
    expect(screen.getByLabelText(/Total Quote Amount/i)).toBeDefined();
    expect(screen.getByText(/Milestone 1/i)).toBeDefined();
  });

  it("renders S19 Quote Comparison matrix with all competing quotes", () => {
    const comparisonQuotes: QuoteItem[] = [
      defaultDetailedQuotes[0]!,
      { ...defaultDetailedQuotes[0]!, id: "quote-02", artisanId: "worker-2", artisanName: "Sample Worker Two", artisanInitials: "ST" },
      { ...defaultDetailedQuotes[0]!, id: "quote-03", artisanId: "worker-3", artisanName: "Sample Worker Three", artisanInitials: "ST" },
    ];
    render(
      <QuoteComparisonScreen
        request={defaultOpenRequests[0]}
        quotes={comparisonQuotes}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: /Compare Artisan Quotes/i }),
    ).toBeDefined();
    expect(screen.getByText("Sample Worker")).toBeDefined();
    expect(screen.getByText("Sample Worker Two")).toBeDefined();
    expect(screen.getByText("Sample Worker Three")).toBeDefined();
  });

  it("renders S20 Quote Details with milestone breakdown and supports acceptance", async () => {
    render(<QuoteDetailsAcceptanceScreen quote={defaultDetailedQuotes[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Quote from Sample Worker/i }),
    ).toBeDefined();
    expect(screen.getByText(/Sample Milestone 1 Amount/i)).toBeDefined();

    const acceptBtn = screen.getByRole("button", {
      name: /Preview Quote Acceptance/i,
    });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(screen.getByText(/Quote accepted and job opened/i)).toBeDefined();
    });
  });

  it("renders S21 Milestone Deposit Checkout and previews a payment interaction", async () => {
    render(<MilestoneDepositCheckoutScreen quote={defaultDetailedQuotes[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Preview Milestone 1 Amount/i }),
    ).toBeDefined();
    expect(screen.getByText(/Sample payment channel/i)).toBeDefined();

    const payBtn = screen.getByRole("button", {
      name: /Preview ₦11,000 Amount/i,
    });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByText(/Payments via Paystack are coming soon/i)).toBeDefined();
    });
  });
});
