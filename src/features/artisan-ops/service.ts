/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Artisan Dashboard Overview, Work Orders, Paystack TEST Earnings Ledger,
 * and Weekly Availability Schedule (S36, S37, S38, S39).
 * Follows Clear Trade Modern specification and integer-kobo money calculations.
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
  type: "MILESTONE_1_RELEASE" | "MILESTONE_2_RELEASE" | "TEST_PAYOUT";
  amountKobo: number;
  dateWat: string;
  status: "SETTLED_TEST_MODE";
}

export interface DayAvailability {
  day: string;
  active: boolean;
  timeSlot: string;
  maxJobs: number;
}

export const defaultArtisanDashboard: ArtisanDashboardData = {
  artisanName: "Osaze Ighodaro",
  artisanTrade: "Plumbing & High Pressure Fusion",
  verifiedBadge: true,
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
    id: "BEN-78401",
    title: "PPR Water Pipe Burst & Overhead Tank Balancing",
    customerName: "Osamudiamen Osazuwa",
    district: "GRA Axis",
    address: "12A Ihama Way, Off Boundary Rd, GRA, Benin City",
    status: "ACTIVE_MILESTONE_1",
    payoutKobo: 2200000,
    dueDate: "01 Nov 2026",
    priority: "HIGH",
  },
  {
    id: "BEN-78390",
    title: "Concealed Conduit Rewiring in Airport Rd",
    customerName: "Blessing Igbinovia",
    district: "Airport Road",
    address: "42 Airport Road, Opposite St. Paul, Benin City",
    status: "ACTIVE_MILESTONE_2",
    payoutKobo: 1800000,
    dueDate: "02 Nov 2026",
    priority: "STANDARD",
  },
];

export const defaultLedgerEntries: readonly EarningsLedgerEntry[] = [
  {
    id: "LED-01",
    jobId: "BEN-78390",
    jobTitle: "Concealed Conduit Rewiring in Airport Rd",
    type: "MILESTONE_1_RELEASE",
    amountKobo: 900000,
    dateWat: "30 Oct 2026 · 14:10 WAT",
    status: "SETTLED_TEST_MODE",
  },
  {
    id: "LED-02",
    jobId: "BEN-78350",
    jobTitle: "Sumo Submersible Pump Repair in Ugbowo",
    type: "MILESTONE_2_RELEASE",
    amountKobo: 2100000,
    dateWat: "28 Oct 2026 · 17:30 WAT",
    status: "SETTLED_TEST_MODE",
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
        message: "Paystack TEST mode transfer node timed out. Please retry in 10 minutes.",
      };
    }
    dashboardStore.availableBalanceKobo = Math.max(0, dashboardStore.availableBalanceKobo - amountKobo);
    const newEntry: EarningsLedgerEntry = {
      id: `LED-${Date.now()}`,
      jobId: "PAYOUT",
      jobTitle: "Direct Settlement to FirstBank Edo Account",
      type: "TEST_PAYOUT",
      amountKobo,
      dateWat: "Just now",
      status: "SETTLED_TEST_MODE",
    };
    ledgerEntriesStore.unshift(newEntry);
    return {
      ok: true,
      message: `Test payout of ₦${(amountKobo / 100).toLocaleString()} credited to simulated Edo State bank account!`,
      payoutRef: `PO-TEST-${Math.floor(10000 + Math.random() * 90000)}`,
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
        message: "Failed to sync calendar schedule with Benin City dispatch queue.",
      };
    }
    return {
      ok: true,
      message: "Weekly dispatch availability schedule updated successfully!",
    };
  },
};

