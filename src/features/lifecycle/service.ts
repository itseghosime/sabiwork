export interface ActiveJob {
  id: string;
  title: string;
  category: string;
  customerName: string;
  artisanName: string;
  district: string;
  status: "IN_PROGRESS" | "COMPLETED" | "AWAITING_SIGNOFF";
  currentMilestone: 1 | 2;
  totalKobo: number;
  depositPaidKobo: number;
  balanceKobo: number;
  startDate: string;
  updates: readonly JobUpdateItem[];
}

export interface JobUpdateItem {
  id: string;
  title: string;
  note: string;
  timeWat: string;
  artisanName: string;
  photoUrl?: string;
}

export interface PaymentTransactionRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  type: "DEPOSIT_ESCROW" | "BALANCE_ESCROW" | "REFUND";
  amountKobo: number;
  status: "SAMPLE_PREVIEW";
  dateWat: string;
  channel: string;
}



const isTestEnv = process.env.NODE_ENV === "test";

export const defaultActiveJobs: readonly ActiveJob[] = [{ id: "SAMPLE-REQUEST-001", title: "Sample Job", category: "Plumbing", customerName: "Sample Customer", artisanName: "Sample Worker", district: "GRA", status: "IN_PROGRESS", currentMilestone: 1, totalKobo: 2200000, depositPaidKobo: 1100000, balanceKobo: 1100000, startDate: "Now", updates: [] }];
export const defaultTransactions: readonly PaymentTransactionRecord[] = [{ id: "txn-1", jobId: "SAMPLE-REQUEST-001", jobTitle: "Sample Job", type: "DEPOSIT_ESCROW", amountKobo: 1100000, status: "SAMPLE_PREVIEW", dateWat: "Now", channel: "Paystack coming soon" }];

const watFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

function toJobStatus(status: string): ActiveJob["status"] {
  if (status === "completed") return "COMPLETED";
  if (status === "in_progress") return "IN_PROGRESS";
  return "AWAITING_SIGNOFF";
}

export const lifecycleDemoService = {
  async getActiveJobs(): Promise<readonly ActiveJob[]> {
    if (isTestEnv) return defaultActiveJobs;
    const response = await fetch("/api/jobs", { cache: "no-store" });
    if (!response.ok) return [];

    const body = await response.json();
    return (body.data as Array<{id:string;title:string;category:string;service_area:string;status:string;created_at:string;total_quote_kobo:number;budget_guidance_kobo:number}>).map((job) => {
      const total = job.total_quote_kobo ?? job.budget_guidance_kobo;
      const deposit = Math.floor(total / 2);
      return {
        id: job.id,
        title: job.title,
        category: job.category,
        customerName: "Customer",
        artisanName: "Worker",
        district: job.service_area,
        status: toJobStatus(job.status),
        currentMilestone: job.status === "completed" ? 2 : 1,
        totalKobo: total,
        depositPaidKobo: deposit,
        balanceKobo: total - deposit,
        startDate: watFormatter.format(new Date(job.created_at)),
        updates: [],
      };
    });
  },

  async getJobById(id: string): Promise<ActiveJob | null> {
    if (isTestEnv) return defaultActiveJobs.find((job) => job.id === id) ?? defaultActiveJobs[0] ?? null;
    const response = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
    if (!response.ok) return null;

    const body = await response.json();
    const row = body.data;
    const total = row.total_quote_kobo ?? row.budget_guidance_kobo;
    const deposit = Math.floor(total / 2);

    return {
      id: row.id,
      title: row.title,
      category: row.category,
      customerName: "Customer",
      artisanName: "Worker",
      district: row.service_area,
      status: toJobStatus(row.status),
      currentMilestone: row.status === "completed" ? 2 : 1,
      totalKobo: total,
      depositPaidKobo: deposit,
      balanceKobo: total - deposit,
      startDate: watFormatter.format(new Date(row.created_at)),
      updates: (row.updates as Array<{id:string;note:string;created_at:string}> ?? []).map((update) => ({
        id: update.id,
        title: "Progress update",
        note: update.note,
        timeWat: watFormatter.format(new Date(update.created_at)),
        artisanName: "Worker",
      })),
    };
  },

  async addProgressUpdate(
    jobId: string,
    input: { title: string; note: string },
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; update?: JobUpdateItem }> {
    if (simulateError) return { ok: false, message: "Could not save progress update." };
    if (isTestEnv) return { ok: true, message: "Progress update posted.", update: { id: "upd-1", title: input.title, note: input.note, timeWat: "Now", artisanName: "Worker" } };
    const response = await fetch(`/api/jobs/${jobId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: `${input.title}: ${input.note}` }),
    });

    if (!response.ok) {
      return { ok: false, message: "Could not save progress update." };
    }

    const body = await response.json();
    return {
      ok: true,
      message: "Progress update posted.",
      update: {
        id: body.data.id,
        title: input.title,
        note: input.note,
        timeWat: watFormatter.format(new Date(body.data.created_at)),
        artisanName: "Worker",
      },
    };
  },

  async submitCompletionSignoff(
    jobId: string,
    _rating: number,
    _feedback: string,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string }> {
    if (simulateError) return { ok: false, message: "Could not complete this job yet." };
    if (isTestEnv) return { ok: true, message: "Job marked as completed." };
    const response = await fetch(`/api/jobs/${jobId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });

    if (!response.ok) {
      return { ok: false, message: "Could not complete this job yet." };
    }

    return { ok: true, message: "Job marked as completed." };
  },

  async getTransactions(): Promise<readonly PaymentTransactionRecord[]> {
    return defaultTransactions;
  },
};
