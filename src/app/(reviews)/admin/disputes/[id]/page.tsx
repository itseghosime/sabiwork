import { AdminShell } from "@/components/workspace-shell";
import { AdminDisputeDetailScreen } from "@/features/reviews/screens";

export default async function AdminDisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminShell><AdminDisputeDetailScreen disputeId={id} /></AdminShell>;
}

