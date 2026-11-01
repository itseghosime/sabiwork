import { MyJobsListScreen } from "@/features/lifecycle/screens";
import { defaultActiveJobs } from "@/features/lifecycle/service";

export default function MyJobsPage() {
  return <MyJobsListScreen initialJobs={defaultActiveJobs} />;
}

