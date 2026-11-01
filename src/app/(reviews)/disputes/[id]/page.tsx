import { CustomerShell } from "@/components/workspace-shell";
import { DisputeStatusScreen } from "@/features/hire-workspace/screens";

export default async function DisputeStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <CustomerShell>
      <DisputeStatusScreen disputeId={id} />
    </CustomerShell>
  );
}
