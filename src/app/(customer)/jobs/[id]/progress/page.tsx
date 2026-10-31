import { notFound } from "next/navigation";
import { JobProgressDetailScreen } from "@/features/lifecycle/screens";
import { lifecycleDemoService } from "@/features/lifecycle/service";

export default async function JobProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await lifecycleDemoService.getJobById(id);

  if (!job) {
    notFound();
  }

  return <JobProgressDetailScreen initialJob={job} />;
}
