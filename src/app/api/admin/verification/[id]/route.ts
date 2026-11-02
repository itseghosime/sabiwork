import { eq } from "drizzle-orm";
import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { artisanProfiles, userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in as an administrator.");
  if (access.kind === "forbidden" || access.kind === "profile-required") return jsonError(403, "FORBIDDEN", "Admin access is required.");
  if (access.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");

  const { id } = await params;

  try {
    const [row] = await getDb()
      .select({
        user_id: artisanProfiles.user_id,
        display_name: userProfiles.display_name,
        contact_phone: artisanProfiles.contact_phone,
        primary_trade: artisanProfiles.primary_trade,
        experience_years: artisanProfiles.experience_years,
        coverage_areas: artisanProfiles.coverage_areas,
        workshop_area: artisanProfiles.workshop_area,
        bio: artisanProfiles.bio,
        skills: artisanProfiles.skills,
        rate_guidance_kobo: artisanProfiles.rate_guidance_kobo,
        verification_status: artisanProfiles.verification_status,
        created_at: artisanProfiles.created_at,
        updated_at: artisanProfiles.updated_at,
      })
      .from(artisanProfiles)
      .innerJoin(userProfiles, eq(userProfiles.user_id, artisanProfiles.user_id))
      .where(eq(artisanProfiles.user_id, id))
      .limit(1);

    if (!row) {
      return jsonError(404, "NOT_FOUND", "Artisan dossier not found.");
    }

    return Response.json({ data: row }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[admin] Dossier lookup failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load dossier.");
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in as an administrator.");
  if (access.kind === "forbidden" || access.kind === "profile-required") return jsonError(403, "FORBIDDEN", "Admin access is required.");
  if (access.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (
    typeof body !== "object" ||
    !body ||
    !("status" in body) ||
    typeof body.status !== "string" ||
    (body.status !== "approved" && body.status !== "rejected" && body.status !== "pending")
  ) {
    return jsonError(400, "INVALID_INPUT", "Status must be 'approved', 'rejected', or 'pending'.");
  }

  try {
    const [updated] = await getDb()
      .update(artisanProfiles)
      .set({
        verification_status: body.status,
        updated_at: new Date(),
      })
      .where(eq(artisanProfiles.user_id, id))
      .returning({
        user_id: artisanProfiles.user_id,
        verification_status: artisanProfiles.verification_status,
        updated_at: artisanProfiles.updated_at,
      });

    if (!updated) {
      return jsonError(404, "NOT_FOUND", "Artisan profile not found.");
    }

    return Response.json({ data: updated }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[admin] Verification update failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not update verification status.");
  }
}
