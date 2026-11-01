import { ExploreServicesScreen } from "@/features/customer-workspace/screens";

export const dynamic = "force-dynamic";

export default async function ExploreServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = query.trade;
  const trade = Array.isArray(raw) ? raw[0] : raw;
  return <ExploreServicesScreen initialTrade={trade ?? ""} />;
}
