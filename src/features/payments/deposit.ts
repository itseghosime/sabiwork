import { createHmac, timingSafeEqual } from "node:crypto";

/** A directory booking reserves the artisan with 10% of their starting labour. */
export const DEPOSIT_PERCENT = 10;
export const MIN_DEPOSIT_KOBO = 100_000;
const ROUNDING_KOBO = 10_000;

export function bookingDepositKobo(startingPriceKobo: number) {
  if (!Number.isFinite(startingPriceKobo) || startingPriceKobo <= 0) {
    return MIN_DEPOSIT_KOBO;
  }
  const share =
    Math.round(
      ((startingPriceKobo * DEPOSIT_PERCENT) / 100) / ROUNDING_KOBO,
    ) * ROUNDING_KOBO;
  return Math.max(MIN_DEPOSIT_KOBO, share);
}

/** Paystack signs the raw webhook body with HMAC-SHA512 using the secret key. */
export function paystackSignatureMatches(input: {
  secret: string;
  body: string;
  signature: string | null;
}) {
  if (!input.secret || !input.signature) return false;
  const provided = input.signature.toLowerCase();
  if (!/^[a-f0-9]{128}$/.test(provided)) return false;
  const expected = createHmac("sha512", input.secret)
    .update(input.body, "utf8")
    .digest("hex");
  return timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(provided, "hex"),
  );
}
