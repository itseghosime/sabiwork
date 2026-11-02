import { AdminDossierReviewScreen } from "@/features/admin-workspace/verification-screen";

export default async function AdminDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminDossierReviewScreen id={id} />;
}
