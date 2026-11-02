import { notFound } from "next/navigation";
import { profilesDemoService } from "@/features/profiles/service";
import { PortfolioViewerScreen } from "@/features/profiles/screens";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ id: string; photoId: string }>;
}) {
  const { id, photoId } = await params;
  const artisan = await profilesDemoService.getProfile(id);

  if (!artisan) {
    notFound();
  }

  return <PortfolioViewerScreen artisan={artisan} initialPhotoId={photoId} />;
}

