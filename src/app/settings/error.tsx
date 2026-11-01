"use client";
import Link from "next/link";
import { Icon } from "@/components/icon";

export default function SettingsError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section
      className="settings-empty settings-error-panel"
      role="alert"
      aria-busy="true"
    >
      <span className="settings-out-icon">
        <Icon name="wrench" size={30} />
      </span>
      <h2>Your settings could not load.</h2>
      <p>This demo screen failed locally. Your changes were not involved.</p>
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
