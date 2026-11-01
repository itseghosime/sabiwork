import { CertificateScreen } from "@/features/training/screens";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CertificateScreen id={id} />;
}

