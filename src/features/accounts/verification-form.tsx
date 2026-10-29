"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { Icon } from "@/components/icon";
import { demoAuthAdapter, type DemoAuthResult } from "./demo-adapter";
import { useAccountDemo } from "./demo-context";
export function VerificationForm({ token = "" }: { token?: string }) {
  const { email } = useAccountDemo();
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState<DemoAuthResult | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(
      () => setCooldown((previous) => Math.max(0, previous - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function perform(action: "verify" | "resend") {
    if (pending || (action === "resend" && cooldown > 0)) return;
    const request = new AbortController();
    controller.current?.abort();
    controller.current = request;
    setPending(true);
    setResult(null);
    try {
      const response =
        action === "verify"
          ? await demoAuthAdapter.verify(token, request.signal)
          : await demoAuthAdapter.resend(email, request.signal);
      if (request.signal.aborted) return;
      setResult(response);
      if (response.ok && action === "resend") setCooldown(60);
    } catch {
      if (!request.signal.aborted)
        setResult({
          ok: false,
          mode: "demo",
          code: "UNAVAILABLE",
          message: "The preview could not finish. Please try again.",
        });
    } finally {
      if (!request.signal.aborted) setPending(false);
    }
  }
  const verified = result?.ok && result.kind === "verification-preview";
  return (
    <div className="auth-card auth-state">
      <span className="auth-state-icon">
        {verified ? (
          <Icon name="check" size={30} />
        ) : (
          <Mail size={30} aria-hidden="true" />
        )}
      </span>
      <p className="eyebrow">ONE SMALL STEP</p>
      <h1>
        {verified
          ? "Verification preview complete."
          : token
            ? "Preview this verification link"
            : "Check your sample inbox"}
      </h1>
      <p>
        {verified ? (
          "The sample link passed the preview check. No email or account has actually been verified."
        ) : (
          <>
            A real account would need to verify{" "}
            <strong className="auth-email">{email}</strong> before continuing.
            No email is sent in this frontend demo.
          </>
        )}
      </p>
      {result && !result.ok && (
        <p className="auth-request-error" role="alert">
          {result.message}
        </p>
      )}
      {result?.ok && result.kind === "resend-preview" && (
        <p className="auth-inline-status" role="status">
          Resend preview complete. No email was sent. The timer below is a local
          demo only.
        </p>
      )}
      {verified ? (
        <Link className="button button-primary auth-submit" href="/login">
          Back to login <Icon name="arrow" size={18} />
        </Link>
      ) : (
        <>
          {token && (
            <button
              className="button button-primary auth-submit"
              type="button"
              disabled={pending}
              onClick={() => perform("verify")}
            >
              {pending ? "Checking sample link…" : "Preview verification"}
              <Icon name="arrow" size={18} />
            </button>
          )}
          <div className="auth-link-preview">
            <Icon name="lock" size={20} />
            <div>
              <strong>No inbox access needed</strong>
              <p>Try the sample link to explore the next step.</p>
              <Link className="text-link" href="/verify-email?token=demo-valid">
                Open sample verification link <Icon name="arrow" size={16} />
              </Link>
            </div>
          </div>
          <button
            type="button"
            className="button button-subtle auth-submit"
            disabled={pending || cooldown > 0}
            onClick={() => perform("resend")}
          >
            {cooldown > 0
              ? `Preview resend in ${cooldown}s`
              : pending
                ? "Checking sample details…"
                : "Preview resend email"}
          </button>
          <p className="auth-fineprint">
            This 60-second demo timer does not enforce server rate limits.
          </p>
          <Link className="text-link" href="/signup/customer">
            Use a different sample email
          </Link>
          <Link className="text-link" href="/login">
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}
