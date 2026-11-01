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
  fullName: "Sample Customer",
  email: "customer@example.test",
  phone: "Not provided",
  primaryDistrict: "Sample area",
  language: "English (Nigeria)",
  currency: "NGN (₦)",
  smsNotifications: true,
  emailReceipts: true,
};

export const defaultJobDraft: JobRequestDraft = {
  id: "SAMPLE-REQUEST-001",
  title: "PPR Water Pipe Burst & Overhead Tank Balancing in GRA",
  category: "Plumbing",
  tradeSpecialty: "PPR Piping & High Pressure Fusion",
  urgency: "standard",
  budgetGuidanceKobo: 2500000, // ₦25,000
  district: "Sample area",
  address: "Sample service area, Benin City",
  description:
    "Water leakage discovered under the master bathroom floor tiles. Need pressure leak tracing, PPR pipe replacement, and bypass valve pressure check before 5 PM tomorrow.",
  photoCount: 3,
  status: "DRAFT",
  createdAt: "31 Oct 2026 · 14:00 WAT",
};

export const defaultQuotes: readonly MatchingQuote[] = [
  {
    id: "quote-01",
    artisanId: "SAMPLE-ARTISAN-001",
    artisanName: "Sample Artisan 1",
    artisanHeadline: "Sample Plumber Profile",
    artisanInitials: "SA",
    rating: 4.9,
    reviewCount: 38,
    completedJobsCount: 42,
    totalQuoteKobo: 2200000, // ₦22,000
    depositKobo: 1100000, // ₦11,000 (50%)
    balanceKobo: 1100000, // ₦11,000 (50%)
    estimatedHours: "4 - 6 hours",
    materialsIncluded: true,
    notes:
      "Fictional quote details for layout preview only. No service is booked and no warranty is offered.",
  },
  {
    id: "quote-02",
    artisanId: "SAMPLE-ARTISAN-002",
    artisanName: "Sample Artisan 2",
    artisanHeadline: "Sample Plumbing Profile",
    artisanInitials: "SA",
    rating: 4.8,
    reviewCount: 24,
    completedJobsCount: 29,
    totalQuoteKobo: 2500000, // ₦25,000
    depositKobo: 1250000,
    balanceKobo: 1250000,
    estimatedHours: "1 full day",
    materialsIncluded: true,
    notes:
      "Sample quote notes only. No service availability, booking, or warranty is represented.",
  },
  {
    id: "quote-03",
    artisanId: "SAMPLE-ARTISAN-003",
    artisanName: "Sample Artisan 3",
    artisanHeadline: "Sample Water Systems Profile",
    artisanInitials: "SA",
    rating: 4.7,
    reviewCount: 19,
    completedJobsCount: 21,
    totalQuoteKobo: 1950000, // ₦19,500
    depositKobo: 975000,
    balanceKobo: 975000,
    estimatedHours: "3 - 5 hours",
    materialsIncluded: false,
    notes:
      "Sample labor-only quote preview. No materials arrangement or service is agreed.",
  },
];

function waitBriefly(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const savedDrafts = new Map<string, JobRequestDraft>([
  [defaultJobDraft.id, defaultJobDraft],
]);

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
        message: "Sample settings preview failed. No account preference was saved.",
      };
    }
    const updated: CustomerSettings = {
      ...defaultSettings,
      ...input,
    };
    return {
      ok: true,
      message: "Sample preferences updated in this page preview only; nothing was saved.",
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
        message: "Sample request preview could not be prepared. No request was saved.",
      };
    }
    const draft: JobRequestDraft = {
      ...defaultJobDraft,
      ...input,
      id: "SAMPLE-REQUEST-PREVIEW",
      status: "DRAFT",
    };
    savedDrafts.set(draft.id, draft);
    return {
      ok: true,
      message: "Sample request preview added to in-memory state only; it was not saved to an account or sent to artisans.",
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
        message: "Sample request preview could not be prepared. No dispatch service is connected.",
      };
    }
    return {
      ok: true,
      message: `Sample request ${jobId} is ready for preview. No job was dispatched and no artisan was notified.`,
      jobRef: `SAMPLE-${jobId}`,
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
