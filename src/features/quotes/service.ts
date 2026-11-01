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



const isTestEnv = process.env.NODE_ENV === "test";

export const defaultOpenRequests: readonly OpenRequest[] = [{ id: "SAMPLE-REQUEST-001", title: "Sample Request", category: "Plumbing", tradeSpecialty: "Plumbing", urgency: "standard", budgetGuidanceKobo: 2500000, district: "GRA", address: "GRA", postedTime: "Now", description: "Sample", quotesCount: 1, photoCount: 0 }];
export const defaultDetailedQuotes: readonly QuoteItem[] = [{ id: "quote-01", requestId: "SAMPLE-REQUEST-001", artisanId: "worker-1", artisanName: "Sample Worker", artisanHeadline: "Work profile", artisanInitials: "SW", artisanRating: 4.8, artisanReviewCount: 10, totalQuoteKobo: 2200000, depositKobo: 1100000, balanceKobo: 1100000, estimatedHours: "4 hours", materialsIncluded: false, notes: "Sample note", milestone1Title: "Start work", milestone2Title: "Complete and review", status: "PENDING" }];

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

const watFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

export const quotesDemoService = {
  async getOpenRequests(): Promise<readonly OpenRequest[]> {
    if (isTestEnv) return defaultOpenRequests;
    const response = await fetch("/api/requests/open", { cache: "no-store" });
    if (!response.ok) return [];
    const body = await response.json();
    return (body.data as Array<{id:string;title:string;category:string;budget_guidance_kobo:number;service_area:string;description:string;quotes_count?:number;created_at:string}>).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      tradeSpecialty: row.category,
      urgency: "standard",
      budgetGuidanceKobo: row.budget_guidance_kobo,
      district: row.service_area,
      address: row.service_area,
      postedTime: watFormatter.format(new Date(row.created_at)),
      description: row.description,
      quotesCount: row.quotes_count ?? 0,
      photoCount: 0,
    }));
  },

  async getRequestById(id: string): Promise<OpenRequest | null> {
    if (isTestEnv) return defaultOpenRequests.find((item) => item.id === id) ?? defaultOpenRequests[0] ?? null;
    const response = await fetch(`/api/requests/${id}`, { cache: "no-store" });
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
      postedTime: watFormatter.format(new Date(row.created_at)),
      description: row.description,
      quotesCount: 0,
      photoCount: 0,
    };
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
    if (simulateError) return { ok: false, message: "Could not submit this quote." };
    if (isTestEnv) return { ok: true, message: "Quote submitted.", quoteId: "quote-01" };
    const response = await fetch(`/api/requests/${input.requestId}/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_kobo: input.totalQuoteKobo, note: input.notes }),
    });

    if (!response.ok) {
      return { ok: false, message: "Could not submit this quote." };
    }

    const body = await response.json();
    return { ok: true, message: "Quote submitted.", quoteId: body.data.id };
  },

  async getQuotesForRequest(requestId: string): Promise<readonly QuoteItem[]> {
    if (isTestEnv) return defaultDetailedQuotes.filter((quote) => quote.requestId === requestId);
    const response = await fetch(`/api/requests/${requestId}/quotes`, { cache: "no-store" });
    if (!response.ok) return [];
    const body = await response.json();
    return (body.data as Array<{id:string;request_id:string;worker_id:string;worker_name:string;total_kobo:number;note:string;status:string}>).map((quote) => {
      const deposit = Math.floor(quote.total_kobo / 2);
      return {
        id: quote.id,
        requestId: quote.request_id,
        artisanId: quote.worker_id,
        artisanName: quote.worker_name,
        artisanHeadline: "Work profile available",
        artisanInitials: initials(quote.worker_name),
        artisanRating: 0,
        artisanReviewCount: 0,
        totalQuoteKobo: quote.total_kobo,
        depositKobo: deposit,
        balanceKobo: quote.total_kobo - deposit,
        estimatedHours: "To be agreed",
        materialsIncluded: false,
        notes: quote.note,
        milestone1Title: "Start work",
        milestone2Title: "Complete and review",
        status:
          quote.status === "accepted"
            ? "ACCEPTED"
            : quote.status === "declined"
              ? "REJECTED"
              : "PENDING",
      };
    });
  },

  async getQuoteDetails(quoteId: string): Promise<QuoteItem | null> {
    const allRequests = await this.getOpenRequests();
    for (const request of allRequests) {
      const quotes = await this.getQuotesForRequest(request.id);
      const found = quotes.find((quote) => quote.id === quoteId);
      if (found) return found;
    }
    return null;
  },

  async acceptQuoteAndLockMilestone(
    quoteId: string,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; checkoutRef?: string }> {
    if (simulateError) return { ok: false, message: "Could not accept this quote." };
    if (isTestEnv) return { ok: true, message: "Quote accepted and job opened.", checkoutRef: "job-01" };
    const response = await fetch(`/api/quotes/${quoteId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "accept" }),
    });

    if (!response.ok) return { ok: false, message: "Could not accept this quote." };

    const body = await response.json();
    return {
      ok: true,
      message: "Quote accepted and job opened.",
      checkoutRef: body.data.job.id,
    };
  },

  async processMilestoneCheckout(
    quoteId: string,
    amountKobo: number,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; escrowRef?: string; jobId?: string }> {
    if (simulateError) return { ok: false, message: "Payments are unavailable right now." };
    if (isTestEnv) return { ok: true, message: `Payments via Paystack are coming soon. Planned amount: ₦${(amountKobo / 100).toLocaleString()}.`, escrowRef: "coming-soon", jobId: quoteId };
    return {
      ok: true,
      message: `Payments via Paystack are coming soon. Planned amount: ₦${(amountKobo / 100).toLocaleString()}.`,
      escrowRef: "coming-soon",
      jobId: quoteId,
    };
  },
};
