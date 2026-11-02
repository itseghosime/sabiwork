import { notFound } from "next/navigation";
import { MilestoneBalanceCheckoutScreen } from "@/features/payments/screens";
import { paymentsDemoService } from "@/features/payments/service";

export default async function BalanceCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await paymentsDemoService.getReceipt(id);

  if (!receipt) notFound();
  return <MilestoneBalanceCheckoutScreen receipt={receipt} />;
}
