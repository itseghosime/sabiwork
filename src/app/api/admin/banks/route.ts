import { authorizeRole } from "@/lib/server/authorization";
import { listPaystackBanks, PaystackError } from "@/lib/server/paystack";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET() {
  const access = await authorizeRole("admin");
  if (access.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in as an administrator.");
  if (access.kind === "forbidden" || access.kind === "profile-required") return jsonError(403, "FORBIDDEN", "Admin access is required.");
  if (access.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");

  try {
    const banks = await listPaystackBanks();
    return Response.json(
      { data: { banks } },
      { headers: { "Cache-Control": "private, max-age=3600" } },
    );
  } catch (error) {
    console.error("[admin] Bank list failed", error);
    return jsonError(
      502,
      "PROVIDER_ERROR",
      error instanceof PaystackError ? error.message : "Could not load the bank list.",
    );
  }
}
