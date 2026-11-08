import { notFound } from "next/navigation";
import { bookingDepositKobo } from "@/features/payments/deposit";
import { getPublicArtisanProfile } from "@/lib/server/artisans";
import { requireMarketplacePage } from "@/lib/server/authorization";
import { paystackConfigured, paystackTestMode } from "@/lib/server/paystack";
import { PublicArtisanDetail } from "@/app/(public)/artisans/[id]/public-artisan-detail";

const outcomes = ["missing", "pending", "failed", "error", "not_found"] as const;
type PaymentOutcome = (typeof outcomes)[number];

const referencePattern = /^SW-DEP-[a-z0-9-]+$/i;

export const dynamic = "force-dynamic";

export default async function CustomerArtisanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, { id }, query] = await Promise.all([
    requireMarketplacePage(),
    params,
    searchParams,
  ]);
  const includeSeedProfile = process.env.NODE_ENV !== "production";
  const artisan = await getPublicArtisanProfile(id, includeSeedProfile);
  if (!artisan) notFound();

  const isPresentationData =
    artisan.id.startsWith("seed-artisan-") || artisan.id.startsWith("demo-artisan-");
  const paidReference =
    typeof query.paid === "string" && referencePattern.test(query.paid)
      ? query.paid
      : null;
  const paymentOutcome =
    !paidReference &&
    typeof query.payment === "string" &&
    (outcomes as readonly string[]).includes(query.payment)
      ? (query.payment as PaymentOutcome)
      : null;

  return (
    <PublicArtisanDetail
      artisan={artisan}
      isPresentationData={isPresentationData}
      workspace
      customerEmail={user.email ?? ""}
      depositKobo={bookingDepositKobo(artisan.startingPriceKobo)}
      paymentsEnabled={
        !isPresentationData && paystackConfigured() && paystackTestMode()
      }
      paidReference={paidReference}
      paymentOutcome={paymentOutcome}
    />
  );
}
