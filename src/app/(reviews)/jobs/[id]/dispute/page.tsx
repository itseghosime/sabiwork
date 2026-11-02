import { CustomerShell } from "@/components/workspace-shell";
import { DisputeUnavailableScreen } from "@/features/hire-workspace/screens";

export default async function DisputeFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <CustomerShell>
      <DisputeUnavailableScreen jobId={id} />
    </CustomerShell>
  );
}
