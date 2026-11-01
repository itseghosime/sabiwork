import { ArtisanProgressUpdateScreen } from "@/features/artisan-workspace/screens";

export default async function ArtisanProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArtisanProgressUpdateScreen jobId={id} />;
}
