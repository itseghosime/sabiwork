import { PaymentUnavailableScreen } from "@/features/hire-workspace/screens";

export default async function DepositCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentUnavailableScreen reference={id} title="Deposit checkout" />;
}
