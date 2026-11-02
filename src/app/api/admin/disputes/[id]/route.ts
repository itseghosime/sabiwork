import { asc, eq } from "drizzle-orm";
import { adminActor, recordAudit } from "@/lib/server/audit";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toDisputeCase } from "@/lib/server/admin-dto";
import { disputeEvents, disputeEvidence, disputes } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

const STATUSES = ["open", "under_review", "awaiting_evidence", "escalated", "resolved"] as const;
const PRIORITIES = ["urgent", "high", "normal"] as const;

type DisputeStatusValue = (typeof STATUSES)[number];

const statusEventLabel: Record<DisputeStatusValue, string> = {
  open: "Case reopened",
  under_review: "Review started",
  awaiting_evidence: "Evidence requested",
  escalated: "Escalated to senior officer",
  resolved: "Case resolved",
};

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

async function requireAdmin() {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") {
    return { error: jsonError(401, "UNAUTHORIZED", "Sign in as an administrator.") };
  }
  if (access.kind === "forbidden" || access.kind === "profile-required") {
    return { error: jsonError(403, "FORBIDDEN", "Admin access is required.") };
  }
  if (access.kind === "unavailable") {
    return { error: jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.") };
  }
  return { user: access.user };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;

  try {
    const db = getDb();
    const [row] = await db.select().from(disputes).where(eq(disputes.id, id)).limit(1);
    if (!row) return jsonError(404, "NOT_FOUND", "Dispute case not found.");

    const [evidence, events] = await Promise.all([
      db.select().from(disputeEvidence).where(eq(disputeEvidence.dispute_id, id)),
      db
        .select()
        .from(disputeEvents)
        .where(eq(disputeEvents.dispute_id, id))
        .orderBy(asc(disputeEvents.occurred_at)),
    ]);

    return Response.json(
      { data: { case: toDisputeCase(row, evidence, events) } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Dispute detail failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load the dispute case.");
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const user = guard.user;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (typeof body !== "object" || !body) {
    return jsonError(400, "INVALID_INPUT", "Request body must be an object.");
  }

  const input = body as Record<string, unknown>;
  const nextStatus = typeof input.status === "string" ? (input.status as DisputeStatusValue) : undefined;
  const nextPriority =
    typeof input.priority === "string" ? (input.priority as (typeof PRIORITIES)[number]) : undefined;
  const nextOfficer =
    input.officer === null ? null : typeof input.officer === "string" ? input.officer.trim() : undefined;
  const nextDetermination =
    input.determination === null
      ? null
      : typeof input.determination === "string"
        ? input.determination.trim()
        : undefined;
  const nextNote =
    input.determinationNote === null
      ? null
      : typeof input.determinationNote === "string"
        ? input.determinationNote.trim()
        : undefined;

  if (nextStatus && !STATUSES.includes(nextStatus)) {
    return jsonError(400, "INVALID_INPUT", "Unknown dispute status.");
  }
  if (nextPriority && !PRIORITIES.includes(nextPriority)) {
    return jsonError(400, "INVALID_INPUT", "Unknown dispute priority.");
  }
  if (nextOfficer !== undefined && nextOfficer !== null && nextOfficer.length > 100) {
    return jsonError(400, "INVALID_INPUT", "Officer name must be 100 characters or fewer.");
  }
  if (nextNote !== undefined && nextNote !== null && nextNote.length < 10) {
    return jsonError(400, "INVALID_INPUT", "A determination needs a rationale of at least 10 characters.");
  }
  if (
    nextStatus === undefined &&
    nextPriority === undefined &&
    nextOfficer === undefined &&
    nextDetermination === undefined &&
    nextNote === undefined
  ) {
    return jsonError(400, "INVALID_INPUT", "Provide at least one field to update.");
  }

  try {
    const db = getDb();
    const [existing] = await db.select().from(disputes).where(eq(disputes.id, id)).limit(1);
    if (!existing) return jsonError(404, "NOT_FOUND", "Dispute case not found.");

    const now = new Date();
    const updates: Partial<typeof disputes.$inferInsert> = { updated_at: now };
    if (nextStatus) {
      updates.status = nextStatus;
      updates.resolved_at = nextStatus === "resolved" ? now : null;
    }
    if (nextPriority) updates.priority = nextPriority;
    if (nextOfficer !== undefined) updates.officer = nextOfficer;
    if (nextDetermination !== undefined) updates.determination = nextDetermination;
    if (nextNote !== undefined) updates.determination_note = nextNote;

    const [updated] = await db.update(disputes).set(updates).where(eq(disputes.id, id)).returning();

    const events: { label: string; detail: string }[] = [];
    if (nextStatus && nextStatus !== existing.status) {
      events.push({
        label: statusEventLabel[nextStatus],
        detail: `Status moved from ${existing.status.replace(/_/g, " ")} to ${nextStatus.replace(/_/g, " ")}.`,
      });
    }
    if (nextPriority && nextPriority !== existing.priority) {
      events.push({ label: "Priority changed", detail: `Priority set to ${nextPriority}.` });
    }
    if (nextOfficer !== undefined && nextOfficer !== existing.officer) {
      events.push({
        label: nextOfficer ? "Case officer assigned" : "Case officer cleared",
        detail: nextOfficer ? `${nextOfficer} picked up this case.` : "The case is back in the unassigned queue.",
      });
    }
    if (nextDetermination !== undefined) {
      events.push({
        label: "Determination recorded",
        detail: nextDetermination ?? "Determination cleared.",
      });
    }

    if (events.length) {
      await db.insert(disputeEvents).values(events.map((event) => ({ dispute_id: id, ...event })));
    }

    await recordAudit({
      actor: adminActor(user),
      actorRole: "Case officer",
      action: nextStatus ? `dispute.${nextStatus}` : "dispute.updated",
      target: `Case ${id}`,
      severity: nextStatus === "escalated" ? "warning" : "info",
    });

    const [evidence, eventRows] = await Promise.all([
      db.select().from(disputeEvidence).where(eq(disputeEvidence.dispute_id, id)),
      db
        .select()
        .from(disputeEvents)
        .where(eq(disputeEvents.dispute_id, id))
        .orderBy(asc(disputeEvents.occurred_at)),
    ]);

    return Response.json(
      { data: { case: toDisputeCase(updated, evidence, eventRows) } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Dispute update failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not update the dispute case.");
  }
}
