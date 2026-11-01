import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CertificateView } from "@/features/training/certificate";
import {
  certificateFor,
  getGuide,
  nextGuide,
} from "@/features/training/service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const guide = getGuide(id);
  return {
    title: guide
      ? `Certificate · ${guide.title} · SabiWork`
      : "Certificate not found · SabiWork",
  };
}

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;
  const guide = getGuide(id);
  if (!guide) notFound();
  const certificate = certificateFor(guide);
  const next = nextGuide(guide);
  return (
    <CertificateView
      certificate={certificate}
      nextGuideId={next?.id ?? null}
      nextGuideTitle={next?.title ?? null}
    />
  );
}
