import { authorizeRole } from "@/lib/server/authorization";
import { customerRequestsQuery } from "@/lib/server/requests";
import { createRealtimeServer } from "@/lib/server/realtime";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST() {
  const access = await authorizeRole("customer");
  if (access.kind === "unauthenticated") {
    return jsonError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  if (access.kind === "forbidden" || access.kind === "profile-required") {
    return jsonError(403, "FORBIDDEN", "A signed-in member account is required.");
  }
  if (access.kind === "unavailable") {
    return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  }

  try {
    const query = customerRequestsQuery(access.user.id);
    const sealed = await createRealtimeServer().seal({ query });
    return Response.json(
      { data: sealed },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[requests] Realtime query sealing failed", error);
    return jsonError(
      500,
      "REALTIME_UNAVAILABLE",
      "Could not prepare live request updates.",
    );
  }
}
