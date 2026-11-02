import { OpenRequestsFeedScreen } from "@/features/quotes/screens";
import { quotesDemoService } from "@/features/quotes/service";

export default async function OpenRequestsPage() {
  const requests = await quotesDemoService.getOpenRequests();
  return <OpenRequestsFeedScreen initialRequests={requests} />;
}

