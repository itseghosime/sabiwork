import { getTrainingModule } from "@/features/training/service";
import { trainingSectionId } from "@/features/training/progress";
import { authorizeMarketplaceUser } from "@/lib/server/authorization";
import { updateArtisanTrainingProgress } from "@/lib/server/training";

export const dynamic = "force-dynamic";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const session = await authorizeMarketplaceUser();
  if (session.kind === "unavailable") return jsonError(503, "AUTH_UNAVAILABLE", "Authentication is unavailable.");
  if (session.kind === "unauthenticated") return jsonError(401, "UNAUTHORIZED", "Sign in to save training progress.");
  if (session.kind === "profile-required") return jsonError(403, "PROFILE_REQUIRED", "Complete your account profile first.");
  if (session.kind === "forbidden" || session.role !== "artisan") return jsonError(403, "FORBIDDEN", "Only artisans can save training progress.");

  const { moduleId } = await params;
  const trainingModule = getTrainingModule(moduleId);
  if (!trainingModule) return jsonError(404, "MODULE_NOT_FOUND", "Training guide not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Send a valid JSON request.");
  }
  if (!isRecord(body) || typeof body.sectionTitle !== "string" || typeof body.completed !== "boolean") {
    return jsonError(400, "INVALID_INPUT", "Provide a lesson title and completed state.");
  }
  const section = trainingModule.sections.find((item) => item.sectionTitle === body.sectionTitle);
  if (!section) return jsonError(400, "INVALID_SECTION", "That lesson does not belong to this guide.");

  try {
    const progress = await updateArtisanTrainingProgress(
      session.user.id,
      moduleId,
      trainingSectionId(section.sectionTitle),
      body.completed,
    );
    if (!progress) return jsonError(404, "MODULE_NOT_FOUND", "Training guide not found.");
    return Response.json({ data: progress }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[artisan-training] Save failed", error);
    return jsonError(500, "SAVE_FAILED", "Could not save training progress.");
  }
}
