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
      screen.getByRole("heading", { level: 1, name: /Payment Status Preview/i }),
    ).toBeDefined();
    expect(screen.getByText(/Payment preview complete/i)).toBeDefined();

    // Switch to pending webhook
    const pendingBtn = screen.getByRole("button", { name: "PENDING_WEBHOOK" });
    fireEvent.click(pendingBtn);
    expect(screen.getByText(/Simulated pending state/i)).toBeDefined();

    // Switch to failed
    const failedBtn = screen.getByRole("button", { name: "FAILED" });
    fireEvent.click(failedBtn);
    expect(screen.getByText(/Simulated payment failure/i)).toBeDefined();
  });

  it("renders an explicitly labelled sample receipt with printable layout", () => {
    render(<PaymentReceiptScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /SabiWork Payment Receipt/i }),
    ).toBeDefined();
    expect(screen.getByText("PAY-BN-2026-8819")).toBeDefined();
    expect(screen.getByText(/Sample only/i)).toBeDefined();
    expect(screen.getByText("Print Receipt")).toBeDefined();
  });

  it("renders S24 Payment Recovery and processes alternate bank transfer method", async () => {
    render(<PaymentRecoveryScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Alternate Payment Method/i }),
    ).toBeDefined();

    const payBtn = screen.getByRole("button", {
      name: /Preview ₦11,000 via bank_transfer/i,
    });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByText(/No payment was made/i)).toBeDefined();
    });
  });

  it("renders S25 Milestone Balance Checkout and approves completion sign-off", async () => {
    render(<MilestoneBalanceCheckoutScreen receipt={defaultReceipt} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Review final balance preview/i,
      }),
    ).toBeDefined();

    const payBtn = screen.getByRole("button", {
      name: /Confirm completion & review/i,
    });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByText(/No charge or release occurred/i)).toBeDefined();
    });
  });
});

