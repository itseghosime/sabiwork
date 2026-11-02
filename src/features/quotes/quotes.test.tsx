import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  OpenRequestsFeedScreen,
  SendItemizedQuoteScreen,
  QuoteComparisonScreen,
  QuoteDetailsAcceptanceScreen,
  MilestoneDepositCheckoutScreen,
} from "./screens";
import { defaultOpenRequests, defaultDetailedQuotes } from "./service";

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
    render(<OpenRequestsFeedScreen initialRequests={defaultOpenRequests} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Open Customer Requests in Benin City/i }),
    ).toBeDefined();
    expect(screen.getByText(/PPR Water Pipe Burst/i)).toBeDefined();

    // Select Airport Road filter
    const select = screen.getByLabelText(/Filter District:/i);
    fireEvent.change(select, { target: { value: "airport" } });
    expect(screen.getByText(/Concealed Conduit Rewiring/i)).toBeDefined();
  });

  it("renders S18 Send Itemized Quote form with milestone calculations", () => {
    render(<SendItemizedQuoteScreen request={defaultOpenRequests[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Send Itemized Quote/i }),
    ).toBeDefined();
    expect(screen.getByLabelText(/Total Quote Amount/i)).toBeDefined();
    expect(screen.getByText(/Milestone 1/i)).toBeDefined();
  });

  it("renders S19 Quote Comparison matrix with all competing quotes", () => {
    render(
      <QuoteComparisonScreen
        request={defaultOpenRequests[0]}
        quotes={defaultDetailedQuotes}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: /Compare Artisan Quotes/i }),
    ).toBeDefined();
    expect(screen.getByText("Osaze Ighodaro")).toBeDefined();
    expect(screen.getByText("Victor E. Edosa")).toBeDefined();
    expect(screen.getByText("Monday Agho")).toBeDefined();
  });

  it("renders S20 Quote Details with milestone breakdown and supports acceptance", async () => {
    render(<QuoteDetailsAcceptanceScreen quote={defaultDetailedQuotes[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Quote from Osaze Ighodaro/i }),
    ).toBeDefined();
    expect(screen.getByText(/Mobilization Deposit/i)).toBeDefined();

    const acceptBtn = screen.getByRole("button", {
      name: /Accept Quote & Proceed to Escrow/i,
    });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(screen.getByText(/Quote accepted/i)).toBeDefined();
    });
  });

  it("renders S21 Milestone Deposit Checkout with Paystack TEST Mode and processes payment", async () => {
    render(<MilestoneDepositCheckoutScreen quote={defaultDetailedQuotes[0]} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Fund Milestone 1 Escrow Deposit/i }),
    ).toBeDefined();
    expect(screen.getByText(/Paystack TEST Mode Card/i)).toBeDefined();

    const payBtn = screen.getByRole("button", {
      name: /Pay ₦11,000 via TEST Mode/i,
    });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByText(/successfully deposited into SabiWork Paystack TEST escrow/i)).toBeDefined();
    });
  });
});

