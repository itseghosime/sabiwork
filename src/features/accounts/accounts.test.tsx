import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AccountForm } from "./account-form";
import { CompleteProfileForm } from "./complete-profile";
import { VerificationForm } from "./verification-form";
import { validateAccount } from "./validation";

const authMocks = vi.hoisted(() => ({
  signUpEmail: vi.fn(),
  signInEmail: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmailOtp: vi.fn(),
  sendVerificationOtp: vi.fn(),
}));
const routerMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));
const fetchMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signUp: { email: authMocks.signUpEmail },
    signIn: { email: authMocks.signInEmail },
    requestPasswordReset: authMocks.requestPasswordReset,
    resetPassword: authMocks.resetPassword,
    emailOtp: {
      verifyEmail: authMocks.verifyEmailOtp,
      sendVerificationOtp: authMocks.sendVerificationOtp,
    },
  },
}));

const successfulResult = { error: null };
const jsonResponse = (status: number, body: unknown = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

function fillAccountForm(mode: "signup" | "login" | "forgot" | "reset") {
  if (mode === "signup") {
    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Example Customer" },
    });
  }
  if (mode !== "reset") {
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "customer@example.test" },
    });
  }
  if (mode === "signup" || mode === "reset") {
    const label = mode === "reset" ? "New password" : "Password";
    fireEvent.change(screen.getByLabelText(label, { exact: true }), {
      target: { value: "ExamplePassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "ExamplePassword123" },
    });
  } else if (mode === "login") {
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
      target: { value: "ExamplePassword123" },
    });
  }
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  authMocks.signUpEmail.mockResolvedValue(successfulResult);
  authMocks.signInEmail.mockResolvedValue(successfulResult);
  authMocks.requestPasswordReset.mockResolvedValue(successfulResult);
  authMocks.resetPassword.mockResolvedValue(successfulResult);
  authMocks.verifyEmailOtp.mockResolvedValue(successfulResult);
  authMocks.sendVerificationOtp.mockResolvedValue(successfulResult);
  fetchMock.mockResolvedValue(jsonResponse(201));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("account validation", () => {
  it("requires a valid name, email, strong matching password, and leaves passwords untrimmed", () => {
    expect(
      validateAccount("signup", {
        name: " ",
        email: "bad",
        password: "weak",
        confirmation: "different",
      }),
    ).toHaveProperty("name");
    expect(
      validateAccount("signup", {
        name: "Example Customer",
        email: "customer@example.test",
        password: "ExamplePassword123",
        confirmation: "ExamplePassword123",
      }),
    ).toEqual({});
    expect(
      validateAccount("reset", {
        password: "  StrongPassword123  ",
        confirmation: "  StrongPassword123  ",
      }),
    ).toEqual({});
  });
});

describe("Neon Auth account flows", () => {
  it("creates a customer auth account, saves the role, and requires email verification", async () => {
    render(<AccountForm mode="signup" />);
    fillAccountForm("signup");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(routerMocks.replace).toHaveBeenCalledWith(
        "/verify-email?email=customer%40example.test",
      ),
    );
    expect(authMocks.signUpEmail).toHaveBeenCalledWith({
      name: "Example Customer",
      email: "customer@example.test",
      password: "ExamplePassword123",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/account/profile",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ role: "customer" }),
      }),
    );
  });

  it("preserves input and reports provider errors on login", async () => {
    authMocks.signInEmail.mockResolvedValue({
      error: { message: "Invalid email or password." },
    });
    render(<AccountForm mode="login" />);
    fillAccountForm("login");
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Invalid email or password.",
    );
    expect(
      (screen.getByLabelText("Password", { exact: true }) as HTMLInputElement)
        .value,
    ).toBe("ExamplePassword123");
  });

  it("routes an unverified login to email verification", async () => {
    authMocks.signInEmail.mockResolvedValue({
      data: { user: { emailVerified: false } },
      error: null,
    });
    render(<AccountForm mode="login" />);
    fillAccountForm("login");
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(routerMocks.replace).toHaveBeenCalledWith(
        "/verify-email?email=customer%40example.test",
      ),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("routes an authenticated account without a profile to role completion", async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { error: {} }));
    render(<AccountForm mode="login" />);
    fillAccountForm("login");
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(routerMocks.replace).toHaveBeenCalledWith("/complete-profile"),
    );
  });

  it("sends a password-reset request without revealing whether the address exists", async () => {
    render(<AccountForm mode="forgot" />);
    fillAccountForm("forgot");
    fireEvent.click(
      screen.getByRole("button", { name: "Send reset instructions" }),
    );

    expect(await screen.findByRole("heading", { name: "Check your inbox" }))
      .toBeTruthy();
    expect(authMocks.requestPasswordReset).toHaveBeenCalledWith({
      email: "customer@example.test",
      redirectTo: expect.stringMatching(/\/reset-password$/),
    });
  });

  it("requires a real reset token and submits a valid password reset", async () => {
    const missingToken = render(<AccountForm mode="reset" />);
    expect(screen.queryByLabelText("New password")).toBeNull();
    missingToken.unmount();

    render(<AccountForm mode="reset" token="provider-token" />);
    fillAccountForm("reset");
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("heading", { name: "Password updated" }))
      .toBeTruthy();
    expect(authMocks.resetPassword).toHaveBeenCalledWith({
      newPassword: "ExamplePassword123",
      token: "provider-token",
    });
  });

  it("verifies a six-digit email code through Neon Auth", async () => {
    render(<VerificationForm initialEmail="customer@example.test" />);
    fireEvent.change(screen.getByLabelText("Six-digit code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify email" }));

    expect(await screen.findByText(/Your email is verified/))
      .toBeTruthy();
    expect(authMocks.verifyEmailOtp).toHaveBeenCalledWith({
      email: "customer@example.test",
      otp: "123456",
    });
  });

  it("requests a verification code for a valid address", async () => {
    render(<VerificationForm />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "customer@example.test" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Send a new code" }),
    );

    expect(
      await screen.findByText(
        "If verification is needed for this account, a code has been sent.",
      ),
    ).toBeTruthy();
    expect(authMocks.sendVerificationOtp).toHaveBeenCalledWith({
      email: "customer@example.test",
      type: "email-verification",
    });
  });

  it("saves only a customer or artisan account type through the profile API", async () => {
    render(<CompleteProfileForm />);
    fireEvent.click(screen.getByRole("radio", { name: /Artisan/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(routerMocks.replace).toHaveBeenCalledWith("/artisan"),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/account/profile",
      expect.objectContaining({
        body: JSON.stringify({ role: "artisan" }),
      }),
    );
  });
});
