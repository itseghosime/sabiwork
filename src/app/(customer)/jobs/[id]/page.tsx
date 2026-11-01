import { JobDetailScreen } from "@/features/hire-workspace/screens";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailScreen jobId={id} />;
}
