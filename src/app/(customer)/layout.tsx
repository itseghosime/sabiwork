import { CustomerShell } from "@/features/customer-workspace/customer-shell";
import { requireMarketplacePage } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function CustomerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireMarketplacePage();
  return (
    <CustomerShell displayName={user.name ?? user.email ?? ""}>
      {children}
    </CustomerShell>
  );
}
