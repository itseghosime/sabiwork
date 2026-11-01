/**
 * Fictional demonstration data and typed browser-only service adapter
 * for payment verification, receipt, recovery, and balance checkout previews (S22-S25).
 * No provider is connected and this adapter does not move money or persist records.
 */

export type PaymentVerificationState = "SAMPLE_SUCCESS" | "SAMPLE_PENDING" | "SAMPLE_FAILED";

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
  status: "SAMPLE_PREVIEW";
  channel: string;
}

export const defaultReceipt: PaymentReceiptData = {
  paymentRef: "SAMPLE-PAYMENT-001",
  paystackTestRef: "NOT-CONNECTED",
  jobId: "SAMPLE-REQUEST-001",
  jobTitle: "PPR Water Pipe Burst & Overhead Tank Balancing in GRA",
  artisanName: "Sample Artisan 1",
  customerName: "Sample Customer",
  milestoneNumber: 1,
  milestoneTitle: "Mobilization & Acoustic Leak Tracing (50% Deposit)",
  amountKobo: 1100000, // ₦11,000
  totalContractKobo: 2200000, // ₦22,000
  dateWat: "31 Oct 2026 · 15:45 WAT",
  status: "SAMPLE_PREVIEW",
  channel: "Prototype preview only; no provider connected",
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
      status: "SAMPLE_SUCCESS",
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
        message: "Sample payment preview failed. No provider was contacted and no payment was attempted.",
      };
    }
    return {
      ok: true,
      message: `Sample ${method} preview for ₦${(amountKobo / 100).toLocaleString()}. No transaction was made.`,
      newPaymentRef: "SAMPLE-NO-PAYMENT",
    };
  },

  async processBalanceCheckout(
    _jobId: string,
    amountKobo: number,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; receiptRef?: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Sample balance preview failed. No provider was contacted and no payment was attempted.",
      };
    }
    return {
      ok: true,
      message: `Sample balance checkout preview for ₦${(amountKobo / 100).toLocaleString()}. No work was signed off and no funds were released.`,
      receiptRef: "SAMPLE-NO-RECEIPT",
    };
  },
};
