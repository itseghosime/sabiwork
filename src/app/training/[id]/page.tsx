import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideReader } from "@/features/training/guide-reader";
import { getGuide } from "@/features/training/service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const guide = getGuide(id);
  return {
    title: guide ? `${guide.title} · SabiWork` : "Guide not found · SabiWork",
  };
}

export default async function GuidePage({ params }: Props) {
  const { id } = await params;
  const guide = getGuide(id);
  if (!guide) notFound();
  return <GuideReader guide={guide} />;
}
