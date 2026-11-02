// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  initializePaystackTransaction,
  paystackTestMode,
  verifyPaystackTransaction,
} from "./paystack";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("rejects live payment keys before any provider request", async () => {
  vi.stubEnv("PAYSTACK_SECRET_KEY", "sk_live_fictional_qa");
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  await expect(
    initializePaystackTransaction({
      email: "qa@example.test",
      amountKobo: 1500000,
      reference: "QA",
      callbackUrl: "https://example.test",
      metadata: {},
    }),
  ).rejects.toThrow("Only Paystack test keys are supported.");
  expect(fetch).not.toHaveBeenCalled();
});
it("rejects mixed test and live configuration", async () => {
  vi.stubEnv("PAYSTACK_SECRET_KEY", "sk_test_fictional_qa");
  vi.stubEnv("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", "pk_live_fictional_qa");
  expect(paystackTestMode()).toBe(false);
  await expect(verifyPaystackTransaction("QA")).rejects.toThrow(
    "Only Paystack test keys are supported.",
  );
});
