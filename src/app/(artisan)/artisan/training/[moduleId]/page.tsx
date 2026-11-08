import { notFound, redirect } from "next/navigation";
import { ArtisanTrainingModuleScreen } from "@/features/artisan-workspace/training-module-screen";
import { getArtisanTrainingModule } from "@/lib/server/training";
import { getUserRole, requireMarketplacePage } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function ArtisanTrainingModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const [user, { moduleId }] = await Promise.all([requireMarketplacePage(), params]);
  const profile = await getUserRole(user.id);
  if (!profile) redirect("/complete-profile");
  if (profile.role !== "artisan") redirect("/forbidden");
  const module = await getArtisanTrainingModule(user.id, moduleId);
  if (!module) notFound();
  return <ArtisanTrainingModuleScreen module={module} />;
}
