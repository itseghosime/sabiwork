import { JobSignoffScreen } from "@/features/hire-workspace/screens";

export default async function JobSignoffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobSignoffScreen jobId={id} />;
}
