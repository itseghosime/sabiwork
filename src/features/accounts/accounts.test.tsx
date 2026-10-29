import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AccountForm } from "./account-form";
import { AccountDemoProvider } from "./demo-context";
import { VerificationForm } from "./verification-form";
import { demoAuthAdapter, demoCredentials } from "./demo-adapter";
import { validateAccount, type AccountValues } from "./validation";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const valid: AccountValues = {
  name: "Ada Okafor",
  email: demoCredentials.email,
  password: demoCredentials.password,
  confirmation: demoCredentials.password,
};
const mount = (child: React.ReactNode) =>
  render(<AccountDemoProvider>{child}</AccountDemoProvider>);
describe("account preview boundaries", () => {
  it("validates names, email, strong matching passwords, and does not trim passwords", () => {
    expect(
      validateAccount("signup", {
        name: " ",
        email: "bad",
        password: "weak",
        confirmation: "different",
      }),
    ).toHaveProperty("name");
    expect(validateAccount("signup", valid)).toEqual({});
    expect(
      validateAccount("reset", {
        ...valid,
        password: "  strong sample 8 ",
        confirmation: "  strong sample 8 ",
      }),
    ).toEqual({});
    expect(
      validateAccount("reset", { ...valid, confirmation: "bad" }),
    ).toHaveProperty("confirmation");
  });
  it("refuses real email accounts and gives identical recovery replies for sample addresses", async () => {
    const real = await demoAuthAdapter.signup({
      ...valid,
      email: "someone@example.com",
    });
    expect(real).toMatchObject({ ok: false, code: "BACKEND_NOT_CONNECTED" });
    expect(await demoAuthAdapter.requestReset("unknown@example.test")).toEqual(
      await demoAuthAdapter.requestReset(demoCredentials.email),
    );
    expect(
      await demoAuthAdapter.login({ ...valid, password: "wrong" }),
    ).toMatchObject({ ok: false, code: "INVALID_CREDENTIALS" });
    expect(await demoAuthAdapter.reset(valid, "arbitrary-token")).toMatchObject(
      { ok: false, code: "INVALID_TOKEN" },
    );
    expect(await demoAuthAdapter.verify("demo-expired")).toMatchObject({
      ok: false,
      code: "EXPIRED_TOKEN",
    });
  });
  it("can cancel a pending operation without completing it", async () => {
    const abort = new AbortController();
    const request = demoAuthAdapter.signup(valid, abort.signal);
    abort.abort();
    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });
});
describe("review regressions", () => {
  it("accepts only the fields each operation needs and returns its own preview kind", async () => {
    const login = await demoAuthAdapter.login({
      email: valid.email,
      password: valid.password,
    });
    expect(login).toEqual({ ok: true, mode: "demo", kind: "login-preview" });
    const reset = await demoAuthAdapter.reset(
      { password: valid.password, confirmation: valid.confirmation },
      "demo-valid",
    );
    expect(reset).toEqual({ ok: true, mode: "demo", kind: "reset-preview" });
  });
  it("does not send customer signup visitors to an unimplemented artisan page", () => {
    mount(<AccountForm mode="signup" />);
    expect(
      screen.queryByRole("link", { name: /Offer your skills/ }),
    ).toBeNull();
    expect(
      screen.getByText("Artisan registration will be available soon."),
    ).toBeTruthy();
  });
});
describe("account forms", () => {
  it("focuses invalid fields and previews signup without persisting a password", async () => {
    mount(<AccountForm mode="signup" />);
    fireEvent.click(screen.getByRole("button", { name: "Preview signup" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Full name"));
    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: valid.name },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: valid.email },
    });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
      target: { value: valid.password },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: valid.confirmation },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Show password$/ }));
    expect(
      screen.getByLabelText("Password", { exact: true }).getAttribute("type"),
    ).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: "Preview signup" }));
    expect(
      screen
        .getByRole("button", { name: "Checking sample details…" })
        .hasAttribute("disabled"),
    ).toBe(true);
    const emailField = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    expect(emailField.matches(":disabled")).toBe(true);
    fireEvent.change(emailField, { target: { value: "changed@example.test" } });
    expect(emailField.value).toBe(valid.email);
    await screen.findByRole("heading", {
      name: "Your signup preview is ready",
    });
    expect(screen.getByRole("status").textContent).toContain(
      "No account has been created",
    );
    fireEvent.click(screen.getByRole("button", { name: "Back to form" }));
    expect(
      (screen.getByLabelText("Password", { exact: true }) as HTMLInputElement)
        .value,
    ).toBe("");
  });
  it("preserves input after failure and only previews sample login", async () => {
    mount(<AccountForm mode="login" />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "offline@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
      target: { value: valid.password },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview login" }));
    await screen.findByRole("alert");
    expect(
      (screen.getByLabelText("Password", { exact: true }) as HTMLInputElement)
        .value,
    ).toBe(valid.password);
    fireEvent.click(screen.getByText("Sample details for this preview"));
    fireEvent.click(
      screen.getByRole("button", { name: "Fill sample details" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Preview login" }));
    await screen.findByRole("heading", { name: "Login preview complete" });
    expect(screen.getByRole("status").textContent).toContain(
      "does not sign you in",
    );
  });
  it("requires a sample reset token and displays honest reset completion", async () => {
    const first = mount(<AccountForm mode="reset" token="demo-expired" />);
    expect(screen.queryByLabelText("New password")).toBeNull();
    expect(
      screen
        .getByRole("link", { name: /Request another link/ })
        .getAttribute("href"),
    ).toBe("/forgot-password");
    first.unmount();
    mount(<AccountForm mode="reset" token="demo-valid" />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: valid.password },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: valid.password },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Preview password reset" }),
    );
    await screen.findByRole("heading", {
      name: "Password reset preview complete",
    });
    expect(screen.getByRole("status").textContent).toContain(
      "No password was changed",
    );
  });
  it("previews forgot-password completion with a sample recovery link", async () => {
    mount(<AccountForm mode="forgot" />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: valid.email },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Preview reset request" }),
    );
    await screen.findByRole("heading", { name: "Reset request preview ready" });
    expect(
      screen
        .getByRole("link", { name: /Preview sample reset link/ })
        .getAttribute("href"),
    ).toBe("/reset-password?token=demo-valid");
  });
  it("handles invalid verification links and allows a fresh sample link", async () => {
    mount(<VerificationForm token="demo-expired" />);
    fireEvent.click(
      screen.getByRole("button", { name: /Preview verification/ }),
    );
    expect((await screen.findByRole("alert")).textContent).toContain("expired");
    expect(
      screen
        .getByRole("link", { name: /Open sample verification link/ })
        .getAttribute("href"),
    ).toBe("/verify-email?token=demo-valid");
  });
  it("prevents duplicate resend requests during the demo cooldown", async () => {
    vi.useFakeTimers();
    mount(<VerificationForm />);
    fireEvent.click(
      screen.getByRole("button", { name: "Preview resend email" }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(180);
    });
    expect(screen.getByRole("status").textContent).toContain(
      "No email was sent",
    );
    expect(
      screen
        .getByRole("button", { name: "Preview resend in 60s" })
        .hasAttribute("disabled"),
    ).toBe(true);
    for (let tick = 0; tick < 60; tick++)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    expect(
      screen
        .getByRole("button", { name: "Preview resend email" })
        .hasAttribute("disabled"),
    ).toBe(false);
  });
  it("previews verification without creating an authenticated account", async () => {
    mount(<VerificationForm token="demo-valid" />);
    fireEvent.click(
      screen.getByRole("button", { name: /Preview verification/ }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Verification preview complete." }),
      ).toBeTruthy(),
    );
    expect(
      screen.getByText(/No email or account has actually been verified/),
    ).toBeTruthy();
  });
});
