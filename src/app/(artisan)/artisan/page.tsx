import { ArtisanDashboardScreen } from "@/features/artisan-ops/screens";
import { artisanOperationsDemoService } from "@/features/artisan-ops/service";

export default async function ArtisanOverviewPage() {
  const data = await artisanOperationsDemoService.getDashboard();
  return <ArtisanDashboardScreen initialData={data} />;
}

