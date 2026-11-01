import { ArtisanMatchingScreen } from "@/features/requests/screens";
import { requestsDemoService } from "@/features/requests/service";

export default async function RequestQuotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotes = await requestsDemoService.getMatchingQuotes(id);
  return <ArtisanMatchingScreen jobId={id} initialQuotes={quotes} />;
}

