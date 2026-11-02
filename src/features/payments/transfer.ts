/** Outbound escrow payouts settled through Paystack Transfers. */
export const escrowTransferStatuses = [
  "pending",
  "otp",
  "success",
  "failed",
  "reversed",
  "abandoned",
] as const;

export type EscrowTransferStatus = (typeof escrowTransferStatuses)[number];

const NUBAN_PATTERN = /^[0-9]{10}$/;

export function isNuban(value: unknown): value is string {
  return typeof value === "string" && NUBAN_PATTERN.test(value);
}

export function maskAccountNumber(accountNumber: string | null): string | null {
  if (!accountNumber || accountNumber.length < 4) return null;
  return `••••${accountNumber.slice(-4)}`;
}

/**
 * Paystack also reports in-flight transfers as queued/receiving. Anything
 * unrecognised is treated as still pending rather than failed, so a new gateway
 * state can never leave a milestone marked as released.
 */
export function normalizeTransferStatus(status: string): EscrowTransferStatus {
  const value = status.trim().toLowerCase();
  return (escrowTransferStatuses as readonly string[]).includes(value)
    ? (value as EscrowTransferStatus)
    : "pending";
}

/** True once the money has actually left the platform balance. */
export function payoutIsSettled(status: EscrowTransferStatus | null): boolean {
  return status === "success";
}

/** True when the payout returned the money and the milestone is payable again. */
export function payoutWasReturned(status: EscrowTransferStatus | null): boolean {
  return status === "failed" || status === "reversed" || status === "abandoned";
}
