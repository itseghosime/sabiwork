import { notFound } from "next/navigation";
import { GuideReader } from "@/features/training/guide-reader";
import { getGuide } from "@/features/training/service";

export default async function GuideReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = getGuide(id);
  if (!guide) notFound();
  return <GuideReader key={id} guide={guide} />;
}
