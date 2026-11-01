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

export type UserProfile = typeof userProfiles.$inferSelect;
export type ArtisanProfile = typeof artisanProfiles.$inferSelect;
export type JobRequest = typeof jobRequests.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type JobProgressUpdate = typeof jobProgressUpdates.$inferSelect;
export type JobReview = typeof jobReviews.$inferSelect;
