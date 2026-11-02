import { authorizeMarketplaceUser } from "@/lib/server/authorization";
import { MilestoneError, startMilestone } from "@/lib/server/milestones";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const session = await authorizeMarketplaceUser();
  if (session.kind !== "authorized")
    return Response.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in with a customer account to pay a booking.",
        },
      },
      {
        status:
          session.kind === "unavailable"
            ? 503
            : session.kind === "unauthenticated"
              ? 401
              : 403,
      },
    );
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "A valid booking is required.",
        },
      },
      { status: 400 },
    );
  }
  if (
    !body ||
    typeof body.jobId !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(body.jobId) ||
    !["deposit", "balance"].includes(body.milestone)
  ) {
    return Response.json(
      {
        error: {
          code: "BOOKING_REQUIRED",
          message:
            "Post a service request and accept a quote before paying a booking milestone.",
        },
      },
      { status: 400 },
    );
  }
  try {
    const data = await startMilestone({
      jobId: body.jobId,
      milestone: body.milestone,
      userId: session.user.id,
      email: session.user.email,
      origin: new URL(request.url).origin,
    });
    return Response.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return Response.json(
      {
        error: {
          code: e instanceof MilestoneError ? e.code : "GATEWAY_ERROR",
          message: e instanceof Error ? e.message : "Could not start checkout.",
        },
      },
      { status: e instanceof MilestoneError ? e.status : 502 },
    );
  }
}
