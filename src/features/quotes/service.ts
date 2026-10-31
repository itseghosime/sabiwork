/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Artisan Open Requests Feed, Sending Quotes, Quote Comparison,
 * Quote Acceptance, and Milestone 1 Escrow Deposit Checkout (S17, S18, S19, S20, S21).
 * Follows Clear Trade Modern specification, Paystack TEST Mode, and integer-kobo money calculations.
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
    id: "BEN-78401",
    title: "PPR Water Pipe Burst & Overhead Tank Balancing in GRA",
    category: "Plumbing",
    tradeSpecialty: "PPR Piping & High Pressure Fusion",
    urgency: "standard",
    budgetGuidanceKobo: 2500000, // ₦25,000
    district: "GRA / Boundary Rd",
    address: "12A Ihama Way, Off Boundary Rd, GRA, Benin City",
    postedTime: "25 minutes ago",
    description:
      "Water leakage discovered under the master bathroom floor tiles. Need pressure leak tracing, PPR pipe replacement, and bypass valve pressure check before 5 PM tomorrow.",
    quotesCount: 3,
    photoCount: 3,
  },
  {
    id: "BEN-78402",
    title: "Concealed Conduit Rewiring & Distribution Box Tripping",
    category: "Electrical",
    tradeSpecialty: "Conduit Fault Finding & Breaker Replacement",
    urgency: "emergency",
    budgetGuidanceKobo: 3500000, // ₦35,000
    district: "Airport Road",
    address: "42 Airport Road, Opposite St. Paul, Benin City",
    postedTime: "1 hour ago",
    description:
      "Main breaker trips repeatedly whenever AC units turn on. Suspected short circuit in ceiling conduit run.",
    quotesCount: 2,
    photoCount: 2,
  },
  {
    id: "BEN-78403",
    title: "Borehole Sumo Submersible Pump Extraction & Rewinding",
    category: "Plumbing",
    tradeSpecialty: "Sumo Borehole & Motorized Pumps",
    urgency: "flexible",
    budgetGuidanceKobo: 4500000, // ₦45,000
    district: "Ugbowo Axis",
    address: "Near UNIBEN Main Gate, Ugbowo, Benin City",
    postedTime: "3 hours ago",
    description:
      "0.75HP submersible pump stuck at 120ft depth. Requires crane rig or manual tripod pull and motor capacitor inspection.",
    quotesCount: 1,
    photoCount: 4,
  },
];

export const defaultDetailedQuotes: readonly QuoteItem[] = [
  {
    id: "quote-01",
    requestId: "BEN-78401",
    artisanId: "00000000-0000-4000-8000-000000000001",
    artisanName: "Osaze Ighodaro",
    artisanHeadline: "Master Plumber & Pipe Fitter · Vetted GRA Pro",
    artisanInitials: "OI",
    artisanRating: 4.9,
    artisanReviewCount: 38,
    totalQuoteKobo: 2200000, // ₦22,000
    depositKobo: 1100000, // ₦11,000
    balanceKobo: 1100000, // ₦11,000
    estimatedHours: "4 - 6 hours",
    materialsIncluded: true,
    notes:
      "Includes digital acoustic leak detection, PPR fusion sleeve installation, and replacement of pressure check valves.",
    milestone1Title: "Acoustic Leak Detection & Surface Floor Preparation",
    milestone2Title: "PPR Fusion Welds, Pressure Testing & Floor Resealing",
    status: "PENDING",
  },
  {
    id: "quote-02",
    requestId: "BEN-78401",
    artisanId: "00000000-0000-4000-8000-000000000002",
    artisanName: "Victor E. Edosa",
    artisanHeadline: "Certified Plumbing & Sanitary Tech",
    artisanInitials: "VE",
    artisanRating: 4.8,
    artisanReviewCount: 24,
    totalQuoteKobo: 2500000, // ₦25,000
    depositKobo: 1250000,
    balanceKobo: 1250000,
    estimatedHours: "1 full day",
    materialsIncluded: true,
    notes:
      "Complete replacement of leaking manifold joints with brass isolation gates. 60-day warranty.",
    milestone1Title: "Manifold Isolation & Trench Access",
    milestone2Title: "Brass Valve Assembly & Final Commissioning",
    status: "PENDING",
  },
  {
    id: "quote-03",
    requestId: "BEN-78401",
    artisanId: "00000000-0000-4000-8000-000000000003",
    artisanName: "Monday Agho",
    artisanHeadline: "Senior Water Systems Technician",
    artisanInitials: "MA",
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
        message: "Failed to lodge quote. Connection to artisan dispatch hub timed out.",
      };
    }
    return {
      ok: true,
      message: "Itemized quote submitted successfully! Customer will review in S19 / S20.",
      quoteId: `quote-${Math.floor(100 + Math.random() * 900)}`,
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
        message: "Unable to lock quote terms. Artisan schedule may have updated.",
      };
    }
    return {
      ok: true,
      message: "Quote accepted! Proceeding to Paystack TEST Mode Milestone 1 escrow deposit.",
      checkoutRef: `PAY-TEST-${Math.floor(100000 + Math.random() * 900000)}`,
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
        message: "Paystack TEST mode transaction declined or connection timeout.",
      };
    }
    return {
      ok: true,
      message: `₦${(amountKobo / 100).toLocaleString()} successfully deposited into SabiWork Paystack TEST escrow! Artisan notified to start work.`,
      escrowRef: `ESC-${Math.floor(10000 + Math.random() * 90000)}`,
      jobId: "BEN-78401",
    };
  },
};
