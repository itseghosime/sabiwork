import { notFound } from "next/navigation";
import { ArtisanProfileScreen } from "@/features/profiles/screens";
import { getPublicArtisanProfile } from "@/lib/server/artisans";

export default async function ArtisanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artisan = await getPublicArtisanProfile(id);

  if (!artisan) {
    notFound();
  }

  return <ArtisanProfileScreen initialArtisan={artisan} />;
}
