import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

async function getSessionUser() {
  const { data, error } = await getAuth().getSession();
  if (error) {
    console.error("[account] Session lookup failed", error.code);
    return { kind: "unavailable" as const };
  }
  if (!data?.user) return { kind: "unauthenticated" as const };
  return { kind: "authenticated" as const, user: data.user };
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
        role: userProfiles.role,
        display_name: userProfiles.display_name,
      })
      .from(userProfiles)
      .where(eq(userProfiles.user_id, session.user.id))
      .limit(1);

    return profile
      ? Response.json({ data: profile }, { headers: { "Cache-Control": "no-store" } })
      : jsonError(404, "PROFILE_REQUIRED", "Choose an account type to continue.");
  } catch (error) {
    console.error("[account] Profile lookup failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load the account profile.");
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
  if (
    typeof body !== "object" ||
    body === null ||
    !("role" in body) ||
    (body.role !== "customer" && body.role !== "artisan")
  ) {
    return jsonError(
      400,
      "INVALID_ROLE",
      "Choose either a customer or artisan account.",
    );
  }

  const role = body.role;
  try {
    const db = getDb();
    const existing = await db
      .select({ role: userProfiles.role })
      .from(userProfiles)
      .where(eq(userProfiles.user_id, session.user.id))
      .limit(1);

    if (existing.length) {
      if (existing[0].role !== role) {
        return jsonError(
          409,
          "ROLE_ALREADY_SET",
          "This account already has a different role.",
        );
      }
      return Response.json({ data: existing[0] });
    }

    const [profile] = await db
      .insert(userProfiles)
      .values({
        user_id: session.user.id,
        role,
        display_name: session.user.name,
      })
      .returning({ role: userProfiles.role });

    return Response.json({ data: profile }, { status: 201 });
  } catch (error) {
    console.error("[account] Profile creation failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not create the account profile.");
  }
}
