import { and, eq, ne } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobRequests, jobs, quotes } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
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

  if (typeof body !== "object" || !body || !("decision" in body)) {
    return jsonError(400, "INVALID_INPUT", "Decision is required.");
  }
  const decision = body.decision;
  if (decision !== "accept" && decision !== "decline") {
    return jsonError(400, "INVALID_INPUT", "Decision must be accept or decline.");
  }

  try {
    const [quote] = await getDb()
      .select({
        id: quotes.id,
        request_id: quotes.request_id,
        worker_id: quotes.worker_id,
        total_kobo: quotes.total_kobo,
        status: quotes.status,
        request_customer_id: jobRequests.customer_id,
        request_status: jobRequests.status,
      })
      .from(quotes)
      .innerJoin(jobRequests, eq(jobRequests.id, quotes.request_id))
      .where(eq(quotes.id, id))
      .limit(1);

    if (!quote) return jsonError(404, "NOT_FOUND", "Quote not found.");
    if (quote.request_customer_id !== session.user.id) {
      return jsonError(403, "FORBIDDEN", "Only the request owner can decide this quote.");
    }
    if (quote.status !== "pending") {
      return jsonError(409, "INVALID_STATE", "This quote is no longer pending.");
    }

    if (decision === "decline") {
      const [updated] = await getDb()
        .update(quotes)
        .set({ status: "declined", updated_at: new Date() })
        .where(eq(quotes.id, id))
        .returning({ id: quotes.id, status: quotes.status });
      return Response.json({ data: updated }, { headers: { "Cache-Control": "private, no-store" } });
    }

    if (quote.request_status !== "submitted" && quote.request_status !== "matching") {
      return jsonError(409, "INVALID_STATE", "This request is not open for acceptance.");
    }

    const existingJob = await getDb()
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.request_id, quote.request_id))
      .limit(1);

    if (existingJob.length) {
      return jsonError(409, "JOB_EXISTS", "A job already exists for this request.");
    }

    const [accepted] = await getDb()
      .update(quotes)
      .set({ status: "accepted", updated_at: new Date() })
      .where(eq(quotes.id, id))
      .returning({
        id: quotes.id,
        request_id: quotes.request_id,
        worker_id: quotes.worker_id,
        status: quotes.status,
      });

    await getDb()
      .update(quotes)
      .set({ status: "declined", updated_at: new Date() })
      .where(and(eq(quotes.request_id, quote.request_id), ne(quotes.id, id), eq(quotes.status, "pending")));

    await getDb()
      .update(jobRequests)
      .set({ status: "matching", updated_at: new Date() })
      .where(eq(jobRequests.id, quote.request_id));

    const [job] = await getDb()
      .insert(jobs)
      .values({
        request_id: quote.request_id,
        accepted_quote_id: accepted.id,
        customer_id: quote.request_customer_id,
        worker_id: quote.worker_id,
        status: "accepted",
      })
      .returning({ id: jobs.id, status: jobs.status, worker_id: jobs.worker_id });

    return Response.json({ data: { quote: accepted, job } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[quotes] Decision failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not process this quote decision.");
  }
}
