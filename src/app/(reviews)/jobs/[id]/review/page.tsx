import { CustomerShell } from "@/components/workspace-shell";
import { JobReviewScreen } from "@/features/hire-workspace/screens";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CustomerShell>
      <JobReviewScreen jobId={id} />
    </CustomerShell>
  );
}
