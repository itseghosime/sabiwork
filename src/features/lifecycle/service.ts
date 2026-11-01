/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Job Lifecycle, Work Progress Updates, Customer Sign-off, and Payment History (S26, S27, S28, S29, S30).
 * These records and actions are local previews; no payment or backend event occurs.
 */

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

export const defaultActiveJobs: readonly ActiveJob[] = [
  {
    id: "SAMPLE-REQUEST-001",
    title: "PPR Water Pipe Burst & Overhead Tank Balancing in GRA",
    category: "Plumbing",
    customerName: "Sample Customer",
    artisanName: "Sample Artisan 1",
    district: "Sample area",
    status: "IN_PROGRESS",
    currentMilestone: 1,
    totalKobo: 2200000, // ₦22,000
    depositPaidKobo: 1100000,
    balanceKobo: 1100000,
    startDate: "31 Oct 2026",
    updates: [
      {
        id: "upd-1",
        title: "Acoustic Leak Tracing Complete",
        note: "Pinpointed hairline crack behind master bath concealed riser. Commencing PPR pipe cut and sleeve replacement.",
        timeWat: "31 Oct, 16:30 WAT",
        artisanName: "Sample Artisan 1",
      },
      {
        id: "upd-2",
        title: "PPR High-Pressure Fusion Joint Installed",
        note: "Welded 25mm high-pressure joint. Undergoing 30-minute static pressure test.",
        timeWat: "31 Oct, 17:15 WAT",
        artisanName: "Sample Artisan 1",
      },
    ],
  },
  {
    id: "SAMPLE-REQUEST-002",
    title: "Sample electrical work request",
    category: "Electrical",
    customerName: "Sample Customer 2",
    artisanName: "Sample Artisan 1",
    district: "Sample area",
    status: "AWAITING_SIGNOFF",
    currentMilestone: 2,
    totalKobo: 1800000,
    depositPaidKobo: 900000,
    balanceKobo: 900000,
    startDate: "29 Oct 2026",
    updates: [
      {
        id: "upd-10",
        title: "All Breakers Replaced & Grounded",
        note: "Work concluded and load tested across 3 AC zones. Waiting for customer sign-off.",
        timeWat: "30 Oct, 14:00 WAT",
        artisanName: "Sample Artisan 1",
      },
    ],
  },
];

export const defaultTransactions: readonly PaymentTransactionRecord[] = [
  {
    id: "SAMPLE-TRANSACTION-001",
    jobId: "SAMPLE-REQUEST-001",
    jobTitle: "PPR Water Pipe Burst & Overhead Tank Balancing",
    type: "DEPOSIT_ESCROW",
    amountKobo: 1100000,
    status: "SAMPLE_PREVIEW",
    dateWat: "31 Oct 2026 · 15:45 WAT",
    channel: "Sample only; no provider connected",
  },
  {
    id: "SAMPLE-TRANSACTION-002",
    jobId: "SAMPLE-REQUEST-002",
    jobTitle: "Sample electrical work request",
    type: "DEPOSIT_ESCROW",
    amountKobo: 900000,
    status: "SAMPLE_PREVIEW",
    dateWat: "29 Oct 2026 · 11:20 WAT",
    channel: "Sample only; no provider connected",
  },
];

const activeJobsStore: ActiveJob[] = defaultActiveJobs.map((j) => ({
  ...j,
  updates: [...j.updates],
}));

const transactionsStore: PaymentTransactionRecord[] = [...defaultTransactions];

function waitBriefly(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const lifecycleDemoService = {
  async getActiveJobs(): Promise<readonly ActiveJob[]> {
    await waitBriefly();
    return activeJobsStore;
  },

  async getJobById(id: string): Promise<ActiveJob | null> {
    await waitBriefly();
    return activeJobsStore.find((j) => j.id === id) || activeJobsStore[0];
  },

  async addProgressUpdate(
    jobId: string,
    input: { title: string; note: string },
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; update?: JobUpdateItem }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Could not prepare the sample progress preview. No customer notification was sent.",
      };
    }
    const update: JobUpdateItem = {
      id: `upd-${Date.now()}`,
      title: input.title,
      note: input.note,
      timeWat: "Just now",
      artisanName: "Sample Artisan 1",
    };
    const target = activeJobsStore.find((j) => j.id === jobId) || activeJobsStore[0];
    if (target) {
      target.updates = [update, ...target.updates];
    }
    return {
      ok: true,
      message: "Sample progress preview updated in memory only; no backend record was saved and no customer was notified.",
      update,
    };
  },

  async submitCompletionSignoff(
    jobId: string,
    _rating: number,
    _feedback: string,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Sample sign-off preview failed. No payment or release record was created.",
      };
    }
    const target = activeJobsStore.find((j) => j.id === jobId) || activeJobsStore[0];
    if (target) {
      target.status = "COMPLETED";
      target.currentMilestone = 2;
    }
    return {
      ok: true,
      message: `Sample sign-off preview for job ${jobId} updated in memory only. No backend record, payment, escrow release, or review was created.`,
    };
  },

  async getTransactions(): Promise<readonly PaymentTransactionRecord[]> {
    await waitBriefly();
    return transactionsStore;
  },
};
