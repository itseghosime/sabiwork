import { MilestoneBalanceCheckoutScreen } from "@/features/payments/screens";
import { paymentsDemoService } from "@/features/payments/service";

export default async function BalanceCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await paymentsDemoService.getReceipt(id);
  return <MilestoneBalanceCheckoutScreen receipt={receipt} />;
}
