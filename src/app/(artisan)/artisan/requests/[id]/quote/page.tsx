import { notFound } from "next/navigation";
import { SendItemizedQuoteScreen } from "@/features/quotes/screens";
import { quotesDemoService } from "@/features/quotes/service";

export default async function SendQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await quotesDemoService.getRequestById(id);

  if (!request) {
    notFound();
  }

  return <SendItemizedQuoteScreen request={request} />;
}
