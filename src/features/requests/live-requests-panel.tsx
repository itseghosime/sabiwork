"use client";

import {
  createRealtimeClient,
  type SealedLiveQuery,
} from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import "./live-requests-panel.css";

type LiveRequestRow = {
  id: string;
  title: string;
  category: string;
  service_area: string;
  budget_guidance_kobo: number;
  status: "draft" | "submitted" | "matching" | "cancelled";
  created_at: Date;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSealedQuery(value: unknown): value is SealedLiveQuery<LiveRequestRow> {
  return (
    isRecord(value) &&
    typeof value.capability === "string" &&
    typeof value.expiresAt === "number" &&
    typeof value.queryFingerprint === "string"
  );
}

async function refreshSealedQuery(): Promise<SealedLiveQuery<LiveRequestRow>> {
  const response = await fetch("/api/requests/live-query", {
    method: "POST",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Could not renew the live request connection.");
  }
  const body: unknown = await response.json();
  if (!isRecord(body) || !isSealedQuery(body.data)) {
    throw new Error("The live request service returned an invalid response.");
  }
  return body.data;
}

function LiveRequestList({
  sealedQuery,
}: {
  sealedQuery: SealedLiveQuery<LiveRequestRow>;
}) {
  const { data, status, error } = useLiveQuery(sealedQuery, {
    refreshQuery: refreshSealedQuery,
  });

  return (
    <div className="live-request-results" aria-live="polite">
      {status === "error" ? (
        <p className="live-request-error" role="alert">
          Live updates stopped: {error.message}
        </p>
      ) : data === undefined ? (
        <p role="status">Connecting to live request updates…</p>
      ) : data.length === 0 ? (
        <p className="live-request-empty">
          No saved drafts yet. New drafts appear here as soon as they are saved.
        </p>
      ) : (
        <ul>
          {data.map((request) => (
            <li key={request.id} className="live-request-item">
              <div>
                <strong>{request.title}</strong>
                <p>
                  {request.category} · {request.service_area}
                </p>
                <small>
                  {new Intl.DateTimeFormat("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Africa/Lagos",
                  }).format(request.created_at)}{" "}
                  WAT
                </small>
              </div>
              <span>
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  maximumFractionDigits: 2,
                }).format(request.budget_guidance_kobo / 100)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {status === "stale" && (
        <p className="live-request-updating" role="status">
          Refreshing the live connection…
        </p>
      )}
    </div>
  );
}

function RequestDraftForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const budget = Number(formData.get("budget"));
    const budgetKobo = Math.round(budget * 100);
    if (
      !Number.isFinite(budget) ||
      budget < 0 ||
      budget > 1_000_000 ||
      !Number.isSafeInteger(budgetKobo)
    ) {
      setErrorMessage("Enter a valid budget in naira.");
      return;
    }

    setPending(true);
    setMessage("");
    setErrorMessage("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          category: formData.get("category"),
          service_area: formData.get("service_area"),
          description: formData.get("description"),
          budget_guidance_kobo: budgetKobo,
        }),
      });
      if (!response.ok) {
        setErrorMessage(
          response.status === 401
            ? "Your session has ended. Sign in again to save a draft."
            : "The request could not be saved. Check the details and try again.",
        );
        return;
      }
      form.reset();
      setMessage(
        "Draft saved to your account. It was not sent to artisans and no service was booked.",
      );
    } catch {
      setErrorMessage(
        "The request service is unavailable. Your details are still here; try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="live-request-form" onSubmit={submit}>
      <label>
        Request title
        <input name="title" minLength={3} maxLength={120} required />
      </label>
      <div className="live-request-form-row">
        <label>
          Trade category
          <input name="category" minLength={2} maxLength={80} required />
        </label>
        <label>
          Service area
          <input name="service_area" minLength={2} maxLength={100} required />
        </label>
      </div>
      <label>
        Work description
        <textarea name="description" minLength={20} maxLength={2000} required />
      </label>
      <label>
        Budget guidance (NGN)
        <input
          name="budget"
          type="number"
          min="0"
          max="1000000"
          step="0.01"
          required
        />
      </label>
      {errorMessage && (
        <p className="live-request-error" role="alert">
          {errorMessage}
        </p>
      )}
      {message && (
        <p className="live-request-success" role="status">
          {message}
        </p>
      )}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Saving draft…" : "Save private draft"}
      </button>
    </form>
  );
}

export function LiveCustomerRequests({
  realtimeUrl,
  sealedQuery,
}: {
  realtimeUrl: string;
  sealedQuery: SealedLiveQuery<LiveRequestRow>;
}) {
  const client = useMemo(
    () => createRealtimeClient({ url: realtimeUrl }),
    [realtimeUrl],
  );

  useEffect(() => {
    return () => client.close();
  }, [client]);

  return (
    <section className="live-request-panel" aria-labelledby="live-requests-title">
      <div className="live-request-heading">
        <div>
          <p className="eyebrow">ACCOUNT STORAGE</p>
          <h2 id="live-requests-title">Saved request drafts</h2>
        </div>
        <span className="live-request-badge">Live database</span>
      </div>
      <p className="live-request-disclosure">
        Drafts are stored privately in your account. Saving does not submit a
        request, notify artisans, book work, or move money.
      </p>
      <RequestDraftForm />
      <RealtimeProvider client={client}>
        <LiveRequestList sealedQuery={sealedQuery} />
      </RealtimeProvider>
    </section>
  );
}
