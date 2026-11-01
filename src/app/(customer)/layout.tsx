import { WorkspaceShell } from "@/components/workspace-shell";
import { requireMarketplacePage } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function CustomerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireMarketplacePage();
  return <WorkspaceShell role="customer">{children}</WorkspaceShell>;
}
