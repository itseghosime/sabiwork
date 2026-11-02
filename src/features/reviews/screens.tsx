"use client";

import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  Gavel,
  ImagePlus,
  Info,
  Lock,
  MessageSquareText,
  Paperclip,
  Scale,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Star,
  Upload,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  formatNaira,
  reviewsDemoService,
  type DemoDispute,
  type DemoJob,
  type DisputeCategory,
  type DisputeViewStatus,
  type ReviewTag,
} from "./service";

const tagOptions: readonly ReviewTag[] = [
  "Clean work",
  "On time",
  "Expert workmanship",
  "Courteous",
  "Fair pricing",
];

const ratingDescriptions: Record<number, string> = {
  1: "1 Star - Poor Quality & Unsatisfactory",
  2: "2 Stars - Below Expectations",
  3: "3 Stars - Average Service",
  4: "4 Stars - Good Work & Professional",
  5: "5 Stars - Exceptional Craft & Neatness",
};

const categories: readonly DisputeCategory[] = [
  "Incomplete work",
  "Defective workmanship",
  "Unprofessional conduct",
  "Pricing discrepancy",
];

function useJob(jobId: string) {
  const [state, setState] = useState<{ loading: boolean; job: DemoJob | null }>({
    loading: true,
    job: null,
  });
  useEffect(() => {
    let active = true;
    void reviewsDemoService.getJob(jobId).then((record) => {
      if (active) setState({ loading: false, job: record });
    });
    return () => {
      active = false;
    };
  }, [jobId]);
  return state;
}

function useDispute(disputeId: string) {
  const [state, setState] = useState<{ loading: boolean; dispute: DemoDispute | null }>({
    loading: true,
    dispute: null,
  });
  useEffect(() => {
    let active = true;
    void reviewsDemoService.getDispute(disputeId).then((record) => {
      if (active) setState({ loading: false, dispute: record });
    });
    return () => {
      active = false;
    };
  }, [disputeId]);
  return state;
}

function PageTitle({
  eyebrow,
  title,
  description,
  backHref,
  backText = "Back to jobs",
  badge,
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backText?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rw-page-title">
      <div className="rw-page-title-top">
        {backHref && (
          <Link className="rw-back" href={backHref}>
            <ArrowLeft size={16} aria-hidden="true" /> {backText}
          </Link>
        )}
        <div className="rw-badge-cluster">
          {badge}
          <div className="rw-test-mode-pill" title="Paystack sandbox integration active">
            <span className="rw-pulse-dot" aria-hidden="true" />
            <span>Paystack TEST Mode Active</span>
          </div>
        </div>
      </div>
      <p className="rw-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="rw-lede">{description}</p>
    </div>
  );
}

function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rw-demo-notice" role="note">
      <Info size={18} aria-hidden="true" />
      <p>
        <strong>Frontend demo.</strong> {children}
      </p>
    </div>
  );
}

function JobCard({
  job,
  compact = false,
  heldMilestoneText,
}: {
  job: DemoJob;
  compact?: boolean;
  heldMilestoneText?: string;
}) {
  return (
    <section className={`rw-job-card${compact ? " rw-job-card-compact" : ""}`}>
      <div className="rw-job-identity">
        <div className="rw-avatar" aria-hidden="true">
          OI
        </div>
        <div className="rw-job-name">
          <div className="rw-job-header-row">
            <span className="rw-kicker">COMPLETED SERVICE · #{job.reference}</span>
            <span className="rw-trade-tag">{job.artisanTrade}</span>
          </div>
          <h2>{job.artisan}</h2>
          <div className="rw-artisan-sub">
            <span className="rw-rating-badge">
              <Star size={13} fill="currentColor" aria-hidden="true" /> 4.9
            </span>
            <span className="rw-dot">•</span>
            <span>142 completed jobs</span>
            <span className="rw-dot">•</span>
            <span className="rw-location">{job.area}</span>
          </div>
        </div>
      </div>
      <div className="rw-job-description">
        <span className="rw-label">Job description</span>
        <p>{job.title}</p>
        {heldMilestoneText && (
          <p className="rw-milestone-flag">
            <Clock3 size={13} /> {heldMilestoneText}
          </p>
        )}
      </div>
      <div className="rw-job-amount">
        <span className="rw-label">Total paid (escrow released)</span>
        <strong>{formatNaira(job.totalKobo)}</strong>
        <span>Completed {job.completedOn} · 2:30 PM WAT</span>
      </div>
    </section>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="rw-loading" role="status" aria-live="polite">
      <span className="rw-spinner" aria-hidden="true" /> Loading {label}…
    </div>
  );
}

function NotFoundCard({
  title,
  message,
  returnHref,
  returnLabel,
}: {
  title: string;
  message: string;
  returnHref: string;
  returnLabel: string;
}) {
  return (
    <div className="rw-card rw-not-found" role="alert">
      <CircleHelp size={32} className="rw-muted-icon" />
      <h2>{title}</h2>
      <p>{message}</p>
      <Link className="button button-outline" href={returnHref}>
        <ArrowLeft size={16} /> {returnLabel}
      </Link>
    </div>
  );
}

function ResultBanner({
  tone,
  children,
}: {
  tone: "success" | "error" | "info";
  children: React.ReactNode;
}) {
  const IconComponent =
    tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;
  return (
    <div
      className={`rw-result rw-result-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <IconComponent size={19} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function ReviewScreen({ jobId }: { jobId: string }) {
  const { loading, job } = useJob(jobId);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [simulateUnavailable, setSimulateUnavailable] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof reviewsDemoService.submitReview>
  > | null>(null);

  if (loading) {
    return (
      <div className="rw-page">
        <LoadingCard label="completed job" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rw-page">
        <NotFoundCard
          title="Job not found"
          message={`No job record found matching reference "${jobId}". Please check your job URL or return to your jobs directory.`}
          returnHref="/jobs"
          returnLabel="Return to My Jobs"
        />
      </div>
    );
  }

  function toggleTag(tag: ReviewTag) {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
    setResult(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const response = await reviewsDemoService.submitReview({
      rating,
      text,
      tags,
      simulateUnavailable,
    });
    setResult(response);
    setSimulateUnavailable(false);
    setPending(false);
  }

  return (
    <div className="rw-page">
      <PageTitle
        eyebrow="S31 · CUSTOMER REVIEW & RATING"
        title="Rate your experience"
        description="Your verified review helps maintain high service standards for trade craft across Benin City."
        badge={
          <span className="rw-service-pill">
            Completed Service • Ref: #{job.reference}
          </span>
        }
      />
      <DemoNotice>
        Reviews are not published to live profiles from this screen. Review eligibility
        and permanent storage will be integrated server-side.
      </DemoNotice>
      <JobCard job={job} />

      <div className="rw-review-layout">
        <div className="rw-card rw-review-form-card">
          {result?.ok ? (
            <div className="rw-success-view" role="status">
              <div className="rw-success-icon-wrap">
                <CheckCircle2 size={44} className="rw-success-icon" />
              </div>
              <h2>Review Submitted Successfully!</h2>
              <p>
                Thank you for helping maintain quality standards in Benin City. Your
                verified feedback is now staged for {job.artisan}&apos;s profile.
              </p>
              <div className="rw-actions rw-actions-center">
                <Link
                  className="button button-primary"
                  href={`/artisans/${encodeURIComponent(job.artisan.toLowerCase().replace(/\s+/g, "-"))}`}
                >
                  <User size={16} /> View Artisan Profile
                </Link>
                <Link className="button button-outline" href="/jobs">
                  <ArrowLeft size={16} /> Return to My Jobs
                </Link>
              </div>
            </div>
          ) : (
            <form className="rw-review-form" onSubmit={submit}>
              <div className="rw-section-head">
                <div>
                  <p className="rw-eyebrow">YOUR FEEDBACK</p>
                  <h2>Leave Your Feedback</h2>
                  <p className="rw-subhead">
                    Share honest feedback on workmanship, timing, and professional conduct.
                  </p>
                </div>
                <span className="rw-required">
                  <b aria-hidden="true">*</b> Required
                </span>
              </div>

              <fieldset className="rw-fieldset" disabled={pending}>
                <legend>
                  Overall Rating <span aria-hidden="true">*</span>
                </legend>
                <div className="rw-stars" role="group" aria-label="Overall rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={rating === value}
                      aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                      className={`rw-star${rating >= value ? " is-selected" : ""}`}
                      onClick={() => {
                        setRating(value);
                        setResult(null);
                      }}
                    >
                      <Star
                        size={32}
                        fill={rating >= value ? "currentColor" : "none"}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                  <p className="rw-rating-desc">
                    {rating ? ratingDescriptions[rating] : "Click a star to rate"}
                  </p>
                </div>
              </fieldset>

              <fieldset className="rw-fieldset">
                <legend>What went particularly well?</legend>
                <div className="rw-chips">
                  {tagOptions.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      aria-pressed={tags.includes(tag)}
                      className={`rw-chip${tags.includes(tag) ? " is-active" : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tags.includes(tag) && <Check size={14} aria-hidden="true" />}
                      #{tag.replace(/\s+/g, "")}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="rw-field">
                <div className="rw-field-label-row">
                  <label htmlFor="review-feedback">
                    Detailed feedback <span aria-hidden="true">*</span>
                  </label>
                  <span>{text.length} / 500 chars</span>
                </div>
                <textarea
                  id="review-feedback"
                  value={text}
                  maxLength={500}
                  rows={4}
                  placeholder={`Describe the quality of work, punctuality, and overall experience with ${job.artisan}...`}
                  onChange={(event) => {
                    setText(event.target.value);
                    setResult(null);
                  }}
                  aria-describedby="review-helper"
                />
                <p id="review-helper" className="rw-help">
                  Provide constructive, specific observations. At least 10 characters required.
                </p>
              </div>

              {result && !result.ok && (
                <ResultBanner tone="error">{result.message}</ResultBanner>
              )}

              <details className="rw-preview-state">
                <summary>Preview a recoverable error</summary>
                <p>
                  This local state verifies that failed responses retain the customer&apos;s
                  draft review text.
                </p>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setSimulateUnavailable(true)}
                >
                  Simulate the next request failing
                </button>
              </details>

              <div className="rw-actions">
                <Link className="button button-subtle" href="/jobs">
                  <ArrowLeft size={16} /> Return to My Jobs
                </Link>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <span className="rw-spinner rw-spinner-light" /> Checking preview…
                    </>
                  ) : (
                    <>
                      Preview review <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="rw-side-stack">
          <section className="rw-card rw-guidance">
            <div className="rw-card-icon">
              <MessageSquareText size={20} />
            </div>
            <h2>Review Guidelines</h2>
            <ul className="rw-checklist">
              <li>
                <Check size={15} className="rw-check-icon" />
                <span>Reviews can only be submitted for fully completed jobs with confirmed payment release.</span>
              </li>
              <li>
                <Check size={15} className="rw-check-icon" />
                <span>Once submitted, ratings are permanently locked to ensure trust and fairness.</span>
              </li>
              <li>
                <Check size={15} className="rw-check-icon" />
                <span>Keep feedback constructive, objective, and specific to the trade service provided.</span>
              </li>
            </ul>
          </section>

          <section className="rw-card rw-already-reviewed">
            <div className="rw-flex-row">
              <Shield size={18} className="rw-primary-icon" />
              <strong>Already Reviewed Status</strong>
            </div>
            <p>
              You submitted feedback for job #{job.reference} on {job.completedOn}.
              Duplicate submissions are restricted to preserve rating integrity.
            </p>
          </section>

          <Link
            className="button button-outline rw-full"
            href={`/jobs/${encodeURIComponent(job.id)}/dispute`}
          >
            <ShieldAlert size={16} /> Report a job issue or dispute
          </Link>
        </aside>
      </div>
    </div>
  );
}

type EvidenceFile = {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
};

function EvidencePicker({
  files,
  onAdd,
  onRemove,
}: {
  files: EvidenceFile[];
  onAdd: (items: EvidenceFile[]) => void;
  onRemove: (id: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setUploadError("");
    const available = Math.max(0, 4 - files.length);
    const accepted: EvidenceFile[] = [];
    const failures: string[] = [];

    Array.from(fileList)
      .slice(0, available)
      .forEach((file) => {
        if (!(file.type.startsWith("image/") || file.type === "application/pdf")) {
          failures.push(`${file.name}: choose an image or PDF.`);
        } else if (file.size > 10 * 1024 * 1024) {
          failures.push(`${file.name}: file exceeds 10 MB limit.`);
        } else {
          accepted.push({
            id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            size: file.size,
            url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
            type: file.type,
          });
        }
      });

    if (accepted.length) onAdd(accepted);
    if (failures.length) setUploadError(failures.join(" "));
    if (fileList.length > available) {
      setUploadError(
        (current) =>
          `${current}${current ? " " : ""}You can attach a maximum of four files.`,
      );
    }
    if (input.current) input.current.value = "";
  }

  function handleRemove(id: string) {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    onRemove(id);
  }

  return (
    <div className="rw-evidence">
      <input
        ref={input}
        className="rw-file-input"
        id="dispute-evidence"
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        multiple
        onChange={(event) => addFiles(event.currentTarget.files)}
        aria-describedby="evidence-help evidence-error"
      />
      <label className="rw-dropzone" htmlFor="dispute-evidence">
        <span className="rw-upload-icon">
          <Upload size={19} />
        </span>
        <span>
          <strong>Add evidence files</strong>
          <small>JPG, PNG, WebP or PDF · up to 10 MB each · maximum 4 files</small>
        </span>
        <span className="button button-outline">Choose files</span>
      </label>
      <p id="evidence-help" className="rw-help">
        Provide photos showing uncompleted scope or defective parts. This demo stores files
        locally in memory only.
      </p>
      {uploadError && (
        <p id="evidence-error" className="rw-inline-error" role="alert">
          {uploadError}
        </p>
      )}
      {files.length > 0 && (
        <ul className="rw-file-list" aria-label="Selected evidence files">
          {files.map((file) => (
            <li key={file.id} className="rw-file-item">
              {file.url ? (
                <Image
                  src={file.url}
                  alt={`Preview of ${file.name}`}
                  width={42}
                  height={42}
                  unoptimized
                />
              ) : (
                <span className="rw-file-icon">
                  <FileText size={20} />
                </span>
              )}
              <span className="rw-file-info">
                <strong title={file.name}>{file.name}</strong>
                <small>
                  {(file.size / (1024 * 1024)).toFixed(1)} MB ·{" "}
                  {file.type === "application/pdf" ? "PDF" : "Image"}
                </small>
              </span>
              <button
                className="rw-icon-button"
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => handleRemove(file.id)}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DisputeFormScreen({ jobId }: { jobId: string }) {
  const { loading, job } = useJob(jobId);
  const [category, setCategory] = useState<DisputeCategory>("Incomplete work");
  const [milestone, setMilestone] = useState<"Deposit" | "Balance">("Deposit");
  const [summary, setSummary] = useState("");
  const [resolution, setResolution] = useState(
    "Ask the artisan to review the issue",
  );
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [pending, setPending] = useState(false);
  const [simulateUnavailable, setSimulateUnavailable] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof reviewsDemoService.submitDispute>
  > | null>(null);

  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(
    () => () =>
      filesRef.current.forEach((file) => {
        if (file.url) URL.revokeObjectURL(file.url);
      }),
    [],
  );

  if (loading) {
    return (
      <div className="rw-page">
        <LoadingCard label="job details" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rw-page">
        <NotFoundCard
          title="Job not found"
          message={`No job record found matching reference "${jobId}". Please verify the job URL or return to your jobs directory.`}
          returnHref="/jobs"
          returnLabel="Return to My Jobs"
        />
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const response = await reviewsDemoService.submitDispute({
      category,
      milestone,
      summary,
      evidenceCount: files.length,
      resolution,
      simulateUnavailable,
    });
    setResult(response);
    setSimulateUnavailable(false);
    setPending(false);
  }

  return (
    <div className="rw-page">
      <div className="rw-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/jobs">Customer Portal</Link>
        <span aria-hidden="true">/</span>
        <Link href="/jobs">My Jobs</Link>
        <span aria-hidden="true">/</span>
        <span>#{job.reference}</span>
        <span aria-hidden="true">/</span>
        <strong aria-current="page">Report Issue / Dispute</strong>
      </div>

      <PageTitle
        eyebrow="S32 · MEDIATION INTAKE DESK • BENIN CITY HUB"
        title="Report Job Issue & Request Mediation"
        description="Submit a detailed dispute or quality issue for independent mediation by SabiWork Benin City support team."
        badge={
          <span className="rw-service-pill">
            Ref: DISP-{job.reference}
          </span>
        }
      />
      <DemoNotice>
        This page only previews the dispute report intake. It does not create an active
        case, freeze payment gateway funds, issue an automated refund, or penalize the
        artisan.
      </DemoNotice>

      <section className="rw-card rw-job-dispute-card">
        <div className="rw-dispute-job-head">
          <div className="rw-dispute-trade-icon">
            <Scale size={24} />
          </div>
          <div className="rw-dispute-job-meta">
            <span className="rw-kicker">
              {job.artisanTrade} Maintenance • {job.area}
            </span>
            <h2>{job.title}</h2>
            <div className="rw-artisan-sub">
              <strong>{job.artisan}</strong>
              <span className="rw-dot">•</span>
              <span className="rw-rating-badge">
                <Star size={13} fill="currentColor" aria-hidden="true" /> 4.9
              </span>
              <span className="rw-dot">•</span>
              <span className="rw-status-indicator">
                <span className="rw-amber-dot" /> Work Submitted / Under Review
              </span>
            </div>
          </div>
        </div>

        <div className="rw-escrow-summary-box">
          <div className="rw-escrow-row">
            <div>
              <span className="rw-label">Agreed Quote</span>
              <strong>{formatNaira(job.totalKobo)}</strong>
            </div>
            <div className="rw-text-right">
              <span className="rw-label rw-highlight-label">Milestone 1 Held</span>
              <strong className="rw-highlight-strong">{formatNaira(job.depositKobo)}</strong>
            </div>
          </div>
          <div className="rw-progress-bar-track">
            <div className="rw-progress-bar-fill" style={{ width: "33.3%" }} />
          </div>
          <div className="rw-escrow-split">
            <span>
              Milestone 2 Balance Due: <strong>{formatNaira(job.balanceKobo)}</strong>
            </span>
            <span>33% Escrowed</span>
          </div>
          <p className="rw-escrow-notice">
            <Shield size={14} /> Funds held securely in mock TEST escrow pending dispute assessment.
          </p>
        </div>
      </section>

      <div className="rw-dispute-layout">
        <form className="rw-card rw-dispute-form" onSubmit={submit}>
          <div className="rw-section-head">
            <div>
              <p className="rw-eyebrow">CASE DETAILS</p>
              <h2>Tell Us What Went Wrong</h2>
            </div>
            <span className="rw-step-count">4 steps</span>
          </div>

          <fieldset className="rw-fieldset">
            <legend>
              <span className="rw-step-number">1</span> Choose an Issue Type
            </legend>
            <div className="rw-choice-grid">
              {categories.map((item) => (
                <label
                  className={`rw-choice${category === item ? " is-selected" : ""}`}
                  key={item}
                >
                  <input
                    type="radio"
                    name="category"
                    value={item}
                    checked={category === item}
                    onChange={() => {
                      setCategory(item);
                      setResult(null);
                    }}
                  />
                  <span className="rw-choice-mark" aria-hidden="true">
                    {category === item && <Check size={13} />}
                  </span>
                  <span>
                    <strong>{item}</strong>
                    <small>
                      {item === "Incomplete work"
                        ? "Agreed scope left unfinished"
                        : item === "Defective workmanship"
                          ? "Materials or installation failed"
                          : item === "Unprofessional conduct"
                            ? "Conduct or scheduling violation"
                            : "Cost altered without mutual agreement"}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rw-fieldset">
            <legend>
              <span className="rw-step-number">2</span> Select Contested Milestone
            </legend>
            <div className="rw-milestone-list">
              {(["Deposit", "Balance"] as const).map((item) => (
                <label
                  className={`rw-milestone${milestone === item ? " is-selected" : ""}`}
                  key={item}
                >
                  <input
                    type="radio"
                    name="milestone"
                    value={item}
                    checked={milestone === item}
                    onChange={() => {
                      setMilestone(item);
                      setResult(null);
                    }}
                  />
                  <span className="rw-choice-mark" aria-hidden="true">
                    {milestone === item && <Check size={13} />}
                  </span>
                  <span>
                    <strong>
                      {item === "Deposit" ? "Milestone 1 (Deposit)" : "Milestone 2 (Balance)"}
                    </strong>
                    <small>
                      {formatNaira(item === "Deposit" ? job.depositKobo : job.balanceKobo)} ·
                      contested amount
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rw-field">
            <div className="rw-field-label-row">
              <label htmlFor="dispute-summary">
                <span className="rw-step-number">3</span> Describe the Issue{" "}
                <span aria-hidden="true">*</span>
              </label>
              <span>{summary.length} / 1000 chars</span>
            </div>
            <textarea
              id="dispute-summary"
              rows={5}
              maxLength={1000}
              value={summary}
              onChange={(event) => {
                setSummary(event.target.value);
                setResult(null);
              }}
              placeholder="Describe the agreed work, what happened, when the issue was discovered, and any conversation with the artisan..."
              aria-describedby="dispute-description-help"
            />
            <p id="dispute-description-help" className="rw-help">
              Include objective facts and chronology. Avoid sharing bank details or private contact information.
            </p>
          </div>

          <div className="rw-field">
            <div className="rw-field-label-row">
              <label htmlFor="dispute-evidence">
                <span className="rw-step-number">4</span> Add Supporting Evidence
              </label>
              <span>Optional, highly recommended</span>
            </div>
            <EvidencePicker
              files={files}
              onAdd={(items) => {
                setFiles((current) => [...current, ...items]);
                setResult(null);
              }}
              onRemove={(id) => {
                setFiles((current) => current.filter((file) => file.id !== id));
                setResult(null);
              }}
            />
          </div>

          <fieldset className="rw-fieldset">
            <legend>What outcome would resolve this?</legend>
            <label className="rw-select-label" htmlFor="preferred-next-step">
              Preferred Resolution Path
            </label>
            <div className="rw-select-wrap">
              <select
                id="preferred-next-step"
                value={resolution}
                onChange={(event) => {
                  setResolution(event.target.value);
                  setResult(null);
                }}
              >
                <option>Ask the artisan to review and correct the issue</option>
                <option>Agree on a mutual completion deadline</option>
                <option>Request formal SabiWork mediation & escrow review</option>
              </select>
              <ChevronDown size={17} aria-hidden="true" />
            </div>
          </fieldset>

          {result && !result.ok && (
            <ResultBanner tone="error">{result.message}</ResultBanner>
          )}
          {result?.ok && (
            <ResultBanner tone="success">
              {result.message}{" "}
              <Link href="/disputes/demo-dispute-01">
                View sample dispute status tracker →
              </Link>
            </ResultBanner>
          )}

          <details className="rw-preview-state">
            <summary>Preview a recoverable error</summary>
            <p>
              This state verifies that submission failures keep your reported details and
              attached evidence intact.
            </p>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setSimulateUnavailable(true)}
            >
              Simulate the next request failing
            </button>
          </details>

          <div className="rw-actions rw-actions-end">
            <Link className="button button-subtle" href="/jobs">
              <ArrowLeft size={16} /> Cancel
            </Link>
            <button
              className="button button-primary"
              type="submit"
              disabled={pending}
            >
              {pending ? (
                <>
                  <span className="rw-spinner rw-spinner-light" /> Submitting...
                </>
              ) : (
                <>
                  Submit Dispute Report <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
          <p className="rw-fineprint">
            Official disputes follow SabiWork Trade Mediation rules. Server authorization
            and automated escrow holding will be enforced on backend integration.
          </p>
        </form>

        <aside className="rw-side-stack">
          <section className="rw-card rw-money-card">
            <p className="rw-eyebrow">ESCROW BALANCE · BENIN HUB</p>
            <h2>{formatNaira(job.totalKobo)}</h2>
            <dl>
              <div>
                <dt>Deposit (Held in Escrow)</dt>
                <dd>{formatNaira(job.depositKobo)}</dd>
              </div>
              <div>
                <dt>Milestone 2 Balance</dt>
                <dd>{formatNaira(job.balanceKobo)}</dd>
              </div>
            </dl>
            <p className="rw-caution">
              <Info size={16} /> Fictional demonstration amounts. No real card charge or escrow freeze has occurred.
            </p>
          </section>

          <section className="rw-card rw-guidance">
            <div className="rw-card-icon">
              <Scale size={20} />
            </div>
            <h2>How SabiWork Reviews Disputes</h2>
            <ol className="rw-mini-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Intake & Evidence Audit</strong>
                  <p>Our Benin City mediation desk reviews statements, receipts, and photo proof.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Artisan Fact-Finding</strong>
                  <p>The artisan is invited to submit clarification or a corrective rework proposal.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Impartial Determination</strong>
                  <p>Escrow is disbursed or refunded according to documented project milestones.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="rw-policy-card">
            <CircleHelp size={20} />
            <div>
              <strong>Need Immediate Guidance?</strong>
              <p>For urgent safety issues or emergency leak assistance, call the Benin City Hub Desk.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

const statusChoices: readonly DisputeViewStatus[] = [
  "Under review",
  "Awaiting information",
  "Resolved",
];

export function DisputeStatusScreen({ disputeId }: { disputeId: string }) {
  const { loading, dispute: data } = useDispute(disputeId);
  const [status, setStatus] = useState<DisputeViewStatus>("Under review");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [noteFileError, setNoteFileError] = useState("");
  const [simulateUnavailable, setSimulateUnavailable] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const noteFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox]);

  if (loading) {
    return (
      <div className="rw-page">
        <LoadingCard label="dispute details" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rw-page">
        <NotFoundCard
          title="Dispute record not found"
          message={`No dispute record found matching ID "${disputeId}". Please check the URL or view open disputes.`}
          returnHref="/jobs"
          returnLabel="Return to My Jobs"
        />
      </div>
    );
  }

  const relatedAmountKobo =
    data.milestone === "Balance" ? data.job.balanceKobo : data.job.depositKobo;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNoteFileError("");
    const selected = Array.from(event.target.files ?? []);
    const valid: string[] = [];
    const errors: string[] = [];

    selected.slice(0, 4).forEach((file) => {
      if (!(file.type.startsWith("image/") || file.type === "application/pdf")) {
        errors.push(`${file.name}: choose an image or PDF.`);
      } else if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: file exceeds 10 MB.`);
      } else {
        valid.push(file.name);
      }
    });

    if (errors.length) {
      setNoteFileError(errors.join(" "));
    }
    setFiles(valid);
  }

  async function sendNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const submittedNote = note;
    const response = await reviewsDemoService.submitParticipantNote(
      note,
      files,
      simulateUnavailable,
    );
    setNotice(response.message);
    setSimulateUnavailable(false);
    setPending(false);
    if (response.ok) {
      setNote((current) => (current === submittedNote ? "" : current));
      setFiles([]);
    }
  }

  return (
    <div className="rw-page rw-status-page">
      <PageTitle
        eyebrow="S33 · MEDIATION DESK WORKSPACE • BENIN CITY HUB (GRA NODE)"
        title="Dispute Status & Mediation Tracker"
        description="Follow case progress, inspect submitted evidence, and communicate with the neutral mediator."
        backHref={`/jobs/${encodeURIComponent(data.job.id)}/dispute`}
        backText="Back to dispute form"
        badge={
          <span className="rw-service-pill">
            Case #{data.id} • Job #{data.job.reference}
          </span>
        }
      />
      <DemoNotice>
        This dispute tracker is a prototype demonstration. No real legal mediation or escrow
        freeze is active.
      </DemoNotice>

      <div className="rw-status-controls" aria-label="Preview status states">
        <span>Interactive State Switcher:</span>
        {statusChoices.map((choice) => (
          <button
            type="button"
            key={choice}
            aria-pressed={status === choice}
            onClick={() => setStatus(choice)}
          >
            {choice}
          </button>
        ))}
      </div>

      <section className="rw-case-hero">
        <div className="rw-case-main">
          <span
            className={`rw-status-pill rw-status-${status.toLowerCase().replaceAll(" ", "-")}`}
          >
            <span />
            {status}
            {status === "Resolved" ? " · demonstration" : ""}
          </span>
          <h2>{data.job.title}</h2>
          <p>
            Case #{data.id} <i aria-hidden="true">·</i> Lodged {data.openedOn} via Customer Protection Channel
          </p>
        </div>
        <div className="rw-case-amount">
          <span className="rw-label">Contested escrow ({data.milestone})</span>
          <strong>{formatNaira(relatedAmountKobo)}</strong>
          <small>
            <Lock size={12} /> Held safely in Paystack mock escrow
          </small>
        </div>
      </section>

      {status !== "Under review" && (
        <ResultBanner tone={status === "Resolved" ? "success" : "info"}>
          {status === "Resolved"
            ? "Resolved is a demonstration display state. No funds have been transferred or deducted."
            : "Awaiting information is a demonstration display state. No formal inquiry was sent."}
        </ResultBanner>
      )}

      <div className="rw-status-grid">
        <div className="rw-main-stack">
          <section className="rw-card rw-case-overview">
            <div className="rw-section-head">
              <div>
                <p className="rw-eyebrow">ISSUE CLAIM & STATEMENT</p>
                <h2>Customer Stated Position</h2>
              </div>
              <span className="rw-category-pill">{data.category}</span>
            </div>
            <blockquote>{data.summary}</blockquote>

            <div className="rw-evidence-heading">
              <strong>Customer Evidence Gallery ({data.evidence.length} Records)</strong>
              <span>Click to view hi-res inspection view</span>
            </div>
            <div className="rw-evidence-cards">
              {data.evidence.map((item, index) => (
                <article className="rw-evidence-card" key={item.id}>
                  <div className={`rw-evidence-image rw-evidence-image-${index + 1}`}>
                    <span>
                      {index === 0 ? <ImagePlus size={26} /> : <FileText size={26} />}
                    </span>
                    <button
                      type="button"
                      aria-label={`Preview ${item.name}`}
                      onClick={() => setLightbox(item.name)}
                    >
                      <ZoomIn size={18} />
                    </button>
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.caption}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rw-card rw-timeline">
            <div className="rw-section-head">
              <div>
                <p className="rw-eyebrow">CHRONOLOGICAL CASE LEDGER</p>
                <h2>Review Timeline</h2>
              </div>
              <span className="rw-step-count">Step 3 of 4</span>
            </div>
            <ol className="rw-timeline-list">
              {data.timeline.map((item, index) => (
                <li
                  className={`rw-timeline-item is-${item.state}`}
                  key={item.title}
                >
                  <span className="rw-timeline-dot">
                    {item.state === "complete" ? (
                      <Check size={14} />
                    ) : item.state === "current" ? (
                      <Clock3 size={15} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div>
                    <div className="rw-timeline-head">
                      <strong>{item.title}</strong>
                      <time>{item.time}</time>
                    </div>
                    <p>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="rw-fineprint">
              Timestamps correspond to West Africa Time (WAT) audit logs.
            </p>
          </section>

          <section className="rw-card rw-response-card">
            <button
              className="rw-accordion-toggle"
              type="button"
              aria-expanded={noteOpen}
              onClick={() => setNoteOpen((value) => !value)}
            >
              <span className="rw-card-icon">
                <MessageSquareText size={20} />
              </span>
              <span>
                <strong>Provide Clarification or Accept Proposal</strong>
                <small>Submit a note or attach supplementary reference documentation</small>
              </span>
              <ChevronDown
                className={noteOpen ? "is-open" : ""}
                size={19}
              />
            </button>
            {noteOpen && (
              <form className="rw-response-form" onSubmit={sendNote}>
                <label htmlFor="participant-note">Your clarification / statement</label>
                <textarea
                  id="participant-note"
                  rows={4}
                  maxLength={1000}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Share additional facts, dates, or responses to the mediator's questions…"
                />
                <input
                  ref={noteFile}
                  className="rw-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  multiple
                  onChange={handleFileChange}
                />
                <div className="rw-response-bottom">
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={() => noteFile.current?.click()}
                  >
                    <Paperclip size={16} /> Attach reference file
                  </button>
                  <span>
                    {files.length
                      ? files.join(", ")
                      : "JPG, PNG, PDF · max 10 MB"}
                  </span>
                </div>
                {noteFileError && (
                  <p className="rw-inline-error" role="alert">
                    {noteFileError}
                  </p>
                )}

                <details className="rw-preview-state">
                  <summary>Preview a recoverable error</summary>
                  <p>Simulate network latency or service timeout.</p>
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setSimulateUnavailable(true)}
                  >
                    Simulate the next request failing
                  </button>
                </details>

                <button
                  className="button button-primary"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? (
                    "Checking preview…"
                  ) : (
                    <>
                      Submit Note Preview <Send size={15} />
                    </>
                  )}
                </button>
                {notice && <ResultBanner tone="info">{notice}</ResultBanner>}
              </form>
            )}
          </section>
        </div>

        <aside className="rw-side-stack">
          <JobCard job={data.job} compact />

          <section className="rw-card rw-guidance">
            <div className="rw-card-icon">
              <Scale size={20} />
            </div>
            <h2>Neutral Mediation Protocol</h2>
            <p>
              SabiWork mediators uphold strict procedural neutrality between property
              owners and guild artisans.
            </p>
            <div className="rw-policy-line">
              <Info size={16} />
              <span>
                Escrow funds remain frozen until an agreed settlement or formal
                determination is entered.
              </span>
            </div>
          </section>

          <Link
            className="button button-outline rw-full"
            href={`/jobs/${encodeURIComponent(data.job.id)}/dispute`}
          >
            <ArrowLeft size={16} /> Return to dispute form
          </Link>
        </aside>
      </div>

      {lightbox && (
        <div
          className="rw-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Evidence preview: ${lightbox}`}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="rw-icon-button rw-lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
          <div
            className="rw-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rw-evidence-placeholder">
              <ImagePlus size={48} />
              <strong>High-Resolution Inspection Preview</strong>
              <span>{lightbox}</span>
            </div>
            <p>
              {data.evidence.find((item) => item.name === lightbox)?.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminDisputeQueueScreen() {
  const [disputes, setDisputes] = useState<readonly DemoDispute[] | null>(null);
  const [filter, setFilter] = useState("All cases");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    void reviewsDemoService.listDisputes().then((items) => {
      if (active) setDisputes(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      (disputes ?? []).filter((item) => {
        const matchesStatus =
          filter === "All cases" ||
          (filter === "Under review" && item.status === "Under review") ||
          (filter === "Awaiting information" && item.status === "Awaiting information") ||
          (filter === "Resolved" && item.status === "Resolved");
        const normalized = query.trim().toLowerCase();
        const matchesText =
          !normalized ||
          [
            item.id,
            item.job.reference,
            item.job.title,
            item.job.artisan,
            item.category,
          ].some((value) => value.toLowerCase().includes(normalized));
        return matchesStatus && matchesText;
      }),
    [disputes, filter, query],
  );

  return (
    <div className="rw-page rw-admin-page">
      <div className="rw-breadcrumbs" aria-label="Breadcrumb">
        <span>Admin Portal</span>
        <span aria-hidden="true">/</span>
        <strong aria-current="page">Dispute Resolution Queue</strong>
      </div>

      <PageTitle
        eyebrow="S34 · BENIN HUB DESK • ESCROW DISPUTE OPERATIONS"
        title="Dispute Resolution & Mediation Queue"
        description="Review active trade disputes lodged across Benin City. Impartially examine linked contracts, frozen Paystack TEST milestone escrow, and lodged evidence."
        badge={
          <span className="rw-service-pill">
            <Gavel size={14} /> Dual Sign-off Active
          </span>
        }
      />
      <DemoNotice>
        The current admin shell is a presentation scaffold. Server-side admin authentication,
        case privacy, and escrow release execution are pending backend connection.
      </DemoNotice>

      <div className="rw-queue-metrics">
        <div>
          <span>Open Cases</span>
          <strong>{disputes?.length ?? "6"}</strong>
          <small>Total queued</small>
        </div>
        <div>
          <span>Urgent Escalations</span>
          <strong className="rw-metric-warn">2</strong>
          <small>&gt; 48h SLA deadline</small>
        </div>
        <div>
          <span>Contested Escrow</span>
          <strong>₦145,000</strong>
          <small>Held in Paystack TEST</small>
        </div>
        <div>
          <span>Resolved (This Week)</span>
          <strong className="rw-metric-success">14</strong>
          <small>Mutual settlements</small>
        </div>
      </div>

      <section className="rw-card rw-queue-card">
        <div className="rw-queue-heading">
          <div>
            <p className="rw-eyebrow">CASE MANAGEMENT · DEMO DATA</p>
            <h2>Reported Issues & Disputes</h2>
          </div>
          <label className="rw-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search disputes</span>
            <input
              aria-label="Search disputes"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search case, job ref, or artisan..."
            />
          </label>
        </div>

        <div className="rw-filter-row" role="group" aria-label="Filter disputes by status">
          {["All cases", ...statusChoices].map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {disputes === null ? (
          <LoadingCard label="sample cases" />
        ) : filtered.length === 0 ? (
          <div className="rw-empty-state">
            <span>
              <Search size={24} />
            </span>
            <h3>No cases match this view</h3>
            <p>Try a different status filter or search keyword.</p>
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setFilter("All cases");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="rw-case-table-head">
              <span>CASE / JOB</span>
              <span>ISSUE TYPE</span>
              <span>STATUS</span>
              <span>OPENED</span>
              <span>ACTION</span>
            </div>
            <div className="rw-case-rows">
              {filtered.map((item) => (
                <Link
                  className="rw-case-row"
                  href={`/admin/disputes/${encodeURIComponent(item.id)}`}
                  key={item.id}
                >
                  <span className="rw-case-ref">
                    <strong>#{item.id}</strong>
                    <small>
                      Job #{item.job.reference} · {item.job.artisan}
                    </small>
                    <em>{item.job.title}</em>
                  </span>
                  <span className="rw-case-type">
                    <span className="rw-category-pill">{item.category}</span>
                  </span>
                  <span className="rw-case-status">
                    <span
                      className={`rw-status-pill rw-status-${item.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      <span />
                      {item.status}
                    </span>
                  </span>
                  <span className="rw-case-date">{item.openedOn.split(" · ")[0]}</span>
                  <span className="rw-row-action">
                    View case <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <p className="rw-fineprint rw-admin-fineprint">
        Fictional sample records only. No production customer PII, real identity credentials,
        or financial settlement authority is represented.
      </p>
    </div>
  );
}

export function AdminDisputeDetailScreen({ disputeId }: { disputeId: string }) {
  const { loading, dispute } = useDispute(disputeId);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  if (loading) {
    return (
      <div className="rw-page">
        <LoadingCard label="case details" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="rw-page">
        <NotFoundCard
          title="Case record not found"
          message={`No dispute record found matching ID "${disputeId}". Return to the queue to review active cases.`}
          returnHref="/admin/disputes"
          returnLabel="Return to Dispute Queue"
        />
      </div>
    );
  }

  const disputedAmountKobo =
    dispute.milestone === "Balance"
      ? dispute.job.balanceKobo
      : dispute.job.depositKobo;

  async function previewAction(action: "request-info" | "continue-review") {
    if (pending) return;
    setPending(true);
    const response = await reviewsDemoService.previewAdminAction(action);
    setNotice(response.message);
    setPending(false);
  }

  return (
    <div className="rw-page rw-admin-page">
      <div className="rw-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/admin/disputes">Admin Portal</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/disputes">Dispute Queue (S34)</Link>
        <span aria-hidden="true">/</span>
        <strong aria-current="page">#{dispute.id}</strong>
      </div>

      <PageTitle
        eyebrow="S35 · DISPUTE DETERMINATION • BENIN HUB MEDIATION"
        title={`Dispute Determination: Case #${dispute.id}`}
        description="Inspect submitted statements, verify photographic field telemetry, and record formal resolution."
        backHref="/admin/disputes"
        backText="Back to dispute queue"
        badge={
          <span className="rw-service-pill">
            <Clock3 size={14} /> Decision Due: Today 4:00 PM (2h remaining)
          </span>
        }
      />
      <DemoNotice>
        These admin controls are prototype interaction previews. They do not alter database
        case state or trigger automated Paystack escrow transfers.
      </DemoNotice>

      <section className="rw-case-hero rw-admin-case-hero">
        <div className="rw-case-main">
          <span
            className={`rw-status-pill rw-status-${dispute.status
              .toLowerCase()
              .replaceAll(" ", "-")}`}
          >
            <span />
            {dispute.status} · sample
          </span>
          <h2>{dispute.job.title}</h2>
          <p>
            Case #{dispute.id} <i aria-hidden="true">·</i> Job #{dispute.job.reference} · Officer Assigned: Tunde Balogun
          </p>
        </div>
        <div className="rw-case-amount">
          <span className="rw-label">Opened date</span>
          <strong className="rw-date-amount">
            {dispute.openedOn.split(" · ")[0]}
          </strong>
          <small>WAT Mediation Desk</small>
        </div>
      </section>

      {notice && <ResultBanner tone="info">{notice}</ResultBanner>}

      <div className="rw-admin-detail-grid">
        <div className="rw-main-stack">
          <section className="rw-card rw-case-overview">
            <div className="rw-section-head">
              <div>
                <p className="rw-eyebrow">CUSTOMER REPORT & POSITION</p>
                <h2>Claim Summary & Evidence</h2>
              </div>
              <span className="rw-category-pill">{dispute.category}</span>
            </div>

            <div className="rw-detail-pair">
              <span className="rw-label">Contested milestone</span>
              <strong>
                {dispute.milestone} ({formatNaira(disputedAmountKobo)})
              </strong>
            </div>

            <blockquote>{dispute.summary}</blockquote>

            <div className="rw-evidence-heading">
              <strong>Submitted Evidence & Field Telemetry</strong>
              <span>{dispute.evidence.length} files attached</span>
            </div>
            <div className="rw-evidence-cards">
              {dispute.evidence.map((item, index) => (
                <article className="rw-evidence-card" key={item.id}>
                  <div className={`rw-evidence-image rw-evidence-image-${index + 1}`}>
                    <span>
                      {index === 0 ? <ImagePlus size={26} /> : <FileText size={26} />}
                    </span>
                    <span className="rw-evidence-label">Preview only</span>
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.caption}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rw-card rw-timeline">
            <div className="rw-section-head">
              <div>
                <p className="rw-eyebrow">CASE HISTORY</p>
                <h2>Chronological Audit & Event Log</h2>
              </div>
            </div>
            <ol className="rw-timeline-list">
              {dispute.timeline.map((item) => (
                <li
                  className={`rw-timeline-item is-${item.state}`}
                  key={item.title}
                >
                  <span className="rw-timeline-dot">
                    {item.state === "complete" ? (
                      <Check size={14} />
                    ) : item.state === "current" ? (
                      <Clock3 size={15} />
                    ) : (
                      <span aria-label="Pending">4</span>
                    )}
                  </span>
                  <div>
                    <div className="rw-timeline-head">
                      <strong>{item.title}</strong>
                      <time>{item.time}</time>
                    </div>
                    <p>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rw-card rw-admin-note">
            <div className="rw-section-head">
              <div>
                <p className="rw-eyebrow">ADMIN WORKSPACE</p>
                <h2>Record Formal Determination Note</h2>
              </div>
            </div>
            <label htmlFor="admin-note">Internal Assessment Notes</label>
            <textarea
              id="admin-note"
              rows={4}
              maxLength={1000}
              value={internalNote}
              onChange={(event) => {
                setInternalNote(event.target.value);
                setNoteSaved(false);
              }}
              placeholder="Record findings from physical inspection, material receipt check, or phone inquiry before recording determination..."
            />
            <p className="rw-help">
              This note draft remains in the local page state for preview testing.
            </p>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setNoteSaved(Boolean(internalNote.trim()))}
              disabled={!internalNote.trim()}
            >
              Preview Note Entry
            </button>
            {noteSaved && (
              <ResultBanner tone="info">
                Note preview recorded in memory. It has not been committed to persistent storage.
              </ResultBanner>
            )}
          </section>
        </div>

        <aside className="rw-side-stack">
          <section className="rw-card rw-participants">
            <p className="rw-eyebrow">PARTIES & STATED POSITIONS</p>
            <h2>People Involved</h2>
            <div className="rw-person-row">
              <span className="rw-avatar">AO</span>
              <div>
                <strong>Ada Okafor</strong>
                <small>Customer · GRA Axis, Benin City</small>
              </div>
            </div>
            <div className="rw-person-row">
              <span className="rw-avatar rw-avatar-alt">OI</span>
              <div>
                <strong>{dispute.job.artisan}</strong>
                <small>{dispute.job.artisanTrade} · Master Guild Member</small>
              </div>
            </div>
          </section>

          <section className="rw-card rw-money-card">
            <p className="rw-eyebrow">CONTESTED ESCROW BREAKDOWN</p>
            <h2>{formatNaira(dispute.job.totalKobo)}</h2>
            <dl>
              <div>
                <dt>Deposit (Held in Escrow)</dt>
                <dd>{formatNaira(dispute.job.depositKobo)}</dd>
              </div>
              <div>
                <dt>Balance Milestone</dt>
                <dd>{formatNaira(dispute.job.balanceKobo)}</dd>
              </div>
            </dl>
            <p className="rw-caution">
              <Info size={16} /> Escrow freeze active on Paystack mock gateway.
            </p>
          </section>

          <section className="rw-card rw-admin-actions">
            <p className="rw-eyebrow">RECORD RESOLUTION</p>
            <h2>Formal Next Step</h2>
            <p>
              Simulate mediator determination workflows. Real outcomes require dual sign-off
              and server-side authorization.
            </p>
            <button
              className="button button-outline rw-full"
              type="button"
              disabled={pending}
              onClick={() => previewAction("request-info")}
            >
              {pending ? "Checking…" : "Preview request for information"}
            </button>
            <button
              className="button button-primary rw-full"
              type="button"
              disabled={pending}
              onClick={() => previewAction("continue-review")}
            >
              {pending ? "Checking…" : "Preview continue review"}
            </button>
            <div className="rw-policy-line">
              <ShieldAlert size={16} />
              <span>No live payment reversal or financial mutation will occur.</span>
            </div>
          </section>

          <Link className="button button-subtle rw-full" href="/admin/disputes">
            <ArrowLeft size={16} /> Return to Queue
          </Link>
        </aside>
      </div>
    </div>
  );
}
