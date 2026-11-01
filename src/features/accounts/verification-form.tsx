"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { Icon } from "@/components/icon";
import { authClient } from "@/lib/auth/client";

export function VerificationForm({
  initialEmail = "",
}: {
  initialEmail?: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  async function perform(action: "verify" | "resend") {
    if (pending) return;
    setPending(true);
    setMessage(null);
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new Error("Enter the email address associated with your account.");
      }

      if (action === "verify") {
        if (!/^\d{6}$/.test(otp.trim())) {
          throw new Error("Enter the six-digit code from your email.");
        }
        const { error } = await authClient.emailOtp.verifyEmail({
          email: email.trim(),
          otp: otp.trim(),
        });
        if (error) throw new Error(error.message || "Email verification failed.");
        setVerified(true);
        setMessage({
          ok: true,
          text: "Your email is verified. Sign in to continue to your account.",
        });
      } else {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email: email.trim(),
          type: "email-verification",
        });
        if (error) {
          throw new Error(error.message || "Could not send a verification code.");
        }
        setMessage({
          ok: true,
          text: "If verification is needed for this account, a code has been sent.",
        });
      }
    } catch (error) {
      setMessage({
        ok: false,
        text:
          error instanceof Error
            ? error.message
            : "The request could not be completed. Try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-card auth-state">
      <span className="auth-state-icon">
        {verified ? (
          <Icon name="check" size={30} />
        ) : (
          <Mail size={30} aria-hidden="true" />
        )}
      </span>
      <p className="eyebrow">EMAIL VERIFICATION</p>
      <h1>{verified ? "Email verified" : "Verify your email"}</h1>
      <p>
        {verified
          ? message?.text
          : "Enter the six-digit code sent by Neon Auth. Email verification does not imply identity, trade, or payment verification."}
      </p>
      {message && !verified && (
        <p
          className={message.ok ? "auth-verification-notice" : "auth-request-error"}
          role={message.ok ? "status" : "alert"}
        >
          {message.text}
        </p>
      )}
      {!verified && (
        <>
          <div className="auth-field">
            <label htmlFor="verification-email">Email address</label>
            <input
              id="verification-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage(null);
              }}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="verification-code">Six-digit code</label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setMessage(null);
              }}
            />
          </div>
          <button
            className="button button-primary auth-submit"
            type="button"
            disabled={pending}
            onClick={() => perform("verify")}
          >
            {pending ? "Verifying…" : "Verify email"}
            <Icon name="arrow" size={18} />
          </button>
          <button
            type="button"
            className="button button-subtle auth-submit"
            disabled={pending}
            onClick={() => perform("resend")}
          >
            {pending ? "Sending…" : "Send a new code"}
          </button>
        </>
      )}
      <Link className="text-link" href="/login">
        {verified ? "Continue to login" : "Back to login"}
      </Link>
    </div>
  );
}
