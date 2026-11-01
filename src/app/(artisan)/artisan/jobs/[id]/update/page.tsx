import { notFound } from "next/navigation";
import { ArtisanAddProgressScreen } from "@/features/lifecycle/screens";
import { lifecycleDemoService } from "@/features/lifecycle/service";

export default async function AddProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await lifecycleDemoService.getJobById(id);

  if (!job) {
    notFound();
  }

  return <ArtisanAddProgressScreen job={job} />;
}

