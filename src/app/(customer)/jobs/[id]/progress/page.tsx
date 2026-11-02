import { JobProgressScreen } from "@/features/hire-workspace/screens";

export default async function JobProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobProgressScreen jobId={id} />;
}
