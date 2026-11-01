/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Artisan Dashboard, Work Orders, Earnings, and Availability (S36-S39).
 * This adapter returns fictional samples and local previews only.
 */

export interface ArtisanDashboardData {
  artisanName: string;
  artisanTrade: string;
  verifiedBadge: boolean;
  activeJobsCount: number;
  openRequestsInDistrict: number;
  totalEarningsKobo: number;
  pendingPaymentsKobo: number;
  availableBalanceKobo: number;
  ratingAverage: number;
  totalReviews: number;
}

export interface ArtisanWorkOrder {
  id: string;
  title: string;
  customerName: string;
  district: string;
  address: string;
  status: "ACTIVE_MILESTONE_1" | "ACTIVE_MILESTONE_2" | "COMPLETED";
  payoutKobo: number;
  dueDate: string;
  priority: "HIGH" | "STANDARD";
}

export interface EarningsLedgerEntry {
  id: string;
  jobId: string;
  jobTitle: string;
  type: "MILESTONE_1_PREVIEW" | "MILESTONE_2_PREVIEW" | "PAYOUT_PREVIEW";
  amountKobo: number;
  dateWat: string;
  status: "SAMPLE_PREVIEW";
}

export interface DayAvailability {
  day: string;
  active: boolean;
  timeSlot: string;
  maxJobs: number;
}

export const defaultArtisanDashboard: ArtisanDashboardData = {
  artisanName: "Sample Artisan 1",
  artisanTrade: "Plumbing & High Pressure Fusion",
  verifiedBadge: false,
  activeJobsCount: 2,
  openRequestsInDistrict: 5,
  totalEarningsKobo: 4100000, // ₦41,000
  pendingPaymentsKobo: 1100000, // ₦11,000 simulated in the demo
  availableBalanceKobo: 3000000, // ₦30,000
  ratingAverage: 4.9,
  totalReviews: 38,
};

export const defaultArtisanOrders: readonly ArtisanWorkOrder[] = [
  {
    id: "SAMPLE-REQUEST-001",
    title: "PPR Water Pipe Burst & Overhead Tank Balancing",
    customerName: "Sample Customer",
    district: "GRA Axis",
    address: "Sample service area, Benin City",
    status: "ACTIVE_MILESTONE_1",
    payoutKobo: 2200000,
    dueDate: "01 Nov 2026",
    priority: "HIGH",
  },
  {
    id: "SAMPLE-REQUEST-002",
    title: "Sample electrical work request",
    customerName: "Sample Customer 2",
    district: "Sample area",
    address: "Sample service area, Benin City",
    status: "ACTIVE_MILESTONE_2",
    payoutKobo: 1800000,
    dueDate: "02 Nov 2026",
    priority: "STANDARD",
  },
];

export const defaultLedgerEntries: readonly EarningsLedgerEntry[] = [
  {
    id: "LED-01",
    jobId: "SAMPLE-REQUEST-002",
    jobTitle: "Sample electrical work request",
    type: "MILESTONE_1_PREVIEW",
    amountKobo: 900000,
    dateWat: "30 Oct 2026 · 14:10 WAT",
    status: "SAMPLE_PREVIEW",
  },
  {
    id: "LED-02",
    jobId: "SAMPLE-REQUEST-003",
    jobTitle: "Sample water-system work request",
    type: "MILESTONE_2_PREVIEW",
    amountKobo: 2100000,
    dateWat: "28 Oct 2026 · 17:30 WAT",
    status: "SAMPLE_PREVIEW",
  },
];

export const defaultSchedule: readonly DayAvailability[] = [
  { day: "Monday", active: true, timeSlot: "08:00 - 17:00", maxJobs: 2 },
  { day: "Tuesday", active: true, timeSlot: "08:00 - 17:00", maxJobs: 2 },
  { day: "Wednesday", active: true, timeSlot: "08:00 - 17:00", maxJobs: 2 },
  { day: "Thursday", active: true, timeSlot: "08:00 - 17:00", maxJobs: 2 },
  { day: "Friday", active: true, timeSlot: "08:00 - 17:00", maxJobs: 2 },
  { day: "Saturday", active: true, timeSlot: "09:00 - 15:00", maxJobs: 1 },
  { day: "Sunday", active: false, timeSlot: "Unavailable (Church & Rest)", maxJobs: 0 },
];

const dashboardStore: ArtisanDashboardData = { ...defaultArtisanDashboard };
const ordersStore: ArtisanWorkOrder[] = [...defaultArtisanOrders];
const ledgerEntriesStore: EarningsLedgerEntry[] = [...defaultLedgerEntries];

function waitBriefly(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const artisanOperationsDemoService = {
  async getDashboard(): Promise<ArtisanDashboardData> {
    await waitBriefly();
    return dashboardStore;
  },

  async getWorkOrders(): Promise<readonly ArtisanWorkOrder[]> {
    await waitBriefly();
    return ordersStore;
  },

  async getEarningsLedger(): Promise<readonly EarningsLedgerEntry[]> {
    await waitBriefly();
    return ledgerEntriesStore;
  },

  async requestTestPayout(
    amountKobo: number,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; payoutRef?: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Sample payout preview failed. No bank or payment provider was contacted.",
      };
    }
    return {
      ok: true,
      message: `Sample payout preview for ₦${(amountKobo / 100).toLocaleString()}. No funds moved and no payout record was saved.`,
      payoutRef: "SAMPLE-NO-PAYOUT",
    };
  },

  async getSchedule(): Promise<readonly DayAvailability[]> {
    await waitBriefly();
    return defaultSchedule;
  },

  async updateSchedule(
    schedule: readonly DayAvailability[],
    simulateError = false,
  ): Promise<{ ok: boolean; message: string }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Sample availability preview could not be updated. No schedule was saved.",
      };
    }
    return {
      ok: true,
      message: "Availability preview updated locally only; no schedule was saved or broadcast.",
    };
  },
};
