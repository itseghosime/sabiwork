import { RequestQuotesScreen } from "@/features/hire-workspace/screens";

export default async function CompareQuotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestQuotesScreen requestId={id} compare />;
}
