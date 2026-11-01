import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const appRole = pgEnum("app_role", ["customer", "artisan", "admin"]);
export const artisanVerificationStatus = pgEnum("artisan_verification_status", [
  "unsubmitted",
  "pending",
  "approved",
  "rejected",
]);
export const jobRequestStatus = pgEnum("job_request_status", [
  "draft",
  "submitted",
  "matching",
  "cancelled",
]);
export const quoteStatus = pgEnum("quote_status", ["pending", "accepted", "declined"]);
export const jobStatus = pgEnum("job_status", [
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
]);

export const userProfiles = pgTable("user_profiles", {
  user_id: text("user_id").primaryKey(),
  role: appRole("role").notNull(),
  display_name: text("display_name").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const artisanProfiles = pgTable("artisan_profiles", {
  user_id: text("user_id")
    .primaryKey()
    .references(() => userProfiles.user_id, { onDelete: "cascade" }),
  contact_phone: text("contact_phone").notNull(),
  primary_trade: text("primary_trade").notNull(),
  experience_years: integer("experience_years").notNull(),
  coverage_areas: text("coverage_areas").array().notNull(),
  workshop_area: text("workshop_area").notNull(),
  bio: text("bio").notNull(),
  skills: text("skills").array().notNull().default(sql`ARRAY[]::text[]`),
  rate_guidance_kobo: integer("rate_guidance_kobo"),
  availability_notes: text("availability_notes"),
  is_listed: boolean("is_listed").notNull().default(true),
  verification_status: artisanVerificationStatus("verification_status")
    .notNull()
    .default("unsubmitted"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jobRequests = pgTable("job_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  customer_id: text("customer_id")
    .notNull()
    .references(() => userProfiles.user_id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  service_area: text("service_area").notNull(),
  description: text("description").notNull(),
  budget_guidance_kobo: integer("budget_guidance_kobo").notNull(),
  status: jobRequestStatus("status").notNull().default("draft"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    request_id: uuid("request_id")
      .notNull()
      .references(() => jobRequests.id, { onDelete: "cascade" }),
    worker_id: text("worker_id")
      .notNull()
      .references(() => userProfiles.user_id, { onDelete: "cascade" }),
    total_kobo: integer("total_kobo").notNull(),
    note: text("note").notNull(),
    status: quoteStatus("status").notNull().default("pending"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("quotes_request_worker_unique").on(table.request_id, table.worker_id),
    check("quotes_total_kobo_non_negative", sql`${table.total_kobo} >= 0`),
  ],
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    request_id: uuid("request_id")
      .notNull()
      .references(() => jobRequests.id, { onDelete: "cascade" }),
    accepted_quote_id: uuid("accepted_quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "restrict" }),
    customer_id: text("customer_id")
      .notNull()
      .references(() => userProfiles.user_id, { onDelete: "cascade" }),
    worker_id: text("worker_id")
      .notNull()
      .references(() => userProfiles.user_id, { onDelete: "cascade" }),
    status: jobStatus("status").notNull().default("accepted"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("jobs_request_unique").on(table.request_id),
    unique("jobs_accepted_quote_unique").on(table.accepted_quote_id),
  ],
);

export const jobProgressUpdates = pgTable("job_progress_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  job_id: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  author_id: text("author_id")
    .notNull()
    .references(() => userProfiles.user_id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jobReviews = pgTable(
  "job_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    job_id: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    reviewer_id: text("reviewer_id")
      .notNull()
      .references(() => userProfiles.user_id, { onDelete: "cascade" }),
    worker_id: text("worker_id")
      .notNull()
      .references(() => userProfiles.user_id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("job_reviews_job_unique").on(table.job_id),
    check("job_reviews_rating_range", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);

export const paymentMilestone = pgEnum("payment_milestone", ["deposit", "balance"]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "failed",
  "cancelled",
]);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    job_id: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    customer_id: text("customer_id")
      .notNull()
      .references(() => userProfiles.user_id, { onDelete: "cascade" }),
    worker_id: text("worker_id")
      .notNull()
      .references(() => userProfiles.user_id, { onDelete: "cascade" }),
    milestone: paymentMilestone("milestone").notNull(),
    amount_kobo: integer("amount_kobo").notNull(),
    status: paymentStatus("status").notNull().default("pending"),
    reference: text("reference").notNull().unique(),
    channel: text("channel").notNull().default("paystack_test"),
    failure_reason: text("failure_reason"),
    paid_at: timestamp("paid_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [check("payments_amount_kobo_non_negative", sql`${table.amount_kobo} >= 0`)],
);

export const disputeStatus = pgEnum("dispute_status", [
  "open",
  "under_review",
  "awaiting_evidence",
  "escalated",
  "resolved",
]);
export const disputePriority = pgEnum("dispute_priority", ["urgent", "high", "normal"]);
export const escrowStatus = pgEnum("escrow_status", ["held", "release_due", "released", "disputed"]);
export const escrowMilestone = pgEnum("escrow_milestone", ["deposit", "balance"]);
export const auditSeverity = pgEnum("audit_severity", ["info", "warning", "critical"]);
export const deskTicketStatus = pgEnum("desk_ticket_status", ["new", "open", "waiting", "resolved"]);
export const deskChannel = pgEnum("desk_channel", ["email", "chat", "phone"]);

export const disputes = pgTable(
  "disputes",
  {
    id: text("id").primaryKey(),
    customer_id: text("customer_id").references(() => userProfiles.user_id, {
      onDelete: "set null",
    }),
    worker_id: text("worker_id").references(() => userProfiles.user_id, {
      onDelete: "set null",
    }),
    job_id: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    job_ref: text("job_ref").notNull(),
    trade: text("trade").notNull(),
    area: text("area").notNull(),
    customer_name: text("customer_name").notNull(),
    artisan_name: text("artisan_name").notNull(),
    amount_kobo: integer("amount_kobo").notNull(),
    status: disputeStatus("status").notNull().default("open"),
    priority: disputePriority("priority").notNull().default("normal"),
    officer: text("officer"),
    summary: text("summary").notNull(),
    customer_statement: text("customer_statement").notNull(),
    artisan_statement: text("artisan_statement").notNull(),
    determination: text("determination"),
    determination_note: text("determination_note"),
    opened_at: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
    sla_due_at: timestamp("sla_due_at", { withTimezone: true }).notNull(),
    resolved_at: timestamp("resolved_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("disputes_amount_kobo_non_negative", sql`${table.amount_kobo} >= 0`)],
);

export const disputeEvidence = pgTable(
  "dispute_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dispute_id: text("dispute_id")
      .notNull()
      .references(() => disputes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    submitted_by: text("submitted_by").notNull(),
    verified: boolean("verified").notNull().default(false),
    submitted_at: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "dispute_evidence_submitted_by_check",
      sql`${table.submitted_by} IN ('customer', 'artisan', 'system')`,
    ),
  ],
);

export const disputeEvents = pgTable("dispute_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  dispute_id: text("dispute_id")
    .notNull()
    .references(() => disputes.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  detail: text("detail").notNull(),
  occurred_at: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const escrowHolds = pgTable(
  "escrow_holds",
  {
    id: text("id").primaryKey(),
    job_ref: text("job_ref").notNull(),
    title: text("title").notNull(),
    trade: text("trade").notNull(),
    area: text("area").notNull(),
    customer_name: text("customer_name").notNull(),
    artisan_name: text("artisan_name").notNull(),
    payout_bank: text("payout_bank").notNull(),
    amount_kobo: integer("amount_kobo").notNull(),
    milestone: escrowMilestone("milestone").notNull(),
    status: escrowStatus("status").notNull().default("held"),
    signed_off: boolean("signed_off").notNull().default(false),
    held_since: timestamp("held_since", { withTimezone: true }).notNull().defaultNow(),
    release_due_at: timestamp("release_due_at", { withTimezone: true }).notNull(),
    released_at: timestamp("released_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("escrow_amount_kobo_non_negative", sql`${table.amount_kobo} >= 0`)],
);

export const commissionTiers = pgTable("commission_tiers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  badge: text("badge").notNull(),
  description: text("description").notNull(),
  commission_bps: integer("commission_bps").notNull(),
  payout_window_days: integer("payout_window_days").notNull(),
  min_completed_jobs: integer("min_completed_jobs").notNull().default(0),
  min_rating_tenths: integer("min_rating_tenths").notNull().default(0),
  sort_order: integer("sort_order").notNull().default(0),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tradeCategories = pgTable("trade_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  active_artisans: integer("active_artisans").notNull().default(0),
  median_rate_kobo: integer("median_rate_kobo").notNull().default(0),
  default_tier_id: text("default_tier_id")
    .notNull()
    .references(() => commissionTiers.id, { onDelete: "restrict" }),
  active: boolean("active").notNull().default(true),
  last_reviewed_at: timestamp("last_reviewed_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().default(sql`'AUD-' || nextval('public.audit_log_seq')::text`),
  actor: text("actor").notNull(),
  actor_role: text("actor_role").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  gateway: text("gateway").notNull().default("BN-04"),
  severity: auditSeverity("severity").notNull().default("info"),
  occurred_at: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deskTickets = pgTable("desk_tickets", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  from_label: text("from_label").notNull(),
  channel: deskChannel("channel").notNull().default("email"),
  status: deskTicketStatus("status").notNull().default("new"),
  priority: disputePriority("priority").notNull().default("normal"),
  summary: text("summary").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deskTicketReplies = pgTable("desk_ticket_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticket_id: text("ticket_id")
    .notNull()
    .references(() => deskTickets.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  body: text("body").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Dispute = typeof disputes.$inferSelect;
export type DisputeEvidenceRow = typeof disputeEvidence.$inferSelect;
export type DisputeEventRow = typeof disputeEvents.$inferSelect;
export type EscrowHold = typeof escrowHolds.$inferSelect;
export type CommissionTier = typeof commissionTiers.$inferSelect;
export type TradeCategoryRow = typeof tradeCategories.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type DeskTicketRow = typeof deskTickets.$inferSelect;
export type DeskTicketReply = typeof deskTicketReplies.$inferSelect;

export type UserProfile = typeof userProfiles.$inferSelect;
export type ArtisanProfile = typeof artisanProfiles.$inferSelect;
export type JobRequest = typeof jobRequests.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type JobProgressUpdate = typeof jobProgressUpdates.$inferSelect;
export type JobReview = typeof jobReviews.$inferSelect;
export type Payment = typeof payments.$inferSelect;
