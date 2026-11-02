import { ArtisanSubmitQuoteScreen } from "@/features/artisan-workspace/screens";

export default async function SendQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArtisanSubmitQuoteScreen requestId={id} />;
}
