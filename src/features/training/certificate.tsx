"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { learner } from "./data";
import type { Certificate } from "./service";

// Regionally correct WAT rendering from a UTC timestamp.
const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatCompleted(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function CertificateView({
  certificate,
  nextGuideTitle,
  nextGuideId,
}: {
  certificate: Certificate;
  nextGuideTitle: string | null;
  nextGuideId: string | null;
}) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  if (certificate.status === "locked") {
    const { guide, progress } = certificate;
    return (
      <div className="certificate-page">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href="/training">Training directory</Link>
          <Icon name="next" size={14} />
          <Link href={`/training/${guide.id}`}>{guide.title}</Link>
          <Icon name="next" size={14} />
          <span aria-current="page">Certificate</span>
        </nav>
        <section className="cert-locked" role="status">
          <span className="demo-out-icon">
            <Icon name="lock" size={28} />
          </span>
          <h1>Certificate not unlocked yet</h1>
          <p>
            <strong>{guide.title}</strong> still has{" "}
            {progress.totalSteps - progress.completedCount} unread part
            {progress.totalSteps - progress.completedCount === 1 ? "" : "s"}.
            Certificate views stay locked until every part is marked read in the
            demo.
          </p>
          <div className="training-progress cert-locked-progress">
            <span style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="cert-locked-meta">
            {progress.completedCount} of {progress.totalSteps} parts read
          </p>
          <div className="recovery-actions">
            <Link
              className="button button-primary"
              href={`/training/${guide.id}`}
            >
              Finish the guide <Icon name="arrow" size={17} />
            </Link>
            <Link className="button button-outline" href="/training">
              All training
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { guide, completedAtUtc, docket } = certificate;
  const nextCourse =
    nextGuideTitle && nextGuideId ? { title: nextGuideTitle, id: nextGuideId } : null;
  const copyLink = async () => {
    const path = `/training/${guide.id}/certificate`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(path);
      setToast("Demo link copied. It opens this page in TEST mode only.");
    } else {
      setToast("Clipboard is unavailable; copy the address bar link instead.");
    }
  };
  const exportPdf = () => {
    setToast("Choose “Save as PDF” in the print dialog to keep a copy.");
    window.print();
  };

  return (
    <div className="certificate-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/training">Training directory</Link>
        <Icon name="next" size={14} />
        <Link href={`/training/${guide.id}`}>{guide.title}</Link>
        <Icon name="next" size={14} />
        <span aria-current="page">Certificate</span>
      </nav>

      <header className="cert-actions print-hide">
        <div>
          <p className="eyebrow">TRAINING · DEMO SCREEN</p>
          <h1>Module completion &amp; certificate</h1>
        </div>
        <div className="cert-actions-buttons">
          <Link className="button button-outline" href="/training">
            <Icon name="back" size={16} /> Back to guides
          </Link>
          <button className="button button-primary" type="button" onClick={exportPdf}>
            Export PDF (print)
          </button>
        </div>
      </header>

      <article className="cert-frame" aria-label="Demo certificate preview">
        <div className="cert-frame-inner">
          <p className="cert-brand">
            Sabi<span>Work</span>
          </p>
          <span className="cert-record-pill">
            <Icon name="shield" size={14} /> Sample training record · TEST mode
          </span>
          <h2 className="cert-title">Certificate of completion</h2>
          <p className="cert-subtitle">
            Issued by the fictional SabiWork training desk for this in-app demo.
          </p>
          <div className="cert-recipient">
            <span>Presented to</span>
            <strong>{learner.name}</strong>
            <small>Plumbing &amp; field utility · {learner.area} · demo learner</small>
          </div>
          <div className="cert-course">
            <span>For finishing the guide</span>
            <strong>“{guide.title}”</strong>
            <div className="cert-course-meta">
              <span>
                Completed: <strong>{formatCompleted(completedAtUtc)}</strong>
              </span>
              <span>
                Parts: <strong>{certificate.progress.totalSteps} of {certificate.progress.totalSteps} read</strong>
              </span>
            </div>
          </div>
          <div className="cert-seals">
            <div>
              <span className="cert-seal" aria-hidden="true">
                <Icon name="wrench" size={22} />
              </span>
              <strong>Training desk</strong>
              <small>Fictional demo issuer</small>
            </div>
            <div>
              <span>Internal docket</span>
              <code>{docket} (sample)</code>
              <small>No verification service is connected</small>
            </div>
            <div>
              <span className="cert-qr" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm12-2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm-4-4h2v2h-2v-2zm2-2h2v2h-2v-2z" />
                </svg>
              </span>
              <strong>Sample QR</strong>
              <small>Decorative placeholder · not scannable</small>
            </div>
          </div>
          <p className="cert-legal">
            This certificate records completion of an in-app demo guide only. It
            is not a government, statutory or vocational trade accreditation,
            and no external registry checks it.
          </p>
        </div>
      </article>

      <div className="cert-bento">
        <article className="cert-card">
          <div className="cert-card-head">
            <span className="cert-badge-icon">
              <Icon name="sparkles" size={18} />
            </span>
            <div>
              <p className="cert-badge-eyebrow">Demo badge</p>
              <h2>Client relations endorsement</h2>
            </div>
          </div>
          <p>
            After backend integration this completion will attach to the
            learner’s public profile and outgoing quotes. Nothing is stored or
            synchronised in TEST mode.
          </p>
          <div className="cert-card-actions">
            <button className="button button-outline" type="button" onClick={copyLink}>
              Copy demo link
            </button>
            <Link className="button button-subtle" href="/artisans">
              Public listings (demo)
            </Link>
          </div>
        </article>
        <article className="cert-card">
          <p className="cert-badge-eyebrow">Next recommended guide</p>
          {nextCourse ? (
            <>
              <h2>{nextCourse.title}</h2>
              <div className="cert-card-actions">
                <Link
                  className="button button-primary"
                  href={`/training/${nextCourse.id}`}
                >
                  Start next guide <Icon name="arrow" size={16} />
                </Link>
                <Link className="button button-outline" href="/training">
                  All training (S44)
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2>All demo guides finished</h2>
              <p>
                You have read every guide in this fictional catalogue. Refresh
                resets the demo progress.
              </p>
              <div className="cert-card-actions">
                <Link className="button button-outline" href="/training">
                  All training (S44)
                </Link>
              </div>
            </>
          )}
        </article>
      </div>

      {toast && (
        <div className="demo-toast" role="status">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
