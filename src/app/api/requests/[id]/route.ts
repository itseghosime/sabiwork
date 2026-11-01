import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobRequests, quotes } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

async function getRequestForUser(id: string, userId: string) {
  const [request] = await getDb()
    .select({
      id: jobRequests.id,
      customer_id: jobRequests.customer_id,
      title: jobRequests.title,
      category: jobRequests.category,
      service_area: jobRequests.service_area,
      description: jobRequests.description,
      budget_guidance_kobo: jobRequests.budget_guidance_kobo,
      status: jobRequests.status,
      created_at: jobRequests.created_at,
      updated_at: jobRequests.updated_at,
    })
    .from(jobRequests)
    .where(eq(jobRequests.id, id))
    .limit(1);

  if (!request) return null;

  const [ownQuote] = await getDb()
    .select({ id: quotes.id })
    .from(quotes)
    .where(and(eq(quotes.request_id, id), eq(quotes.worker_id, userId)))
    .limit(1);

  if (request.customer_id !== userId && !ownQuote) {
    return undefined;
  }

  return request;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  const { id } = await params;

  try {
    const record = await getRequestForUser(id, session.user.id);
    if (record === undefined) return jsonError(403, "FORBIDDEN", "You do not have access to this request.");
    if (!record) return jsonError(404, "NOT_FOUND", "Request not found.");
    return Response.json({ data: record }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[requests] Detail failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load this request.");
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  if (typeof body !== "object" || !body || !("action" in body)) {
    return jsonError(400, "INVALID_INPUT", "An action is required.");
  }

  const action = body.action;
  if (action !== "submit" && action !== "cancel") {
    return jsonError(400, "INVALID_ACTION", "Action must be submit or cancel.");
  }

  try {
    const [owned] = await getDb()
      .select({ id: jobRequests.id, status: jobRequests.status, customer_id: jobRequests.customer_id })
      .from(jobRequests)
      .where(and(eq(jobRequests.id, id), eq(jobRequests.customer_id, session.user.id)))
      .limit(1);

    if (!owned) return jsonError(404, "NOT_FOUND", "Request not found.");

    const targetStatus = action === "submit" ? "submitted" : "cancelled";
    if (action === "submit" && owned.status !== "draft") {
      return jsonError(409, "INVALID_STATE", "Only draft requests can be submitted.");
    }
    if (action === "cancel" && owned.status !== "submitted" && owned.status !== "matching") {
      return jsonError(409, "INVALID_STATE", "Only open submitted requests can be cancelled.");
    }

    const [updated] = await getDb()
      .update(jobRequests)
      .set({ status: targetStatus, updated_at: new Date() })
      .where(and(eq(jobRequests.id, id), eq(jobRequests.customer_id, session.user.id)))
      .returning({ id: jobRequests.id, status: jobRequests.status, updated_at: jobRequests.updated_at });

    return Response.json({ data: updated }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[requests] Status update failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not update this request.");
  }
}
