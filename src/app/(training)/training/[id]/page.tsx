import { GuideReaderScreen } from "@/features/training/screens";

export default async function GuideReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuideReaderScreen id={id} />;
}
