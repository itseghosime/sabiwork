"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { workspaceRoutes } from "./access";

type Role = "customer" | "artisan";

export function CompleteProfileForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
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
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        setErrorMessage(
          response.status === 401
            ? "Sign in before choosing an account type."
            : response.status === 409
              ? "This account already has a different account type."
              : "Could not complete your profile. Try again.",
        );
        return;
      }
      router.replace(workspaceRoutes[role]);
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
      <h1>Choose your account type</h1>
      <p className="auth-intro">
        Your account has no marketplace role yet. Choose the workspace that
        matches how you plan to use SabiWork.
      </p>
      <form onSubmit={submit}>
        <fieldset className="auth-role-options" disabled={pending}>
          <legend>Account type</legend>
          <label>
            <input
              type="radio"
              name="role"
              value="customer"
              checked={role === "customer"}
              onChange={() => setRole("customer")}
            />
            <span>
              <strong>Customer</strong>
              <small>Find and request local services.</small>
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="artisan"
              checked={role === "artisan"}
              onChange={() => setRole("artisan")}
            />
            <span>
              <strong>Artisan</strong>
              <small>Build a service profile and manage requests.</small>
            </span>
          </label>
        </fieldset>
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
          {pending ? "Saving account type…" : "Continue"}
          <Icon name="arrow" size={18} />
        </button>
      </form>
      <p className="auth-fineprint">
        Account type is saved to your profile. Admin access cannot be selected
        here.
      </p>
    </div>
  );
}
