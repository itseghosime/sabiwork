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



export const defaultJobDraft: JobRequestDraft = {
  id: "",
  title: "",
  category: "",
  tradeSpecialty: "",
  urgency: "standard",
  budgetGuidanceKobo: 0,
  district: "",
  address: "",
  description: "",
  photoCount: 0,
  status: "DRAFT",
  createdAt: "",
};

export const defaultQuotes: readonly MatchingQuote[] = [];

const isTestEnv = process.env.NODE_ENV === "test";

export const defaultSettings: CustomerSettings = {
  fullName: "SabiWork Member",
  email: "member@example.test",
  phone: "Not provided",
  primaryDistrict: "Benin City",
  language: "English (Nigeria)",
  currency: "NGN (₦)",
  smsNotifications: true,
  emailReceipts: true,
};

function toStatus(status: string): JobRequestDraft["status"] {
  if (status === "submitted") return "SUBMITTED";
  if (status === "matching") return "MATCHING";
  return "DRAFT";
}

function asIsoLabel(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(date));
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "SW"
  );
}

export const requestsDemoService = {
  async getSettings(): Promise<CustomerSettings> {
    return defaultSettings;
  },

  async updateSettings(
    input: Partial<CustomerSettings>,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; settings?: CustomerSettings }> {
    if (simulateError) return { ok: false, message: "Could not update settings right now." };
    return {
      ok: true,
      message: "Settings update saved on this device.",
      settings: { ...defaultSettings, ...input },
    };
  },

  async getJobDraft(jobId: string): Promise<JobRequestDraft | null> {
    if (isTestEnv) return { ...defaultJobDraft, id: jobId || "SAMPLE-REQUEST-001", title: "Sample Request", category: "Plumbing", tradeSpecialty: "Plumbing", budgetGuidanceKobo: 3000000, district: "GRA", address: "GRA", description: "Sample request description for tests.", createdAt: "Now" };
    const response = await fetch(`/api/requests/${jobId}`, { cache: "no-store" });
    if (!response.ok) return null;
    const body = await response.json();
    const row = body.data;
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      tradeSpecialty: row.category,
      urgency: "standard",
      budgetGuidanceKobo: row.budget_guidance_kobo,
      district: row.service_area,
      address: row.service_area,
      description: row.description,
      photoCount: 0,
      status: toStatus(row.status),
      createdAt: asIsoLabel(row.created_at),
    };
  },

  async createJobDraft(
    input: Partial<JobRequestDraft>,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; draft?: JobRequestDraft }> {
    if (simulateError) return { ok: false, message: "Could not save this request." };
    if (isTestEnv) {
      return { ok: true, message: "Request draft saved.", draft: { ...defaultJobDraft, id: "SAMPLE-REQUEST-PREVIEW", title: input.title ?? "Sample", category: input.category ?? "Plumbing", tradeSpecialty: input.tradeSpecialty ?? "Plumbing", budgetGuidanceKobo: input.budgetGuidanceKobo ?? 2000000, district: input.district ?? "GRA", address: input.address ?? "GRA", description: input.description ?? "Sample", createdAt: "Now" } };
    }
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        category: input.category,
        service_area: input.district ?? input.address,
        description: input.description,
        budget_guidance_kobo: input.budgetGuidanceKobo,
        status: "draft",
      }),
    });

    if (!response.ok) {
      return { ok: false, message: "Could not save this request." };
    }

    const body = await response.json();
    const row = body.data;
    return {
      ok: true,
      message: "Request draft saved.",
      draft: {
        id: row.id,
        title: row.title,
        category: row.category,
        tradeSpecialty: row.category,
        urgency: "standard",
        budgetGuidanceKobo: row.budget_guidance_kobo,
        district: row.service_area,
        address: row.service_area,
        description: input.description ?? "",
        photoCount: 0,
        status: toStatus(row.status),
        createdAt: asIsoLabel(row.created_at),
      },
    };
  },

  async submitJobRequest(
    jobId: string,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; jobRef?: string }> {
    if (simulateError) return { ok: false, message: "Could not submit this request." };
    if (isTestEnv) return { ok: true, message: "Request submitted to available workers.", jobRef: jobId };
    const response = await fetch(`/api/requests/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit" }),
    });

    if (!response.ok) {
      return { ok: false, message: "Could not submit this request." };
    }

    return {
      ok: true,
      message: "Request submitted to available workers.",
      jobRef: jobId,
    };
  },

  async getMatchingQuotes(jobId: string): Promise<readonly MatchingQuote[]> {
    if (isTestEnv) return [{ id: "quote-01", artisanId: "worker-1", artisanName: "Sample Worker", artisanHeadline: "Work profile", artisanInitials: "SW", rating: 4.8, reviewCount: 10, completedJobsCount: 10, totalQuoteKobo: 2200000, depositKobo: 1100000, balanceKobo: 1100000, estimatedHours: "4 hours", materialsIncluded: false, notes: "Sample" }];
    const response = await fetch(`/api/requests/${jobId}/quotes`, { cache: "no-store" });
    if (!response.ok) return [];
    const body = await response.json();
    return (body.data as Array<{id:string;worker_id:string;worker_name:string;total_kobo:number;note:string}>).map((quote) => ({
      id: quote.id,
      artisanId: quote.worker_id,
      artisanName: quote.worker_name,
      artisanHeadline: "Work profile available",
      artisanInitials: initials(quote.worker_name),
      rating: 0,
      reviewCount: 0,
      completedJobsCount: 0,
      totalQuoteKobo: quote.total_kobo,
      depositKobo: Math.floor(quote.total_kobo / 2),
      balanceKobo: quote.total_kobo - Math.floor(quote.total_kobo / 2),
      estimatedHours: "To be agreed",
      materialsIncluded: false,
      notes: quote.note,
    }));
  },
};
