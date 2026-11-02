import { notFound } from "next/navigation";
import { CertificateView } from "@/features/training/certificate";
import { guides } from "@/features/training/data";
import { certificateFor, getGuide, nextGuide } from "@/features/training/service";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = getGuide(id);
  if (!guide) notFound();
  const next = nextGuide(guide, guides);
  return (
    <CertificateView
      certificate={certificateFor(guide)}
      nextGuideTitle={next?.title ?? null}
      nextGuideId={next?.id ?? null}
    />
  );
}
