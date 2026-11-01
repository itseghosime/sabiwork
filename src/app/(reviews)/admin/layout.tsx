import { WorkspaceShell } from "@/components/workspace-shell";
import { requirePageRole } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function AdminReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("admin");
  return <WorkspaceShell role="admin">{children}</WorkspaceShell>;
}
