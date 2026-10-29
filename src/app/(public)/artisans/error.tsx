"use client";
import Link from "next/link";
import { Icon } from "@/components/icon";
export default function ResultsError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="container section empty-state" role="alert">
      <span className="empty-icon">
        <Icon name="wrench" size={30} />
      </span>
      <h1>We couldn’t load the directory.</h1>
      <p>
        Your filters are still in the address bar. Try again, or return home.
      </p>
      <div className="recovery-actions">
        <button className="button button-primary" onClick={retry}>
          Try again <Icon name="arrow" size={17} />
        </button>
        <Link className="button button-outline" href="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
