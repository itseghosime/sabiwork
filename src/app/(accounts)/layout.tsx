import "./accounts.css";
import "./account-redesign.css";
import "./auth-editorial.css";
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="account-main" id="main-content" tabIndex={-1}>{children}</main>;
}
