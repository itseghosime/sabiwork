import { desc } from "drizzle-orm";
import { toAuditLog } from "@/lib/server/admin-dto";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import {
  artisanProfiles,
  auditLogs,
  deskTickets,
  disputes,
  escrowHolds,
  jobRequests,
  userProfiles,
} from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET() {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") {
    return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  if (access.kind === "forbidden" || access.kind === "profile-required") {
    return jsonError(403, "FORBIDDEN", "Admin access is required.");
  }
  if (access.kind === "unavailable") {
    return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  }

  try {
    const db = getDb();
    const [users, workProfiles, requests, disputeRows, escrowRows, auditRows, ticketRows] = await Promise.all([
      db
        .select({
          user_id: userProfiles.user_id,
          role: userProfiles.role,
          display_name: userProfiles.display_name,
          created_at: userProfiles.created_at,
        })
        .from(userProfiles)
        .orderBy(desc(userProfiles.created_at))
        .limit(100),
      db
        .select({
          user_id: artisanProfiles.user_id,
          primary_trade: artisanProfiles.primary_trade,
          coverage_areas: artisanProfiles.coverage_areas,
          is_listed: artisanProfiles.is_listed,
          verification_status: artisanProfiles.verification_status,
          created_at: artisanProfiles.created_at,
        })
        .from(artisanProfiles)
        .orderBy(desc(artisanProfiles.created_at))
        .limit(100),
      db
        .select({
          id: jobRequests.id,
          customer_id: jobRequests.customer_id,
          title: jobRequests.title,
          category: jobRequests.category,
          status: jobRequests.status,
          created_at: jobRequests.created_at,
        })
        .from(jobRequests)
        .orderBy(desc(jobRequests.created_at))
        .limit(100),
      db
        .select({
          id: disputes.id,
          title: disputes.title,
          status: disputes.status,
          priority: disputes.priority,
          officer: disputes.officer,
          sla_due_at: disputes.sla_due_at,
        })
        .from(disputes),
      db
        .select({
          status: escrowHolds.status,
          amount_kobo: escrowHolds.amount_kobo,
          released_at: escrowHolds.released_at,
        })
        .from(escrowHolds),
      db.select().from(auditLogs).orderBy(desc(auditLogs.occurred_at)).limit(8),
      db.select({ status: deskTickets.status }).from(deskTickets),
    ]);

    const now = Date.now();
    const openDisputes = disputeRows.filter((row) => row.status !== "resolved");

    const disputeSummary = {
      total: disputeRows.length,
      open: openDisputes.length,
      urgent: openDisputes.filter((row) => row.priority === "urgent").length,
      awaitingEvidence: openDisputes.filter((row) => row.status === "awaiting_evidence").length,
      unassigned: openDisputes.filter((row) => !row.officer).length,
      overdue: openDisputes.filter((row) => row.sla_due_at.getTime() < now).length,
    };

    const escrow = escrowRows.reduce(
      (acc, row) => {
        if (row.status === "released") {
          acc.releasedKobo += row.amount_kobo;
          if (row.released_at && now - row.released_at.getTime() <= 7 * 86_400_000) {
            acc.releasedLast7DaysKobo += row.amount_kobo;
          }
        } else if (row.status === "disputed") {
          acc.disputedKobo += row.amount_kobo;
        } else {
          acc.heldKobo += row.amount_kobo;
          if (row.status === "release_due") {
            acc.releaseDueKobo += row.amount_kobo;
            acc.dueNow += 1;
          }
        }
        return acc;
      },
      { heldKobo: 0, releaseDueKobo: 0, releasedKobo: 0, disputedKobo: 0, releasedLast7DaysKobo: 0, dueNow: 0 },
    );

    const desk = {
      open: ticketRows.filter((row) => row.status !== "resolved").length,
      unclaimed: ticketRows.filter((row) => row.status === "new").length,
    };

    return Response.json(
      {
        data: {
          users,
          workProfiles,
          requests,
          disputes: disputeSummary,
          escrow,
          activity: auditRows.map(toAuditLog),
          desk,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Overview failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load admin data.");
  }
}
