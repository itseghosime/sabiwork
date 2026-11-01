import { authorizeRole } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { artisanProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const access = await authorizeRole("artisan", { allowUnverified: true });
  if (access.kind === "unauthenticated") {
    return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  if (access.kind === "forbidden" || access.kind === "profile-required") {
    return jsonError(403, "FORBIDDEN", "An artisan account is required.");
  }
  if (access.kind === "unavailable") {
    return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  if (!isRecord(body)) {
    return jsonError(400, "INVALID_INPUT", "Profile details are required.");
  }

  const {
    contact_phone,
    primary_trade,
    experience_years,
    coverage_areas,
    workshop_area,
    bio,
  } = body;
  if (
    typeof contact_phone !== "string" ||
    !/^[+()\d\s-]{8,20}$/.test(contact_phone) ||
    typeof primary_trade !== "string" ||
    primary_trade.trim().length < 2 ||
    primary_trade.trim().length > 100 ||
    typeof experience_years !== "number" ||
    !Number.isSafeInteger(experience_years) ||
    experience_years < 0 ||
    experience_years > 60 ||
    !Array.isArray(coverage_areas) ||
    coverage_areas.length < 1 ||
    coverage_areas.length > 10 ||
    !coverage_areas.every(
      (area) =>
        typeof area === "string" &&
        area.trim().length >= 2 &&
        area.trim().length <= 100,
    ) ||
    typeof workshop_area !== "string" ||
    workshop_area.trim().length < 2 ||
    workshop_area.trim().length > 100 ||
    typeof bio !== "string" ||
    bio.trim().length < 20 ||
    bio.trim().length > 2000
  ) {
    return jsonError(
      400,
      "INVALID_INPUT",
      "Check the contact, trade, coverage, and profile details.",
    );
  }

  try {
    const [profile] = await getDb()
      .insert(artisanProfiles)
      .values({
        user_id: access.user.id,
        contact_phone: contact_phone.trim(),
        primary_trade: primary_trade.trim(),
        experience_years,
        coverage_areas: coverage_areas.map((area) => area.trim()),
        workshop_area: workshop_area.trim(),
        bio: bio.trim(),
        verification_status: "unsubmitted",
      })
      .onConflictDoUpdate({
        target: artisanProfiles.user_id,
        set: {
          contact_phone: contact_phone.trim(),
          primary_trade: primary_trade.trim(),
          experience_years,
          coverage_areas: coverage_areas.map((area) => area.trim()),
          workshop_area: workshop_area.trim(),
          bio: bio.trim(),
          updated_at: new Date(),
        },
      })
      .returning({
        user_id: artisanProfiles.user_id,
        primary_trade: artisanProfiles.primary_trade,
        verification_status: artisanProfiles.verification_status,
      });

    return Response.json(
      { data: profile },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[artisan-profile] Save failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save this artisan profile.");
  }
}
