import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { artisanProfiles, userProfiles } from "@/lib/server/schema";

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
    const [profile] = await getDb()
      .select({
        user_id: artisanProfiles.user_id,
        contact_phone: artisanProfiles.contact_phone,
        primary_trade: artisanProfiles.primary_trade,
        experience_years: artisanProfiles.experience_years,
        coverage_areas: artisanProfiles.coverage_areas,
        workshop_area: artisanProfiles.workshop_area,
        bio: artisanProfiles.bio,
        skills: artisanProfiles.skills,
        rate_guidance_kobo: artisanProfiles.rate_guidance_kobo,
        availability_notes: artisanProfiles.availability_notes,
        is_listed: artisanProfiles.is_listed,
        verification_status: artisanProfiles.verification_status,
      })
      .from(artisanProfiles)
      .where(eq(artisanProfiles.user_id, session.user.id))
      .limit(1);

    if (!profile) {
      return jsonError(404, "WORK_PROFILE_REQUIRED", "Create your work profile to get listed.");
    }

    return Response.json({ data: profile }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[work-profile] Lookup failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load this work profile.");
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
    return jsonError(400, "INVALID_INPUT", "Profile details are required.");
  }

  const {
    contact_phone,
    primary_trade,
    experience_years,
    coverage_areas,
    workshop_area,
    bio,
    skills,
    rate_guidance_kobo,
    availability_notes,
    is_listed,
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
    bio.trim().length > 2000 ||
    (skills !== undefined &&
      (!Array.isArray(skills) ||
        skills.length > 20 ||
        !skills.every(
          (skill) =>
            typeof skill === "string" &&
            skill.trim().length >= 2 &&
            skill.trim().length <= 80,
        ))) ||
    (rate_guidance_kobo !== undefined &&
      (typeof rate_guidance_kobo !== "number" ||
        !Number.isSafeInteger(rate_guidance_kobo) ||
        rate_guidance_kobo < 0 ||
        rate_guidance_kobo > 1_000_000_000)) ||
    (availability_notes !== undefined &&
      (typeof availability_notes !== "string" || availability_notes.length > 500)) ||
    (is_listed !== undefined && typeof is_listed !== "boolean")
  ) {
    return jsonError(
      400,
      "INVALID_INPUT",
      "Check the contact, trade, coverage, and profile details.",
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

    const [profile] = await getDb()
      .insert(artisanProfiles)
      .values({
        user_id: session.user.id,
        contact_phone: contact_phone.trim(),
        primary_trade: primary_trade.trim(),
        experience_years,
        coverage_areas: coverage_areas.map((area) => area.trim()),
        workshop_area: workshop_area.trim(),
        bio: bio.trim(),
        skills: (Array.isArray(skills) ? skills : [primary_trade]).map((skill) => skill.trim()),
        rate_guidance_kobo: typeof rate_guidance_kobo === "number" ? rate_guidance_kobo : null,
        availability_notes: typeof availability_notes === "string" ? availability_notes.trim() : null,
        is_listed: typeof is_listed === "boolean" ? is_listed : true,
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
          skills: (Array.isArray(skills) ? skills : [primary_trade]).map((skill) => skill.trim()),
          rate_guidance_kobo: typeof rate_guidance_kobo === "number" ? rate_guidance_kobo : null,
          availability_notes: typeof availability_notes === "string" ? availability_notes.trim() : null,
          is_listed: typeof is_listed === "boolean" ? is_listed : true,
          updated_at: new Date(),
        },
      })
      .returning({
        user_id: artisanProfiles.user_id,
        primary_trade: artisanProfiles.primary_trade,
        coverage_areas: artisanProfiles.coverage_areas,
        skills: artisanProfiles.skills,
        verification_status: artisanProfiles.verification_status,
      });

    return Response.json(
      { data: profile },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[work-profile] Save failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not save this work profile.");
  }
}
