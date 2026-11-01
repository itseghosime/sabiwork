import { ArtisanProgressUpdateScreen } from "@/features/artisan-workspace/screens";

export default async function AddProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArtisanProgressUpdateScreen jobId={id} />;
}
