import { AdminDisputeDetailScreen } from "@/features/admin-workspace/screens";

export default async function AdminDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminDisputeDetailScreen id={id} />;
}
