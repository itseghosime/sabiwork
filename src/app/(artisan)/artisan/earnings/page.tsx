import { ArtisanEarningsLedgerScreen } from "@/features/artisan-ops/screens";
import { artisanOperationsDemoService } from "@/features/artisan-ops/service";

export default async function ArtisanEarningsPage() {
  const ledger = await artisanOperationsDemoService.getEarningsLedger();
  return <ArtisanEarningsLedgerScreen initialLedger={ledger} />;
}

