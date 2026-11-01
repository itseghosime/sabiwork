import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

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

export type UserProfile = typeof userProfiles.$inferSelect;
export type ArtisanProfile = typeof artisanProfiles.$inferSelect;
export type JobRequest = typeof jobRequests.$inferSelect;
