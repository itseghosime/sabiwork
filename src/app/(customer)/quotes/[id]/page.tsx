import { QuoteDetailScreen } from "@/features/hire-workspace/screens";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuoteDetailScreen quoteId={id} />;
}
