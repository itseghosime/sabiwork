import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  PaymentVerificationScreen,
  PaymentReceiptScreen,
  PaymentRecoveryScreen,
  MilestoneBalanceCheckoutScreen,
} from "./screens";
import { defaultReceipt } from "./service";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => "/payments",
}));

afterEach(() => {
  cleanup();
  nav.push.mockClear();
  nav.replace.mockClear();
});

describe("Payments, Verification & Receipts (S22, S23, S24, S25)", () => {
  it("renders S22 Payment Verification and handles sample state controls", () => {
    render(<PaymentVerificationScreen initialReceipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Payment Status Preview/i }),
    ).toBeDefined();
    expect(screen.getByText(/Sample payment preview/i)).toBeDefined();

    // Switch to pending webhook
    const pendingBtn = screen.getByRole("button", { name: "SAMPLE_PENDING" });
    fireEvent.click(pendingBtn);
    expect(screen.getByText(/Sample pending state/i)).toBeDefined();

    // Switch to failed
    const failedBtn = screen.getByRole("button", { name: "SAMPLE_FAILED" });
    fireEvent.click(failedBtn);
    expect(screen.getByText(/Sample failure state/i)).toBeDefined();
  });

  it("renders S23 sample receipt without payment evidence", () => {
    render(<PaymentReceiptScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Sample Payment Receipt Preview/i }),
    ).toBeDefined();
    expect(screen.getByText("SAMPLE-PAYMENT-001")).toBeDefined();
    expect(screen.getByText(/SAMPLE ONLY · NOT PAID/i)).toBeDefined();
    expect(screen.getByText("Print Sample Preview")).toBeDefined();
  });

  it("renders S24 Payment Recovery and previews an alternate method", async () => {
    render(<PaymentRecoveryScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Alternate Payment Method Preview/i }),
    ).toBeDefined();

    const payBtn = screen.getByRole("button", {
      name: /Preview ₦11,000 via bank_transfer/i,
    });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByText(/No transaction was made/i)).toBeDefined();
    });
  });

  it("renders S25 Milestone Balance Checkout and previews a checkout interaction", async () => {
    render(<MilestoneBalanceCheckoutScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Preview Milestone 2 Balance Checkout/i,
      }),
    ).toBeDefined();

    const payBtn = screen.getByRole("button", {
      name: /Preview ₦11,000 checkout/i,
    });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByText(/No work was signed off and no funds were released/i)).toBeDefined();
    });
  });
});
