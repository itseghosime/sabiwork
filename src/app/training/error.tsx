"use client";
import Link from "next/link";
import { Icon } from "@/components/icon";

export default function TrainingError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="training-empty" role="alert">
      <span className="demo-out-icon">
        <Icon name="wrench" size={30} />
      </span>
      <h1>The demo catalogue could not load.</h1>
      <p>
        The training adapter failed locally. No progress was lost — try again
        or return to the guides.
      </p>
      <div className="recovery-actions">
        <button className="button button-primary" onClick={retry}>
          Try again <Icon name="arrow" size={17} />
        </button>
        <Link className="button button-outline" href="/training">
          Back to training
        </Link>
      </div>
    </section>
  );
}
