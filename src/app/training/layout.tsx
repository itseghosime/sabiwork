import { ArtisanShell } from "@/components/workspace-shell";
import "./training.css";

// PRESENTATION ONLY: a real server layout must verify a session and role
// before attaching a workspace shell. This demo renders the artisan shell
// without any authentication claim.
export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ArtisanShell>{children}</ArtisanShell>;
}
