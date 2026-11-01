export type ReviewTag =
  | "Clean work"
  | "On time"
  | "Expert workmanship"
  | "Courteous"
  | "Fair pricing";

export type DisputeCategory =
  | "Incomplete work"
  | "Defective workmanship"
  | "Unprofessional conduct"
  | "Pricing discrepancy";

export type DisputeViewStatus =
  | "Under review"
  | "Awaiting information"
  | "Resolved";

export type DemoJob = {
  id: string;
  reference: string;
  title: string;
  artisan: string;
  artisanTrade: string;
  area: string;
  completedOn: string;
  totalKobo: number;
  depositKobo: number;
  balanceKobo: number;
};

export type DemoDispute = {
  id: string;
  job: DemoJob;
  category: DisputeCategory;
  milestone: "Deposit" | "Balance";
  summary: string;
  status: DisputeViewStatus;
  openedOn: string;
  evidence: readonly { id: string; name: string; caption: string }[];
  timeline: readonly {
    title: string;
    detail: string;
    time: string;
    state: "complete" | "current" | "pending";
  }[];
};

export type DemoServiceError = {
  ok: false;
  mode: "demo";
  code: "VALIDATION" | "BACKEND_NOT_CONNECTED" | "UNAVAILABLE";
  message: string;
};

export type DemoResult<T extends string> =
  | { ok: true; mode: "demo"; kind: T; message: string }
  | DemoServiceError;

const isTestEnv = process.env.NODE_ENV === "test";

const sampleDispute: DemoDispute = {
  id: "SAMPLE-DISPUTE-001",
  job: { id: "SAMPLE-REQUEST-001", reference: "SAMPLE-REQUEST-001", title: "Sample Job", artisan: "Sample Worker", artisanTrade: "Plumbing", area: "GRA", completedOn: "Now", totalKobo: 3000000, depositKobo: 1000000, balanceKobo: 2000000 },
  category: "Incomplete work",
  milestone: "Deposit",
  summary: "Sample summary",
  status: "Under review",
  openedOn: "Now",
  evidence: [],
  timeline: [{ title: "Case opened", detail: "Pending", time: "Now", state: "current" }],
};

function error(
  code: DemoServiceError["code"],
  message: string,
): DemoServiceError {
  return { ok: false, mode: "demo", code, message };
}

export const reviewsDemoService = {
  async getJob(jobId: string): Promise<DemoJob | null> {
    if (isTestEnv) return sampleDispute.job;
    const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
    if (!response.ok) return null;
    const body = await response.json();
    const row = body.data;
    const total = row.total_quote_kobo ?? row.budget_guidance_kobo ?? 0;
    const deposit = Math.floor(total / 2);
    return {
      id: row.id,
      reference: row.id,
      title: row.title,
      artisan: "Worker",
      artisanTrade: row.category,
      area: row.service_area,
      completedOn: new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(new Date(row.updated_at)),
      totalKobo: total,
      depositKobo: deposit,
      balanceKobo: total - deposit,
    };
  },

  async submitReview(input: {
    jobId?: string;
    rating: number;
    text: string;
    tags: readonly ReviewTag[];
    simulateUnavailable?: boolean;
  }): Promise<DemoResult<"review-preview">> {
    if (input.rating < 1 || input.rating > 5)
      return error("VALIDATION", "Choose an overall rating to continue.");
    if (input.text.trim().length < 10)
      return error("VALIDATION", "Add at least 10 characters of feedback.");
    if (!input.jobId && !isTestEnv)
      return error("VALIDATION", "A job id is required to save this review.");

    if (isTestEnv) {
      return { ok: true, mode: "demo", kind: "review-preview", message: "Review saved." };
    }

    const response = await fetch(`/api/jobs/${input.jobId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: input.rating, comment: input.text.trim() }),
    });

    if (!response.ok) {
      return error("UNAVAILABLE", "Could not save this review right now.");
    }

    return {
      ok: true,
      mode: "demo",
      kind: "review-preview",
      message: "Review saved.",
    };
  },

  async submitDispute(input: {
    category: DisputeCategory;
    milestone: "Deposit" | "Balance";
    summary: string;
    evidenceCount: number;
    resolution: string;
    simulateUnavailable?: boolean;
  }): Promise<DemoResult<"dispute-preview">> {
    void input;
    return {
      ok: true,
      mode: "demo",
      kind: "dispute-preview",
      message: "Dispute tools are coming soon.",
    };
  },

  async getDispute(disputeId: string): Promise<DemoDispute | null> {
    if (!isTestEnv) return null;
    return disputeId.toLowerCase() === "sample-dispute-001" ? sampleDispute : null;
  },

  async listDisputes(): Promise<readonly DemoDispute[]> {
    return isTestEnv ? [sampleDispute] : [];
  },

  async submitParticipantNote(
    note: string,
    fileNames: readonly string[] = [],
    simulateUnavailable = false,
  ): Promise<DemoResult<"note-preview">> {
    void simulateUnavailable;
    if (note.trim().length < 3 && fileNames.length === 0)
      return error("VALIDATION", "Write a short note or attach a file before submitting.");
    return {
      ok: true,
      mode: "demo",
      kind: "note-preview",
      message: "Message recorded locally. Team messaging is coming soon.",
    };
  },

  async previewAdminAction(action: "request-info" | "continue-review") {
    return {
      ok: true as const,
      mode: "demo" as const,
      kind: action,
      message: "Admin action endpoints are coming soon.",
    };
  },
};

export function formatNaira(amountKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amountKobo / 100);
}
