import { CustomerShell } from "@/components/workspace-shell";
import { DisputeFormScreen } from "@/features/reviews/screens";

export default async function DisputeFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerShell><DisputeFormScreen jobId={id} /></CustomerShell>;
}

