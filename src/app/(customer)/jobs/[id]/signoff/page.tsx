import { notFound } from "next/navigation";
import { CustomerSignoffScreen } from "@/features/lifecycle/screens";
import { lifecycleDemoService } from "@/features/lifecycle/service";

export default async function CustomerSignoffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await lifecycleDemoService.getJobById(id);

  if (!job) {
    notFound();
  }

  return <CustomerSignoffScreen job={job} />;
}
