import { afterEach, describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  ArtisanDashboardScreen,
  ArtisanWorkOrdersScreen,
  ArtisanEarningsLedgerScreen,
  ArtisanAvailabilityScreen,
} from "./screens";
import {
  defaultArtisanDashboard,
  defaultArtisanOrders,
  defaultLedgerEntries,
  defaultSchedule,
} from "./service";

afterEach(cleanup);

describe("Artisan Dashboard, Orders, Earnings & Schedule (S36, S37, S38, S39)", () => {
  it("renders S36 Artisan Dashboard with active KPIs and metrics", () => {
    render(<ArtisanDashboardScreen initialData={defaultArtisanDashboard} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Welcome, Sample artisan/i }),
    ).toBeDefined();
    expect(screen.getByText(/Active Work Orders/i)).toBeDefined();
    expect(screen.getByText(/Pending payment previews/i)).toBeDefined();
  });

  it("renders S37 Artisan Work Orders with active milestone badges", () => {
    render(<ArtisanWorkOrdersScreen initialOrders={defaultArtisanOrders} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /My Work Orders & Field Jobs/i,
      }),
    ).toBeDefined();
    expect(screen.getByText(/PPR Water Pipe Burst/i)).toBeDefined();
    expect(screen.getByText(/Milestone 1 Active/i)).toBeDefined();
  });

  it("renders S38 Artisan Earnings Ledger and handles test payout request", async () => {
    render(<ArtisanEarningsLedgerScreen initialLedger={defaultLedgerEntries} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Artisan Earnings Ledger/i }),
    ).toBeDefined();
    expect(screen.getByText(/₦30,000.00/i)).toBeDefined();

    const payoutBtn = screen.getByRole("button", {
      name: /Preview ₦30,000 payout/i,
    });
    fireEvent.click(payoutBtn);

    await waitFor(() => {
      expect(screen.getByText(/No money was transferred/i)).toBeDefined();
    });
  });

  it("renders S39 Artisan Availability and toggles day active states", async () => {
    render(<ArtisanAvailabilityScreen initialSchedule={defaultSchedule} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Weekly Dispatch Availability/i }),
    ).toBeDefined();
    expect(screen.getByText("Monday")).toBeDefined();

    // Toggle Friday off
    const fridayCheckbox = screen.getByLabelText("Friday");
    fireEvent.click(fridayCheckbox);

    // Save schedule
    const saveBtn = screen.getByRole("button", { name: /Save Weekly Schedule/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Weekly dispatch availability schedule updated/i)).toBeDefined();
    });
  });
});

