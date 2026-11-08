import { ExploreServicesScreen } from "@/features/customer-workspace/screens";
import { parseFilters } from "@/features/search/service";
import { searchPublicArtisans } from "@/lib/server/artisans";

export const dynamic = "force-dynamic";

export default async function ExploreServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = query.trade;
  const trade = Array.isArray(raw) ? raw[0] : raw;
  const includeSeedProfiles = process.env.NODE_ENV !== "production";
  const { items } = await searchPublicArtisans(
    parseFilters({}),
    100,
    includeSeedProfiles,
  );
  return (
    <ExploreServicesScreen
      initialTrade={trade ?? ""}
      initialArtisans={items}
      isPresentationData={items.some(
        (artisan) => artisan.id.startsWith("seed-artisan-") || artisan.id.startsWith("demo-artisan-"),
      )}
    />
  );
}
