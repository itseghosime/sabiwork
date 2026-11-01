import type { IconName } from "@/components/icon";

/* --------------------------------------------------------------------------
   Admin workspace data layer.

   Every record below is fictional sample data used to exercise the admin UI
   before the escrow, dispute, and audit services are connected. Amounts are
   integer kobo (NGN * 100); timestamps are stored in UTC and rendered in WAT.
   -------------------------------------------------------------------------- */

export const SAMPLE_NOW_ISO = "2026-11-01T12:00:00Z";

export const SAMPLE_LEDGER_NOTE =
  "Financial records are fictional samples. No Paystack, escrow, payout, or provider connection is active in this build.";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const compactNaira = new Intl.NumberFormat("en-NG", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const watDateTime = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

const watDate = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeZone: "Africa/Lagos",
});

export function formatNaira(kobo: number): string {
  return naira.format(kobo / 100);
}

export function formatNairaCompact(kobo: number): string {
  return `₦${compactNaira.format(kobo / 100)}`;
}

export function formatWat(iso: string): string {
  return watDateTime.format(new Date(iso));
}

export function formatWatDate(iso: string): string {
  return watDate.format(new Date(iso));
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 1)}%`;
}

export function pluralUnit(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function hoursBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 3_600_000,
  );
}

export function relativeWat(iso: string, nowIso: string = SAMPLE_NOW_ISO): string {
  const hours = hoursBetween(iso, nowIso);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

/* ------------------------------- Overview -------------------------------- */

export type OverviewSeriesPoint = { label: string; valueKobo: number };

export const sampleVolumeSeries: readonly OverviewSeriesPoint[] = [
  { label: "Mon", valueKobo: 62_000_000 },
  { label: "Tue", valueKobo: 48_500_000 },
  { label: "Wed", valueKobo: 71_250_000 },
  { label: "Thu", valueKobo: 39_000_000 },
  { label: "Fri", valueKobo: 84_500_000 },
  { label: "Sat", valueKobo: 96_000_000 },
  { label: "Sun", valueKobo: 81_250_000 },
];

export const sampleLedger = {
  asOfIso: SAMPLE_NOW_ISO,
  grossVolumeKobo: 482_500_000,
  escrowHeldKobo: 124_000_000,
  releasedKobo: 341_000_000,
  commissionKobo: 17_250_000,
  releaseDueKobo: 38_500_000,
  disputedKobo: 24_000_000,
} as const;

export type AttentionItem = {
  id: string;
  href: string;
  icon: IconName;
  tone: "danger" | "warning" | "info";
  title: string;
  detail: string;
  meta: string;
};

export const sampleAttentionQueue: readonly AttentionItem[] = [
  {
    id: "att-1",
    href: "/admin/verification",
    icon: "shield",
    tone: "warning",
    title: "3 dossiers inside the 24h vetting SLA",
    detail: "Trade specimens and NIN slips waiting for a second officer sign-off.",
    meta: "Verification",
  },
  {
    id: "att-2",
    href: "/admin/disputes/DSP-2026-0138",
    icon: "gavel",
    tone: "danger",
    title: "DSP-2026-0138 escalated to urgent",
    detail: "Electrical burn-out claim is missing the artisan's written response.",
    meta: "Disputes",
  },
  {
    id: "att-3",
    href: "/admin/escrow",
    icon: "banknote",
    tone: "info",
    title: "2 escrow releases are due today",
    detail: "₦385,000 is scheduled to release once sign-off is confirmed.",
    meta: "Escrow",
  },
  {
    id: "att-4",
    href: "/admin/trades",
    icon: "filters",
    tone: "info",
    title: "Tier review for Tiling is overdue",
    detail: "Commission band has not been revisited in 92 days.",
    meta: "Rates & tiers",
  },
] as const;

/* -------------------------------- Disputes ------------------------------- */

export type DisputeStatus =
  | "open"
  | "under_review"
  | "awaiting_evidence"
  | "escalated"
  | "resolved";

export type DisputePriority = "urgent" | "high" | "normal";

export type DisputeEvidence = {
  id: string;
  name: string;
  kind: string;
  submittedBy: "customer" | "artisan" | "system";
  submittedAtIso: string;
  verified: boolean;
};

export type DisputeTimelineEntry = {
  atIso: string;
  label: string;
  detail: string;
};

export type DisputeCase = {
  id: string;
  title: string;
  jobRef: string;
  trade: string;
  area: string;
  customerName: string;
  artisanName: string;
  amountKobo: number;
  status: DisputeStatus;
  priority: DisputePriority;
  openedAtIso: string;
  slaHoursLeft: number;
  officer: string | null;
  summary: string;
  customerStatement: string;
  artisanStatement: string;
  evidence: readonly DisputeEvidence[];
  timeline: readonly DisputeTimelineEntry[];
};

export const sampleDisputes: readonly DisputeCase[] = [
  {
    id: "DSP-2026-0141",
    title: "Kitchen sink re-piping left unfinished",
    jobRef: "JOB-2026-0784",
    trade: "Plumbing",
    area: "GRA",
    customerName: "Ada Nwosu",
    artisanName: "Emeka Obi",
    amountKobo: 18_500_000,
    status: "under_review",
    priority: "high",
    openedAtIso: "2026-10-30T09:12:00Z",
    slaHoursLeft: 14,
    officer: "Officer A. Nwosu",
    summary:
      "Customer says the balance milestone was paid but two sink points still leak under pressure. Artisan claims the leak is from an existing pipe outside the quoted scope.",
    customerStatement:
      "The crew left on Friday with the second sink still dripping. I paid the balance in good faith and would like the join re-sealed before the case closes.",
    artisanStatement:
      "We replaced everything inside the quoted scope. The remaining drip comes from the building's old galvanised riser, which was not part of the itemised quote.",
    evidence: [
      {
        id: "ev-1",
        name: "Leak close-up photographs",
        kind: "Photo set (4)",
        submittedBy: "customer",
        submittedAtIso: "2026-10-30T10:04:00Z",
        verified: true,
      },
      {
        id: "ev-2",
        name: "Itemised quote and scope note",
        kind: "PDF",
        submittedBy: "artisan",
        submittedAtIso: "2026-10-30T13:22:00Z",
        verified: true,
      },
      {
        id: "ev-3",
        name: "Payment confirmation screenshot",
        kind: "Image",
        submittedBy: "customer",
        submittedAtIso: "2026-10-31T08:15:00Z",
        verified: false,
      },
    ],
    timeline: [
      { atIso: "2026-10-30T09:12:00Z", label: "Case opened", detail: "Customer submitted a dispute on the balance milestone." },
      { atIso: "2026-10-30T11:40:00Z", label: "Artisan notified", detail: "SMS and email sent with a 48-hour response window." },
      { atIso: "2026-10-30T13:22:00Z", label: "Artisan responded", detail: "Scope note and quote uploaded for review." },
      { atIso: "2026-10-31T08:15:00Z", label: "Evidence added", detail: "Customer uploaded a payment confirmation screenshot." },
    ],
  },
  {
    id: "DSP-2026-0138",
    title: "Socket burn-out after electrical install",
    jobRef: "JOB-2026-0779",
    trade: "Electrical",
    area: "Ugbowo",
    customerName: "Tunde Ade",
    artisanName: "Blessing Iyamu",
    amountKobo: 9_250_000,
    status: "awaiting_evidence",
    priority: "urgent",
    openedAtIso: "2026-10-31T07:40:00Z",
    slaHoursLeft: 6,
    officer: null,
    summary:
      "A socket failed within 48 hours of a rewire. The artisan has not yet provided the test certificate or a written response.",
    customerStatement:
      "The socket sparked and tripped the whole apartment. I unplugged everything and have not used the circuit since.",
    artisanStatement:
      "No written response yet. The case officer requested the insulation resistance test certificate on 31 October.",
    evidence: [
      {
        id: "ev-4",
        name: "Socket damage photograph",
        kind: "Image",
        submittedBy: "customer",
        submittedAtIso: "2026-10-31T07:44:00Z",
        verified: true,
      },
    ],
    timeline: [
      { atIso: "2026-10-31T07:40:00Z", label: "Case opened", detail: "Urgent safety dispute raised by the customer." },
      { atIso: "2026-10-31T08:05:00Z", label: "Evidence requested", detail: "Artisan asked for test certificate within 24 hours." },
    ],
  },
  {
    id: "DSP-2026-0135",
    title: "Wrong tile batch installed in bathroom",
    jobRef: "JOB-2026-0761",
    trade: "Tiling",
    area: "Sapele Road",
    customerName: "Chiamaka Eze",
    artisanName: "Friday Osas",
    amountKobo: 24_000_000,
    status: "open",
    priority: "normal",
    openedAtIso: "2026-10-29T15:20:00Z",
    slaHoursLeft: 30,
    officer: "Officer B. Ogie",
    summary:
      "The delivered tile batch differs from the approved sample. Customer wants a re-tile; artisan says the batch was substituted with consent.",
    customerStatement:
      "The bathroom is a different shade from the sample I approved. I would not have signed off on this batch.",
    artisanStatement:
      "The supplier ran out of the original batch. I called before installing and was told to proceed with the closest match.",
    evidence: [
      {
        id: "ev-5",
        name: "Approved sample photograph",
        kind: "Image",
        submittedBy: "customer",
        submittedAtIso: "2026-10-29T15:26:00Z",
        verified: true,
      },
      {
        id: "ev-6",
        name: "Call log extract",
        kind: "Screenshot",
        submittedBy: "artisan",
        submittedAtIso: "2026-10-29T18:02:00Z",
        verified: false,
      },
    ],
    timeline: [
      { atIso: "2026-10-29T15:20:00Z", label: "Case opened", detail: "Customer disputed the installed tile batch." },
      { atIso: "2026-10-29T18:02:00Z", label: "Artisan responded", detail: "Substitution consent evidence uploaded." },
    ],
  },
  {
    id: "DSP-2026-0129",
    title: "AC servicing did not restore cooling",
    jobRef: "JOB-2026-0744",
    trade: "HVAC",
    area: "Ring Road",
    customerName: "Osaretin Ede",
    artisanName: "Kelvin Uche",
    amountKobo: 4_500_000,
    status: "escalated",
    priority: "high",
    openedAtIso: "2026-10-28T11:05:00Z",
    slaHoursLeft: 21,
    officer: "Officer C. Ilenre",
    summary:
      "Two servicing visits did not restore cooling. Escalated to a senior officer because the artisan disputes the second visit.",
    customerStatement:
      "The unit still blows warm air after two visits. I have paid for both call-outs and want the job re-assessed.",
    artisanStatement:
      "The second visit was a diagnostic only and was never billed. The compressor fault is outside routine servicing.",
    evidence: [
      {
        id: "ev-7",
        name: "Service receipts (2)",
        kind: "Photo set",
        submittedBy: "customer",
        submittedAtIso: "2026-10-28T11:12:00Z",
        verified: true,
      },
      {
        id: "ev-8",
        name: "Diagnostic notes",
        kind: "PDF",
        submittedBy: "artisan",
        submittedAtIso: "2026-10-28T16:40:00Z",
        verified: true,
      },
    ],
    timeline: [
      { atIso: "2026-10-28T11:05:00Z", label: "Case opened", detail: "Cooling failure reported after servicing." },
      { atIso: "2026-10-29T09:30:00Z", label: "Case escalated", detail: "Assigned to a senior case officer for review." },
    ],
  },
  {
    id: "DSP-2026-0121",
    title: "Cabinet door alignment dispute",
    jobRef: "JOB-2026-0712",
    trade: "Carpentry",
    area: "Ikpoba Hill",
    customerName: "Halima Bello",
    artisanName: "Samuel Ojo",
    amountKobo: 6_800_000,
    status: "resolved",
    priority: "normal",
    openedAtIso: "2026-10-24T10:30:00Z",
    slaHoursLeft: 0,
    officer: "Officer B. Ogie",
    summary:
      "Resolved after the artisan returned to re-align two doors. Both parties confirmed the fix in writing.",
    customerStatement:
      "The artisan came back and adjusted the doors. I am satisfied with the finish.",
    artisanStatement:
      "Return visit completed and the customer signed off on the work.",
    evidence: [
      {
        id: "ev-9",
        name: "Sign-off note",
        kind: "Text",
        submittedBy: "system",
        submittedAtIso: "2026-10-26T14:00:00Z",
        verified: true,
      },
    ],
    timeline: [
      { atIso: "2026-10-24T10:30:00Z", label: "Case opened", detail: "Door alignment complaint raised." },
      { atIso: "2026-10-26T14:00:00Z", label: "Case resolved", detail: "Artisan re-aligned doors; customer signed off." },
    ],
  },
  {
    id: "DSP-2026-0118",
    title: "Painter left before final coat",
    jobRef: "JOB-2026-0698",
    trade: "Painting",
    area: "Uselu",
    customerName: "Grace Iyabo",
    artisanName: "Peter Akpan",
    amountKobo: 12_000_000,
    status: "resolved",
    priority: "normal",
    openedAtIso: "2026-10-21T08:55:00Z",
    slaHoursLeft: 0,
    officer: "Officer A. Nwosu",
    summary:
      "Resolved after a partial refund was agreed for the uncompleted final coat.",
    customerStatement:
      "We agreed a partial refund for the coat that was not applied. Case can close.",
    artisanStatement:
      "Refund agreed with the customer and recorded in the job notes.",
    evidence: [
      {
        id: "ev-10",
        name: "Refund agreement",
        kind: "PDF",
        submittedBy: "system",
        submittedAtIso: "2026-10-23T12:30:00Z",
        verified: true,
      },
    ],
    timeline: [
      { atIso: "2026-10-21T08:55:00Z", label: "Case opened", detail: "Incomplete final coat reported." },
      { atIso: "2026-10-23T12:30:00Z", label: "Case resolved", detail: "Partial refund agreement recorded." },
    ],
  },
] as const;

export const disputeStatusLabel: Record<DisputeStatus, string> = {
  open: "Open",
  under_review: "Under review",
  awaiting_evidence: "Awaiting evidence",
  escalated: "Escalated",
  resolved: "Resolved",
};

export function findDispute(id: string): DisputeCase | null {
  return sampleDisputes.find((dispute) => dispute.id === id) ?? null;
}

/* --------------------------------- Escrow -------------------------------- */

export type EscrowStatus = "held" | "release_due" | "released" | "disputed";

export type EscrowHold = {
  id: string;
  jobRef: string;
  title: string;
  trade: string;
  area: string;
  customerName: string;
  artisanName: string;
  amountKobo: number;
  milestone: "Deposit" | "Balance";
  status: EscrowStatus;
  heldSinceIso: string;
  releaseDueIso: string;
  payoutBank: string;
  signedOff: boolean;
};

export const sampleEscrowHolds: readonly EscrowHold[] = [
  {
    id: "ESC-2026-0912",
    jobRef: "JOB-2026-0784",
    title: "Bathroom re-tile and waterproofing",
    trade: "Tiling",
    area: "GRA",
    customerName: "Chiamaka Eze",
    artisanName: "Friday Osas",
    amountKobo: 24_000_000,
    milestone: "Balance",
    status: "release_due",
    heldSinceIso: "2026-10-28T09:00:00Z",
    releaseDueIso: "2026-11-01T16:00:00Z",
    payoutBank: "Access Bank •••• 4019",
    signedOff: true,
  },
  {
    id: "ESC-2026-0908",
    jobRef: "JOB-2026-0779",
    title: "Apartment rewire and socket replacement",
    trade: "Electrical",
    area: "Ugbowo",
    customerName: "Tunde Ade",
    artisanName: "Blessing Iyamu",
    amountKobo: 14_500_000,
    milestone: "Balance",
    status: "disputed",
    heldSinceIso: "2026-10-30T10:30:00Z",
    releaseDueIso: "2026-11-02T10:30:00Z",
    payoutBank: "GTBank •••• 2280",
    signedOff: false,
  },
  {
    id: "ESC-2026-0904",
    jobRef: "JOB-2026-0771",
    title: "Kitchen cabinet installation",
    trade: "Carpentry",
    area: "Ikpoba Hill",
    customerName: "Halima Bello",
    artisanName: "Samuel Ojo",
    amountKobo: 6_800_000,
    milestone: "Deposit",
    status: "held",
    heldSinceIso: "2026-10-31T14:10:00Z",
    releaseDueIso: "2026-11-03T14:10:00Z",
    payoutBank: "Zenith Bank •••• 7734",
    signedOff: false,
  },
  {
    id: "ESC-2026-0899",
    jobRef: "JOB-2026-0765",
    title: "Two-bedroom interior repaint",
    trade: "Painting",
    area: "Uselu",
    customerName: "Grace Iyabo",
    artisanName: "Peter Akpan",
    amountKobo: 9_600_000,
    milestone: "Balance",
    status: "released",
    heldSinceIso: "2026-10-24T11:00:00Z",
    releaseDueIso: "2026-10-27T11:00:00Z",
    payoutBank: "UBA •••• 5510",
    signedOff: true,
  },
  {
    id: "ESC-2026-0894",
    jobRef: "JOB-2026-0744",
    title: "Split AC servicing and gas top-up",
    trade: "HVAC",
    area: "Ring Road",
    customerName: "Osaretin Ede",
    artisanName: "Kelvin Uche",
    amountKobo: 4_500_000,
    milestone: "Deposit",
    status: "release_due",
    heldSinceIso: "2026-10-29T08:20:00Z",
    releaseDueIso: "2026-11-01T18:00:00Z",
    payoutBank: "First Bank •••• 9032",
    signedOff: true,
  },
  {
    id: "ESC-2026-0887",
    jobRef: "JOB-2026-0731",
    title: "Security gate fabrication and fitting",
    trade: "Welding",
    area: "Sapele Road",
    customerName: "Ada Nwosu",
    artisanName: "Ibrahim Sule",
    amountKobo: 18_000_000,
    milestone: "Balance",
    status: "released",
    heldSinceIso: "2026-10-20T09:45:00Z",
    releaseDueIso: "2026-10-23T09:45:00Z",
    payoutBank: "Access Bank •••• 1187",
    signedOff: true,
  },
  {
    id: "ESC-2026-0881",
    jobRef: "JOB-2026-0720",
    title: "Borehole pump replacement",
    trade: "Plumbing",
    area: "Ugbowo",
    customerName: "Tunde Ade",
    artisanName: "Emeka Obi",
    amountKobo: 8_200_000,
    milestone: "Deposit",
    status: "held",
    heldSinceIso: "2026-11-01T07:30:00Z",
    releaseDueIso: "2026-11-04T07:30:00Z",
    payoutBank: "GTBank •••• 6621",
    signedOff: false,
  },
] as const;

export const escrowStatusLabel: Record<EscrowStatus, string> = {
  held: "Held",
  release_due: "Release due",
  released: "Released",
  disputed: "Disputed",
};

/* ----------------------------- Trades & tiers ---------------------------- */

export type TradeTier = {
  id: string;
  name: string;
  badge: string;
  commissionBps: number;
  payoutWindowDays: number;
  minCompletedJobs: number;
  minRating: number;
  description: string;
};

export const sampleTiers: readonly TradeTier[] = [
  {
    id: "tier-starter",
    name: "Starter",
    badge: "New",
    commissionBps: 1200,
    payoutWindowDays: 5,
    minCompletedJobs: 0,
    minRating: 0,
    description: "Newly approved artisans completing their first jobs.",
  },
  {
    id: "tier-verified",
    name: "Verified",
    badge: "Verified",
    commissionBps: 1000,
    payoutWindowDays: 3,
    minCompletedJobs: 5,
    minRating: 4,
    description: "Dossiers cleared with a verified badge and first jobs delivered.",
  },
  {
    id: "tier-pro",
    name: "Pro",
    badge: "Pro",
    commissionBps: 800,
    payoutWindowDays: 2,
    minCompletedJobs: 20,
    minRating: 4.5,
    description: "Consistent ratings and a clean dispute record over 20 jobs.",
  },
  {
    id: "tier-elite",
    name: "Elite",
    badge: "Elite",
    commissionBps: 600,
    payoutWindowDays: 1,
    minCompletedJobs: 60,
    minRating: 480,
    description: "Top-rated specialists with priority payout windows.",
  },
] as const;

export type TradeCategory = {
  id: string;
  name: string;
  icon: IconName;
  activeArtisans: number;
  medianRateKobo: number;
  defaultTierId: string;
  active: boolean;
  lastReviewedIso: string;
};

export const sampleTradeCategories: readonly TradeCategory[] = [
  { id: "cat-plumbing", name: "Plumbing", icon: "wrench", activeArtisans: 38, medianRateKobo: 2_500_000, defaultTierId: "tier-verified", active: true, lastReviewedIso: "2026-10-18T09:00:00Z" },
  { id: "cat-electrical", name: "Electrical", icon: "zap", activeArtisans: 41, medianRateKobo: 3_200_000, defaultTierId: "tier-verified", active: true, lastReviewedIso: "2026-10-12T09:00:00Z" },
  { id: "cat-carpentry", name: "Carpentry", icon: "hammer", activeArtisans: 29, medianRateKobo: 4_000_000, defaultTierId: "tier-verified", active: true, lastReviewedIso: "2026-09-30T09:00:00Z" },
  { id: "cat-painting", name: "Painting", icon: "paintbrush", activeArtisans: 33, medianRateKobo: 1_800_000, defaultTierId: "tier-starter", active: true, lastReviewedIso: "2026-10-05T09:00:00Z" },
  { id: "cat-tiling", name: "Tiling", icon: "grid", activeArtisans: 24, medianRateKobo: 2_200_000, defaultTierId: "tier-verified", active: true, lastReviewedIso: "2026-08-01T09:00:00Z" },
  { id: "cat-hvac", name: "AC & HVAC", icon: "sparkles", activeArtisans: 17, medianRateKobo: 2_800_000, defaultTierId: "tier-pro", active: true, lastReviewedIso: "2026-10-21T09:00:00Z" },
  { id: "cat-welding", name: "Welding", icon: "shield", activeArtisans: 12, medianRateKobo: 3_600_000, defaultTierId: "tier-pro", active: false, lastReviewedIso: "2026-07-14T09:00:00Z" },
  { id: "cat-auto", name: "Auto mechanics", icon: "settings", activeArtisans: 9, medianRateKobo: 1_500_000, defaultTierId: "tier-starter", active: false, lastReviewedIso: "2026-06-22T09:00:00Z" },
] as const;

/* ------------------------------ Audit & desk ----------------------------- */

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditLogEntry = {
  id: string;
  atIso: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  gateway: string;
  severity: AuditSeverity;
};

export const sampleAuditLogs: readonly AuditLogEntry[] = [
  { id: "AUD-90412", atIso: "2026-11-01T09:42:00Z", actor: "Officer A. Nwosu", actorRole: "Case officer", action: "verification.approved", target: "Artisan dossier #VER-BN-2026-118", gateway: "BN-04", severity: "info" },
  { id: "AUD-90411", atIso: "2026-11-01T09:18:00Z", actor: "Officer B. Ogie", actorRole: "Senior officer", action: "payout.release_requested", target: "Escrow release ESC-2026-0912", gateway: "BN-04", severity: "warning" },
  { id: "AUD-90410", atIso: "2026-11-01T08:55:00Z", actor: "System", actorRole: "Automation", action: "dispute.sla_breached", target: "Case DSP-2026-0138", gateway: "BN-04", severity: "critical" },
  { id: "AUD-90409", atIso: "2026-11-01T08:31:00Z", actor: "Officer C. Ilenre", actorRole: "Case officer", action: "dispute.escalated", target: "Case DSP-2026-0129", gateway: "BN-04", severity: "warning" },
  { id: "AUD-90408", atIso: "2026-10-31T17:12:00Z", actor: "Officer A. Nwosu", actorRole: "Case officer", action: "verification.rejected", target: "Artisan dossier #VER-BN-2026-109", gateway: "BN-04", severity: "info" },
  { id: "AUD-90407", atIso: "2026-10-31T15:44:00Z", actor: "Officer B. Ogie", actorRole: "Senior officer", action: "trade_tier.updated", target: "Tier \"Pro\" commission band", gateway: "BN-04", severity: "warning" },
  { id: "AUD-90406", atIso: "2026-10-31T14:02:00Z", actor: "System", actorRole: "Automation", action: "escrow.hold_created", target: "Escrow hold ESC-2026-0910", gateway: "BN-04", severity: "info" },
  { id: "AUD-90405", atIso: "2026-10-31T11:38:00Z", actor: "Officer C. Ilenre", actorRole: "Case officer", action: "dispute.evidence_requested", target: "Case DSP-2026-0135", gateway: "BN-04", severity: "info" },
  { id: "AUD-90404", atIso: "2026-10-30T19:26:00Z", actor: "System", actorRole: "Automation", action: "auth.failed_attempt", target: "Admin desk login", gateway: "BN-04", severity: "critical" },
  { id: "AUD-90403", atIso: "2026-10-30T16:05:00Z", actor: "Officer A. Nwosu", actorRole: "Case officer", action: "desk.ticket_assigned", target: "Desk ticket DSK-2026-0311", gateway: "BN-04", severity: "info" },
] as const;

export type DeskTicketStatus = "new" | "open" | "waiting" | "resolved";
export type DeskChannel = "email" | "chat" | "phone";

export type DeskTicket = {
  id: string;
  subject: string;
  from: string;
  channel: DeskChannel;
  status: DeskTicketStatus;
  priority: DisputePriority;
  updatedAtIso: string;
  summary: string;
};

export const sampleDeskTickets: readonly DeskTicket[] = [
  { id: "DSK-2026-0318", subject: "Artisan cannot upload NIN slip", from: "Artisan · Friday Osas", channel: "chat", status: "new", priority: "high", updatedAtIso: "2026-11-01T10:12:00Z", summary: "Upload rejects a 1.8 MB photo. Needs the file-size limit or an alternative upload path." },
  { id: "DSK-2026-0315", subject: "Customer asks how escrow release works", from: "Customer · Ada Nwosu", channel: "email", status: "open", priority: "normal", updatedAtIso: "2026-11-01T08:40:00Z", summary: "Asked when the balance milestone moves from held to released after sign-off." },
  { id: "DSK-2026-0311", subject: "Duplicate deposit charge on test account", from: "Customer · Tunde Ade", channel: "email", status: "waiting", priority: "urgent", updatedAtIso: "2026-10-31T18:05:00Z", summary: "Test-mode duplicate charge. Payment provider ledger is not connected, so no refund can be issued from this desk." },
  { id: "DSK-2026-0307", subject: "Request to switch trade category", from: "Artisan · Blessing Iyamu", channel: "chat", status: "open", priority: "normal", updatedAtIso: "2026-10-31T13:22:00Z", summary: "Wants to move from Electrical to AC & HVAC after completing a certification." },
  { id: "DSK-2026-0302", subject: "Training module certificate not showing", from: "Artisan · Peter Akpan", channel: "phone", status: "resolved", priority: "normal", updatedAtIso: "2026-10-30T10:15:00Z", summary: "Certificate appeared after the module page was refreshed. Marked resolved." },
] as const;

export const deskStatusLabel: Record<DeskTicketStatus, string> = {
  new: "New",
  open: "Open",
  waiting: "Waiting",
  resolved: "Resolved",
};

export type ActivityItem = {
  id: string;
  atIso: string;
  title: string;
  detail: string;
  tone: "info" | "success" | "warning" | "danger";
};

export const sampleActivity: readonly ActivityItem[] = [
  { id: "act-1", atIso: "2026-11-01T09:42:00Z", title: "Dossier approved", detail: "Officer A. Nwosu cleared #VER-BN-2026-118 for listing.", tone: "success" },
  { id: "act-2", atIso: "2026-11-01T09:18:00Z", title: "Payout release requested", detail: "ESC-2026-0912 (₦240,000) queued for the release window.", tone: "warning" },
  { id: "act-3", atIso: "2026-11-01T08:55:00Z", title: "Dispute SLA breached", detail: "DSP-2026-0138 has 6 hours left and no artisan response.", tone: "danger" },
  { id: "act-4", atIso: "2026-11-01T08:31:00Z", title: "Dispute escalated", detail: "DSP-2026-0129 moved to senior review.", tone: "warning" },
  { id: "act-5", atIso: "2026-10-31T15:44:00Z", title: "Tier band updated", detail: "Pro commission adjusted to 8%.", tone: "info" },
  { id: "act-6", atIso: "2026-10-31T11:38:00Z", title: "Evidence requested", detail: "DSP-2026-0135 waiting on the artisan call-log extract.", tone: "info" },
] as const;
