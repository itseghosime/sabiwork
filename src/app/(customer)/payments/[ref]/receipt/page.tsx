import { PaymentUnavailableScreen } from "@/features/hire-workspace/screens";

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  return <PaymentUnavailableScreen reference={ref} title="Payment receipt" />;
}
