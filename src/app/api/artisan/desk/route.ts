import { authorizeMarketplaceUser } from "@/lib/server/authorization";
import { loadArtisanDesk } from "@/lib/server/artisan-desk";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET() {
  const session = await authorizeMarketplaceUser();
  if (session.kind === "unavailable") {
    return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  }
  if (session.kind === "unauthenticated") {
    return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  if (session.kind === "profile-required") {
    return jsonError(403, "PROFILE_REQUIRED", "Complete your account profile to continue.");
  }
  if (session.kind === "forbidden") {
    return jsonError(403, "FORBIDDEN", "Admins cannot access the artisan board.");
  }

  try {
    const desk = await loadArtisanDesk(session.user.id);
    return Response.json({ data: desk }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[artisan-desk] Load failed", error);
    return jsonError(500, "INTERNAL_ERROR", "Could not load your artisan board.");
  }
}
