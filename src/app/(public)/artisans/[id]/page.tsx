import { notFound } from "next/navigation";
import { profilesDemoService } from "@/features/profiles/service";
import { ArtisanProfileScreen } from "@/features/profiles/screens";

export default async function ArtisanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artisan = await profilesDemoService.getProfile(id);

  if (!artisan) {
    notFound();
  }

  return <ArtisanProfileScreen initialArtisan={artisan} />;
}
