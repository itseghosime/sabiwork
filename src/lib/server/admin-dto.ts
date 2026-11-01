import "server-only";

import type {
  AuditLog,
  CommissionTier,
  DeskTicketRow,
  Dispute,
  DisputeEvidenceRow,
  DisputeEventRow,
  EscrowHold,
  TradeCategoryRow,
} from "./schema";

export type DisputeCaseDto = {
  id: string;
  title: string;
  jobRef: string;
  trade: string;
  area: string;
  customerName: string;
  artisanName: string;
  amountKobo: number;
  status: Dispute["status"];
  priority: Dispute["priority"];
  openedAtIso: string;
  slaDueAtIso: string;
  slaHoursLeft: number;
  officer: string | null;
  summary: string;
  customerStatement: string;
  artisanStatement: string;
  determination: string | null;
  determinationNote: string | null;
  evidence: {
    id: string;
    name: string;
    kind: string;
    submittedBy: string;
    submittedAtIso: string;
    verified: boolean;
  }[];
  timeline: { atIso: string; label: string; detail: string }[];
};

export type EscrowHoldDto = {
  id: string;
  jobRef: string;
  title: string;
  trade: string;
  area: string;
  customerName: string;
  artisanName: string;
  payoutBank: string;
  amountKobo: number;
  milestone: EscrowHold["milestone"];
  status: EscrowHold["status"];
  signedOff: boolean;
  heldSinceIso: string;
  releaseDueIso: string;
  releasedAtIso: string | null;
};

export type TradeTierDto = {
  id: string;
  name: string;
  badge: string;
  description: string;
  commissionBps: number;
  payoutWindowDays: number;
  minCompletedJobs: number;
  minRating: number;
};

export type TradeCategoryDto = {
  id: string;
  name: string;
  icon: string;
  activeArtisans: number;
  medianRateKobo: number;
  defaultTierId: string;
  active: boolean;
  lastReviewedIso: string;
};

export type AuditLogDto = {
  id: string;
  atIso: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  gateway: string;
  severity: AuditLog["severity"];
};

export type DeskTicketDto = {
  id: string;
  subject: string;
  from: string;
  channel: DeskTicketRow["channel"];
  status: DeskTicketRow["status"];
  priority: DeskTicketRow["priority"];
  updatedAtIso: string;
  summary: string;
};

function hoursBetween(fromIso: string, now: number) {
  return Math.round((new Date(fromIso).getTime() - now) / 3_600_000);
}

export function toDisputeCase(
  row: Dispute,
  evidence: DisputeEvidenceRow[],
  events: DisputeEventRow[],
  now = Date.now(),
): DisputeCaseDto {
  return {
    id: row.id,
    title: row.title,
    jobRef: row.job_ref,
    trade: row.trade,
    area: row.area,
    customerName: row.customer_name,
    artisanName: row.artisan_name,
    amountKobo: row.amount_kobo,
    status: row.status,
    priority: row.priority,
    openedAtIso: row.opened_at.toISOString(),
    slaDueAtIso: row.sla_due_at.toISOString(),
    slaHoursLeft: Math.max(0, hoursBetween(row.sla_due_at.toISOString(), now)),
    officer: row.officer,
    summary: row.summary,
    customerStatement: row.customer_statement,
    artisanStatement: row.artisan_statement,
    determination: row.determination,
    determinationNote: row.determination_note,
    evidence: evidence.map((item) => ({
      id: item.id,
      name: item.name,
      kind: item.kind,
      submittedBy: item.submitted_by,
      submittedAtIso: item.submitted_at.toISOString(),
      verified: item.verified,
    })),
    timeline: events
      .slice()
      .sort((a, b) => a.occurred_at.getTime() - b.occurred_at.getTime())
      .map((event) => ({
        atIso: event.occurred_at.toISOString(),
        label: event.label,
        detail: event.detail,
      })),
  };
}

export function toEscrowHold(row: EscrowHold): EscrowHoldDto {
  return {
    id: row.id,
    jobRef: row.job_ref,
    title: row.title,
    trade: row.trade,
    area: row.area,
    customerName: row.customer_name,
    artisanName: row.artisan_name,
    payoutBank: row.payout_bank,
    amountKobo: row.amount_kobo,
    milestone: row.milestone,
    status: row.status,
    signedOff: row.signed_off,
    heldSinceIso: row.held_since.toISOString(),
    releaseDueIso: row.release_due_at.toISOString(),
    releasedAtIso: row.released_at ? row.released_at.toISOString() : null,
  };
}

export function toTradeTier(row: CommissionTier): TradeTierDto {
  return {
    id: row.id,
    name: row.name,
    badge: row.badge,
    description: row.description,
    commissionBps: row.commission_bps,
    payoutWindowDays: row.payout_window_days,
    minCompletedJobs: row.min_completed_jobs,
    minRating: row.min_rating_tenths / 10,
  };
}

export function toTradeCategory(row: TradeCategoryRow): TradeCategoryDto {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    activeArtisans: row.active_artisans,
    medianRateKobo: row.median_rate_kobo,
    defaultTierId: row.default_tier_id,
    active: row.active,
    lastReviewedIso: row.last_reviewed_at.toISOString(),
  };
}

export function toAuditLog(row: AuditLog): AuditLogDto {
  return {
    id: row.id,
    atIso: row.occurred_at.toISOString(),
    actor: row.actor,
    actorRole: row.actor_role,
    action: row.action,
    target: row.target,
    gateway: row.gateway,
    severity: row.severity,
  };
}

export function toDeskTicket(row: DeskTicketRow): DeskTicketDto {
  return {
    id: row.id,
    subject: row.subject,
    from: row.from_label,
    channel: row.channel,
    status: row.status,
    priority: row.priority,
    updatedAtIso: row.updated_at.toISOString(),
    summary: row.summary,
  };
}
