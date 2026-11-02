import "server-only";

const PAYSTACK_BASE = "https://api.paystack.co";

export class PaystackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaystackError";
  }
}

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export function paystackTestMode() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY ?? "";
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
  return (
    secretKey.startsWith("sk_test_") &&
    (!publicKey || publicKey.startsWith("pk_test_"))
  );
}

export function paystackPublicKey() {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
}

function paystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new PaystackError("Paystack test keys are not configured.");
  return key;
}

type InitializeResponse = {
  status?: boolean;
  message?: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
};

export interface PaystackCheckout {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializePaystackTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}): Promise<PaystackCheckout> {
  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as
    | InitializeResponse
    | null;
  const data = body?.data;
  if (
    !response.ok ||
    !body?.status ||
    !data?.authorization_url ||
    !data.access_code
  ) {
    throw new PaystackError(
      body?.message ?? "Paystack could not start this payment.",
    );
  }
  return {
    authorizationUrl: data.authorization_url,
    accessCode: data.access_code,
    reference: data.reference ?? input.reference,
  };
}

type VerifyResponse = {
  status?: boolean;
  message?: string;
  data?: {
    status?: string;
    amount?: number;
    currency?: string;
    paid_at?: string | null;
    gateway_response?: string | null;
    reference?: string;
  };
};

type Envelope<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

async function callPaystack<T>(
  path: string,
  init: { method?: string; body?: unknown; fallbackMessage: string },
): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${paystackSecretKey()}`,
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !body?.status || body.data === undefined) {
    throw new PaystackError(body?.message ?? init.fallbackMessage);
  }
  return body.data;
}

export interface PaystackVerification {
  reference: string;
  status: string;
  amountKobo: number;
  currency: string;
  paidAt: Date | null;
  gatewayResponse: string | null;
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerification | null> {
  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${paystackSecretKey()}` },
      cache: "no-store",
    },
  );
  const body = (await response.json().catch(() => null)) as
    | VerifyResponse
    | null;
  if (response.status === 404 || /not found/i.test(body?.message ?? "")) {
    return null;
  }
  const data = body?.data;
  if (!response.ok || !body?.status || !data) {
    throw new PaystackError(
      body?.message ?? "Paystack could not verify this payment.",
    );
  }
  return {
    reference: data.reference ?? reference,
    status: data.status ?? "unknown",
    amountKobo: data.amount ?? 0,
    currency: data.currency ?? "",
    paidAt: data.paid_at ? new Date(data.paid_at) : null,
    gatewayResponse: data.gateway_response ?? null,
  };
}

export interface PaystackBank {
  name: string;
  code: string;
}

export async function listPaystackBanks(): Promise<PaystackBank[]> {
  const data = await callPaystack<
    { name?: string; code?: string }[]
  >("/bank?currency=NGN", { fallbackMessage: "Paystack could not list banks." });
  return data
    .filter((bank): bank is { name: string; code: string } =>
      Boolean(bank.name && bank.code),
    )
    .map((bank) => ({ name: bank.name, code: bank.code }));
}

export interface PaystackResolvedAccount {
  accountNumber: string;
  accountName: string;
}

export async function resolvePaystackAccount(input: {
  accountNumber: string;
  bankCode: string;
}): Promise<PaystackResolvedAccount> {
  const query = new URLSearchParams({
    account_number: input.accountNumber,
    bank_code: input.bankCode,
  });
  const data = await callPaystack<{
    account_number?: string;
    account_name?: string;
  }>(`/bank/resolve?${query.toString()}`, {
    fallbackMessage: "Paystack could not resolve that account.",
  });
  if (!data.account_name) {
    throw new PaystackError("Paystack could not resolve that account.");
  }
  return {
    accountNumber: data.account_number ?? input.accountNumber,
    accountName: data.account_name,
  };
}

export interface PaystackRecipient {
  recipientCode: string;
  accountName: string;
}

export async function createPaystackTransferRecipient(input: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<PaystackRecipient> {
  const data = await callPaystack<{
    recipient_code?: string;
    details?: { account_name?: string };
  }>("/transferrecipient", {
    method: "POST",
    body: {
      type: "nuban",
      name: input.name,
      account_number: input.accountNumber,
      bank_code: input.bankCode,
      currency: "NGN",
    },
    fallbackMessage: "Paystack could not register that payout account.",
  });
  if (!data.recipient_code) {
    throw new PaystackError("Paystack could not register that payout account.");
  }
  return {
    recipientCode: data.recipient_code,
    accountName: data.details?.account_name ?? input.name,
  };
}

export interface PaystackTransfer {
  reference: string;
  transferCode: string | null;
  status: string;
  amountKobo: number;
  recipientCode: string | null;
  failureReason: string | null;
}

type TransferData = {
  reference?: string;
  transfer_code?: string;
  status?: string;
  amount?: number;
  recipient?: string | { recipient_code?: string };
  failure_reason?: string | null;
  gateway_response?: string | null;
};

function toPaystackTransfer(data: TransferData, fallbackReference: string): PaystackTransfer {
  const recipient = data.recipient;
  return {
    reference: data.reference ?? fallbackReference,
    transferCode: data.transfer_code ?? null,
    status: data.status ?? "unknown",
    amountKobo: data.amount ?? 0,
    recipientCode:
      typeof recipient === "string"
        ? recipient
        : (recipient?.recipient_code ?? null),
    failureReason: data.failure_reason ?? data.gateway_response ?? null,
  };
}

export async function initiatePaystackTransfer(input: {
  amountKobo: number;
  recipientCode: string;
  reason: string;
  reference: string;
}): Promise<PaystackTransfer> {
  const data = await callPaystack<TransferData>("/transfer", {
    method: "POST",
    body: {
      source: "balance",
      amount: input.amountKobo,
      recipient: input.recipientCode,
      reason: input.reason,
      reference: input.reference,
      currency: "NGN",
    },
    fallbackMessage: "Paystack could not start this payout.",
  });
  return toPaystackTransfer(data, input.reference);
}

export async function verifyPaystackTransfer(
  reference: string,
): Promise<PaystackTransfer | null> {
  const response = await fetch(
    `${PAYSTACK_BASE}/transfer/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${paystackSecretKey()}` },
      cache: "no-store",
    },
  );
  const body = (await response.json().catch(() => null)) as
    | Envelope<TransferData>
    | null;
  if (response.status === 404) return null;
  if (!response.ok || !body?.status || !body.data) {
    throw new PaystackError(
      body?.message ?? "Paystack could not verify this payout.",
    );
  }
  return toPaystackTransfer(body.data, reference);
}

export async function finalizePaystackTransfer(input: {
  transferCode: string;
  otp: string;
}): Promise<PaystackTransfer> {
  const data = await callPaystack<TransferData>("/transfer/finalize_transfer", {
    method: "POST",
    body: { transfer_code: input.transferCode, otp: input.otp },
    fallbackMessage: "Paystack rejected that transfer OTP.",
  });
  return toPaystackTransfer(data, "");
}
