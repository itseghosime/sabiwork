"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import { Brand } from "@/components/public-shell";
import { SignOutButton } from "@/features/accounts/sign-out-button";
import "./board.css";

type BoardNavItem = {
  href: string;
  label: string;
  icon: IconName;
};

export const boardNav: readonly BoardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/explore", label: "Explore", icon: "compass" },
  { href: "/requests", label: "Requests", icon: "clipboard" },
  { href: "/jobs", label: "Bookings", icon: "briefcase" },
  { href: "/payments", label: "Payments", icon: "wallet" },
];

const accountNav: readonly BoardNavItem[] = [
  { href: "/reviews", label: "Reviews", icon: "star" },
  { href: "/support", label: "Help & support", icon: "lifeBuoy" },
  { href: "/settings", label: "Account settings", icon: "settings" },
];

const sectionLabels: Record<string, string> = {
  dashboard: "Dashboard",
  explore: "Explore services",
  jobs: "My bookings",
  requests: "My requests",
  reviews: "Reviews & ratings",
  payments: "Payments",
  support: "Support",
  settings: "Account settings",
  quotes: "Quotes",
  disputes: "Disputes",
};

const detailLabels: Record<string, string> = {
  jobs: "Booking details",
  requests: "Request details",
  quotes: "Quote details",
  payments: "Payment details",
  disputes: "Dispute case",
};

const stepLabels: Record<string, string> = {
  new: "New request",
  review: "Rate & review",
  dispute: "Report an issue",
  signoff: "Sign-off",
  complete: "Completion",
  progress: "Progress",
  quotes: "Quotes",
  compare: "Compare quotes",
  checkout: "Checkout",
  deposit: "Deposit",
  balance: "Balance",
  verify: "Verification",
  receipt: "Receipt",
  recover: "Recovery",
  failed: "Failed payment",
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function buildCrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[0] ?? "dashboard";
  const crumbs: Array<{ label: string; href?: string }> = [];

  if (section !== "dashboard") {
    crumbs.push({ label: "Dashboard", href: "/dashboard" });
  }

  const sectionLabel = sectionLabels[section] ?? "Customer board";
  if (segments.length <= 1) {
    crumbs.push({ label: sectionLabel });
    return crumbs;
  }

  crumbs.push({ label: sectionLabel, href: `/${section}` });

  const second = segments[1] ?? "";
  if (stepLabels[second]) {
    crumbs.push({ label: stepLabels[second] });
    return crumbs;
  }

  const detail = detailLabels[section] ?? "Details";
  if (segments.length === 2) {
    crumbs.push({ label: detail });
    return crumbs;
  }

  const third = segments[2] ?? "";
  crumbs.push({ label: detail, href: `/${section}/${second}` });
  crumbs.push({ label: stepLabels[third] ?? "Details" });
  return crumbs;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "SW";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function CustomerShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpenAt, setMobileOpenAt] = useState<string | null>(null);
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menus are bound to the path they were opened on, so a navigation closes
  // them without resetting state from an effect.
  const mobileOpen = mobileOpenAt === pathname;
  const menuOpen = menuOpenAt === pathname;

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpenAt(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  const crumbs = buildCrumbs(pathname);
  const initials = initialsOf(displayName);
  const firstName = displayName.trim().split(/\s+/)[0] || "there";

  return (
    <div className="cb-shell">
      <a href="#customer-board-main" className="skip-link">
        Skip to customer board
      </a>

      <header
        className="cb-header"
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          if (menuOpen) {
            setMenuOpenAt(null);
            avatarButtonRef.current?.focus();
          } else if (mobileOpen) {
            setMobileOpenAt(null);
            menuButtonRef.current?.focus();
          }
        }}
      >
        <div className="cb-container cb-header-top">
          <Brand href="/dashboard" />

          <nav className="cb-nav" aria-label="Customer board">
            {boardNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="cb-header-actions">
            <span className="cb-location">
              <Icon name="pin" size={15} />
              Benin City
            </span>
            <Link href="/requests/new" className="cb-cta">
              <Icon name="plus" size={16} />
              Post a request
            </Link>
            <Link
              href="/notifications"
              className="cb-icon-button cb-bell"
              aria-label="Notifications"
              title="Notifications"
            >
              <Icon name="bell" size={19} />
            </Link>

            <div className="cb-account" ref={menuRef}>
              <button
                ref={avatarButtonRef}
                type="button"
                className="cb-account-trigger"
                aria-expanded={menuOpen}
                aria-controls="customer-account-menu"
                onClick={() =>
                  setMenuOpenAt((current) => (current === pathname ? null : pathname))
                }
              >
                <span className="cb-avatar" aria-hidden="true">
                  {initials}
                </span>
                <span className="cb-account-copy">
                  <span className="cb-account-name">{firstName}</span>
                  <span className="cb-account-role">Customer</span>
                </span>
                <Icon name="chevron" size={15} />
              </button>

              {menuOpen ? (
                <div
                  id="customer-account-menu"
                  className="cb-account-menu"
                  role="group"
                  aria-label="Account menu"
                >
                  <p className="cb-account-menu-name">{displayName || "SabiWork customer"}</p>
                  {accountNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpenAt(null)}
                    >
                      <Icon name={item.icon} size={17} /> {item.label}
                    </Link>
                  ))}
                  <Link href="/categories" onClick={() => setMenuOpenAt(null)}>
                    <Icon name="grid" size={17} /> Public directory
                  </Link>
                  <div className="cb-account-menu-signout">
                    <SignOutButton />
                  </div>
                </div>
              ) : null}
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              className="cb-icon-button cb-menu-toggle"
              aria-label={mobileOpen ? "Close board navigation" : "Open board navigation"}
              aria-expanded={mobileOpen}
              aria-controls="customer-board-mobile-nav"
              onClick={() =>
                setMobileOpenAt((current) => (current === pathname ? null : pathname))
              }
            >
              <Icon name={mobileOpen ? "x" : "menu"} size={20} />
            </button>
          </div>
        </div>

        <div className="cb-container cb-breadcrumb-row">
          <nav aria-label="Breadcrumb" className="cb-breadcrumb">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <span key={`${crumb.label}-${index}`}>
                  {index > 0 ? <Icon name="next" size={13} /> : null}
                  {crumb.href && !last ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={last ? "page" : undefined}>{crumb.label}</span>
                  )}
                </span>
              );
            })}
          </nav>
        </div>

        {mobileOpen ? (
          <div className="cb-mobile-drawer" id="customer-board-mobile-nav">
            <nav aria-label="Customer board mobile">
              {[...boardNav, ...accountNav].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpenAt(null)}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  <Icon name={item.icon} size={19} />
                  <span>{item.label}</span>
                  <Icon name="next" size={16} />
                </Link>
              ))}
            </nav>
            <div className="cb-mobile-drawer-foot">
              <SignOutButton />
            </div>
          </div>
        ) : null}
      </header>

      <main id="customer-board-main" className="cb-main" tabIndex={-1}>
        <div className="cb-container">{children}</div>
      </main>

      <footer className="cb-footer">
        <div className="cb-container cb-footer-top">
          <div className="cb-footer-brand">
            <Brand href="/dashboard" />
            <p>
              Direct exchange between customers and local artisans across Benin
              City. Milestone payments run in test mode.
            </p>
          </div>
          <nav aria-label="Customer board footer">
            <Link href="/explore">Explore</Link>
            <Link href="/requests">Requests</Link>
            <Link href="/jobs">Bookings</Link>
            <Link href="/payments">Payments</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/support">Help &amp; support</Link>
            <Link href="/settings">Account settings</Link>
          </nav>
        </div>
        <div className="cb-container cb-footer-bottom">
          <span>© {new Date().getFullYear()} SabiWork. Built for Benin City.</span>
        </div>
      </footer>
    </div>
  );
}
