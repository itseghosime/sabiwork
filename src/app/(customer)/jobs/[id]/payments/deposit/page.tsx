import { MilestoneCheckout } from "@/features/payments/milestone-checkout";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MilestoneCheckout jobId={id} milestone="deposit" />;
}
