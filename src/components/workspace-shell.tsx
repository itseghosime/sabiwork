import Link from "next/link";
import { Brand } from "./public-shell";
import { Icon } from "./icon";
import type { AccountRole } from "@/features/accounts/access";

const navigation: Record<
  AccountRole,
  readonly { href: string; label: string }[]
> = {
  customer: [
    { href: "/jobs", label: "My jobs" },
    { href: "/requests/new", label: "Post a request" },
    { href: "/payments", label: "Payment history" },
    { href: "/settings", label: "Account settings" },
  ],
  artisan: [
    { href: "/artisan", label: "Overview" },
    { href: "/artisan/jobs", label: "My jobs" },
    { href: "/artisan/requests", label: "Open requests" },
    { href: "/artisan/availability", label: "Availability" },
    { href: "/artisan/earnings", label: "Test earnings" },
    { href: "/artisan/profile", label: "My profile" },
    { href: "/artisan/verification", label: "Verification" },
    { href: "/training", label: "Training" },
  ],
  admin: [
    { href: "/admin/verification", label: "Verification queue" },
    { href: "/admin/disputes", label: "Dispute queue" },
  ],
};
/** PRESENTATION ONLY: server layouts must verify a real session and role before
 * rendering. This scaffold never establishes access and is not a route guard. */
export function WorkspaceShell({
  role,
  children,
}: {
  role: AccountRole;
  children: React.ReactNode;
}) {
  return (
    <div className="workspace-shell">
      <a href="#workspace-content" className="skip-link">
        Skip to workspace
      </a>
      <aside className="workspace-sidebar">
        <Brand />
        <p className="eyebrow">{role} workspace</p>
        <nav aria-label={`${role} workspace`}>
          {navigation[role].map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
              <Icon name="next" size={16} />
            </Link>
          ))}
        </nav>
        <Link className="text-link" href="/">
          Public directory <Icon name="arrow" size={16} />
        </Link>
      </aside>
      <div className="workspace-main">
        <header>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="sabi-pulse-dot online" />
            <span style={{ fontWeight: 600 }}>{role[0].toUpperCase() + role.slice(1)} workspace</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="demo-tag">
              UI scaffold · auth integration pending
            </span>
          </div>
        </header>
        <details className="workspace-mobile-nav">
          <summary>Workspace navigation</summary>
          <nav aria-label={`${role} mobile workspace`}>
            {navigation[role].map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
        <main id="workspace-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
export const CustomerShell = ({ children }: { children: React.ReactNode }) => (
  <WorkspaceShell role="customer">{children}</WorkspaceShell>
);
export const ArtisanShell = ({ children }: { children: React.ReactNode }) => (
  <WorkspaceShell role="artisan">{children}</WorkspaceShell>
);
export const AdminShell = ({ children }: { children: React.ReactNode }) => (
  <WorkspaceShell role="admin">{children}</WorkspaceShell>
);
