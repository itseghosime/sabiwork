import { CustomerShell } from "@/components/workspace-shell";
import { ReviewScreen } from "@/features/reviews/screens";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerShell><ReviewScreen jobId={id} /></CustomerShell>;
}

