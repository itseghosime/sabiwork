import "./accounts.css";
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="account-main" id="main-content" tabIndex={-1}>{children}</main>;
}
