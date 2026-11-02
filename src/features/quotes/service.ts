/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Artisan Open Requests Feed, Sending Quotes, Quote Comparison,
 * Quote Acceptance and Milestone 1 Checkout previews (S17-S21).
 * This adapter performs no dispatch, payment, escrow, or persistence.
 */

export interface OpenRequest {
  id: string;
  title: string;
  category: string;
  tradeSpecialty: string;
  urgency: "emergency" | "standard" | "flexible";
  budgetGuidanceKobo: number;
  district: string;
  address: string;
  postedTime: string;
  description: string;
  quotesCount: number;
  photoCount: number;
}

export interface QuoteItem {
  id: string;
  requestId: string;
  artisanId: string;
  artisanName: string;
  artisanHeadline: string;
  artisanInitials: string;
  artisanRating: number;
  artisanReviewCount: number;
  totalQuoteKobo: number;
  depositKobo: number;
  balanceKobo: number;
  estimatedHours: string;
  materialsIncluded: boolean;
  notes: string;
  milestone1Title: string;
  milestone2Title: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export const defaultOpenRequests: readonly OpenRequest[] = [
  {
    id: "SAMPLE-REQUEST-001",
    title: "PPR Water Pipe Burst & Overhead Tank Balancing in GRA",
    category: "Plumbing",
    tradeSpecialty: "PPR Piping & High Pressure Fusion",
    urgency: "standard",
    budgetGuidanceKobo: 2500000, // ₦25,000
    district: "Sample area",
    address: "Sample service area, Benin City",
    postedTime: "25 minutes ago",
    description:
      "Sample plumbing request for previewing quote and milestone layouts. No service is booked.",
    quotesCount: 3,
    photoCount: 3,
  },
  {
    id: "SAMPLE-REQUEST-002",
    title: "Concealed Conduit Rewiring & Distribution Box Tripping",
    category: "Electrical",
    tradeSpecialty: "Conduit Fault Finding & Breaker Replacement",
    urgency: "emergency",
    budgetGuidanceKobo: 3500000, // ₦35,000
    district: "Airport sample area",
    address: "Sample service area, Benin City",
    postedTime: "1 hour ago",
    description: "Sample electrical request for previewing the quote flow. No service is booked.",
    quotesCount: 2,
    photoCount: 2,
  },
  {
    id: "SAMPLE-REQUEST-003",
    title: "Borehole Sumo Submersible Pump Extraction & Rewinding",
    category: "Plumbing",
    tradeSpecialty: "Sumo Borehole & Motorized Pumps",
    urgency: "flexible",
    budgetGuidanceKobo: 4500000, // ₦45,000
    district: "Sample area",
    address: "Sample service area, Benin City",
    postedTime: "3 hours ago",
    description: "Sample water-system request for previewing the quote flow. No service is booked.",
    quotesCount: 1,
    photoCount: 4,
  },
];

export const defaultDetailedQuotes: readonly QuoteItem[] = [
  {
    id: "quote-01",
    requestId: "SAMPLE-REQUEST-001",
    artisanId: "SAMPLE-ARTISAN-001",
    artisanName: "Sample Artisan 1",
    artisanHeadline: "Sample plumbing profile",
    artisanInitials: "S1",
    artisanRating: 4.9,
    artisanReviewCount: 38,
    totalQuoteKobo: 2200000, // ₦22,000
    depositKobo: 1100000, // ₦11,000
    balanceKobo: 1100000, // ₦11,000
    estimatedHours: "4 - 6 hours",
    materialsIncluded: true,
    notes:
      "Sample quote details only; no service, warranty, or booking is created.",
    milestone1Title: "Acoustic Leak Detection & Surface Floor Preparation",
    milestone2Title: "PPR Fusion Welds, Pressure Testing & Floor Resealing",
    status: "PENDING",
  },
  {
    id: "quote-02",
    requestId: "SAMPLE-REQUEST-001",
    artisanId: "SAMPLE-ARTISAN-002",
    artisanName: "Sample Artisan 2",
    artisanHeadline: "Sample plumbing profile",
    artisanInitials: "S2",
    artisanRating: 4.8,
    artisanReviewCount: 24,
    totalQuoteKobo: 2500000, // ₦25,000
    depositKobo: 1250000,
    balanceKobo: 1250000,
    estimatedHours: "1 full day",
    materialsIncluded: true,
    notes:
      "Sample quote details only; no service, warranty, or booking is created.",
    milestone1Title: "Manifold Isolation & Trench Access",
    milestone2Title: "Brass Valve Assembly & Final Commissioning",
    status: "PENDING",
  },
  {
    id: "quote-03",
    requestId: "SAMPLE-REQUEST-001",
    artisanId: "SAMPLE-ARTISAN-003",
    artisanName: "Sample Artisan 3",
    artisanHeadline: "Sample water-systems profile",
    artisanInitials: "S3",
    artisanRating: 4.7,
    artisanReviewCount: 19,
    totalQuoteKobo: 1950000, // ₦19,500
    depositKobo: 975000,
    balanceKobo: 975000,
    estimatedHours: "3 - 5 hours",
    materialsIncluded: false,
    notes: "Labor only. Client supplies materials.",
    milestone1Title: "Pipe Section Clearance",
    milestone2Title: "Fitting Joints & Water Release",
    status: "PENDING",
  },
];

function waitBriefly(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const quotesDemoService = {
  async getOpenRequests(): Promise<readonly OpenRequest[]> {
    await waitBriefly();
    return defaultOpenRequests;
  },

  async getRequestById(id: string): Promise<OpenRequest | null> {
    await waitBriefly();
    return defaultOpenRequests.find((r) => r.id === id) || defaultOpenRequests[0];
  },

  async submitItemizedQuote(
    input: {
      requestId: string;
      totalQuoteKobo: number;
      depositKobo: number;
      balanceKobo: number;
      estimatedHours: string;
      materialsIncluded: boolean;
      notes: string;
    },
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; quoteId?: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Sample quote preview could not be prepared. No request was sent.",
      };
    }
    return {
      ok: true,
      message: "Sample quote preview prepared locally; no quote was sent to a customer.",
      quoteId: "SAMPLE-QUOTE-PREVIEW",
    };
  },

  async getQuotesForRequest(requestId: string): Promise<readonly QuoteItem[]> {
    await waitBriefly();
    return defaultDetailedQuotes.filter((q) => q.requestId === requestId || !requestId);
  },

  async getQuoteDetails(quoteId: string): Promise<QuoteItem | null> {
    await waitBriefly();
    return defaultDetailedQuotes.find((q) => q.id === quoteId) || defaultDetailedQuotes[0];
  },

  async acceptQuoteAndLockMilestone(
    quoteId: string,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; checkoutRef?: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Sample acceptance preview could not be prepared. No quote or job was changed.",
      };
    }
    return {
      ok: true,
      message: "Sample quote acceptance preview only; no job, payment, or escrow was created.",
      checkoutRef: "SAMPLE-CHECKOUT-PREVIEW",
    };
  },

  async processMilestoneCheckout(
    quoteId: string,
    amountKobo: number,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; escrowRef?: string; jobId?: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Sample checkout preview could not be completed. No payment was attempted.",
      };
    }
    return {
      ok: true,
      message: `Sample checkout preview for ₦${(amountKobo / 100).toLocaleString()}. No payment, escrow, job, or artisan notification occurred.`,
      escrowRef: "SAMPLE-NO-ESCROW",
      jobId: "SAMPLE-NO-JOB",
    };
  },
};
