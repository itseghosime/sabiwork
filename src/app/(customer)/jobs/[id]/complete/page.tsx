import { JobCompleteScreen } from "@/features/hire-workspace/screens";

export default async function JobCompletionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobCompleteScreen jobId={id} />;
}
