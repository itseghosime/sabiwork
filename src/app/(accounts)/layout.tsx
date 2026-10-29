import { PublicShell } from "@/components/public-shell";
import { AccountDemoProvider } from "@/features/accounts/demo-context";
import "./accounts.css";
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountDemoProvider>
      <PublicShell>{children}</PublicShell>
    </AccountDemoProvider>
  );
}
