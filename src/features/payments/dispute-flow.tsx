"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatWat, readJson } from "@/features/customer-workspace/service";
export function BookingDispute({
  jobId,
  statusOnly = false,
}: {
  jobId: string;
  statusOnly?: boolean;
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<{
    id: string;
    status: string;
    summary: string;
    determination_note: string | null;
    events: {
      id: string;
      label: string;
      detail: string;
      occurred_at: string;
    }[];
  } | null>(null);
  useEffect(() => {
    let active = true;
    if (statusOnly)
      void readJson<NonNullable<typeof record>>(`/api/jobs/${jobId}/dispute`)
        .then((data) => {
          if (active) setRecord(data);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [jobId, statusOnly]);
  return (
    <section className="hire-page">
      <h1>{statusOnly ? "Reported issue" : "Report a booking issue"}</h1>
      <p>
        Saved issues are reviewed by an administrator. Unreleased test
        milestones are frozen. This does not perform refunds or recall transfers
        already sent.
      </p>
      {error ? <p role="alert">{error}</p> : null}
      {statusOnly ? (
        record ? (
          <article className="hire-card">
            <p>{record.status.replaceAll("_", " ")}</p>
            <p>{record.summary}</p>
            {record.determination_note ? (
              <p>{record.determination_note}</p>
            ) : null}
            {record.events.map((e) => (
              <p key={e.id}>
                <strong>{e.label}</strong> · {formatWat(e.occurred_at)}
                <br />
                {e.detail}
              </p>
            ))}
          </article>
        ) : !error ? (
          <p>Loading case…</p>
        ) : null
      ) : (
        <form
          className="hire-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await readJson(`/api/jobs/${jobId}/dispute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description }),
              });
              router.push(`/disputes/${jobId}`);
            } catch (reason) {
              setError(
                reason instanceof Error
                  ? reason.message
                  : "Could not save the issue.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Describe what happened
            <textarea
              required
              minLength={20}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button className="button button-primary" disabled={busy}>
            {busy ? "Saving…" : "Submit issue"}
          </button>
        </form>
      )}
      <Link className="button button-subtle" href={`/jobs/${jobId}`}>
        Back to booking
      </Link>
    </section>
  );
}
