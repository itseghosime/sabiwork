import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { payments } from "@/lib/server/schema";
import { MilestoneError, settleMilestone } from "@/lib/server/milestones";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (session.kind !== "authenticated")
    return Response.json(
      { error: { message: "Sign in to verify your payment." } },
      { status: session.kind === "unavailable" ? 503 : 401 },
    );
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { message: "Invalid request." } },
      { status: 400 },
    );
  }
  if (typeof body?.reference !== "string" || body.reference.length > 100)
    return Response.json(
      { error: { message: "A valid payment reference is required." } },
      { status: 400 },
    );
  try {
    const [owned] = await getDb()
      .select({ id: payments.id })
      .from(payments)
      .where(
        and(
          eq(payments.reference, body.reference),
          eq(payments.customer_id, session.user.id),
        ),
      )
      .limit(1);
    if (!owned)
      return Response.json(
        { error: { message: "Payment not found." } },
        { status: 404 },
      );
    const data = await settleMilestone(body.reference);
    return Response.json(
      { data },
      {
        status: data.status === "pending" ? 202 : 200,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (e) {
    return Response.json(
      {
        error: {
          message: e instanceof Error ? e.message : "Verification failed.",
        },
      },
      { status: e instanceof MilestoneError ? e.status : 502 },
    );
  }
}
