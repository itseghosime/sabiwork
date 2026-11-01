import { CheckoutNoticeScreen } from "@/features/hire-workspace/screens";

export default async function RequestCheckoutPage({
  params,
}: {
  params: Promise<{ id: string; quoteId: string }>;
}) {
  const { id, quoteId } = await params;
  return <CheckoutNoticeScreen requestId={id} quoteId={quoteId} />;
}
