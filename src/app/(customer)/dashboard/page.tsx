import { CustomerDashboardScreen } from "@/features/customer-workspace/screens";
import { requireMarketplacePage } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await requireMarketplacePage();
  return <CustomerDashboardScreen displayName={user.name ?? user.email ?? ""} />;
}
