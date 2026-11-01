import { WorkspaceShell } from "@/components/workspace-shell";
import { requirePageRole } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function CustomerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("customer");
  return <WorkspaceShell role="customer">{children}</WorkspaceShell>;
}
