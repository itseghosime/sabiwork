import { LiveCustomerRequests } from "@/features/requests/live-requests-panel";
import { requirePageRole } from "@/lib/server/authorization";
import { getServerEnv } from "@/lib/server/env";
import { customerRequestsQuery } from "@/lib/server/requests";
import { createRealtimeServer } from "@/lib/server/realtime";
import { MyJobsListScreen } from "@/features/lifecycle/screens";
import { defaultActiveJobs } from "@/features/lifecycle/service";

export const dynamic = "force-dynamic";

export default async function MyJobsPage() {
  const user = await requirePageRole("customer");
  const query = customerRequestsQuery(user.id);
  const sealedQuery = await createRealtimeServer().seal({ query });
  const { realtimeUrl } = getServerEnv();

  return (
    <>
      <LiveCustomerRequests
        realtimeUrl={realtimeUrl}
        sealedQuery={sealedQuery}
      />
      <MyJobsListScreen initialJobs={defaultActiveJobs} />
    </>
  );
}
