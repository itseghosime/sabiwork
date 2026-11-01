"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "./icon";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="SabiWork home">
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
export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <PublicShellContent key={pathname} pathname={pathname}>
      {children}
    </PublicShellContent>
  );
}
function PublicShellContent({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const links = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Explore services" },
    { href: "/artisans", label: "Find an artisan" },
    { href: "/#how-it-works", label: "How it works" },
  ];
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}
      >
        <div className="container header-inner">
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
          <div className="desktop-auth">
            <Link href="/login" className="text-link">
              Log in
            </Link>
            <Link href="/signup/artisan" className="button button-subtle">
              Join as an artisan <Icon name="arrow" size={17} />
            </Link>
          </div>
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
            <Link href="/login" onClick={() => setOpen(false)}>
              Log in
              <Icon name="next" size={17} />
            </Link>
            <Link
              className="button button-primary"
              href="/signup/artisan"
              onClick={() => setOpen(false)}
            >
              Join as an artisan <Icon name="arrow" size={17} />
            </Link>
            <div style={{ borderTop: "1px solid var(--border, #e2e8f0)", margin: "8px 0" }} />
            <Link href="/jobs" onClick={() => setOpen(false)}>
              Customer Workspace
              <Icon name="next" size={17} />
            </Link>
            <Link href="/artisan" onClick={() => setOpen(false)}>
              Artisan Workspace
              <Icon name="next" size={17} />
            </Link>
            <Link href="/admin/verification" onClick={() => setOpen(false)}>
              Admin Desk
              <Icon name="next" size={17} />
            </Link>
          </nav>
        )}
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="container footer-top">
          <div>
            <Brand />
            <p>
              Good work starts with the right person.
              <br />
              Discover skilled hands around Benin City.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/categories">Explore services</Link>
            <Link href="/artisans">Find an artisan</Link>
            <Link href="/#how-it-works">How it works</Link>
          </nav>
          <div className="footer-location">
            <Icon name="pin" size={18} /> Benin City, Nigeria
            <span className="demo-tag">Group Four · Demo</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} SabiWork. Built by Group Four.
          </span>
          <span>
            Fictional profiles & ratings. Payments are not connected yet.
          </span>
        </div>
      </footer>
    </>
  );
}
