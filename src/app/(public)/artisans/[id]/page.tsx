import { notFound } from "next/navigation";
import { getPublicArtisanProfile } from "@/lib/server/artisans";
import { PublicArtisanDetail } from "./public-artisan-detail";

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

  return <PublicArtisanDetail artisan={artisan} />;
}
