import { requireSignedInPage } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSignedInPage();
  return children;
}
