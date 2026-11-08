"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { SignOutButton } from "@/features/accounts/sign-out-button";
import { Icon } from "./icon";

export type PublicAccount = {
  name: string;
  workspaceHref: string;
  workspaceLabel: string;
};

export function Brand({ href = "/" }: { href?: string } = {}) {
  return (
    <Link href={href} className="brand" aria-label="SabiWork home">
      <span className="brand-mark">
        <Image
          src="/images/sabiwork-icon.png"
          alt=""
          width={64}
          height={64}
          priority
        />
      </span>
      <span>
        Sabi<span className="brand-accent">Work</span>
        <small>Skilled hands. Trusted work.</small>
      </span>
    </Link>
  );
}

export function PublicShell({
  children,
  account = null,
  sessionUnavailable = false,
}: {
  children: React.ReactNode;
  account?: PublicAccount | null;
  sessionUnavailable?: boolean;
}) {
  const pathname = usePathname();
  return (
    <PublicShellContent
      key={pathname}
      pathname={pathname}
      account={account}
      sessionUnavailable={sessionUnavailable}
    >
      {children}
    </PublicShellContent>
  );
}

function PublicShellContent({
  children,
  pathname,
  account,
  sessionUnavailable,
}: {
  children: React.ReactNode;
  pathname: string;
  account: PublicAccount | null;
  sessionUnavailable: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const links = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Explore services" },
    { href: "/artisans", label: "Find an artisan" },
    { href: "/#how-it-works", label: "How it works" },
  ];
  const accountActions = account ? (
    <>
      <span className="public-account-greeting">
        <Icon name="user" size={17} />
        <span>
          <strong>{account.name}</strong>
          <small>Signed in</small>
        </span>
      </span>
      <Link href={account.workspaceHref} className="button button-primary">
        {account.workspaceLabel} <Icon name="arrow" size={17} />
      </Link>
      <span className="public-shell-signout">
        <SignOutButton />
      </span>
    </>
  ) : sessionUnavailable ? (
    <span className="public-session-unavailable" role="status">
      <Icon name="help" size={17} />
      Account temporarily unavailable
    </span>
  ) : (
    <>
      <Link href="/login" className="text-link">
        Log in
      </Link>
      <Link href="/signup/customer" className="button button-primary">
        Sign up <Icon name="arrow" size={17} />
      </Link>
    </>
  );

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header
        className="site-header public-shell-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}
      >
        <div className="container header-inner public-header-inner">
          <Brand />
          <nav aria-label="Main navigation" className="desktop-nav">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="desktop-auth">{accountActions}</div>
          <button
            ref={menuButton}
            className="icon-button mobile-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="mobile-navigation container"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
                menuButton.current?.focus();
              }
            }}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
                <Icon name="next" size={17} />
              </Link>
            ))}
            {account ? (
              <>
                <div className="public-mobile-account" aria-label="Signed-in account">
                  <Icon name="user" size={18} />
                  <span>
                    <strong>{account.name}</strong>
                    <small>Signed in</small>
                  </span>
                </div>
                <Link
                  className="button button-primary mobile-path"
                  href={account.workspaceHref}
                  onClick={() => setOpen(false)}
                >
                  {account.workspaceLabel} <Icon name="arrow" size={17} />
                </Link>
                <span className="public-shell-signout">
                  <SignOutButton />
                </span>
              </>
            ) : sessionUnavailable ? (
              <p className="public-session-unavailable" role="status">
                Account temporarily unavailable. Please try again shortly.
              </p>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                  <Icon name="next" size={17} />
                </Link>
                <Link
                  className="button button-primary mobile-path"
                  href="/signup/customer"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                  <Icon name="arrow" size={17} />
                </Link>
              </>
            )}
          </nav>
        )}
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer public-shell-footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <Brand />
            <p>
              Good work starts with the right person.
              <br />
              Discover skilled hands around Benin City.
            </p>
          </div>
          <nav aria-label="Explore" className="footer-column">
            <p className="footer-heading">Explore</p>
            <Link href="/categories">Explore services</Link>
            <Link href="/artisans">Find an artisan</Link>
            <Link href="/#how-it-works">How it works</Link>
          </nav>
          <nav aria-label="Account" className="footer-column">
            <p className="footer-heading">Account</p>
            {account ? (
              <>
                <Link href={account.workspaceHref}>{account.workspaceLabel}</Link>
                <Link href="/settings">Account settings</Link>
              </>
            ) : sessionUnavailable ? (
              <span>Account temporarily unavailable</span>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/signup/customer">Hire an artisan</Link>
                <Link href="/signup/artisan">Join as an artisan</Link>
              </>
            )}
          </nav>
          <div className="footer-location">
            <p className="footer-heading">Where we work</p>
            <span className="footer-place">
              <Icon name="pin" size={16} /> Benin City, Nigeria
            </span>
            <span className="demo-tag">Neighbourhood services marketplace</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} SabiWork. Built for skilled work in Benin City.
          </span>
          <span>
            Payments via Paystack are coming soon. Service requests and work updates run on your account data.
          </span>
        </div>
      </footer>
    </>
  );
}
