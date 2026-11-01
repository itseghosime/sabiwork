"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "./public-shell";
import { Icon, type IconName } from "./icon";
import { SignOutButton } from "@/features/accounts/sign-out-button";
import "@/features/admin-workspace/screens.css";

type AdminNavItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
};

const navSections: readonly { label: string; items: readonly AdminNavItem[] }[] = [
  {
    label: "Hub operations",
    items: [
      { href: "/admin", label: "Overview", icon: "dashboard" },
      { href: "/admin/verification", label: "Artisan verification", icon: "shield", badge: "S42" },
      { href: "/admin/disputes", label: "Dispute cases", icon: "gavel", badge: "S34" },
      { href: "/admin/escrow", label: "Escrow & payouts", icon: "banknote" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/trades", label: "Trade rates & tiers", icon: "filters" },
      { href: "/admin/audit", label: "Audit logs & desk", icon: "scroll" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  return (
    <div
      className="admin-shell"
      data-collapsed={isCollapsed ? "true" : "false"}
      data-drawer={isDrawerOpen ? "open" : "closed"}
    >
      <a href="#admin-content" className="skip-link">
        Skip to admin content
      </a>

      <aside className="admin-sidebar" aria-label="Admin workspace">
        <div className="admin-sidebar-head">
          <Brand />
          <button
            type="button"
            className="admin-collapse-btn"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            <Icon name={isCollapsed ? "next" : "back"} size={18} />
          </button>
          <button
            type="button"
            className="admin-drawer-close"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close navigation"
            title="Close navigation"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="admin-sidebar-scroll">
          {navSections.map((section) => (
            <div key={section.label} className="admin-nav-section">
              <p className="admin-nav-label">{section.label}</p>
              <nav aria-label={section.label}>
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={item.label}
                      className="admin-nav-link"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Icon name={item.icon} size={20} />
                      <span className="admin-nav-text">{item.label}</span>
                      {item.badge ? <span className="admin-nav-badge">{item.badge}</span> : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="admin-sidebar-foot">
          <div className="admin-hub-card">
            <span className="admin-hub-icon">
              <Icon name="pin" size={18} />
            </span>
            <div className="admin-hub-text">
              <strong>Edo State territory</strong>
              <span>Gateway #BN-04</span>
            </div>
            <span className="admin-hub-dot" aria-hidden="true" />
          </div>
        </div>
      </aside>

      <button
        type="button"
        className="admin-drawer-scrim"
        aria-label="Close navigation"
        tabIndex={isDrawerOpen ? 0 : -1}
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open navigation"
              title="Open navigation"
              aria-expanded={isDrawerOpen}
            >
              <Icon name="menu" size={20} />
            </button>

            <span className="admin-hub-pill">
              <Icon name="pin" size={16} />
              <span>Benin City hub · Admin desk</span>
            </span>

          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              className="admin-icon-btn"
              aria-label="Notifications (sample only)"
              title="Notifications (sample only)"
            >
              <Icon name="bell" size={20} />
              <span className="admin-notify-dot" aria-hidden="true" />
            </button>

            <div className="admin-officer">
              <div className="admin-officer-text">
                <strong>Edo hub admin</strong>
                <span>Operations · Level 2</span>
              </div>
              <span className="admin-officer-avatar" aria-hidden="true">
                <Icon name="user" size={18} />
              </span>
            </div>

            <SignOutButton />
          </div>
        </header>

        <main id="admin-content" tabIndex={-1} className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
