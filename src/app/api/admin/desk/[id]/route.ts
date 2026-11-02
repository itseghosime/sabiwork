import { asc, eq } from "drizzle-orm";
import { adminActor, recordAudit } from "@/lib/server/audit";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { toDeskTicket } from "@/lib/server/admin-dto";
import { deskTicketReplies, deskTickets } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "open", "waiting", "resolved"] as const;
type DeskStatusValue = (typeof STATUSES)[number];

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
    const [ticket] = await db.select().from(deskTickets).where(eq(deskTickets.id, id)).limit(1);
    if (!ticket) return jsonError(404, "NOT_FOUND", "Desk ticket not found.");

    const replies = await db
      .select()
      .from(deskTicketReplies)
      .where(eq(deskTicketReplies.ticket_id, id))
      .orderBy(asc(deskTicketReplies.created_at));

    return Response.json(
      {
        data: {
          ticket: toDeskTicket(ticket),
          replies: replies.map((reply) => ({
            id: reply.id,
            author: reply.author,
            body: reply.body,
            createdAtIso: reply.created_at.toISOString(),
          })),
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Desk ticket failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load the desk ticket.");
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

  const status =
    typeof body === "object" && body && "status" in body && typeof (body as { status: unknown }).status === "string"
      ? ((body as { status: string }).status as DeskStatusValue)
      : undefined;

  if (!status || !STATUSES.includes(status)) {
    return jsonError(400, "INVALID_INPUT", "Status must be new, open, waiting, or resolved.");
  }

  try {
    const db = getDb();
    const [updated] = await db
      .update(deskTickets)
      .set({ status, updated_at: new Date() })
      .where(eq(deskTickets.id, id))
      .returning();

    if (!updated) return jsonError(404, "NOT_FOUND", "Desk ticket not found.");

    await recordAudit({
      actor: adminActor(user),
      actorRole: "Desk officer",
      action: `desk.${status}`,
      target: `Desk ticket ${id}`,
      severity: "info",
    });

    return Response.json(
      { data: { ticket: toDeskTicket(updated) } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Desk ticket update failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not update the desk ticket.");
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const message =
    typeof body === "object" && body && "body" in body && typeof (body as { body: unknown }).body === "string"
      ? (body as { body: string }).body.trim()
      : "";

  if (message.length < 2) {
    return jsonError(400, "INVALID_INPUT", "Write a reply before sending.");
  }
  if (message.length > 2000) {
    return jsonError(400, "INVALID_INPUT", "Replies are limited to 2000 characters.");
  }

  try {
    const db = getDb();
    const [ticket] = await db.select().from(deskTickets).where(eq(deskTickets.id, id)).limit(1);
    if (!ticket) return jsonError(404, "NOT_FOUND", "Desk ticket not found.");

    const author = adminActor(user);
    const [reply] = await db.insert(deskTicketReplies).values({ ticket_id: id, author, body: message }).returning();

    const nextStatus = ticket.status === "new" ? "open" : ticket.status;
    const [updatedTicket] = await db
      .update(deskTickets)
      .set({ status: nextStatus, updated_at: new Date() })
      .where(eq(deskTickets.id, id))
      .returning();

    await recordAudit({
      actor: author,
      actorRole: "Desk officer",
      action: "desk.reply_sent",
      target: `Desk ticket ${id}`,
      severity: "info",
    });

    return Response.json(
      {
        data: {
          ticket: toDeskTicket(updatedTicket),
          reply: {
            id: reply.id,
            author: reply.author,
            body: reply.body,
            createdAtIso: reply.created_at.toISOString(),
          },
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[admin] Desk reply failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not send the reply.");
  }
}
