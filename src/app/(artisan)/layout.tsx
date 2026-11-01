import { WorkspaceShell } from "@/components/workspace-shell";
import { requirePageRole } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function ArtisanWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole("artisan");
  return <WorkspaceShell role="artisan">{children}</WorkspaceShell>;
}
