import { notFound } from "next/navigation";
import { MilestoneDepositCheckoutScreen } from "@/features/quotes/screens";
import { quotesDemoService } from "@/features/quotes/service";

export default async function DepositCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotes = await quotesDemoService.getQuotesForRequest(id);
  const quote = quotes[0];

  if (!quote) notFound();
  return <MilestoneDepositCheckoutScreen quote={quote} />;
}
