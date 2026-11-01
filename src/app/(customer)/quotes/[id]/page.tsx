import { notFound } from "next/navigation";
import { QuoteDetailsAcceptanceScreen } from "@/features/quotes/screens";
import { quotesDemoService } from "@/features/quotes/service";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await quotesDemoService.getQuoteDetails(id);

  if (!quote) notFound();
  return <QuoteDetailsAcceptanceScreen quote={quote} />;
}
