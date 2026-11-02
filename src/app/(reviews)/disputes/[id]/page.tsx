import { CustomerShell } from "@/components/workspace-shell";
import { BookingDispute } from "@/features/payments/dispute-flow";

export default async function DisputeStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <CustomerShell>
      <BookingDispute jobId={id} statusOnly />
    </CustomerShell>
  );
}
