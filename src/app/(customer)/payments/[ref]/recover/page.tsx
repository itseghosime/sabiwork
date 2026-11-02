import { MilestoneReceipt } from "@/features/payments/milestone-checkout";
export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <MilestoneReceipt reference={ref} verify={false} />;
}
