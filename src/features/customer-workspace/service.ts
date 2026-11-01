export type RequestStatus = "draft" | "submitted" | "matching" | "cancelled";
export type JobStatus = "accepted" | "in_progress" | "completed" | "cancelled";

export interface CustomerRequest {
  id: string;
  title: string;
  category: string;
  service_area: string;
  description: string;
  budget_guidance_kobo: number;
  status: RequestStatus;
  created_at: string;
  updated_at?: string;
}

export interface CustomerJob {
  id: string;
  request_id: string;
  status: JobStatus;
  customer_id: string;
  worker_id: string;
  title: string;
  category: string;
  service_area: string;
  description?: string;
  budget_guidance_kobo: number;
  total_quote_kobo: number;
  quote_note?: string;
  created_at: string;
  updated_at: string;
}

export interface JobUpdate {
  id: string;
  author_id: string;
  note: string;
  created_at: string;
}

export interface JobReview {
  id: string;
  reviewer_id?: string;
  worker_id?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CustomerJobDetail extends CustomerJob {
  updates: JobUpdate[];
  review: JobReview | null;
}

export type ApiEnvelope<T> = { data: T };
export type ApiErrorEnvelope = { error?: { code?: string; message?: string } };

export class CustomerDataError extends Error {
  constructor(
    message: string,
    readonly code = "REQUEST_FAILED",
  ) {
    super(message);
    this.name = "CustomerDataError";
  }
}

export async function readJson<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, { cache: "no-store", ...init });
  } catch {
    throw new CustomerDataError(
      "We could not reach SabiWork. Check your connection and try again.",
      "NETWORK_ERROR",
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorEnvelope;
    throw new CustomerDataError(
      body.error?.message ?? "That request could not be completed.",
      body.error?.code ?? "REQUEST_FAILED",
    );
  }

  const body = (await response.json()) as ApiEnvelope<T>;
  return body.data;
}

export const formatMoney = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Math.round(kobo) / 100);

export const formatWat = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));

export const formatWatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));

export function getWatGreeting(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-NG", {
      hour: "numeric",
      hour12: false,
      timeZone: "Africa/Lagos",
    }).format(date),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const agreedAmountKobo = (job: CustomerJob) =>
  job.total_quote_kobo || job.budget_guidance_kobo || 0;

export const depositKobo = (job: CustomerJob) =>
  Math.floor(agreedAmountKobo(job) / 2);

export const balanceKobo = (job: CustomerJob) =>
  agreedAmountKobo(job) - depositKobo(job);

export const jobStatusLabel: Record<JobStatus, string> = {
  accepted: "Awaiting deposit",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const requestStatusLabel: Record<RequestStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  matching: "Receiving quotes",
  cancelled: "Cancelled",
};

export const requestStatusTone: Record<RequestStatus, string> = {
  draft: "neutral",
  submitted: "info",
  matching: "active",
  cancelled: "muted",
};

export const jobStatusTone: Record<JobStatus, string> = {
  accepted: "pending",
  in_progress: "active",
  completed: "done",
  cancelled: "muted",
};

export type JobStage = "deposit" | "work" | "signoff" | "closed";

export function jobStage(job: CustomerJob): JobStage {
  if (job.status === "accepted") return "deposit";
  if (job.status === "in_progress") return "work";
  if (job.status === "completed") return "signoff";
  return "closed";
}

export interface ArtisanSummary {
  id: string;
  name: string;
  primary_trade: string | null;
  workshop_area: string | null;
  average_rating: number;
  reviews_count: number;
  verification_status: string;
}

export interface ReviewOverview {
  reviewed: Array<{ job: CustomerJob; review: JobReview }>;
  pending: CustomerJob[];
  averageRating: number;
}

export interface SupportTicketInput {
  topic: string;
  subject: string;
  message: string;
  replyEmail: string;
}

export interface SupportTicketResult {
  reference: string;
  delivered: boolean;
  notice: string;
}

export const customerService = {
  async listRequests(): Promise<CustomerRequest[]> {
    return readJson<CustomerRequest[]>("/api/requests");
  },

  async listJobs(): Promise<CustomerJob[]> {
    return readJson<CustomerJob[]>("/api/jobs?scope=customer");
  },

  async getJob(jobId: string): Promise<CustomerJobDetail> {
    return readJson<CustomerJobDetail>(`/api/jobs/${jobId}`);
  },

  /** Attaches the assigned artisan to each booking. A missing profile is not
   * fatal here: the booking still renders without the artisan block. */
  async getArtisanSummaries(
    workerIds: string[],
  ): Promise<Record<string, ArtisanSummary>> {
    const unique = Array.from(new Set(workerIds.filter(Boolean)));
    const rows = await Promise.all(
      unique.map(async (id) => {
        try {
          return await readJson<ArtisanSummary>(`/api/artisans/${id}`);
        } catch {
          return null;
        }
      }),
    );

    return rows.reduce<Record<string, ArtisanSummary>>((map, row) => {
      if (row) map[row.id] = row;
      return map;
    }, {});
  },

  async reviewOverview(): Promise<ReviewOverview> {
    const jobs = await customerService.listJobs();
    const completed = jobs.filter((job) => job.status === "completed");

    const details = await Promise.all(
      completed.map(async (job) => {
        try {
          return await customerService.getJob(job.id);
        } catch {
          return null;
        }
      }),
    );

    const reviewed: ReviewOverview["reviewed"] = [];
    const pending: CustomerJob[] = [];

    details.forEach((detail) => {
      if (!detail) return;
      if (detail.review) {
        reviewed.push({ job: detail, review: detail.review });
      } else {
        pending.push(detail);
      }
    });

    const averageRating = reviewed.length
      ? reviewed.reduce((sum, entry) => sum + entry.review.rating, 0) /
        reviewed.length
      : 0;

    return { reviewed, pending, averageRating };
  },

  /** Demonstration adapter: validates the payload and returns a local reference.
   * No support inbox exists yet, so the result is explicit about not delivering. */
  async submitSupportTicket(input: SupportTicketInput): Promise<SupportTicketResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (input.message.trim().length < 20) {
      throw new CustomerDataError(
        "Describe the issue in at least 20 characters.",
        "INVALID_INPUT",
      );
    }
    if (
      input.replyEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.replyEmail.trim())
    ) {
      throw new CustomerDataError(
        "Enter a valid email address or leave the field empty.",
        "INVALID_INPUT",
      );
    }
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return {
      reference: `DEMO-SUPPORT-${suffix}`,
      delivered: false,
      notice:
        "This is a front-end demonstration. Your message was not delivered to a support inbox and no ticket was stored.",
    };
  },
};
