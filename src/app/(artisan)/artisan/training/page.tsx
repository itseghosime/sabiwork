import { redirect } from "next/navigation";
import { ArtisanTrainingScreen } from "@/features/artisan-workspace/training-screen";
import { getArtisanTrainingOverview } from "@/lib/server/training";
import { getUserRole, requireMarketplacePage } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function ArtisanTrainingPage() {
  const user = await requireMarketplacePage();
  const profile = await getUserRole(user.id);
  if (!profile) redirect("/complete-profile");
  if (profile.role !== "artisan") redirect("/forbidden");
  const { modules, stats } = await getArtisanTrainingOverview(user.id);
  return <ArtisanTrainingScreen modules={modules} stats={stats} />;
}
