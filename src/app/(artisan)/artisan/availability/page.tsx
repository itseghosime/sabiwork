import { ArtisanAvailabilityScreen } from "@/features/artisan-ops/screens";
import { artisanOperationsDemoService } from "@/features/artisan-ops/service";

export default async function ArtisanAvailabilityPage() {
  const schedule = await artisanOperationsDemoService.getSchedule();
  return <ArtisanAvailabilityScreen initialSchedule={schedule} />;
}

