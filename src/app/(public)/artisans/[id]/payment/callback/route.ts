import { NextResponse } from "next/server";
import { settleDeposit } from "@/lib/server/deposits";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const reference =
    url.searchParams.get("reference") ?? url.searchParams.get("trxref");
  const profileUrl = `${url.origin}/artisans/${encodeURIComponent(id)}`;

  if (!reference) {
    return NextResponse.redirect(`${profileUrl}?payment=missing`, 303);
  }

  try {
    const result = await settleDeposit(reference);
    const outcome =
      result.kind === "paid"
        ? `paid=${encodeURIComponent(reference)}`
        : `payment=${result.kind}`;
    return NextResponse.redirect(`${profileUrl}?${outcome}`, 303);
  } catch (error) {
    console.error("[payments] Deposit callback failed", error);
    return NextResponse.redirect(`${profileUrl}?payment=error`, 303);
  }
}
