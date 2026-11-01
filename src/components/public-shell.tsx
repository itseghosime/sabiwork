"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "./icon";

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
          <div className="desktop-auth">
            <Link href="/login" className="text-link">
              Log in
            </Link>
            <Link href="/signup/artisan" className="button button-outline">
              Join as an artisan
            </Link>
            <Link href="/signup/customer" className="button button-primary">
              Hire an artisan <Icon name="arrow" size={17} />
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
            <p className="mobile-nav-label">Choose your path</p>
            <Link
              className="button button-outline mobile-path"
              href="/signup/customer"
              onClick={() => setOpen(false)}
            >
              Hire an artisan
              <Icon name="arrow" size={17} />
            </Link>
            <Link
              className="button button-primary mobile-path"
              href="/signup/artisan"
              onClick={() => setOpen(false)}
            >
              Join as an artisan
              <Icon name="arrow" size={17} />
            </Link>
          </nav>
        )}
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer public-shell-footer">
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
