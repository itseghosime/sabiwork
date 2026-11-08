"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { Crumbs, Head } from "./ui";

export function ArtisanTrainingCertificateScreen({
  title,
  artisanName,
  completedAt,
}: {
  title: string;
  artisanName: string;
  completedAt: string | null;
}) {
  const completedDate = completedAt
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(new Date(completedAt))
    : null;
  return (
    <div className="aw-page">
      <Crumbs trail={[
        { label: "SabiWork", href: "/" },
        { label: "Artisan workspace", href: "/artisan" },
        { label: "Training", href: "/artisan/training" },
        { label: title, href: "/artisan/training" },
        { label: "Completion record" },
      ]} />
      <Head title="Guide completion record" subtitle="A record of learning progress saved to your artisan account.">
        <Link className="aw-btn aw-btn-ghost" href="/artisan/training">
          <Icon name="back" size={15} /> Back to training
        </Link>
      </Head>
      {completedAt ? (
        <section className="aw-panel" aria-labelledby="completion-title">
          <p className="aw-course-meta">SABIWORK · ARTISAN LEARNING</p>
          <h2 id="completion-title">{title}</h2>
          <p className="aw-course-summary">Completed by <strong>{artisanName}</strong> on {completedDate}.</p>
          <p className="aw-alert aw-alert-info" role="note">
            This confirms completion of a SabiWork learning guide only. It is not an accredited certificate, trade licence, identity check or verification badge.
          </p>
          <div className="aw-course-foot">
            <button type="button" className="aw-btn aw-btn-primary" onClick={() => window.print()}>
              <Icon name="file" size={15} /> Print this record
            </button>
            <Link className="aw-btn aw-btn-ghost" href="/artisan/training">Continue learning</Link>
          </div>
        </section>
      ) : (
        <section className="aw-panel">
          <h2>Finish the lessons first</h2>
          <p className="aw-course-summary">Your completion record becomes available after you mark every lesson in this guide complete.</p>
          <Link className="aw-btn aw-btn-primary" href="/artisan/training">Return to training</Link>
        </section>
      )}
    </div>
  );
}
