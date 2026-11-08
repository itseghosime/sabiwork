import { notFound } from "next/navigation";
import { bookingDepositKobo } from "@/features/payments/deposit";
import { getPublicArtisanProfile } from "@/lib/server/artisans";
import { paystackConfigured, paystackTestMode } from "@/lib/server/paystack";
import { PublicArtisanDetail } from "./public-artisan-detail";

const outcomes = ["missing", "pending", "failed", "error", "not_found"] as const;
type PaymentOutcome = (typeof outcomes)[number];

const referencePattern = /^SW-DEP-[a-z0-9-]+$/i;

export default async function ArtisanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const includeSeedProfile = process.env.NODE_ENV !== "production";
  const artisan = await getPublicArtisanProfile(id, includeSeedProfile);

  if (!artisan) {
    notFound();
  }
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
      depositKobo={bookingDepositKobo(artisan.startingPriceKobo)}
      paymentsEnabled={
        !isPresentationData && paystackConfigured() && paystackTestMode()
      }
      paidReference={paidReference}
      paymentOutcome={paymentOutcome}
    />
  );
}
