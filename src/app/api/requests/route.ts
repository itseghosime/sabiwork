import { and, desc, eq } from "drizzle-orm";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { jobRequests } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function authorizationResponse(kind: string) {
  if (kind === "unauthenticated") {
    return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  if (kind === "forbidden") {
    return jsonError(403, "FORBIDDEN", "A customer account is required.");
  }
  if (kind === "profile-required") {
    return jsonError(403, "PROFILE_REQUIRED", "Complete your account profile first.");
  }
  return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET() {
  const access = await authorizeRole("customer");
  if (access.kind !== "authorized") {
    return authorizationResponse(access.kind);
  }

  try {
    const requests = await getDb()
      .select({
        id: jobRequests.id,
        title: jobRequests.title,
        category: jobRequests.category,
        service_area: jobRequests.service_area,
        budget_guidance_kobo: jobRequests.budget_guidance_kobo,
        status: jobRequests.status,
        created_at: jobRequests.created_at,
      })
      .from(jobRequests)
      .where(
        and(
          eq(jobRequests.customer_id, access.user.id),
          eq(jobRequests.status, "draft"),
        ),
      )
      .orderBy(desc(jobRequests.created_at), desc(jobRequests.id))
      .limit(50);

    return Response.json(
      { data: requests },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[requests] List failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load saved requests.");
  }
}

export async function POST(request: Request) {
  const access = await authorizeRole("customer");
  if (access.kind !== "authorized") {
    return authorizationResponse(access.kind);
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

  const { title, category, service_area, description, budget_guidance_kobo } = body;
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
    budget_guidance_kobo > 100_000_000
  ) {
    return jsonError(
      400,
      "INVALID_INPUT",
      "Check the request details and budget amount.",
    );
  }

  try {
    const [saved] = await getDb()
      .insert(jobRequests)
      .values({
        customer_id: access.user.id,
        title: title.trim(),
        category: category.trim(),
        service_area: service_area.trim(),
        description: description.trim(),
        budget_guidance_kobo,
        status: "draft",
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
