/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Job Lifecycle, Work Progress Updates, Customer Sign-off, and Payment History (S26, S27, S28, S29, S30).
 * Follows Clear Trade Modern specification and integer-kobo money calculations.
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
  status: "LOCKED" | "RELEASED" | "SETTLED";
  dateWat: string;
  channel: string;
}

export const defaultActiveJobs: readonly ActiveJob[] = [
  {
    id: "BEN-78401",
    title: "PPR Water Pipe Burst & Overhead Tank Balancing in GRA",
    category: "Plumbing",
    customerName: "Osamudiamen Osazuwa",
    artisanName: "Osaze Ighodaro",
    district: "GRA Axis",
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
        artisanName: "Osaze Ighodaro",
      },
      {
        id: "upd-2",
        title: "PPR High-Pressure Fusion Joint Installed",
        note: "Welded 25mm high-pressure joint. Undergoing 30-minute static pressure test.",
        timeWat: "31 Oct, 17:15 WAT",
        artisanName: "Osaze Ighodaro",
      },
    ],
  },
  {
    id: "BEN-78390",
    title: "Concealed Conduit Rewiring in Airport Rd",
    category: "Electrical",
    customerName: "Blessing Igbinovia",
    artisanName: "Osaze Ighodaro",
    district: "Airport Road",
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
        artisanName: "Osaze Ighodaro",
      },
    ],
  },
];

export const defaultTransactions: readonly PaymentTransactionRecord[] = [
  {
    id: "TXN-8819",
    jobId: "BEN-78401",
    jobTitle: "PPR Water Pipe Burst & Overhead Tank Balancing",
    type: "DEPOSIT_ESCROW",
    amountKobo: 1100000,
    status: "LOCKED",
    dateWat: "31 Oct 2026 · 15:45 WAT",
    channel: "Paystack TEST Mode Card",
  },
  {
    id: "TXN-8740",
    jobId: "BEN-78390",
    jobTitle: "Concealed Conduit Rewiring in Airport Rd",
    type: "DEPOSIT_ESCROW",
    amountKobo: 900000,
    status: "RELEASED",
    dateWat: "29 Oct 2026 · 11:20 WAT",
    channel: "Paystack TEST Bank Transfer",
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
        message: "Failed to broadcast progress update. Hub dispatch server timeout.",
      };
    }
    const update: JobUpdateItem = {
      id: `upd-${Date.now()}`,
      title: input.title,
      note: input.note,
      timeWat: "Just now",
      artisanName: "Osaze Ighodaro",
    };
    const target = activeJobsStore.find((j) => j.id === jobId) || activeJobsStore[0];
    if (target) {
      target.updates = [update, ...target.updates];
    }
    return {
      ok: true,
      message: "Work progress logged! Customer notified with live milestone audit.",
      update,
    };
  },

  async submitCompletionSignoff(
    jobId: string,
    rating: number,
    feedback: string,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Sign-off timeout. Could not finalize escrow release ledger.",
      };
    }
    const target = activeJobsStore.find((j) => j.id === jobId) || activeJobsStore[0];
    if (target) {
      target.status = "COMPLETED";
      target.currentMilestone = 2;
    }
    transactionsStore.unshift({
      id: `TXN-${Date.now()}`,
      jobId,
      jobTitle: target?.title || "Milestone 2 Completion Release",
      type: "BALANCE_ESCROW",
      amountKobo: target?.balanceKobo || 1100000,
      status: "SETTLED",
      dateWat: "Just now",
      channel: "Paystack Milestone Release",
    });
    return {
      ok: true,
      message: `Job #${jobId} signed off successfully! Milestone balance released and rating (${rating}★) published to artisan profile.`,
    };
  },

  async getTransactions(): Promise<readonly PaymentTransactionRecord[]> {
    await waitBriefly();
    return transactionsStore;
  },
};

