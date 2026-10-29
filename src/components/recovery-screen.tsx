import Link from "next/link";
import Form from "next/form";
import { Icon } from "./icon";
export function RecoveryScreen({ forbidden = false }: { forbidden?: boolean }) {
  return (
    <section className="container recovery-page">
      <div className="recovery-art" aria-hidden="true">
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
        <span className="recovery-glyph">
          <Icon name={forbidden ? "lock" : "search"} size={56} />
        </span>
        <span className="recovery-code">{forbidden ? "403" : "404"}</span>
        <span className="orbit-dot dot-one" />
        <span className="orbit-dot dot-two" />
      </div>
      <p className="eyebrow">
        {forbidden
          ? "HTTP 403 · ACCESS RESTRICTED"
          : "HTTP 404 · PAGE NOT FOUND"}
      </p>
      <h1>
        {forbidden
          ? "You don’t have access to this page."
          : "We can’t find that page."}
      </h1>
      <p className="recovery-copy">
        {forbidden
          ? "You may need a different account or permission to open this page. You can still explore local services from here."
          : "We couldn’t find the page you were looking for. The link may have changed, but the right helping hand is still close by."}
      </p>
      <div className="recovery-actions">
        <Link href="/" className="button button-primary">
          <Icon name="home" size={18} /> Back to home
        </Link>
        <Link href="/artisans" className="button button-outline">
          Find an artisan <Icon name="arrow" size={18} />
        </Link>
      </div>
      {forbidden && (
        <p className="recovery-footnote">
          Already have the right account?{" "}
          <Link href="/login" className="text-link">
            Log in
          </Link>
        </p>
      )}
      {!forbidden && (
        <Form action="/artisans" className="recovery-search">
          <label>
            <Icon name="search" size={18} />
            <span className="sr-only">Search local artisans</span>
            <input
              name="q"
              maxLength={100}
              placeholder="Try a trade, name or task"
            />
          </label>
          <button className="button button-primary" type="submit">
            Search <Icon name="arrow" size={16} />
          </button>
        </Form>
      )}
      <div className="recovery-privacy">
        <Icon name="shield" size={18} />
        <p>
          {forbidden
            ? "Permissions protect private jobs, payment records and verification documents. This screen does not reveal whether a private record exists."
            : "Your saved work is not changed by this missing page. Check the address or use one of the safe links above."}
        </p>
      </div>
      <div className="recovery-help-grid">
        {forbidden ? (
          <>
            <article>
              <span className="category-icon">
                <Icon name="home" />
              </span>
              <h2>Looking for skilled help?</h2>
              <p>
                Explore the public directory and find the right trade for your
                task.
              </p>
              <Link className="text-link" href="/categories">
                Explore trades <Icon name="arrow" size={16} />
              </Link>
            </article>
            <article>
              <span className="category-icon">
                <Icon name="lock" />
              </span>
              <h2>Using another account?</h2>
              <p>
                Sign in with the account that has access. Your role is managed
                by the platform.
              </p>
              <Link className="text-link" href="/login">
                Go to login <Icon name="arrow" size={16} />
              </Link>
            </article>
            <article>
              <span className="category-icon">
                <Icon name="help" />
              </span>
              <h2>Not sure where to go?</h2>
              <p>
                Start from the homepage and follow the navigation to a public
                service.
              </p>
              <Link className="text-link" href="/">
                Return home <Icon name="arrow" size={16} />
              </Link>
            </article>
          </>
        ) : (
          <>
            <article>
              <span className="category-icon">
                <Icon name="wrench" />
              </span>
              <h2>Plumbing in GRA</h2>
              <p>
                Find help with water systems, leaky taps and bathroom fittings.
              </p>
              <Link
                className="text-link"
                href="/artisans?category=plumbing&area=GRA"
              >
                Find plumbing help <Icon name="arrow" size={16} />
              </Link>
            </article>
            <article>
              <span className="category-icon">
                <Icon name="zap" />
              </span>
              <h2>Electrical repairs</h2>
              <p>
                Browse local electricians for lighting, wiring and
                installations.
              </p>
              <Link className="text-link" href="/artisans?category=electrical">
                Find electricians <Icon name="arrow" size={16} />
              </Link>
            </article>
            <article>
              <span className="category-icon">
                <Icon name="hammer" />
              </span>
              <h2>Furniture & woodwork</h2>
              <p>
                Explore carpenters for repairs and pieces made for your space.
              </p>
              <Link className="text-link" href="/artisans?category=carpentry">
                Find carpenters <Icon name="arrow" size={16} />
              </Link>
            </article>
          </>
        )}
      </div>
      <p className="recovery-reference">
        {forbidden ? "Access restricted · 403" : "Page not found · 404"}
      </p>
    </section>
  );
}
