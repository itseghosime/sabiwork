"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Icon } from "@/components/icon";
import {
  demoAuthAdapter,
  demoCredentials,
  type DemoAuthResult,
} from "./demo-adapter";
import { useAccountDemo } from "./demo-context";
import {
  passwordChecks,
  validateAccount,
  type AccountErrors,
  type AccountMode,
  type AccountValues,
} from "./validation";
const copy = {
  signup: {
    eyebrow: "YOUR NEXT PROJECT STARTS HERE",
    title: "Create a customer account",
    text: "Find skilled local people and plan your next job.",
    action: "Preview signup",
  },
  login: {
    eyebrow: "GOOD TO SEE YOU AGAIN",
    title: "Welcome back.",
    text: "Pick up where your next project left off.",
    action: "Preview login",
  },
  forgot: {
    eyebrow: "LET’S GET YOU BACK IN",
    title: "Forgot your password?",
    text: "Enter your sample email to preview the recovery journey.",
    action: "Preview reset request",
  },
  reset: {
    eyebrow: "A FRESH START",
    title: "Choose a new password",
    text: "Use a strong sample password you can remember.",
    action: "Preview password reset",
  },
} as const;
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
}: {
  mode: AccountMode;
  token?: string;
}) {
  const { setEmail } = useAccountDemo();
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [values, setValues] = useState<AccountValues>({
    name: "",
    email: "",
    password: "",
    confirmation: "",
  });
  const [errors, setErrors] = useState<AccountErrors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<DemoAuthResult | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
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
    const request = new AbortController();
    controller.current?.abort();
    controller.current = request;
    setPending(true);
    try {
      let response: DemoAuthResult;
      if (mode === "signup")
        response = await demoAuthAdapter.signup(values, request.signal);
      else if (mode === "login")
        response = await demoAuthAdapter.login(
          { email: values.email, password: values.password },
          request.signal,
        );
      else if (mode === "forgot")
        response = await demoAuthAdapter.requestReset(
          values.email,
          request.signal,
        );
      else
        response = await demoAuthAdapter.reset(
          { password: values.password, confirmation: values.confirmation },
          token,
          request.signal,
        );
      if (request.signal.aborted) return;
      if (response.ok && mode !== "reset")
        setEmail(values.email.trim().toLowerCase());
      setResult(response);
      if (response.ok)
        setValues((previous) => ({
          ...previous,
          password: "",
          confirmation: "",
        }));
    } catch (error) {
      if (!request.signal.aborted)
        setResult({
          ok: false,
          mode: "demo",
          code: "UNAVAILABLE",
          message:
            "The preview could not finish. Your inputs are still here; try again.",
        });
      if (error instanceof Error && error.name === "AbortError") return;
    } finally {
      if (!request.signal.aborted) setPending(false);
    }
  }
  const heading = copy[mode];
  if (mode === "reset" && token !== "demo-valid")
    return (
      <div className="auth-card auth-state">
        <span className="auth-state-icon">
          <Icon name="lock" size={28} />
        </span>
        <h1>
          {token === "demo-expired"
            ? "This sample link has expired."
            : "A reset link is needed."}
        </h1>
        <p>
          Request a new sample reset link to continue. No account or password
          has been changed.
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
    const needsVerify =
      mode === "signup" || result.kind === "verification-required";
    return (
      <div className="auth-card auth-state" role="status">
        <span className="auth-state-icon">
          <Icon name="check" size={30} />
        </span>
        <p className="eyebrow">DEMO STEP COMPLETE</p>
        <h1>
          {result.kind === "verification-required"
            ? "Preview email verification"
            : mode === "forgot"
              ? "Reset request preview ready"
              : mode === "reset"
                ? "Password reset preview complete"
                : mode === "signup"
                  ? "Your signup preview is ready"
                  : "Login preview complete"}
        </h1>
        <p>
          {mode === "forgot"
            ? "A real recovery flow would send instructions if an account exists. No email was sent in this demo."
            : mode === "reset"
              ? "Your sample password passed validation. No password was changed."
              : mode === "login" && result.kind !== "verification-required"
                ? "The sample credentials matched. This preview does not sign you in or create a session."
                : "Continue to preview the verification step. No account has been created or verified."}
        </p>
        <Link
          className="button button-primary auth-submit"
          href={
            needsVerify
              ? "/verify-email"
              : mode === "forgot"
                ? "/reset-password?token=demo-valid"
                : mode === "reset"
                  ? "/login"
                  : "/artisans"
          }
        >
          {needsVerify
            ? "Continue to verification"
            : mode === "forgot"
              ? "Preview sample reset link"
              : mode === "reset"
                ? "Back to login"
                : "Explore public directory"}
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
        <div className="auth-role-choice">
          <span>
            <Icon name="home" size={18} /> I’m looking for an artisan
          </span>
          <p>Choose the artisan path if you want to offer your skills.</p>
          <Link href="/signup/artisan" className="auth-role-link">
            Join as an artisan <Icon name="arrow" size={16} />
          </Link>
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
                placeholder="Ada Okafor"
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
                placeholder="ada@example.test"
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
                aria-label="Sample password requirements"
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
                Checking sample details…
              </>
            ) : (
              <>
                {heading.action}
                <Icon name="arrow" size={18} />
              </>
            )}
          </button>
          <p className="auth-fineprint">
            This is a local frontend preview. No account, session, email or
            password change is created.
          </p>
        </fieldset>
      </form>
      {mode === "login" && (
        <details className="auth-demo-help">
          <summary>Sample details for this preview</summary>
          <p>
            Email: <code>{demoCredentials.email}</code>
            <br />
            Password: <code>{demoCredentials.password}</code>
          </p>
          <button
            type="button"
            className="text-link auth-text-button"
            disabled={pending}
            onClick={() => {
              setValues((previous) => ({
                ...previous,
                email: demoCredentials.email,
                password: demoCredentials.password,
              }));
              setErrors({});
              setResult(null);
            }}
          >
            Fill sample details
          </button>
        </details>
      )}
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
              Create a customer account
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
