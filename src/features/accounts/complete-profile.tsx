"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

export function CompleteProfileForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });
      if (!response.ok) {
        setErrorMessage(
          response.status === 401
            ? "Sign in before completing your profile."
            : "Could not complete your profile. Try again.",
        );
        return;
      }
      router.replace("/jobs");
      router.refresh();
    } catch {
      setErrorMessage("The account service is unavailable. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">ONE LAST STEP</p>
      <h1>Complete your account</h1>
      <p className="auth-intro">
        Add your display name to finish setup. This single account can both post requests and maintain an optional work profile.
      </p>
      <form onSubmit={submit}>
        <div className="auth-field">
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            name="display-name"
            type="text"
            maxLength={100}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="How should we address you?"
          />
        </div>

        {errorMessage && (
          <p className="auth-request-error" role="alert">
            {errorMessage}
          </p>
        )}
        <button
          type="submit"
          className="button button-primary auth-submit"
          disabled={pending}
        >
          {pending ? "Saving profile…" : "Continue"}
          <Icon name="arrow" size={18} />
        </button>
      </form>
      <p className="auth-fineprint">Admin access is assigned only by project maintainers.</p>
    </div>
  );
}
