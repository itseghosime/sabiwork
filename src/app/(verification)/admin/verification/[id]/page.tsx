import { AdminDossierReviewScreen } from "@/features/verification/screens";

export default async function AdminDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminDossierReviewScreen id={id} />;
}
