import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  bookingDepositKobo,
  MIN_DEPOSIT_KOBO,
  paystackSignatureMatches,
} from "./deposit";

describe("bookingDepositKobo", () => {
  it("takes ten percent of the starting labour", () => {
    expect(bookingDepositKobo(2_800_000)).toBe(280_000);
  });

  it("rounds up to the nearest hundred naira", () => {
    expect(bookingDepositKobo(1_955_000)).toBe(200_000);
  });

  it("never goes below the minimum deposit", () => {
    expect(bookingDepositKobo(400_000)).toBe(MIN_DEPOSIT_KOBO);
    expect(bookingDepositKobo(0)).toBe(MIN_DEPOSIT_KOBO);
  });

  it("falls back to the minimum for unusable rates", () => {
    expect(bookingDepositKobo(Number.NaN)).toBe(MIN_DEPOSIT_KOBO);
    expect(bookingDepositKobo(-50_000)).toBe(MIN_DEPOSIT_KOBO);
  });
});

describe("paystackSignatureMatches", () => {
  const secret = "sk_test_example";
  const body = JSON.stringify({ event: "charge.success", data: { amount: 280000 } });
  const signature = createHmac("sha512", secret)
    .update(body, "utf8")
    .digest("hex");

  it("accepts a signature produced with the secret key", () => {
    expect(paystackSignatureMatches({ secret, body, signature })).toBe(true);
    expect(
      paystackSignatureMatches({ secret, body, signature: signature.toUpperCase() }),
    ).toBe(true);
  });

  it("rejects a tampered body", () => {
    expect(
      paystackSignatureMatches({ secret, body: `${body} `, signature }),
    ).toBe(false);
  });

  it("rejects a signature made with another secret", () => {
    const other = createHmac("sha512", "sk_test_other").update(body).digest("hex");
    expect(paystackSignatureMatches({ secret, body, signature: other })).toBe(false);
  });

  it("rejects missing or malformed signatures", () => {
    expect(paystackSignatureMatches({ secret, body, signature: null })).toBe(false);
    expect(paystackSignatureMatches({ secret, body, signature: "abc" })).toBe(false);
  });
});
