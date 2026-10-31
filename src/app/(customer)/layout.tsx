import { WorkspaceShell } from "@/components/workspace-shell";

export default function CustomerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell role="customer">{children}</WorkspaceShell>;
}
