import { requirePageRole } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function AdminVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("admin");
  return children;
}
