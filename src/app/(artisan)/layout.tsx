import { ArtisanShell } from "@/components/artisan-shell";
import { requireMarketplacePage } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function ArtisanWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireMarketplacePage();
  return (
    <ArtisanShell displayName={user.name ?? user.email ?? ""}>
      {children}
    </ArtisanShell>
  );
}
