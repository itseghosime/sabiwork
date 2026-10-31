/**
 * Fictional, browser-only review and dispute fixtures for the frontend demo.
 * Replace this adapter with the Reviews/Disputes server contract before launch.
 * Nothing written here is saved or changes a job, review, payment, or case.
 */

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

const job: DemoJob = {
  id: "demo-job-8421",
  reference: "BN-REQ-8421",
  title: "Under-sink kitchen drain pipe replacement & leak repair",
  artisan: "Osaze Ighodaro",
  artisanTrade: "Master Plumber",
  area: "Benin City, GRA",
  completedOn: "24 October 2026",
  totalKobo: 3_000_000,
  depositKobo: 1_000_000,
  balanceKobo: 2_000_000,
};

const dispute: DemoDispute = {
  id: "demo-dispute-01",
  job,
  category: "Incomplete work",
  milestone: "Deposit",
  summary:
    "Water drips from the upper slip joint after three minutes of tap flow. Pipe offcuts were left under the sink.",
  status: "Under review",
  openedOn: "31 October 2026 · 11:42 WAT",
  evidence: [
    {
      id: "evidence-joint",
      name: "joint_leak_close.jpg",
      caption: "Water drops near the upper pipe joint",
    },
    {
      id: "evidence-cabinet",
      name: "floor_scraps.jpg",
      caption: "Pipe offcuts remaining in the cabinet",
    },
  ],
  timeline: [
    {
      title: "Dispute submitted",
      detail: "The customer sent an issue description and two sample photos.",
      time: "11:42 WAT",
      state: "complete",
    },
    {
      title: "Case received",
      detail: "The case is shown in this local demonstration queue.",
      time: "12:05 WAT",
      state: "complete",
    },
    {
      title: "Review in progress",
      detail: "Both sides can add information in the demonstration flow.",
      time: "Now",
      state: "current",
    },
    {
      title: "Next steps",
      detail: "A real outcome requires the agreed server-side process.",
      time: "Pending",
      state: "pending",
    },
  ],
};

const waitBriefly = () => new Promise<void>((resolve) => setTimeout(resolve, 220));
const error = (
  code: DemoServiceError["code"],
  message: string,
): DemoServiceError => ({ ok: false, mode: "demo", code, message });

/** Demo adapter: replace with the feature owner's server implementation. */
export const reviewsDemoService = {
  async getJob(_jobId: string): Promise<DemoJob> {
    await waitBriefly();
    return job;
  },
  async submitReview(input: {
    rating: number;
    text: string;
    tags: readonly ReviewTag[];
    simulateUnavailable?: boolean;
  }): Promise<DemoResult<"review-preview">> {
    await waitBriefly();
    if (input.rating < 1 || input.rating > 5)
      return error("VALIDATION", "Choose an overall rating to continue.");
    if (input.text.trim().length < 10)
      return error("VALIDATION", "Add at least 10 characters of feedback.");
    if (input.simulateUnavailable)
      return error(
        "UNAVAILABLE",
        "The local preview could not finish. Your feedback is still here; try again.",
      );
    return {
      ok: true,
      mode: "demo",
      kind: "review-preview",
      message:
        "Review preview complete. It has not been saved or published.",
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
    await waitBriefly();
    if (input.summary.trim().length < 20)
      return error("VALIDATION", "Add at least 20 characters about the issue.");
    if (input.evidenceCount < 1)
      return error("VALIDATION", "Add at least one evidence file.");
    if (input.simulateUnavailable)
      return error(
        "UNAVAILABLE",
        "The local preview could not finish. Your details are still here; try again.",
      );
    return {
      ok: true,
      mode: "demo",
      kind: "dispute-preview",
      message: `Dispute preview complete. Preferred next step: ${input.resolution}. No case was created and no payment status changed.`,
    };
  },
  async getDispute(_disputeId: string): Promise<DemoDispute> {
    await waitBriefly();
    return dispute;
  },
  async listDisputes(): Promise<readonly DemoDispute[]> {
    await waitBriefly();
    return [dispute];
  },
  async submitParticipantNote(
    note: string,
    simulateUnavailable = false,
  ): Promise<DemoResult<"note-preview">> {
    await waitBriefly();
    if (note.trim().length < 3)
      return error("VALIDATION", "Write a short note before submitting.");
    if (simulateUnavailable)
      return error(
        "UNAVAILABLE",
        "The local preview could not finish. Your note is still here; try again.",
      );
    return {
      ok: true,
      mode: "demo",
      kind: "note-preview",
      message: "Note preview complete. It was not sent or saved.",
    };
  },
  async previewAdminAction(action: "request-info" | "continue-review") {
    await waitBriefly();
    return {
      ok: true as const,
      mode: "demo" as const,
      kind: action,
      message:
        "Admin action preview only. The case has not changed; server-side access and case updates are pending.",
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

