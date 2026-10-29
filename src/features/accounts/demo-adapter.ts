import { validateAccount, type AccountValues } from "./validation";
export type DemoAuthErrorCode =
  | "VALIDATION"
  | "BACKEND_NOT_CONNECTED"
  | "INVALID_CREDENTIALS"
  | "UNAVAILABLE"
  | "INVALID_TOKEN"
  | "EXPIRED_TOKEN";
export type DemoAuthResult =
  | {
      ok: true;
      mode: "demo";
      kind:
        | "signup-preview"
        | "login-preview"
        | "reset-request-preview"
        | "reset-preview"
        | "resend-preview"
        | "verification-preview"
        | "verification-required";
    }
  | { ok: false; mode: "demo"; code: DemoAuthErrorCode; message: string };
export const demoCredentials = {
  email: "ada@example.test",
  password: "SabiWork-demo-2026!",
} as const;
const fail = (code: DemoAuthErrorCode, message: string): DemoAuthResult => ({
  ok: false,
  mode: "demo",
  code,
  message,
});
const isSampleEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.test$/i.test(email.trim());
const disconnected = () =>
  fail(
    "BACKEND_NOT_CONNECTED",
    "Real accounts and email delivery are not connected. Use a sample address ending in .test to preview this form.",
  );
async function pause(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, 180);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
/** Browser-local frontend preview only. No fetch, cookies, storage, email, user
 * records, password mutations or sessions. Replace with Better Auth/Resend. */
export const demoAuthAdapter = {
  async signup(
    values: AccountValues,
    signal?: AbortSignal,
  ): Promise<DemoAuthResult> {
    await pause(signal);
    if (Object.keys(validateAccount("signup", values)).length)
      return fail("VALIDATION", "Check the highlighted fields.");
    if (!isSampleEmail(values.email)) return disconnected();
    if (values.email.trim().toLowerCase() === "offline@example.test")
      return fail(
        "UNAVAILABLE",
        "The demo request could not finish. Your inputs are still here; try again.",
      );
    return { ok: true, mode: "demo", kind: "signup-preview" };
  },
  async login(
    values: AccountValues,
    signal?: AbortSignal,
  ): Promise<DemoAuthResult> {
    await pause(signal);
    if (Object.keys(validateAccount("login", values)).length)
      return fail("VALIDATION", "Enter an email address and password.");
    if (!isSampleEmail(values.email)) return disconnected();
    if (values.email.trim().toLowerCase() === "offline@example.test")
      return fail(
        "UNAVAILABLE",
        "The demo request could not finish. Your inputs are still here; try again.",
      );
    if (values.password !== demoCredentials.password)
      return fail(
        "INVALID_CREDENTIALS",
        "The sample email or password does not match.",
      );
    if (values.email.trim().toLowerCase() === "unverified@example.test")
      return { ok: true, mode: "demo", kind: "verification-required" };
    if (values.email.trim().toLowerCase() !== demoCredentials.email)
      return fail(
        "INVALID_CREDENTIALS",
        "The sample email or password does not match.",
      );
    return { ok: true, mode: "demo", kind: "login-preview" };
  },
  async requestReset(
    email: string,
    signal?: AbortSignal,
  ): Promise<DemoAuthResult> {
    await pause(signal);
    if (!isSampleEmail(email)) return disconnected();
    // Identical reply for every sample address, without account enumeration.
    return { ok: true, mode: "demo", kind: "reset-request-preview" };
  },
  async reset(
    values: AccountValues,
    token: string,
    signal?: AbortSignal,
  ): Promise<DemoAuthResult> {
    await pause(signal);
    if (token === "demo-expired")
      return fail(
        "EXPIRED_TOKEN",
        "This sample link has expired. Request another reset link.",
      );
    if (token !== "demo-valid")
      return fail(
        "INVALID_TOKEN",
        "This sample link is invalid. Request another reset link.",
      );
    if (Object.keys(validateAccount("reset", values)).length)
      return fail("VALIDATION", "Check the highlighted fields.");
    return { ok: true, mode: "demo", kind: "reset-preview" };
  },
  async resend(email: string, signal?: AbortSignal): Promise<DemoAuthResult> {
    await pause(signal);
    if (!isSampleEmail(email)) return disconnected();
    return { ok: true, mode: "demo", kind: "resend-preview" };
  },
  async verify(token: string, signal?: AbortSignal): Promise<DemoAuthResult> {
    await pause(signal);
    if (token === "demo-expired")
      return fail(
        "EXPIRED_TOKEN",
        "This sample verification link has expired. Preview another link below.",
      );
    if (token !== "demo-valid")
      return fail(
        "INVALID_TOKEN",
        "This sample verification link is invalid. Preview another link below.",
      );
    return { ok: true, mode: "demo", kind: "verification-preview" };
  },
};
