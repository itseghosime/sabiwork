import { AdminShell } from "@/components/admin-shell";
import { requirePageRole } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("admin");
  return <AdminShell>{children}</AdminShell>;
}
