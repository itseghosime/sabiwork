import { JobRequestReviewScreen } from "@/features/requests/screens";
import { requestsDemoService } from "@/features/requests/service";

export default async function RequestReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draft = (await requestsDemoService.getJobDraft(id))!;
  return <JobRequestReviewScreen initialDraft={draft} />;
}

