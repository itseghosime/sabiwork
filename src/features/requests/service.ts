/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Customer Requests, Job Posting, Review, and Artisan Matching (S13, S14, S15, S16).
 * Follows Clear Trade Modern specification and integer-kobo money calculations.
 */

export interface CustomerSettings {
  fullName: string;
  email: string;
  phone: string;
  primaryDistrict: string;
  language: string;
  currency: string;
  smsNotifications: boolean;
  emailReceipts: boolean;
}

export interface JobRequestDraft {
  id: string;
  title: string;
  category: string;
  tradeSpecialty: string;
  urgency: "flexible" | "standard" | "emergency";
  budgetGuidanceKobo: number;
  district: string;
  address: string;
  description: string;
  photoCount: number;
  status: "DRAFT" | "SUBMITTED" | "MATCHING";
  createdAt: string;
}

export interface MatchingQuote {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanHeadline: string;
  artisanInitials: string;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  totalQuoteKobo: number;
  depositKobo: number;
  balanceKobo: number;
  estimatedHours: string;
  materialsIncluded: boolean;
  notes: string;
}

export const defaultSettings: CustomerSettings = {
  fullName: "Osamudiamen Osazuwa",
  email: "o.osazuwa@example.com",
  phone: "+234 803 555 0192",
  primaryDistrict: "GRA / Ihama Road",
  language: "English (Nigeria)",
  currency: "NGN (₦)",
  smsNotifications: true,
  emailReceipts: true,
};

export const defaultJobDraft: JobRequestDraft = {
  id: "BEN-78401",
  title: "PPR Water Pipe Burst & Overhead Tank Balancing in GRA",
  category: "Plumbing",
  tradeSpecialty: "PPR Piping & High Pressure Fusion",
  urgency: "standard",
  budgetGuidanceKobo: 2500000, // ₦25,000
  district: "GRA / Boundary Rd",
  address: "12A Ihama Way, Off Boundary Rd, GRA, Benin City",
  description:
    "Water leakage discovered under the master bathroom floor tiles. Need pressure leak tracing, PPR pipe replacement, and bypass valve pressure check before 5 PM tomorrow.",
  photoCount: 3,
  status: "DRAFT",
  createdAt: "31 Oct 2026 · 14:00 WAT",
};

export const defaultQuotes: readonly MatchingQuote[] = [
  {
    id: "quote-01",
    artisanId: "00000000-0000-4000-8000-000000000001",
    artisanName: "Osaze Ighodaro",
    artisanHeadline: "Master Plumber & Pipe Fitter · Vetted GRA Pro",
    artisanInitials: "OI",
    rating: 4.9,
    reviewCount: 38,
    completedJobsCount: 42,
    totalQuoteKobo: 2200000, // ₦22,000
    depositKobo: 1100000, // ₦11,000 (50%)
    balanceKobo: 1100000, // ₦11,000 (50%)
    estimatedHours: "4 - 6 hours",
    materialsIncluded: true,
    notes:
      "Includes pressure testing with digital gauge, high-temperature PPR fusion sleeve, and 30-day leak guarantee.",
  },
  {
    id: "quote-02",
    artisanId: "00000000-0000-4000-8000-000000000002",
    artisanName: "Victor E. Edosa",
    artisanHeadline: "Certified Plumbing & Sanitary Tech",
    artisanInitials: "VE",
    rating: 4.8,
    reviewCount: 24,
    completedJobsCount: 29,
    totalQuoteKobo: 2500000, // ₦25,000
    depositKobo: 1250000,
    balanceKobo: 1250000,
    estimatedHours: "1 full day",
    materialsIncluded: true,
    notes:
      "Complete replacement of leaking manifold joints with brass isolation gates. Same-day service available.",
  },
  {
    id: "quote-03",
    artisanId: "00000000-0000-4000-8000-000000000003",
    artisanName: "Monday Agho",
    artisanHeadline: "Senior Water Systems Technician",
    artisanInitials: "MA",
    rating: 4.7,
    reviewCount: 19,
    completedJobsCount: 21,
    totalQuoteKobo: 1950000, // ₦19,500
    depositKobo: 975000,
    balanceKobo: 975000,
    estimatedHours: "3 - 5 hours",
    materialsIncluded: false,
    notes:
      "Labor only. Client supplies PPR elbows, heat fusion machine provided by artisan.",
  },
];

function waitBriefly(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const savedDrafts = new Map<string, JobRequestDraft>();
savedDrafts.set(defaultJobDraft.id, defaultJobDraft);
savedDrafts.set("BEN-78401", defaultJobDraft);

export const requestsDemoService = {
  async getSettings(): Promise<CustomerSettings> {
    await waitBriefly();
    return defaultSettings;
  },

  async updateSettings(
    input: Partial<CustomerSettings>,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; settings?: CustomerSettings }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Failed to update settings. Connection to customer preferences timed out.",
      };
    }
    const updated: CustomerSettings = {
      ...defaultSettings,
      ...input,
    };
    return {
      ok: true,
      message: "Customer preferences and notifications updated successfully!",
      settings: updated,
    };
  },

  async getJobDraft(jobId: string): Promise<JobRequestDraft | null> {
    await waitBriefly();
    if (savedDrafts.has(jobId)) {
      return savedDrafts.get(jobId)!;
    }
    return defaultJobDraft;
  },

  async createJobDraft(
    input: Partial<JobRequestDraft>,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; draft?: JobRequestDraft }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Failed to create job draft. Validation error in district coverage.",
      };
    }
    const draft: JobRequestDraft = {
      ...defaultJobDraft,
      ...input,
      id: `BEN-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "DRAFT",
    };
    savedDrafts.set(draft.id, draft);
    return {
      ok: true,
      message: "Job request draft created! Review details before dispatching to artisans.",
      draft,
    };
  },

  async submitJobRequest(
    jobId: string,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; jobRef?: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Dispatch timeout. Could not reach Benin City artisan notification queue.",
      };
    }
    return {
      ok: true,
      message: `Job ${jobId} dispatched to verified artisans in GRA Axis! Matching quotes will appear in S16.`,
      jobRef: jobId,
    };
  },

  async getMatchingQuotes(jobId: string): Promise<readonly MatchingQuote[]> {
    await waitBriefly();
    if (jobId) {
      return defaultQuotes;
    }
    return defaultQuotes;
  },
};

