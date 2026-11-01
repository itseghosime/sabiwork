"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./public-shell";
import { Icon, type IconName } from "./icon";
import type { AccountRole } from "@/features/accounts/access";

const navigation: Record<
  AccountRole,
  readonly { href: string; label: string; icon: IconName }[]
> = {
  customer: [
    { href: "/jobs", label: "My jobs", icon: "briefcase" },
    { href: "/requests/new", label: "Post a request", icon: "clipboard" },
    { href: "/payments", label: "Payment history", icon: "wallet" },
    { href: "/settings", label: "Account settings", icon: "settings" },
  ],
  artisan: [
    { href: "/artisan", label: "Overview", icon: "dashboard" },
    { href: "/artisan/jobs", label: "My jobs", icon: "briefcase" },
    { href: "/artisan/requests", label: "Open requests", icon: "clipboard" },
    { href: "/artisan/availability", label: "Availability", icon: "calendar" },
    { href: "/artisan/earnings", label: "Test earnings", icon: "wallet" },
    { href: "/artisan/profile", label: "My profile", icon: "user" },
    { href: "/artisan/verification", label: "Verification", icon: "shield" },
    { href: "/training", label: "Training", icon: "graduation" },
  ],
  admin: [
    { href: "/admin/verification", label: "Verification queue", icon: "shield" },
    { href: "/admin/disputes", label: "Dispute queue", icon: "badge" },
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
  const pathname = usePathname();
  return (
    <div className="workspace-shell">
      <a href="#workspace-content" className="skip-link">
        Skip to workspace
      </a>
      <aside className="workspace-sidebar">
        <div className="workspace-sidebar-brand">
          <Brand />
          <details className="workspace-sidebar-collapse" open>
            <summary aria-label="Toggle workspace sidebar" title="Collapse or expand sidebar">
              <Icon name="chevron" size={18} />
            </summary>
          </details>
        </div>
        <p className="eyebrow workspace-sidebar-label">{role} workspace</p>
        <nav aria-label={`${role} workspace`}>
          {navigation[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              title={item.label}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              <Icon className="workspace-nav-arrow" name="next" size={16} />
            </Link>
          ))}
        </nav>
        <Link className="text-link workspace-public-link" href="/" title="Public directory">
          <Icon name="home" size={19} />
          <span>Public directory</span>
          <Icon className="workspace-nav-arrow" name="arrow" size={16} />
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
