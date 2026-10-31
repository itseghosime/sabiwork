import { WorkspaceShell } from "@/components/workspace-shell";

export default function ArtisanWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell role="artisan">{children}</WorkspaceShell>;
}
