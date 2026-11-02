import { AccountDemoProvider } from "@/features/accounts/demo-context";
import "./accounts.css";
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountDemoProvider>
      <main className="account-main" id="main-content" tabIndex={-1}>{children}</main>
    </AccountDemoProvider>
  );
}
