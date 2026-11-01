import { PaymentUnavailableScreen } from "@/features/hire-workspace/screens";

export default async function BalanceCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentUnavailableScreen reference={id} title="Milestone balance payment" />;
}
