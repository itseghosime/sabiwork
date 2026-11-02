import { notFound } from "next/navigation";
import { MilestoneDepositCheckoutScreen } from "@/features/quotes/screens";
import { quotesDemoService } from "@/features/quotes/service";

export default async function MilestoneCheckoutPage({
  params,
}: {
  params: Promise<{ id: string; quoteId: string }>;
}) {
  const { quoteId } = await params;
  const quote = await quotesDemoService.getQuoteDetails(quoteId);

  if (!quote) {
    notFound();
  }

  return <MilestoneDepositCheckoutScreen quote={quote} />;
}

