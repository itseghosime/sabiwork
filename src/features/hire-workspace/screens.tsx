"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import "./screens.css";

type RequestRow = {
  id: string;
  title: string;
  category: string;
  service_area: string;
  description: string;
  budget_guidance_kobo: number;
  status: "draft" | "submitted" | "matching" | "cancelled";
  created_at: string;
  updated_at?: string;
};

type QuoteRow = {
  id: string;
  request_id: string;
  worker_id: string;
  worker_name: string;
  total_kobo: number;
  note: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

type JobRow = {
  id: string;
  request_id: string;
  status: "accepted" | "in_progress" | "completed" | "cancelled";
  customer_id: string;
  worker_id: string;
  title: string;
  category: string;
  service_area: string;
  description?: string;
  budget_guidance_kobo: number;
  total_quote_kobo: number;
  quote_note?: string;
  updates?: Array<{ id: string; author_id: string; note: string; created_at: string }>;
  review?: { id: string; rating: number; comment: string; created_at: string } | null;
  created_at: string;
  updated_at: string;
};

type ApiError = { error?: { code?: string; message?: string } };

const formatMoney = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);

const formatWat = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error?.message ?? "Request failed.");
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

function StatusPill({ text }: { text: string }) {
  return <span className="hire-status-pill">{text.replaceAll("_", " ")}</span>;
}

function PageFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="hire-page">
      <header className="hire-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

export function RequestComposerScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [budgetNaira, setBudgetNaira] = useState("30000");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"draft" | "submitted" | null>(null);

  const submit = async (event: FormEvent, status: "draft" | "submitted") => {
    event.preventDefault();
    setSaving(status);
    setError(null);

    const payload = {
      title,
      category,
      service_area: area,
      description,
      budget_guidance_kobo: Math.round(Number(budgetNaira || "0") * 100),
      status,
    };

    try {
      const saved = await readJson<RequestRow>("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.push(`/requests/${saved.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save request.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <PageFrame
      title="Create a service request"
      subtitle="Describe the work clearly so artisans can quote accurately. Amounts are saved in NGN kobo."
    >
      <form className="hire-form" onSubmit={(event) => submit(event, "draft")}>
        <label>
          Request title
          <input required minLength={3} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Category
          <input required minLength={2} maxLength={80} value={category} onChange={(event) => setCategory(event.target.value)} />
        </label>
        <label>
          Service area
          <input required minLength={2} maxLength={100} value={area} onChange={(event) => setArea(event.target.value)} />
        </label>
        <label>
          Budget (NGN)
          <input required type="number" min={0} step={1} value={budgetNaira} onChange={(event) => setBudgetNaira(event.target.value)} />
        </label>
        <label>
          Job description
          <textarea required minLength={20} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} rows={6} />
        </label>
        {error ? <p className="hire-error" role="alert">{error}</p> : null}
        <div className="hire-actions">
          <button className="button button-outline" type="submit" disabled={saving !== null}>
            {saving === "draft" ? "Saving draft..." : "Save draft"}
          </button>
          <button className="button button-primary" type="button" disabled={saving !== null} onClick={(event) => void submit(event, "submitted")}>
            {saving === "submitted" ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </form>
    </PageFrame>
  );
}

export function RequestDetailScreen({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<RequestRow | null>(null);
  const [quotesCount, setQuotesCount] = useState(0);
  const [state, setState] = useState<{ loading: boolean; error: string | null }>({ loading: true, error: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const [requestData, quotes] = await Promise.all([
        readJson<RequestRow>(`/api/requests/${requestId}`),
        readJson<QuoteRow[]>(`/api/requests/${requestId}/quotes`),
      ]);
      setRequest(requestData);
      setQuotesCount(quotes.length);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Could not load request." });
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateState = async (action: "submit" | "cancel") => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      await readJson(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await load();
    } catch (error) {
      setState((prev) => ({ ...prev, error: error instanceof Error ? error.message : "Could not update request." }));
    }
  };

  if (state.loading) return <PageFrame title="Request details" subtitle="Loading request..."><p>Loading...</p></PageFrame>;
  if (state.error || !request) return <PageFrame title="Request details" subtitle="Unable to load request."><p className="hire-error" role="alert">{state.error ?? "Request not found."}</p></PageFrame>;

  return (
    <PageFrame title={request.title} subtitle={`${request.category} · ${request.service_area}`}>
      <article className="hire-card">
        <div className="hire-inline"><StatusPill text={request.status} /><span>{quotesCount} quotes</span></div>
        <p>{request.description}</p>
        <p><strong>Budget:</strong> {formatMoney(request.budget_guidance_kobo)}</p>
        <p><strong>Created:</strong> {formatWat(request.created_at)}</p>
      </article>
      <div className="hire-actions">
        {request.status === "draft" ? <button className="button button-primary" type="button" onClick={() => void updateState("submit")}>Submit request</button> : null}
        {(request.status === "submitted" || request.status === "matching") ? <button className="button button-outline" type="button" onClick={() => void updateState("cancel")}>Cancel request</button> : null}
        <Link className="button button-subtle" href={`/requests/${request.id}/quotes`}>View quotes</Link>
        <Link className="button button-subtle" href={`/requests/${request.id}/compare`}>Compare quotes</Link>
      </div>
      {state.error ? <p className="hire-error" role="alert">{state.error}</p> : null}
    </PageFrame>
  );
}

export function RequestQuotesScreen({ requestId, compare }: { requestId: string; compare?: boolean }) {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [state, setState] = useState<{ loading: boolean; error: string | null }>({ loading: true, error: null });
  const [actioning, setActioning] = useState<string | null>(null);
  const [jobCreatedId, setJobCreatedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const rows = await readJson<QuoteRow[]>(`/api/requests/${requestId}/quotes`);
      setQuotes(rows);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Could not load quotes." });
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (quoteId: string, decision: "accept" | "decline") => {
    setActioning(quoteId);
    setState((prev) => ({ ...prev, error: null }));
    try {
      const result = await readJson<{ quote: QuoteRow; job: { id: string } } | QuoteRow>(`/api/quotes/${quoteId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (decision === "accept" && "job" in result) {
        setJobCreatedId(result.job.id);
      }
      await load();
    } catch (error) {
      setState((prev) => ({ ...prev, error: error instanceof Error ? error.message : "Could not process decision." }));
    } finally {
      setActioning(null);
    }
  };

  const sorted = useMemo(() => [...quotes].sort((a, b) => a.total_kobo - b.total_kobo), [quotes]);

  return (
    <PageFrame title={compare ? "Compare quotes" : "Request quotes"} subtitle="Review each quote before selecting a worker.">
      {state.loading ? <p>Loading quotes...</p> : null}
      {state.error ? <p className="hire-error" role="alert">{state.error}</p> : null}
      {!state.loading && !state.error && sorted.length === 0 ? (
        <p className="hire-empty">No quotes yet. Share time for artisans to respond.</p>
      ) : null}
      {jobCreatedId ? <p className="hire-success">Quote accepted. Job created: <Link href={`/jobs/${jobCreatedId}`}>open job</Link>.</p> : null}
      <div className="hire-list">
        {sorted.map((quote) => (
          <article key={quote.id} className="hire-card">
            <div className="hire-inline">
              <h2>{quote.worker_name}</h2>
              <StatusPill text={quote.status} />
            </div>
            <p><strong>Total:</strong> {formatMoney(quote.total_kobo)}</p>
            <p><strong>Deposit plan:</strong> {formatMoney(Math.floor(quote.total_kobo / 2))}</p>
            <p>{quote.note}</p>
            <div className="hire-actions">
              <Link className="button button-subtle" href={`/requests/${requestId}/quotes/${quote.id}`}>View details</Link>
              <button className="button button-primary" type="button" disabled={actioning === quote.id || quote.status !== "pending"} onClick={() => void decide(quote.id, "accept")}>Accept</button>
              <button className="button button-outline" type="button" disabled={actioning === quote.id || quote.status !== "pending"} onClick={() => void decide(quote.id, "decline")}>Decline</button>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

export function QuoteDetailScreen({ quoteId, requestId }: { quoteId: string; requestId?: string }) {
  const [quote, setQuote] = useState<QuoteRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void readJson<QuoteRow>(`/api/quotes/${quoteId}`)
      .then((data) => {
        if (active) {
          setQuote(data);
          setError(null);
        }
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load quote.");
      });
    return () => {
      active = false;
    };
  }, [quoteId]);

  if (error) return <PageFrame title="Quote details" subtitle="Unable to load quote."><p className="hire-error" role="alert">{error}</p></PageFrame>;
  if (!quote) return <PageFrame title="Quote details" subtitle="Loading quote..."><p>Loading...</p></PageFrame>;

  const requestPath = requestId ?? quote.request_id;

  return (
    <PageFrame title="Quote details" subtitle={`From ${quote.worker_name}`}>
      <article className="hire-card">
        <p><strong>Total:</strong> {formatMoney(quote.total_kobo)}</p>
        <p><strong>Status:</strong> {quote.status}</p>
        <p><strong>Submitted:</strong> {formatWat(quote.created_at)}</p>
        <p>{quote.note}</p>
      </article>
      <div className="hire-actions">
        <Link className="button button-primary" href={`/requests/${requestPath}/checkout/${quote.id}`}>Continue to checkout guidance</Link>
        <Link className="button button-outline" href={`/requests/${requestPath}/quotes`}>Back to quotes</Link>
      </div>
    </PageFrame>
  );
}

export function CheckoutNoticeScreen({ quoteId, requestId }: { quoteId: string; requestId: string }) {
  return (
    <PageFrame
      title="Checkout"
      subtitle="Payment integration is not available yet. Do not treat this as a confirmed payment or escrow step."
    >
      <article className="hire-card">
        <p>Quote reference: <strong>{quoteId}</strong></p>
        <p>Payment service is not available in this build yet, so deposits and balances are not processed here.</p>
      </article>
      <div className="hire-actions">
        <Link className="button button-subtle" href={`/requests/${requestId}/quotes/${quoteId}`}>Back to quote</Link>
      </div>
    </PageFrame>
  );
}

export function JobsListScreen() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [state, setState] = useState<{ loading: boolean; error: string | null }>({ loading: true, error: null });

  useEffect(() => {
    let active = true;
    void readJson<JobRow[]>("/api/jobs")
      .then((rows) => {
        if (!active) return;
        setJobs(rows);
        setState({ loading: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        setState({ loading: false, error: error instanceof Error ? error.message : "Could not load jobs." });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageFrame title="Jobs" subtitle="Track accepted quotes, progress, and completion status.">
      {state.loading ? <p>Loading jobs...</p> : null}
      {state.error ? <p className="hire-error" role="alert">{state.error}</p> : null}
      {!state.loading && !state.error && jobs.length === 0 ? <p className="hire-empty">No jobs yet. Accept a quote to create one.</p> : null}
      <div className="hire-list">
        {jobs.map((job) => (
          <article key={job.id} className="hire-card">
            <div className="hire-inline"><h2>{job.title}</h2><StatusPill text={job.status} /></div>
            <p>{job.category} · {job.service_area}</p>
            <p><strong>Total quote:</strong> {formatMoney(job.total_quote_kobo ?? job.budget_guidance_kobo)}</p>
            <div className="hire-actions">
              <Link className="button button-primary" href={`/jobs/${job.id}`}>Open job</Link>
              <Link className="button button-outline" href={`/jobs/${job.id}/progress`}>Progress</Link>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

export function JobDetailScreen({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void readJson<JobRow>(`/api/jobs/${jobId}`)
      .then((data) => {
        if (active) setJob(data);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load this job.");
      });
    return () => {
      active = false;
    };
  }, [jobId]);

  if (error) return <PageFrame title="Job details" subtitle="Unable to load job."><p className="hire-error" role="alert">{error}</p></PageFrame>;
  if (!job) return <PageFrame title="Job details" subtitle="Loading job..."><p>Loading...</p></PageFrame>;

  return (
    <PageFrame title={job.title} subtitle={`${job.category} · ${job.service_area}`}>
      <article className="hire-card">
        <div className="hire-inline"><StatusPill text={job.status} /><span>Updated {formatWat(job.updated_at)}</span></div>
        <p>{job.description}</p>
        <p><strong>Agreed quote:</strong> {formatMoney(job.total_quote_kobo ?? job.budget_guidance_kobo)}</p>
        <p><strong>Latest worker note:</strong> {job.updates?.at(-1)?.note ?? "No progress updates yet."}</p>
      </article>
      <div className="hire-actions">
        <Link className="button button-outline" href={`/jobs/${job.id}/progress`}>View progress</Link>
        <Link className="button button-subtle" href={`/jobs/${job.id}/signoff`}>Sign-off</Link>
        <Link className="button button-primary" href={`/jobs/${job.id}/review`}>Review</Link>
      </div>
    </PageFrame>
  );
}

export function JobProgressScreen({ jobId }: { jobId: string }) {
  const [notes, setNotes] = useState<Array<{ id: string; note: string; created_at: string }>>([]);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = await readJson<Array<{ id: string; note: string; created_at: string }>>(`/api/jobs/${jobId}/progress`);
      setNotes(rows);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load progress updates.");
    }
  }, [jobId]);

  useEffect(() => {
    let active = true;
    void readJson<Array<{ id: string; note: string; created_at: string }>>(`/api/jobs/${jobId}/progress`)
      .then((rows) => {
        if (!active) return;
        setNotes(rows);
        setError(null);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Could not load progress updates.");
      });
    return () => {
      active = false;
    };
  }, [jobId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await readJson(`/api/jobs/${jobId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });
      setNewNote("");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save progress.");
    }
  };

  return (
    <PageFrame title="Job progress" subtitle="Follow updates shared for this job.">
      <form className="hire-form" onSubmit={submit}>
        <label>
          Add progress note (workers only)
          <textarea value={newNote} minLength={3} maxLength={2000} onChange={(event) => setNewNote(event.target.value)} rows={4} />
        </label>
        <button className="button button-primary" type="submit">Post update</button>
      </form>
      {error ? <p className="hire-error" role="alert">{error}</p> : null}
      <div className="hire-list">
        {notes.length === 0 ? <p className="hire-empty">No updates posted yet.</p> : null}
        {notes.map((note) => (
          <article key={note.id} className="hire-card">
            <p>{note.note}</p>
            <p><small>{formatWat(note.created_at)}</small></p>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

function JobCompletionAction({ jobId, signoff }: { jobId: string; signoff?: boolean }) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const complete = async () => {
    setStatus(null);
    setError(null);
    try {
      await readJson(`/api/jobs/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      setStatus("Job marked completed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not complete this job.");
    }
  };

  return (
    <PageFrame title={signoff ? "Job sign-off" : "Complete job"} subtitle="Completion changes job status only. Payment processing is not integrated yet.">
      <article className="hire-card">
        <p>Only customers can mark in-progress jobs as completed.</p>
        <p>Payment service is not available yet, so completion does not confirm any transfer.</p>
      </article>
      <div className="hire-actions">
        <button type="button" className="button button-primary" onClick={() => void complete()}>Confirm completion</button>
        <Link className="button button-outline" href={`/jobs/${jobId}`}>Back to job</Link>
      </div>
      {status ? <p className="hire-success">{status}</p> : null}
      {error ? <p className="hire-error" role="alert">{error}</p> : null}
    </PageFrame>
  );
}

export function JobCompleteScreen({ jobId }: { jobId: string }) {
  return <JobCompletionAction jobId={jobId} />;
}

export function JobSignoffScreen({ jobId }: { jobId: string }) {
  return <JobCompletionAction jobId={jobId} signoff />;
}

export function JobReviewScreen({ jobId }: { jobId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setError(null);
    try {
      await readJson(`/api/jobs/${jobId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      setStatus("Review saved.");
      setComment("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save review.");
    }
  };

  return (
    <PageFrame title="Review job" subtitle="Share clear, factual feedback after completion.">
      <form className="hire-form" onSubmit={submit}>
        <label>
          Rating
          <input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(Number(event.target.value))} />
        </label>
        <label>
          Comment
          <textarea required minLength={10} maxLength={2000} rows={6} value={comment} onChange={(event) => setComment(event.target.value)} />
        </label>
        <button className="button button-primary" type="submit">Submit review</button>
      </form>
      {status ? <p className="hire-success">{status}</p> : null}
      {error ? <p className="hire-error" role="alert">{error}</p> : null}
    </PageFrame>
  );
}

export function PaymentUnavailableScreen({ reference, title }: { reference: string; title: string }) {
  return (
    <PageFrame title={title} subtitle="Payment service is not available yet in this build.">
      <article className="hire-card">
        <p>Reference: <strong>{reference}</strong></p>
        <p>This page does not verify payment and does not confirm escrow or payout.</p>
        <p>Use signed-in request and job pages to continue tracking work status.</p>
      </article>
      <div className="hire-actions">
        <Link className="button button-outline" href="/jobs">Back to jobs</Link>
      </div>
    </PageFrame>
  );
}
