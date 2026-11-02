import { RequestDetailScreen } from "@/features/hire-workspace/screens";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetailScreen requestId={id} />;
}
