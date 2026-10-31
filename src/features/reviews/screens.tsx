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
  ImagePlus,
  Info,
  MessageSquareText,
  Paperclip,
  Scale,
  Search,
  Send,
  ShieldAlert,
  Star,
  Upload,
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
const categories: readonly DisputeCategory[] = [
  "Incomplete work",
  "Defective workmanship",
  "Unprofessional conduct",
  "Pricing discrepancy",
];

function useJob(jobId: string) {
  const [job, setJob] = useState<DemoJob | null>(null);
  useEffect(() => {
    let active = true;
    void reviewsDemoService.getJob(jobId).then((record) => {
      if (active) setJob(record);
    });
    return () => {
      active = false;
    };
  }, [jobId]);
  return job;
}

function useDispute(disputeId: string) {
  const [dispute, setDispute] = useState<DemoDispute | null>(null);
  useEffect(() => {
    let active = true;
    void reviewsDemoService.getDispute(disputeId).then((record) => {
      if (active) setDispute(record);
    });
    return () => {
      active = false;
    };
  }, [disputeId]);
  return dispute;
}

function PageTitle({
  eyebrow,
  title,
  description,
  backHref,
  backText = "Back to jobs",
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backText?: string;
}) {
  return (
    <div className="rw-page-title">
      {backHref && (
        <Link className="rw-back" href={backHref}>
          <ArrowLeft size={17} aria-hidden="true" /> {backText}
        </Link>
      )}
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

function JobCard({ job, compact = false }: { job: DemoJob; compact?: boolean }) {
  return (
    <section className={`rw-job-card${compact ? " rw-job-card-compact" : ""}`}>
      <div className="rw-job-identity">
        <div className="rw-avatar" aria-hidden="true">OI</div>
        <div className="rw-job-name">
          <p className="rw-kicker">COMPLETED SERVICE · #{job.reference}</p>
          <h2>{job.artisan}</h2>
          <span>{job.artisanTrade} <i aria-hidden="true">·</i> {job.area}</span>
        </div>
      </div>
      <div className="rw-job-description">
        <span className="rw-label">Job</span>
        <p>{job.title}</p>
      </div>
      <div className="rw-job-amount">
        <span className="rw-label">Agreed total</span>
        <strong>{formatNaira(job.totalKobo)}</strong>
        <span>Completed {job.completedOn}</span>
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

function ResultBanner({
  tone,
  children,
}: {
  tone: "success" | "error" | "info";
  children: React.ReactNode;
}) {
  const IconComponent = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;
  return (
    <div className={`rw-result rw-result-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <IconComponent size={19} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

export function ReviewScreen({ jobId }: { jobId: string }) {
  const job = useJob(jobId);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [simulateUnavailable, setSimulateUnavailable] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof reviewsDemoService.submitReview>> | null>(null);
  if (!job) return <div className="rw-page"><LoadingCard label="completed job" /></div>;

  function toggleTag(tag: ReviewTag) {
    setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const response = await reviewsDemoService.submitReview({ rating, text, tags, simulateUnavailable });
    setResult(response);
    setSimulateUnavailable(false);
    setPending(false);
  }

  return (
    <div className="rw-page">
      <PageTitle
        eyebrow="S31 · CUSTOMER REVIEW"
        title="Rate your experience"
        description="Share practical feedback about the completed work. Your preview helps you see how a review form behaves."
      />
      <DemoNotice>Reviews are not submitted or published from this page. Real review eligibility and storage are backend work.</DemoNotice>
      <JobCard job={job} />
      <div className="rw-review-layout">
        <form className="rw-card rw-review-form" onSubmit={submit}>
          <div className="rw-section-head">
            <div>
              <p className="rw-eyebrow">YOUR FEEDBACK</p>
              <h2>Leave a review</h2>
            </div>
            <span className="rw-required"><b aria-hidden="true">*</b> Required</span>
          </div>
          <fieldset className="rw-fieldset" disabled={pending}>
            <legend>Overall rating <span aria-hidden="true">*</span></legend>
              <div className="rw-stars" role="group" aria-label="Overall rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={rating === value}
                  aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                  className={`rw-star${rating >= value ? " is-selected" : ""}`}
                  onClick={() => { setRating(value); setResult(null); }}
                >
                  <Star size={28} fill={rating >= value ? "currentColor" : "none"} aria-hidden="true" />
                </button>
              ))}
              <span className="rw-rating-copy">{rating ? `${rating} out of 5` : "Choose a rating"}</span>
            </div>
          </fieldset>
          <fieldset className="rw-fieldset">
            <legend>What went well?</legend>
            <div className="rw-chips">
              {tagOptions.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  aria-pressed={tags.includes(tag)}
                  className={`rw-chip${tags.includes(tag) ? " is-active" : ""}`}
                  onClick={() => { toggleTag(tag); setResult(null); }}
                >
                  {tags.includes(tag) && <Check size={14} aria-hidden="true" />}{tag}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="rw-field">
            <div className="rw-field-label-row">
              <label htmlFor="review-feedback">Detailed feedback <span aria-hidden="true">*</span></label>
              <span>{text.length}/500</span>
            </div>
            <textarea
              id="review-feedback"
              value={text}
              maxLength={500}
              rows={5}
              placeholder={`Describe the quality of work, timing and your experience with ${job.artisan}…`}
              onChange={(event) => { setText(event.target.value); setResult(null); }}
              aria-describedby="review-helper"
            />
            <p id="review-helper" className="rw-help">Use specific, respectful details. At least 10 characters.</p>
          </div>
          {result && !result.ok && <ResultBanner tone="error">{result.message}</ResultBanner>}
          {result?.ok && <ResultBanner tone="success">{result.message}</ResultBanner>}
          <details className="rw-preview-state"><summary>Preview a recoverable error</summary><p>This local state checks that a failed response keeps the form values.</p><button type="button" className="rw-button rw-button-outline" onClick={() => setSimulateUnavailable(true)}>Simulate the next request failing</button></details>
          <div className="rw-actions">
            <Link className="rw-button rw-button-quiet" href="/"><ArrowLeft size={17} /> Return to SabiWork</Link>
            <button className="rw-button rw-button-primary" type="submit" disabled={pending}>
              {pending ? <><span className="rw-spinner rw-spinner-light" /> Checking preview…</> : <>Preview review <ArrowRight size={17} /></>}
            </button>
          </div>
        </form>
        <aside className="rw-side-stack">
          <section className="rw-card rw-guidance">
            <div className="rw-card-icon"><MessageSquareText size={19} /></div>
            <h2>Helpful feedback</h2>
            <p>Keep your review about the service. Clear details help other customers understand what to expect.</p>
            <ul>
              <li>Describe the result and workmanship.</li>
              <li>Mention timing or communication when useful.</li>
              <li>Avoid private contact or payment information.</li>
            </ul>
          </section>
          <Link className="rw-button rw-button-outline rw-full" href={`/jobs/${encodeURIComponent(job.id)}/dispute`}><ShieldAlert size={16} /> Report a job issue</Link>
          <section className="rw-policy-card">
            <ShieldAlert size={19} />
            <div><strong>Review policy</strong><p>Submission rules and moderation will be enforced by the backend.</p></div>
          </section>
        </aside>
      </div>
    </div>
  );
}

type EvidenceFile = { id: string; name: string; size: number; url: string; type: string };
function EvidencePicker({ files, onAdd, onRemove }: { files: EvidenceFile[]; onAdd: (items: EvidenceFile[]) => void; onRemove: (id: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setUploadError("");
    const available = Math.max(0, 4 - files.length);
    const accepted: EvidenceFile[] = [];
    const failures: string[] = [];
    Array.from(fileList).slice(0, available).forEach((file) => {
      if (!(file.type.startsWith("image/") || file.type === "application/pdf")) failures.push(`${file.name}: choose an image or PDF.`);
      else if (file.size > 10 * 1024 * 1024) failures.push(`${file.name}: file must be 10 MB or smaller.`);
      else accepted.push({ id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, name: file.name, size: file.size, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "", type: file.type });
    });
    if (accepted.length) onAdd(accepted);
    if (failures.length) setUploadError(failures.join(" "));
    if (fileList.length > available) setUploadError((current) => `${current}${current ? " " : ""}You can attach up to four files.`);
    if (input.current) input.current.value = "";
  }
  return (
    <div className="rw-evidence">
      <input ref={input} className="rw-file-input" id="dispute-evidence" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple onChange={(event) => addFiles(event.currentTarget.files)} aria-describedby="evidence-help evidence-error" />
      <label className="rw-dropzone" htmlFor="dispute-evidence">
        <span className="rw-upload-icon"><Upload size={19} /></span>
        <span><strong>Add evidence files</strong><small>JPG, PNG, WebP or PDF · up to 10 MB each · maximum 4 files</small></span>
        <span className="rw-button rw-button-outline">Choose files</span>
      </label>
      <p id="evidence-help" className="rw-help">Use photos that relate directly to the issue. This local preview does not upload files to a server.</p>
      {uploadError && <p id="evidence-error" className="rw-inline-error" role="alert">{uploadError}</p>}
      {files.length > 0 && (
        <ul className="rw-file-list" aria-label="Selected evidence files">
          {files.map((file) => (
            <li key={file.id} className="rw-file-item">
              {file.url ? <Image src={file.url} alt={`Preview of ${file.name}`} width={42} height={42} unoptimized /> : <span className="rw-file-icon"><FileText size={21} /></span>}
              <span className="rw-file-info"><strong title={file.name}>{file.name}</strong><small>{(file.size / (1024 * 1024)).toFixed(1)} MB · {file.type === "application/pdf" ? "PDF" : "Image"}</small></span>
              <button className="rw-icon-button" type="button" aria-label={`Remove ${file.name}`} onClick={() => onRemove(file.id)}><X size={17} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DisputeFormScreen({ jobId }: { jobId: string }) {
  const job = useJob(jobId);
  const [category, setCategory] = useState<DisputeCategory>("Incomplete work");
  const [milestone, setMilestone] = useState<"Deposit" | "Balance">("Deposit");
  const [summary, setSummary] = useState("");
  const [resolution, setResolution] = useState("Ask the artisan to review the issue");
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [pending, setPending] = useState(false);
  const [simulateUnavailable, setSimulateUnavailable] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof reviewsDemoService.submitDispute>> | null>(null);
  const filesRef = useRef(files);
  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => () => filesRef.current.forEach((file) => { if (file.url) URL.revokeObjectURL(file.url); }), []);
  if (!job) return <div className="rw-page"><LoadingCard label="job details" /></div>;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const response = await reviewsDemoService.submitDispute({ category, milestone, summary, evidenceCount: files.length, resolution, simulateUnavailable });
    setResult(response);
    setSimulateUnavailable(false);
    setPending(false);
  }
  return (
    <div className="rw-page">
      <PageTitle eyebrow="S32 · CUSTOMER DISPUTE" title="Report a job issue" description="Describe what happened and add relevant evidence. A real case requires server-side review and access checks." />
      <DemoNotice>This page only previews the report flow. It does not create a case, freeze funds, issue a refund, or contact the artisan.</DemoNotice>
      <JobCard job={job} compact />
      <div className="rw-dispute-layout">
        <form className="rw-card rw-dispute-form" onSubmit={submit}>
          <div className="rw-section-head"><div><p className="rw-eyebrow">CASE DETAILS</p><h2>Tell us what went wrong</h2></div><span className="rw-step-count">4 steps</span></div>
          <fieldset className="rw-fieldset">
            <legend><span className="rw-step-number">1</span> Choose an issue type</legend>
            <div className="rw-choice-grid">
              {categories.map((item) => (
                <label className={`rw-choice${category === item ? " is-selected" : ""}`} key={item}>
                  <input type="radio" name="category" value={item} checked={category === item} onChange={() => { setCategory(item); setResult(null); }} />
                  <span className="rw-choice-mark" aria-hidden="true">{category === item && <Check size={14} />}</span>
                  <span><strong>{item}</strong><small>{item === "Incomplete work" ? "Some agreed work is unfinished" : item === "Defective workmanship" ? "The result needs attention" : item === "Unprofessional conduct" ? "A concern about the service interaction" : "The amount or agreed price differs"}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="rw-fieldset">
            <legend><span className="rw-step-number">2</span> Select the related milestone</legend>
            <div className="rw-milestone-list">
              {(["Deposit", "Balance"] as const).map((item) => (
                <label className={`rw-milestone${milestone === item ? " is-selected" : ""}`} key={item}>
                  <input type="radio" name="milestone" value={item} checked={milestone === item} onChange={() => { setMilestone(item); setResult(null); }} />
                  <span className="rw-choice-mark" aria-hidden="true">{milestone === item && <Check size={14} />}</span>
                  <span><strong>{item}</strong><small>{formatNaira(item === "Deposit" ? job.depositKobo : job.balanceKobo)} · demonstration amount</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="rw-field">
            <div className="rw-field-label-row"><label htmlFor="dispute-summary"><span className="rw-step-number">3</span> Describe the issue <span aria-hidden="true">*</span></label><span>{summary.length}/1000</span></div>
            <textarea id="dispute-summary" rows={5} maxLength={1000} value={summary} onChange={(event) => { setSummary(event.target.value); setResult(null); }} placeholder="Describe the work agreed, what happened and when you noticed the issue…" aria-describedby="dispute-description-help" />
            <p id="dispute-description-help" className="rw-help">Include clear facts and avoid sharing private payment or contact information.</p>
          </div>
          <div className="rw-field">
            <div className="rw-field-label-row"><label htmlFor="dispute-evidence"><span className="rw-step-number">4</span> Add evidence</label><span>Optional, recommended</span></div>
            <EvidencePicker files={files} onAdd={(items) => { setFiles((current) => [...current, ...items]); setResult(null); }} onRemove={(id) => { setFiles((current) => current.filter((file) => file.id !== id)); setResult(null); }} />
          </div>
          <fieldset className="rw-fieldset">
            <legend>What would help resolve this?</legend>
            <label className="rw-select-label" htmlFor="preferred-next-step">Preferred next step</label>
            <div className="rw-select-wrap"><select id="preferred-next-step" value={resolution} onChange={(event) => { setResolution(event.target.value); setResult(null); }}><option>Ask the artisan to review the issue</option><option>Discuss a completion plan</option><option>Ask for a neutral review</option></select><ChevronDown size={17} aria-hidden="true" /></div>
          </fieldset>
          {result && !result.ok && <ResultBanner tone="error">{result.message}</ResultBanner>}
          {result?.ok && <ResultBanner tone="success">{result.message} <Link href={`/disputes/demo-dispute-01`}>View sample dispute status</Link></ResultBanner>}
          <details className="rw-preview-state"><summary>Preview a recoverable error</summary><p>This local state checks that the report and selected evidence stay available after failure.</p><button type="button" className="rw-button rw-button-outline" onClick={() => setSimulateUnavailable(true)}>Simulate the next request failing</button></details>
          <div className="rw-actions rw-actions-end">
            <Link className="rw-button rw-button-quiet" href="/"><ArrowLeft size={17} /> Cancel</Link>
            <button className="rw-button rw-button-primary" type="submit" disabled={pending}>{pending ? <><span className="rw-spinner rw-spinner-light" /> Checking preview…</> : <>Preview report <ArrowRight size={17} /></>}</button>
          </div>
          <p className="rw-fineprint">Submitting a real dispute may affect job workflows. Server policy, eligibility and evidence storage are not implemented in this frontend.</p>
        </form>
        <aside className="rw-side-stack">
          <section className="rw-card rw-money-card"><p className="rw-eyebrow">JOB AMOUNTS · DEMO</p><h2>{formatNaira(job.totalKobo)}</h2><dl><div><dt>Deposit</dt><dd>{formatNaira(job.depositKobo)}</dd></div><div><dt>Balance</dt><dd>{formatNaira(job.balanceKobo)}</dd></div></dl><p className="rw-caution"><Info size={16} /> These are sample figures. No funds are being held or changed.</p></section>
          <section className="rw-card rw-guidance"><div className="rw-card-icon"><Scale size={19} /></div><h2>What happens next?</h2><ol className="rw-mini-steps"><li><span>1</span><p>Details and supporting information are reviewed.</p></li><li><span>2</span><p>Both participants may be asked for relevant context.</p></li><li><span>3</span><p>Any real next step follows the agreed case process.</p></li></ol></section>
          <section className="rw-policy-card"><CircleHelp size={19} /><div><strong>Need help?</strong><p>Support contact details will be connected with the shared support flow.</p></div></section>
        </aside>
      </div>
    </div>
  );
}

const statusChoices: readonly DisputeViewStatus[] = ["Under review", "Awaiting information", "Resolved"];
export function DisputeStatusScreen({ disputeId }: { disputeId: string }) {
  const dispute = useDispute(disputeId);
  const [status, setStatus] = useState<DisputeViewStatus>("Under review");
  const [note, setNote] = useState("");
  const [simulateUnavailable, setSimulateUnavailable] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const noteFile = useRef<HTMLInputElement>(null);
  const data = dispute;
  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox]);
  if (!data) return <div className="rw-page"><LoadingCard label="dispute details" /></div>;
  async function sendNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const response = await reviewsDemoService.submitParticipantNote(note, simulateUnavailable);
    setNotice(response.message);
    setSimulateUnavailable(false);
    setPending(false);
    if (response.ok) setNote("");
  }
  return (
    <div className="rw-page rw-status-page">
      <PageTitle eyebrow="S33 · CUSTOMER DISPUTE" title="Dispute status" description="Follow the sample case steps and add information to the local demonstration." backHref={`/jobs/${encodeURIComponent(data.job.id)}/dispute`} backText="Back to report form" />
      <DemoNotice>This sample case does not represent an actual submission, account, payment hold or resolution decision.</DemoNotice>
      <div className="rw-status-controls" aria-label="Preview status states">
        <span>Preview state</span>
        {statusChoices.map((choice) => <button type="button" key={choice} aria-pressed={status === choice} onClick={() => setStatus(choice)}>{choice}</button>)}
      </div>
      <section className="rw-case-hero">
        <div className="rw-case-main"><span className={`rw-status-pill rw-status-${status.toLowerCase().replaceAll(" ", "-")}`}><span />{status}{status === "Resolved" ? " · preview" : ""}</span><h2>{data.job.title}</h2><p>Case #{data.id} <i aria-hidden="true">·</i> Opened {data.openedOn}</p></div>
        <div className="rw-case-amount"><span className="rw-label">Related amount</span><strong>{formatNaira(data.job.depositKobo)}</strong><small>Sample job amount · not held</small></div>
      </section>
      {status !== "Under review" && <ResultBanner tone={status === "Resolved" ? "success" : "info"}>{status === "Resolved" ? "Resolved is a display preview only; no outcome or payment was changed." : "Awaiting information is a display preview only; no request was sent."}</ResultBanner>}
      <div className="rw-status-grid">
        <div className="rw-main-stack">
          <section className="rw-card rw-case-overview"><div className="rw-section-head"><div><p className="rw-eyebrow">CASE SUMMARY</p><h2>Issue and evidence</h2></div><span className="rw-category-pill">{data.category}</span></div><blockquote>{data.summary}</blockquote><div className="rw-evidence-heading"><strong>Evidence attached in the sample</strong><span>{data.evidence.length} files</span></div><div className="rw-evidence-cards">{data.evidence.map((item, index) => <article className="rw-evidence-card" key={item.id}><div className={`rw-evidence-image rw-evidence-image-${index + 1}`}><span>{index === 0 ? <ImagePlus size={27} /> : <FileText size={27} />}</span><button type="button" aria-label={`Preview ${item.name}`} onClick={() => setLightbox(item.name)}><ZoomIn size={18} /></button></div><div><strong>{item.name}</strong><small>{item.caption}</small></div></article>)}</div></section>
          <section className="rw-card rw-timeline"><div className="rw-section-head"><div><p className="rw-eyebrow">CASE ACTIVITY</p><h2>Review timeline</h2></div><span className="rw-step-count">Step 3 of 4</span></div><ol className="rw-timeline-list">{data.timeline.map((item, index) => <li className={`rw-timeline-item is-${item.state}`} key={item.title}><span className="rw-timeline-dot">{item.state === "complete" ? <Check size={14} /> : item.state === "current" ? <Clock3 size={15} /> : index + 1}</span><div><div className="rw-timeline-head"><strong>{item.title}</strong><time>{item.time}</time></div><p>{item.detail}</p></div></li>)}</ol><p className="rw-fineprint">Timeline details are fictional sample content for the screen preview.</p></section>
          <section className="rw-card rw-response-card"><button className="rw-accordion-toggle" type="button" aria-expanded={noteOpen} onClick={() => setNoteOpen((value) => !value)}><span className="rw-card-icon"><MessageSquareText size={19} /></span><span><strong>Add information</strong><small>Write a note or attach a reference file</small></span><ChevronDown className={noteOpen ? "is-open" : ""} size={19} /></button>{noteOpen && <form className="rw-response-form" onSubmit={sendNote}><label htmlFor="participant-note">Your note</label><textarea id="participant-note" rows={4} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Share additional facts that may help explain the issue…"/><input ref={noteFile} className="rw-file-input" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 4).map((file) => file.name))}/><div className="rw-response-bottom"><button className="rw-button rw-button-outline" type="button" onClick={() => noteFile.current?.click()}><Paperclip size={16} /> Attach file</button><span>{files.length ? files.join(", ") : "JPG, PNG, PDF · max 10 MB"}</span></div><details className="rw-preview-state"><summary>Preview a recoverable error</summary><p>The note remains in the field if the response fails.</p><button type="button" className="rw-button rw-button-outline" onClick={() => setSimulateUnavailable(true)}>Simulate the next request failing</button></details><button className="rw-button rw-button-primary" type="submit" disabled={pending}>{pending ? "Checking preview…" : <>Submit note preview <Send size={16} /></>}</button>{notice && <ResultBanner tone="info">{notice}</ResultBanner>}</form>}</section>
        </div>
        <aside className="rw-side-stack"><JobCard job={data.job} compact /><section className="rw-card rw-guidance"><div className="rw-card-icon"><Scale size={19} /></div><h2>Fair review process</h2><p>Each side can provide relevant information. Any decision must follow the shared case policy once connected.</p><div className="rw-policy-line"><Info size={17} /><span>No automatic refund or payment release is represented here.</span></div></section><Link className="rw-button rw-button-dark rw-full" href={`/jobs/${encodeURIComponent(data.job.id)}/dispute`}><ArrowLeft size={16}/> Return to dispute form</Link></aside>
      </div>
      {lightbox && <div className="rw-lightbox" role="dialog" aria-modal="true" aria-label={`Evidence preview: ${lightbox}`} onClick={() => setLightbox(null)}><button type="button" className="rw-icon-button rw-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close preview"><X size={20}/></button><div className="rw-lightbox-content" onClick={(event) => event.stopPropagation()}><div className="rw-evidence-placeholder"><ImagePlus size={44}/><strong>Sample evidence preview</strong><span>{lightbox}</span></div><p>{data.evidence.find((item) => item.name === lightbox)?.caption}</p></div></div>}
    </div>
  );
}

export function AdminDisputeQueueScreen() {
  const [disputes, setDisputes] = useState<readonly DemoDispute[] | null>(null);
  const [filter, setFilter] = useState("All cases");
  const [query, setQuery] = useState("");
  useEffect(() => { let active = true; void reviewsDemoService.listDisputes().then((items) => { if (active) setDisputes(items); }); return () => { active = false; }; }, []);
  const filtered = useMemo(() => (disputes ?? []).filter((item) => {
    const matchesStatus = filter === "All cases" || (filter === "Under review" && item.status === "Under review") || (filter === "Awaiting information" && item.status === "Awaiting information") || (filter === "Resolved" && item.status === "Resolved");
    const normalized = query.trim().toLowerCase();
    const matchesText = !normalized || [item.id, item.job.reference, item.job.title, item.job.artisan, item.category].some((value) => value.toLowerCase().includes(normalized));
    return matchesStatus && matchesText;
  }), [disputes, filter, query]);
  return (
    <div className="rw-page rw-admin-page">
      <PageTitle eyebrow="S34 · ADMIN DISPUTES" title="Dispute queue" description="Review the sample reports and open a case detail. This queue is a local UI preview, not an access-controlled admin tool." />
      <DemoNotice>The current admin shell is a presentation scaffold. Server-side admin authentication, case privacy and actions are pending.</DemoNotice>
      <div className="rw-queue-metrics"><div><span>Sample cases</span><strong>{disputes?.length ?? "—"}</strong></div><div><span>Under review</span><strong>{disputes?.filter((item) => item.status === "Under review").length ?? "—"}</strong></div><div><span>Awaiting information</span><strong>{disputes?.filter((item) => item.status === "Awaiting information").length ?? "—"}</strong></div><div><span>Resolved</span><strong>{disputes?.filter((item) => item.status === "Resolved").length ?? "—"}</strong></div></div>
      <section className="rw-card rw-queue-card"><div className="rw-queue-heading"><div><p className="rw-eyebrow">CASE MANAGEMENT · DEMO DATA</p><h2>Reported issues</h2></div><label className="rw-search"><Search size={17} aria-hidden="true"/><span className="sr-only">Search disputes</span><input aria-label="Search disputes" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search case, job or artisan" /></label></div><div className="rw-filter-row" role="group" aria-label="Filter disputes by status">{["All cases", ...statusChoices].map((item) => <button type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>{disputes === null ? <LoadingCard label="sample cases" /> : filtered.length === 0 ? <div className="rw-empty-state"><span><Search size={22}/></span><h3>No cases match this view</h3><p>Try a different status or search term.</p><button type="button" className="rw-button rw-button-outline" onClick={() => { setFilter("All cases"); setQuery(""); }}>Clear filters</button></div> : <><div className="rw-case-table-head"><span>CASE / JOB</span><span>ISSUE TYPE</span><span>STATUS</span><span>OPENED</span><span></span></div><div className="rw-case-rows">{filtered.map((item) => <Link className="rw-case-row" href={`/admin/disputes/${encodeURIComponent(item.id)}`} key={item.id}><span className="rw-case-ref"><strong>#{item.id}</strong><small>Job #{item.job.reference} · {item.job.artisan}</small><em>{item.job.title}</em></span><span className="rw-case-type"><span className="rw-category-pill">{item.category}</span></span><span className="rw-case-status"><span className={`rw-status-pill rw-status-${item.status.toLowerCase().replaceAll(" ", "-")}`}><span />{item.status}</span></span><span className="rw-case-date">{item.openedOn.split(" · ")[0]}</span><span className="rw-row-action">View case <ArrowRight size={16}/></span></Link>)}</div></>}</section>
      <p className="rw-fineprint rw-admin-fineprint">Fictional sample records only. No real customers, identity data, or production case state is available.</p>
    </div>
  );
}

export function AdminDisputeDetailScreen({ disputeId }: { disputeId: string }) {
  const dispute = useDispute(disputeId);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  if (!dispute) return <div className="rw-page"><LoadingCard label="case details" /></div>;
  async function previewAction(action: "request-info" | "continue-review") {
    if (pending) return;
    setPending(true);
    const response = await reviewsDemoService.previewAdminAction(action);
    setNotice(response.message);
    setPending(false);
  }
  return (
    <div className="rw-page rw-admin-page">
      <PageTitle eyebrow="S35 · ADMIN CASE REVIEW" title="Review dispute" description="Inspect the sample case record and preview the available admin actions." backHref="/admin/disputes" backText="Back to dispute queue" />
      <DemoNotice>These controls are interaction previews. They do not change a dispute or enforce administrator access.</DemoNotice>
      <section className="rw-case-hero rw-admin-case-hero"><div className="rw-case-main"><span className="rw-status-pill rw-status-under-review"><span />Under review · sample</span><h2>{dispute.job.title}</h2><p>Case #{dispute.id} <i aria-hidden="true">·</i> Job #{dispute.job.reference}</p></div><div className="rw-case-amount"><span className="rw-label">Opened</span><strong className="rw-date-amount">{dispute.openedOn.split(" · ")[0]}</strong><small>Local demonstration record</small></div></section>
      {notice && <ResultBanner tone="info">{notice}</ResultBanner>}
      <div className="rw-admin-detail-grid">
        <div className="rw-main-stack">
          <section className="rw-card rw-case-overview"><div className="rw-section-head"><div><p className="rw-eyebrow">CUSTOMER REPORT</p><h2>Issue and evidence</h2></div><span className="rw-category-pill">{dispute.category}</span></div><div className="rw-detail-pair"><span className="rw-label">Related milestone</span><strong>{dispute.milestone} · {formatNaira(dispute.job.depositKobo)}</strong></div><blockquote>{dispute.summary}</blockquote><div className="rw-evidence-heading"><strong>Submitted evidence · sample</strong><span>{dispute.evidence.length} files</span></div><div className="rw-evidence-cards">{dispute.evidence.map((item, index) => <article className="rw-evidence-card" key={item.id}><div className={`rw-evidence-image rw-evidence-image-${index + 1}`}><span>{index === 0 ? <ImagePlus size={27}/> : <FileText size={27}/>}</span><span className="rw-evidence-label">Preview only</span></div><div><strong>{item.name}</strong><small>{item.caption}</small></div></article>)}</div></section>
          <section className="rw-card rw-timeline"><div className="rw-section-head"><div><p className="rw-eyebrow">CASE HISTORY</p><h2>Activity timeline</h2></div></div><ol className="rw-timeline-list">{dispute.timeline.map((item) => <li className={`rw-timeline-item is-${item.state}`} key={item.title}><span className="rw-timeline-dot">{item.state === "complete" ? <Check size={14}/> : item.state === "current" ? <Clock3 size={15}/> : <span aria-label="Pending">4</span>}</span><div><div className="rw-timeline-head"><strong>{item.title}</strong><time>{item.time}</time></div><p>{item.detail}</p></div></li>)}</ol></section>
          <section className="rw-card rw-admin-note"><div className="rw-section-head"><div><p className="rw-eyebrow">ADMIN WORKSPACE</p><h2>Review note</h2></div></div><label htmlFor="admin-note">Private note draft</label><textarea id="admin-note" rows={4} maxLength={1000} value={internalNote} onChange={(event) => { setInternalNote(event.target.value); setNoteSaved(false); }} placeholder="Record what needs to be checked before any real case action…"/><p className="rw-help">This draft stays in the current page only; it is not a confidential or saved admin note.</p><button type="button" className="rw-button rw-button-outline" onClick={() => setNoteSaved(Boolean(internalNote.trim()))} disabled={!internalNote.trim()}>Preview note</button>{noteSaved && <ResultBanner tone="info">Note preview visible in this page only. It has not been saved.</ResultBanner>}</section>
        </div>
        <aside className="rw-side-stack"><section className="rw-card rw-participants"><p className="rw-eyebrow">PARTICIPANTS · FICTIONAL</p><h2>People involved</h2><div className="rw-person-row"><span className="rw-avatar">AO</span><div><strong>Ada Okafor</strong><small>Customer · sample profile</small></div></div><div className="rw-person-row"><span className="rw-avatar rw-avatar-alt">OI</span><div><strong>{dispute.job.artisan}</strong><small>{dispute.job.artisanTrade} · sample profile</small></div></div></section><section className="rw-card rw-money-card"><p className="rw-eyebrow">JOB AMOUNTS · DEMO</p><h2>{formatNaira(dispute.job.totalKobo)}</h2><dl><div><dt>Deposit</dt><dd>{formatNaira(dispute.job.depositKobo)}</dd></div><div><dt>Balance</dt><dd>{formatNaira(dispute.job.balanceKobo)}</dd></div></dl><p className="rw-caution"><Info size={16}/> No payment or escrow state is represented.</p></section><section className="rw-card rw-admin-actions"><p className="rw-eyebrow">PREVIEW ACTIONS</p><h2>Next step</h2><p>Use the sample controls to see feedback. A real action must follow approved policy and server authorization.</p><button className="rw-button rw-button-outline rw-full" type="button" disabled={pending} onClick={() => previewAction("request-info")}>{pending ? "Checking…" : "Preview request for information"}</button><button className="rw-button rw-button-primary rw-full" type="button" disabled={pending} onClick={() => previewAction("continue-review")}>{pending ? "Checking…" : "Preview continue review"}</button><div className="rw-policy-line"><ShieldAlert size={17}/><span>No refund, payment release, or final decision is available in this demo.</span></div></section><Link className="rw-button rw-button-quiet rw-full" href="/admin/disputes"><ArrowLeft size={16}/> Return to queue</Link></aside>
      </div>
    </div>
  );
}

