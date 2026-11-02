import { notFound } from "next/navigation";
import { QuoteComparisonScreen } from "@/features/quotes/screens";
import { quotesDemoService } from "@/features/quotes/service";

export default async function CompareQuotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await quotesDemoService.getRequestById(id);
  const quotes = await quotesDemoService.getQuotesForRequest(id);

  if (!request) {
    notFound();
  }

  return <QuoteComparisonScreen request={request} quotes={quotes} />;
}

