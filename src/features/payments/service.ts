/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Payment Verification, Receipt, Recovery, and Milestone Balance Checkout (S22, S23, S24, S25).
 * Follows Clear Trade Modern specification, Paystack TEST Mode, and integer-kobo money calculations.
 */

export type PaymentVerificationState = "VERIFIED" | "PENDING_WEBHOOK" | "FAILED";

export interface PaymentReceiptData {
  paymentRef: string;
  paystackTestRef: string;
  jobId: string;
  jobTitle: string;
  artisanName: string;
  customerName: string;
  milestoneNumber: 1 | 2;
  milestoneTitle: string;
  amountKobo: number;
  totalContractKobo: number;
  dateWat: string;
  status: "ESCROW_LOCKED" | "RELEASED_TO_ARTISAN";
  channel: string;
}

export const defaultReceipt: PaymentReceiptData = {
  paymentRef: "PAY-BN-2026-8819",
  paystackTestRef: "DEMO-PROVIDER-REF",
  jobId: "BEN-78401",
  jobTitle: "PPR Water Pipe Burst & Overhead Tank Balancing in GRA",
  artisanName: "Sample artisan",
  customerName: "Sample customer",
  milestoneNumber: 1,
  milestoneTitle: "Mobilization & Acoustic Leak Tracing (50% Deposit)",
  amountKobo: 1100000, // ₦11,000
  totalContractKobo: 2200000, // ₦22,000
  dateWat: "31 Oct 2026 · 15:45 WAT",
  status: "ESCROW_LOCKED",
  channel: "Sample payment method — no charge",
};

function waitBriefly(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const paymentsDemoService = {
  async verifyPayment(
    reference: string,
    simulateState?: PaymentVerificationState,
  ): Promise<{ status: PaymentVerificationState; receipt: PaymentReceiptData }> {
    await waitBriefly();
    if (simulateState) {
      return {
        status: simulateState,
        receipt: { ...defaultReceipt, paymentRef: reference || defaultReceipt.paymentRef },
      };
    }
    return {
      status: "VERIFIED",
      receipt: { ...defaultReceipt, paymentRef: reference || defaultReceipt.paymentRef },
    };
  },

  async getReceipt(paymentRef: string): Promise<PaymentReceiptData> {
    await waitBriefly();
    return {
      ...defaultReceipt,
      paymentRef: paymentRef || defaultReceipt.paymentRef,
    };
  },

  async processAlternatePayment(
    method: "bank_transfer" | "ussd" | "card",
    amountKobo: number,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; newPaymentRef?: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Preview error state. No payment gateway is connected and no transaction was attempted.",
      };
    }
    return {
      ok: true,
      message: `Payment preview complete for ₦${(amountKobo / 100).toLocaleString()} via ${method}. No payment was made.`,
      newPaymentRef: `DEMO-ALT-${Math.floor(10000 + Math.random() * 90000)}`,
    };
  },

  async processBalanceCheckout(
    jobId: string,
    amountKobo: number,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; receiptRef?: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Preview error state. No payment gateway is connected and no transaction was attempted.",
      };
    }
    return {
      ok: true,
      message: `Final balance preview: ₦${(amountKobo / 100).toLocaleString()}. No charge or release occurred.`,
      receiptRef: `DEMO-BAL-${Math.floor(10000 + Math.random() * 90000)}`,
    };
  },
};

