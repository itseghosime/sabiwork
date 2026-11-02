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
  it("renders S22 Payment Verification and handles webhook simulator states", () => {
    render(<PaymentVerificationScreen initialReceipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Payment Verification & Escrow Audit/i }),
    ).toBeDefined();
    expect(screen.getByText(/Paystack TEST Mode Payment Verified/i)).toBeDefined();

    // Switch to pending webhook
    const pendingBtn = screen.getByRole("button", { name: "PENDING_WEBHOOK" });
    fireEvent.click(pendingBtn);
    expect(screen.getByText(/Awaiting Paystack Webhook Confirmation/i)).toBeDefined();

    // Switch to failed
    const failedBtn = screen.getByRole("button", { name: "FAILED" });
    fireEvent.click(failedBtn);
    expect(screen.getByText(/Payment Authorization Failed or Declined/i)).toBeDefined();
  });

  it("renders S23 Payment Receipt with escrow status and printable layout", () => {
    render(<PaymentReceiptScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /SabiWork Payment Receipt/i }),
    ).toBeDefined();
    expect(screen.getByText("PAY-BN-2026-8819")).toBeDefined();
    expect(screen.getByText(/Escrow Protected/i)).toBeDefined();
    expect(screen.getByText("Print Receipt")).toBeDefined();
  });

  it("renders S24 Payment Recovery and processes alternate bank transfer method", async () => {
    render(<PaymentRecoveryScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Alternate Payment Method/i }),
    ).toBeDefined();

    const payBtn = screen.getByRole("button", {
      name: /Pay ₦11,000 via bank_transfer/i,
    });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByText(/submitted in Paystack TEST mode/i)).toBeDefined();
      expect(screen.getByText(/pending server verification/i)).toBeDefined();
      expect(screen.queryByText(/escrow/i)).toBeNull();
    });
  });

  it("renders S25 Milestone Balance Checkout with honest demo messaging", async () => {
    render(<MilestoneBalanceCheckoutScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Fund Milestone 2 Completion Balance/i,
      }),
    ).toBeDefined();

    const payBtn = screen.getByRole("button", {
      name: /Approve & Pay ₦11,000 via TEST Mode/i,
    });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByText(/Milestone 2 balance payment submitted in Paystack TEST mode/i)).toBeDefined();
      expect(screen.getByText(/No sign-off or payout happens in this demo/i)).toBeDefined();
      expect(screen.queryByText(/escrow/i)).toBeNull();
      expect(screen.queryByText(/signed off and released/i)).toBeNull();
    });
  });
});

