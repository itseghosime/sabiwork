import { and, asc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { artisanProfiles, jobRequests, quotes, userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function canAccessQuotes(requestId: string, userId: string) {
  const [request] = await getDb()
    .select({ customer_id: jobRequests.customer_id })
    .from(jobRequests)
    .where(eq(jobRequests.id, requestId))
    .limit(1);

  if (!request) return { kind: "not-found" as const };
  if (request.customer_id === userId) return { kind: "ok" as const, isCustomer: true };

  const [profile] = await getDb()
    .select({ user_id: artisanProfiles.user_id })
    .from(artisanProfiles)
    .where(eq(artisanProfiles.user_id, userId))
    .limit(1);

  if (!profile) return { kind: "forbidden" as const };
  return { kind: "ok" as const, isCustomer: false };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  const { id } = await params;

  try {
    const access = await canAccessQuotes(id, session.user.id);
    if (access.kind === "not-found") return jsonError(404, "NOT_FOUND", "Request not found.");
    if (access.kind === "forbidden") return jsonError(403, "FORBIDDEN", "You do not have access to this request.");

    const rows = await getDb()
      .select({
        id: quotes.id,
        request_id: quotes.request_id,
        worker_id: quotes.worker_id,
        worker_name: userProfiles.display_name,
        total_kobo: quotes.total_kobo,
        note: quotes.note,
        status: quotes.status,
        created_at: quotes.created_at,
      })
      .from(quotes)
      .innerJoin(userProfiles, eq(userProfiles.user_id, quotes.worker_id))
      .where(eq(quotes.request_id, id))
      .orderBy(asc(quotes.created_at));

    return Response.json({ data: rows }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[quotes] List failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load quotes.");
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  if (!isRecord(body)) {
    return jsonError(400, "INVALID_INPUT", "Quote details are required.");
  }

  const { total_kobo, note } = body;
  if (
    typeof total_kobo !== "number" ||
    !Number.isSafeInteger(total_kobo) ||
    total_kobo < 0 ||
    total_kobo > 1_000_000_000 ||
    typeof note !== "string" ||
    note.trim().length < 10 ||
    note.trim().length > 2000
  ) {
    return jsonError(400, "INVALID_INPUT", "Provide a valid amount and quote note.");
  }

  try {
    const [requestRow] = await getDb()
      .select({
        id: jobRequests.id,
        status: jobRequests.status,
        customer_id: jobRequests.customer_id,
      })
      .from(jobRequests)
      .where(eq(jobRequests.id, id))
      .limit(1);

    if (!requestRow) return jsonError(404, "NOT_FOUND", "Request not found.");
    if (requestRow.customer_id === session.user.id) {
      return jsonError(403, "FORBIDDEN", "You cannot quote your own request.");
    }
    if (requestRow.status !== "submitted" && requestRow.status !== "matching") {
      return jsonError(409, "INVALID_STATE", "Quotes can only be added to open requests.");
    }

    const [profile] = await getDb()
      .select({ user_id: artisanProfiles.user_id })
      .from(artisanProfiles)
      .where(eq(artisanProfiles.user_id, session.user.id))
      .limit(1);

    if (!profile) {
      return jsonError(403, "WORK_PROFILE_REQUIRED", "Create your work profile before sending quotes.");
    }

    const [created] = await getDb()
      .insert(quotes)
      .values({
        request_id: id,
        worker_id: session.user.id,
        total_kobo,
        note: note.trim(),
      })
      .onConflictDoUpdate({
        target: [quotes.request_id, quotes.worker_id],
        set: {
          total_kobo,
          note: note.trim(),
          status: "pending",
          updated_at: new Date(),
        },
      })
      .returning({
        id: quotes.id,
        request_id: quotes.request_id,
        worker_id: quotes.worker_id,
        total_kobo: quotes.total_kobo,
        note: quotes.note,
        status: quotes.status,
        created_at: quotes.created_at,
      });

    await getDb()
      .update(jobRequests)
      .set({ status: "matching", updated_at: new Date() })
      .where(and(eq(jobRequests.id, id), eq(jobRequests.status, "submitted")));

    return Response.json({ data: created }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[quotes] Create failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save this quote.");
  }
}
