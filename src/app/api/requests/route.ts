import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobRequests, userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET() {
  const session = await getSessionUser();
  if (session.kind === "unavailable") {
    return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  }
  if (session.kind === "unauthenticated") {
    return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  }

  try {
    const requests = await getDb()
      .select({
        id: jobRequests.id,
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
      .where(eq(jobRequests.customer_id, session.user.id))
      .orderBy(desc(jobRequests.created_at), desc(jobRequests.id))
      .limit(100);

    return Response.json(
      { data: requests },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[requests] List failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load your requests.");
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (session.kind === "unavailable") {
    return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  }
  if (session.kind === "unauthenticated") {
    return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  if (!isRecord(body)) {
    return jsonError(400, "INVALID_INPUT", "Request details are required.");
  }

  const { title, category, service_area, description, budget_guidance_kobo, status } = body;
  if (
    typeof title !== "string" ||
    title.trim().length < 3 ||
    title.trim().length > 120 ||
    typeof category !== "string" ||
    category.trim().length < 2 ||
    category.trim().length > 80 ||
    typeof service_area !== "string" ||
    service_area.trim().length < 2 ||
    service_area.trim().length > 100 ||
    typeof description !== "string" ||
    description.trim().length < 20 ||
    description.trim().length > 2000 ||
    typeof budget_guidance_kobo !== "number" ||
    !Number.isSafeInteger(budget_guidance_kobo) ||
    budget_guidance_kobo < 0 ||
    budget_guidance_kobo > 100_000_000 ||
    (status !== undefined && status !== "draft" && status !== "submitted")
  ) {
    return jsonError(
      400,
      "INVALID_INPUT",
      "Check the request details and budget amount.",
    );
  }

  try {
    await getDb()
      .insert(userProfiles)
      .values({
        user_id: session.user.id,
        role: "customer",
        display_name: session.user.name,
      })
      .onConflictDoNothing();

    const [saved] = await getDb()
      .insert(jobRequests)
      .values({
        customer_id: session.user.id,
        title: title.trim(),
        category: category.trim(),
        service_area: service_area.trim(),
        description: description.trim(),
        budget_guidance_kobo,
        status: status === "submitted" ? "submitted" : "draft",
      })
      .returning({
        id: jobRequests.id,
        title: jobRequests.title,
        category: jobRequests.category,
        service_area: jobRequests.service_area,
        budget_guidance_kobo: jobRequests.budget_guidance_kobo,
        status: jobRequests.status,
        created_at: jobRequests.created_at,
      });

    return Response.json(
      { data: saved },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[requests] Create failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save this request.");
  }
}
