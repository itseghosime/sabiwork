import { desc } from "drizzle-orm";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toAuditLog, toDeskTicket } from "@/lib/server/admin-dto";
import { auditLogs, deskTickets } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET() {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in as an administrator.");
  if (access.kind === "forbidden" || access.kind === "profile-required") return jsonError(403, "FORBIDDEN", "Admin access is required.");
  if (access.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");

  try {
    const db = getDb();
    const [logRows, ticketRows] = await Promise.all([
      db.select().from(auditLogs).orderBy(desc(auditLogs.occurred_at)).limit(200),
      db.select().from(deskTickets).orderBy(desc(deskTickets.updated_at)),
    ]);

    return Response.json(
      { data: { logs: logRows.map(toAuditLog), tickets: ticketRows.map(toDeskTicket) } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Audit list failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load the audit trail.");
  }
}
