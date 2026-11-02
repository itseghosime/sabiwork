"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Icon } from "@/components/icon";
import { workspaceRoutes, type AccountRole } from "./access";
import { signupPaths, signupPathList, type SignupPath } from "./signup-paths";
import { authClient } from "@/lib/auth/client";
import {
  passwordChecks,
  validateAccount,
  type AccountErrors,
  type AccountMode,
  type AccountValues,
} from "./validation";
const signupCopy: Record<
  SignupPath,
  { eyebrow: string; title: string; text: string; action: string }
> = {
  customer: {
    eyebrow: "CREATE A CUSTOMER ACCOUNT",
    title: "Start hiring local artisans",
    text: "Post the job, compare itemised quotes, and track the work through to sign-off.",
    action: "Create customer account",
  },
  artisan: {
    eyebrow: "CREATE AN ARTISAN ACCOUNT",
    title: "Start getting hired for your craft",
    text: "Create your account, then build the work profile customers see when they quote you.",
    action: "Create artisan account",
  },
};
const copy = {
  login: {
    eyebrow: "WELCOME BACK",
    title: "Welcome back.",
    text: "Sign in to continue your requests, quotes, and optional work profile.",
    action: "Log in",
  },
  forgot: {
    eyebrow: "LET’S GET YOU BACK IN",
    title: "Forgot your password?",
    text: "Enter your email to request password reset instructions.",
    action: "Send reset instructions",
  },
  reset: {
    eyebrow: "A FRESH START",
    title: "Choose a new password",
    text: "Choose a strong password for your account.",
    action: "Reset password",
  },
} as const;

type FormResult = { ok: boolean; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAccountRole(value: unknown): value is AccountRole {
  return value === "customer" || value === "artisan" || value === "admin";
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The request could not be completed. Try again.";
}

async function setAccountRole(role: SignupPath) {
  const response = await fetch("/api/account/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Your account was created, but the session could not be started. Log in to continue."
        : "Your account was created, but its profile could not be completed. Log in and try again.",
    );
  }
}

async function getAccountRole(): Promise<AccountRole | null> {
  const response = await fetch("/api/account/profile", {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Could not load your account profile.");
  }
  const body: unknown = await response.json();
  if (
    !isRecord(body) ||
    !isRecord(body.data) ||
    !isAccountRole(body.data.role)
  ) {
    throw new Error("The account service returned an invalid profile.");
  }
  return body.data.role;
}

function PasswordInput({
  id,
  name,
  value,
  onChange,
  error,
  label,
  autoComplete,
}: {
  id: string;
  name: "password" | "confirmation";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className={`auth-input-wrap ${error ? "invalid" : ""}`}>
        <input
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          maxLength={128}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          className="auth-password-toggle"
          type="button"
          onClick={() => setShow(!show)}
          aria-label={`${show ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={show}
        >
          {show ? (
            <EyeOff size={19} aria-hidden="true" />
          ) : (
            <Eye size={19} aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="auth-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
export function AccountForm({
  mode,
  token = "",
  path = "customer",
}: {
  mode: AccountMode;
  token?: string;
  path?: SignupPath;
}) {
  const selectedPath = signupPaths[path];
  const router = useRouter();
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<AccountValues>({
    name: "",
    email: "",
    password: "",
    confirmation: "",
  });
  const [errors, setErrors] = useState<AccountErrors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  function update(name: keyof AccountValues, value: string) {
    if (pending) return;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setResult(null);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const found = validateAccount(mode, values);
    setErrors(found);
    setResult(null);
    const first = Object.keys(found)[0];
    if (first) {
      form.current
        ?.querySelector<HTMLInputElement>(`[name="${first}"]`)
        ?.focus();
      return;
    }
    setPending(true);
    setResult(null);
    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        });
        if (error) throw new Error(error.message || "Could not create account.");
        await setAccountRole(selectedPath.role);
        router.replace(selectedPath.workspace);
        router.refresh();
        return;
      }

      if (mode === "login") {
        const { error } = await authClient.signIn.email({
          email: values.email.trim(),
          password: values.password,
        });
        if (error) throw new Error(error.message || "Could not log in.");
        const currentRole = await getAccountRole();
        router.replace(
          currentRole ? workspaceRoutes[currentRole] : "/complete-profile",
        );
        router.refresh();
        return;
      }

      if (mode === "forgot") {
        const { error } = await authClient.requestPasswordReset({
          email: values.email.trim(),
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw new Error(error.message || "Could not request a reset.");
        setResult({
          ok: true,
          message:
            "If an account uses this address, password reset instructions have been sent.",
        });
        return;
      }

      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });
      if (error) throw new Error(error.message || "Could not reset password.");
      setValues((previous) => ({
        ...previous,
        password: "",
        confirmation: "",
      }));
      setResult({ ok: true, message: "Your password has been updated." });
    } catch (error) {
      setResult({ ok: false, message: errorMessage(error) });
    } finally {
      setPending(false);
    }
  }
  const heading = mode === "signup" ? signupCopy[path] : copy[mode];
  if (mode === "reset" && !token)
    return (
      <div className="auth-card auth-state">
        <span className="auth-state-icon">
          <Icon name="lock" size={28} />
        </span>
        <h1>
          A reset link is needed.
        </h1>
        <p>
          Request a password reset email to continue. No password has been
          changed.
        </p>
        <Link
          className="button button-primary auth-submit"
          href="/forgot-password"
        >
          Request another link <Icon name="arrow" size={18} />
        </Link>
        <Link className="text-link" href="/login">
          Back to login
        </Link>
      </div>
    );
  if (result?.ok) {
    return (
      <div className="auth-card auth-state" role="status">
        <span className="auth-state-icon">
          <Icon name="check" size={30} />
        </span>
        <p className="eyebrow">ACCOUNT UPDATE COMPLETE</p>
        <h1>
          {mode === "forgot" ? "Check your inbox" : "Password updated"}
        </h1>
        <p>{result.message}</p>
        <Link
          className="button button-primary auth-submit"
          href="/login"
        >
          Back to login
          <Icon name="arrow" size={18} />
        </Link>
        <button
          type="button"
          className="text-link auth-text-button"
          onClick={() => setResult(null)}
        >
          Back to form
        </button>
      </div>
    );
  }
  const checks = passwordChecks(values.password);
  return (
    <div className="auth-card">
      <p className="eyebrow">{heading.eyebrow}</p>
      <h1>{heading.title}</h1>
      <p className="auth-intro">{heading.text}</p>
      {mode === "signup" && (
        <div
          className="auth-path-picker"
          role="group"
          aria-label="Choose how you will use SabiWork"
        >
          <span className="auth-path-picker-label">Joining as</span>
          <div className="auth-path-options">
            {signupPathList.map((option) => {
              const active = option.role === path;
              return (
                <Link
                  key={option.role}
                  href={option.href}
                  aria-current={active ? "page" : undefined}
                  className={`auth-path-option ${
                    active ? "is-active" : ""
                  }`}
                >
                  <Icon name={option.icon} size={18} />
                  <span className="auth-path-option-text">
                    <strong>{option.switchLabel}</strong>
                    <small>{option.roleNote}</small>
                  </span>
                  {active && (
                    <span className="auth-path-check">
                      <Icon name="check" size={13} />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <p className="auth-path-note">{selectedPath.aside}</p>
        </div>
      )}
      <form ref={form} onSubmit={submit} noValidate aria-busy={pending}>
        <fieldset disabled={pending} className="auth-fields">
          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor={`${id}-name`}>Full name</label>
              <input
                id={`${id}-name`}
                name="name"
                value={values.name}
                onChange={(event) => update("name", event.target.value)}
                autoComplete="name"
                maxLength={100}
                placeholder="Your name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${id}-name-error` : undefined}
              />
              {errors.name && (
                <p id={`${id}-name-error`} className="auth-field-error">
                  {errors.name}
                </p>
              )}
            </div>
          )}
          {mode !== "reset" && (
            <div className="auth-field">
              <label htmlFor={`${id}-email`}>Email address</label>
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                value={values.email}
                onChange={(event) => update("email", event.target.value)}
                autoComplete="email"
                maxLength={254}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? `${id}-email-error` : undefined
                }
              />
              {errors.email && (
                <p id={`${id}-email-error`} className="auth-field-error">
                  {errors.email}
                </p>
              )}
            </div>
          )}
          {mode !== "forgot" && (
            <>
              <PasswordInput
                id={`${id}-password`}
                name="password"
                label={mode === "reset" ? "New password" : "Password"}
                value={values.password}
                onChange={(value) => update("password", value)}
                error={errors.password}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
              {mode === "login" && (
                <div className="auth-forgot-link">
                  <Link className="text-link" href="/forgot-password">
                    Forgot password?
                  </Link>
                </div>
              )}
            </>
          )}
          {(mode === "signup" || mode === "reset") && (
            <>
              <ul
                className="password-checks"
                aria-label="Password requirements"
              >
                <li data-valid={checks.length}>
                  <Icon name={checks.length ? "check" : "help"} size={14} />
                  12–128 characters
                </li>
                <li data-valid={checks.letter}>
                  <Icon name={checks.letter ? "check" : "help"} size={14} />A
                  letter
                </li>
                <li data-valid={checks.number}>
                  <Icon name={checks.number ? "check" : "help"} size={14} />A
                  number
                </li>
              </ul>
              <PasswordInput
                id={`${id}-confirmation`}
                name="confirmation"
                label="Confirm password"
                value={values.confirmation}
                onChange={(value) => update("confirmation", value)}
                error={errors.confirmation}
                autoComplete="new-password"
              />
            </>
          )}
          {Object.values(errors).some(Boolean) && (
            <p role="alert" className="auth-error-summary">
              Please check the highlighted fields.
            </p>
          )}
          {result && !result.ok && (
            <div role="alert" className="auth-request-error">
              <Icon name="help" size={18} />
              <p>{result.message}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="button button-primary auth-submit"
          >
            {pending ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
              {mode === "login"
                ? "Logging in…"
                : mode === "signup"
                  ? "Creating account…"
                  : mode === "forgot"
                    ? "Sending instructions…"
                    : "Updating password…"}
              </>
            ) : (
              <>
                {heading.action}
                <Icon name="arrow" size={18} />
              </>
            )}
          </button>
          <p className="auth-fineprint">
            Authentication is provided by Neon. Payments and dispute handling are not available from this account form.
          </p>
        </fieldset>
      </form>
      <div className="auth-switch">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link className="text-link" href="/login">
              Log in
            </Link>
          </>
        ) : mode === "login" ? (
          <>
            New to SabiWork?{" "}
            <Link className="text-link" href="/signup/customer">
              Create an account
            </Link>
          </>
        ) : (
          <Link className="text-link" href="/login">
            <Icon name="back" size={16} /> Back to login
          </Link>
        )}
      </div>
    </div>
  );
}
