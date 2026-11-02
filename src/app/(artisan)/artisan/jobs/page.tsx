import { ArtisanWorkOrdersScreen } from "@/features/artisan-ops/screens";
import { artisanOperationsDemoService } from "@/features/artisan-ops/service";

export default async function ArtisanJobsPage() {
  const orders = await artisanOperationsDemoService.getWorkOrders();
  return <ArtisanWorkOrdersScreen initialOrders={orders} />;
}

