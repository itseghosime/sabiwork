import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { artisanProfiles, jobRequests, quotes, userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");

  const { id } = await params;

  try {
    const [quote] = await getDb()
      .select({
        id: quotes.id,
        request_id: quotes.request_id,
        worker_id: quotes.worker_id,
        worker_name: userProfiles.display_name,
        total_kobo: quotes.total_kobo,
        note: quotes.note,
        status: quotes.status,
        created_at: quotes.created_at,
        request_customer_id: jobRequests.customer_id,
      })
      .from(quotes)
      .innerJoin(jobRequests, eq(jobRequests.id, quotes.request_id))
      .innerJoin(userProfiles, eq(userProfiles.user_id, quotes.worker_id))
      .where(eq(quotes.id, id))
      .limit(1);

    if (!quote) return jsonError(404, "NOT_FOUND", "Quote not found.");

    if (quote.request_customer_id !== session.user.id && quote.worker_id !== session.user.id) {
      const [profile] = await getDb()
        .select({ user_id: artisanProfiles.user_id })
        .from(artisanProfiles)
        .where(eq(artisanProfiles.user_id, session.user.id))
        .limit(1);

      if (!profile) {
        return jsonError(403, "FORBIDDEN", "You do not have access to this quote.");
      }

      const [ownQuoteOnRequest] = await getDb()
        .select({ id: quotes.id })
        .from(quotes)
        .where(and(eq(quotes.request_id, quote.request_id), eq(quotes.worker_id, session.user.id)))
        .limit(1);

      if (!ownQuoteOnRequest) {
        return jsonError(403, "FORBIDDEN", "You do not have access to this quote.");
      }
    }

    return Response.json({ data: quote }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[quotes] Detail failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load this quote.");
  }
}
