"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "./public-shell";
import { Icon, type IconName } from "./icon";
import { SignOutButton } from "@/features/accounts/sign-out-button";
import "@/features/artisan-workspace/board.css";

type ArtisanNavItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
};

export const artisanNav: readonly {
  label: string;
  items: readonly ArtisanNavItem[];
}[] = [
  {
    label: "Workspace",
    items: [
      { href: "/artisan", label: "Overview", icon: "dashboard" },
      { href: "/artisan/requests", label: "Requests & quotes", icon: "clipboard" },
      { href: "/artisan/jobs", label: "My jobs", icon: "briefcase" },
      { href: "/artisan/earnings", label: "Earnings", icon: "wallet" },
      { href: "/artisan/availability", label: "Availability", icon: "calendar" },
    ],
  },
  {
    label: "Trust & growth",
    items: [
      { href: "/artisan/profile", label: "My profile", icon: "user" },
      { href: "/artisan/verification", label: "Verification", icon: "shield" },
      { href: "/artisan/training", label: "Training", icon: "graduation" },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/artisan/settings", label: "Artisan settings", icon: "settings" }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/artisan") return pathname === "/artisan";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "SW";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function ArtisanShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
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
      className="aw-shell"
      data-collapsed={isCollapsed ? "true" : "false"}
      data-drawer={isDrawerOpen ? "open" : "closed"}
    >
      <a href="#artisan-board-main" className="skip-link">
        Skip to artisan board
      </a>

      <aside className="aw-sidebar" aria-label="Artisan board">
        <div className="aw-sidebar-head">
          <Brand />
          <button
            type="button"
            className="aw-collapse-btn"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            <Icon name={isCollapsed ? "next" : "back"} size={18} />
          </button>
          <button
            type="button"
            className="aw-drawer-close"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close navigation"
            title="Close navigation"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="aw-sidebar-scroll">
          <div className="aw-sidebar-intro">
            <p className="aw-sidebar-eyebrow">Artisan workspace</p>
            <p className="aw-sidebar-tagline">Skilled hands. Trusted work.</p>
          </div>

          {artisanNav.map((section) => (
            <div key={section.label} className="aw-nav-section">
              <p className="aw-nav-label">{section.label}</p>
              <nav aria-label={`Artisan board · ${section.label}`}>
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={item.label}
                      className="aw-nav-link"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Icon name={item.icon} size={19} />
                      <span className="aw-nav-text">{item.label}</span>
                      {item.badge ? <span className="aw-nav-badge">{item.badge}</span> : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="aw-sidebar-foot">
          <Link href="/artisan/availability" className="aw-foot-card">
            <span className="aw-foot-icon">
              <Icon name="pin" size={18} />
            </span>
            <span className="aw-foot-text">
              <strong>Availability &amp; visibility</strong>
              <span>Choose when clients can reach you</span>
            </span>
            <Icon name="next" size={16} />
          </Link>
        </div>
      </aside>

      <button
        type="button"
        className="aw-drawer-scrim"
        aria-label="Close navigation"
        tabIndex={isDrawerOpen ? 0 : -1}
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="aw-main">
        <header className="aw-topbar">
          <div className="aw-topbar-left">
            <button
              type="button"
              className="aw-menu-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open navigation"
              title="Open navigation"
              aria-expanded={isDrawerOpen}
            >
              <Icon name="menu" size={20} />
            </button>

            <span className="aw-hub-pill">
              <Icon name="pin" size={16} />
              <span>Benin City hub · Artisan desk</span>
            </span>
          </div>

          <div className="aw-topbar-right">
            <span className="aw-test-pill">
              <span className="aw-test-dot" aria-hidden="true" />
              Paystack TEST mode
            </span>

            <button
              type="button"
              className="aw-icon-btn"
              aria-label="Notifications (sample only)"
              title="Notifications (sample only)"
            >
              <Icon name="bell" size={20} />
              <span className="aw-notify-dot" aria-hidden="true" />
            </button>

            <div className="aw-user">
              <span className="aw-user-text">
                <strong>{displayName || "SabiWork artisan"}</strong>
                <span>Artisan workspace</span>
              </span>
              <span className="aw-user-avatar" aria-hidden="true">
                {initialsOf(displayName)}
              </span>
            </div>

            <SignOutButton />
          </div>
        </header>

        <main id="artisan-board-main" tabIndex={-1} className="aw-content">
          {children}
        </main>
      </div>
    </div>
  );
}
