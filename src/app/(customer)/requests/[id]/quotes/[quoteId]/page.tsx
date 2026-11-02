import { QuoteDetailScreen } from "@/features/hire-workspace/screens";

export default async function RequestQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string; quoteId: string }>;
}) {
  const { id, quoteId } = await params;
  return <QuoteDetailScreen quoteId={quoteId} requestId={id} />;
}
