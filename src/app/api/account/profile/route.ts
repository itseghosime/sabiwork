import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/server/authorization";
import { getDb } from "@/lib/server/db";
import { userProfiles } from "@/lib/server/schema";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
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
      .select({ role: userProfiles.role, display_name: userProfiles.display_name })
      .from(userProfiles)
      .where(eq(userProfiles.user_id, session.user.id))
      .limit(1);

    return profile
      ? Response.json(
          { data: { ...profile, email: session.user.email ?? null } },
          { headers: { "Cache-Control": "no-store" } },
        )
      : jsonError(404, "PROFILE_REQUIRED", "Complete your account profile to continue.");
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

  let displayName = session.user.name;
  // Only the two self-service paths are selectable; admin is assigned server-side only.
  let role: "customer" | "artisan" = "customer";
  try {
    const body = await request.json();
    if (typeof body === "object" && body) {
      if ("display_name" in body && typeof body.display_name === "string") {
        const trimmed = body.display_name.trim();
        if (trimmed.length >= 2 && trimmed.length <= 100) displayName = trimmed;
      }
      if ("role" in body && (body.role === "artisan" || body.role === "customer")) {
        role = body.role;
      }
    }
  } catch {
    // allow empty body for compatibility with existing signup calls
  }

  try {
    const [profile] = await getDb()
      .insert(userProfiles)
      .values({
        user_id: session.user.id,
        role,
        display_name: displayName,
      })
      .onConflictDoUpdate({
        target: userProfiles.user_id,
        set: {
          display_name: displayName,
          updated_at: new Date(),
        },
      })
      .returning({ role: userProfiles.role, display_name: userProfiles.display_name });

    return Response.json({ data: profile }, { status: 201 });
  } catch (error) {
    console.error("[account] Profile upsert failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not update the account profile.");
  }
}
