import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import {
  artisanProfiles,
  escrowHolds,
  jobProgressUpdates,
  jobRequests,
  jobReviews,
  jobs,
  payments,
  quotes,
  userProfiles,
} from "@/lib/server/schema";
import type {
  ArtisanDesk,
  DeskJob,
  DeskPayment,
  DeskQuote,
  DeskRequest,
} from "@/features/artisan-workspace/types";

const iso = (value: Date | null) => (value ? value.toISOString() : null);

// Derived from the account id so it is stable across sessions. The schema has
// no stored registration number; this is a workspace reference, not a licence.
export function workspaceReference(userId: string) {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 33 + userId.charCodeAt(index)) % 10000;
  }
  return `BN-${String(hash).padStart(4, "0")}`;
}

function startOfWeek(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  return start;
}

function startOfMonth(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function loadArtisanDesk(userId: string): Promise<ArtisanDesk> {
  const db = getDb();
  const now = new Date();

  const [profileRow] = await db
    .select({
      user_id: artisanProfiles.user_id,
      contact_phone: artisanProfiles.contact_phone,
      primary_trade: artisanProfiles.primary_trade,
      experience_years: artisanProfiles.experience_years,
      coverage_areas: artisanProfiles.coverage_areas,
      workshop_area: artisanProfiles.workshop_area,
      bio: artisanProfiles.bio,
      skills: artisanProfiles.skills,
      rate_guidance_kobo: artisanProfiles.rate_guidance_kobo,
      availability_notes: artisanProfiles.availability_notes,
      is_listed: artisanProfiles.is_listed,
      verification_status: artisanProfiles.verification_status,
    })
    .from(artisanProfiles)
    .where(eq(artisanProfiles.user_id, userId))
    .limit(1);

  const [account] = await db
    .select({ display_name: userProfiles.display_name })
    .from(userProfiles)
    .where(eq(userProfiles.user_id, userId))
    .limit(1);

  const jobRows = await db
    .select({
      id: jobs.id,
      request_id: jobs.request_id,
      status: jobs.status,
      created_at: jobs.created_at,
      updated_at: jobs.updated_at,
      title: jobRequests.title,
      category: jobRequests.category,
      service_area: jobRequests.service_area,
      description: jobRequests.description,
      budget_guidance_kobo: jobRequests.budget_guidance_kobo,
      total_quote_kobo: quotes.total_kobo,
      customer_name: userProfiles.display_name,
    })
    .from(jobs)
    .innerJoin(jobRequests, eq(jobRequests.id, jobs.request_id))
    .innerJoin(quotes, eq(quotes.id, jobs.accepted_quote_id))
    .innerJoin(userProfiles, eq(userProfiles.user_id, jobs.customer_id))
    .where(eq(jobs.worker_id, userId))
    .orderBy(desc(jobs.updated_at));

  const paymentRows = await db
    .select({
      id: payments.id,
      reference: payments.reference,
      job_id: payments.job_id,
      milestone: payments.milestone,
      amount_kobo: payments.amount_kobo,
      status: payments.status,
      paid_at: payments.paid_at,
      created_at: payments.created_at,
    })
    .from(payments)
    .where(and(eq(payments.worker_id, userId), eq(payments.channel, "paystack_verified_test")))
    .orderBy(desc(payments.created_at))
    .limit(200);

  const quoteRows = await db
    .select({
      id: quotes.id,
      request_id: quotes.request_id,
      total_kobo: quotes.total_kobo,
      status: quotes.status,
      created_at: quotes.created_at,
      title: jobRequests.title,
      category: jobRequests.category,
      service_area: jobRequests.service_area,
      customer_name: userProfiles.display_name,
    })
    .from(quotes)
    .innerJoin(jobRequests, eq(jobRequests.id, quotes.request_id))
    .innerJoin(userProfiles, eq(userProfiles.user_id, jobRequests.customer_id))
    .where(eq(quotes.worker_id, userId))
    .orderBy(desc(quotes.created_at))
    .limit(12);

  const [pendingQuote] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quotes)
    .where(and(eq(quotes.worker_id, userId), eq(quotes.status, "pending")));

  const [reviewStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      average: sql<number>`coalesce(round(avg(${jobReviews.rating})::numeric, 1)::float8, 0)`,
    })
    .from(jobReviews)
    .where(eq(jobReviews.worker_id, userId));

  const progressRows = jobRows.length
    ? await db
        .select({
          job_id: jobProgressUpdates.job_id,
          note: jobProgressUpdates.note,
          created_at: jobProgressUpdates.created_at,
        })
        .from(jobProgressUpdates)
        .where(
          inArray(
            jobProgressUpdates.job_id,
            jobRows.map((row) => row.id),
          ),
        )
        .orderBy(desc(jobProgressUpdates.created_at))
    : [];

  const openRequestRows = await db
    .select({
      id: jobRequests.id,
      title: jobRequests.title,
      category: jobRequests.category,
      service_area: jobRequests.service_area,
      description: jobRequests.description,
      budget_guidance_kobo: jobRequests.budget_guidance_kobo,
      created_at: jobRequests.created_at,
      customer_name: userProfiles.display_name,
      quotes_count: sql<number>`(select count(*)::int from ${quotes} q where q.request_id = ${jobRequests.id})`,
    })
    .from(jobRequests)
    .innerJoin(userProfiles, eq(userProfiles.user_id, jobRequests.customer_id))
    .where(and(sql`${jobRequests.status} in ('submitted', 'matching') and not exists (select 1 from jobs j where j.request_id = ${jobRequests.id})`, ne(jobRequests.customer_id, userId)))
    .orderBy(desc(jobRequests.created_at))
    .limit(6);

  const latestUpdateByJob = new Map<string, { note: string; created_at: string }>();
  const updateCountByJob = new Map<string, number>();
  for (const row of progressRows) {
    updateCountByJob.set(row.job_id, (updateCountByJob.get(row.job_id) ?? 0) + 1);
    if (!latestUpdateByJob.has(row.job_id)) {
      latestUpdateByJob.set(row.job_id, {
        note: row.note,
        created_at: row.created_at.toISOString(),
      });
    }
  }

  const holdRows = await db.select().from(escrowHolds).where(eq(escrowHolds.artisan_id, userId));
  const escrowByJob = new Map<string, number>();
  let mtdEarningsKobo = 0;
  let weekEarningsKobo = 0;
  let pendingEscrowKobo = 0;
  const firstOfMonth = startOfMonth(now);
  const firstOfWeek = startOfWeek(now);
  for (const hold of holdRows) {
    if (hold.status !== "released" || hold.transfer_status !== "success") {
      pendingEscrowKobo += hold.amount_kobo;
      escrowByJob.set(hold.job_ref, (escrowByJob.get(hold.job_ref) ?? 0) + hold.amount_kobo);
      continue;
    }
    const settledAt = hold.paid_out_at;
    if (settledAt && settledAt >= firstOfMonth) mtdEarningsKobo += hold.amount_kobo;
    if (settledAt && settledAt >= firstOfWeek) weekEarningsKobo += hold.amount_kobo;
  }

  const deskJobs: DeskJob[] = jobRows.map((row) => ({
    id: row.id,
    request_id: row.request_id,
    status: row.status,
    title: row.title,
    category: row.category,
    service_area: row.service_area,
    description: row.description,
    budget_guidance_kobo: row.budget_guidance_kobo,
    total_quote_kobo: row.total_quote_kobo,
    customer_name: row.customer_name,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    escrow_kobo: escrowByJob.get(row.id) ?? 0,
    update_count: updateCountByJob.get(row.id) ?? 0,
    latest_update: latestUpdateByJob.get(row.id) ?? null,
  }));

  const deskQuotes: DeskQuote[] = quoteRows.map((row) => ({
    id: row.id,
    request_id: row.request_id,
    title: row.title,
    category: row.category,
    service_area: row.service_area,
    customer_name: row.customer_name,
    total_kobo: row.total_kobo,
    status: row.status,
    created_at: row.created_at.toISOString(),
  }));

  const deskPayments: DeskPayment[] = paymentRows.slice(0, 40).map((row) => ({
    id: row.id,
    reference: row.reference,
    job_id: row.job_id,
    milestone: row.milestone,
    amount_kobo: row.amount_kobo,
    status: row.status,
    paid_at: iso(row.paid_at),
    created_at: row.created_at.toISOString(),
  }));

  const deskRequests: DeskRequest[] = openRequestRows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    service_area: row.service_area,
    description: row.description,
    budget_guidance_kobo: row.budget_guidance_kobo,
    created_at: row.created_at.toISOString(),
    quotes_count: row.quotes_count,
    customer_name: row.customer_name,
  }));

  return {
    profile: profileRow ?? null,
    display_name: account?.display_name ?? "",
    reference: workspaceReference(userId),
    stats: {
      active_jobs: deskJobs.filter(
        (job) => job.status === "accepted" || job.status === "in_progress",
      ).length,
      in_progress_jobs: deskJobs.filter((job) => job.status === "in_progress").length,
      pending_quotes: pendingQuote?.count ?? 0,
      completed_jobs: deskJobs.filter((job) => job.status === "completed").length,
      mtd_earnings_kobo: mtdEarningsKobo,
      pending_escrow_kobo: pendingEscrowKobo,
      week_earnings_kobo: weekEarningsKobo,
      reviews_count: reviewStats?.count ?? 0,
      average_rating: reviewStats?.average ?? 0,
    },
    jobs: deskJobs,
    quotes: deskQuotes,
    payments: deskPayments,
    open_requests: deskRequests,
  };
}
