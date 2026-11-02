"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { formatNaira } from "@/features/search/data";

type PaystackHandler = { openIframe: () => void };
type PaystackPopup = {
  setup: (options: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    metadata?: Record<string, string>;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }) => PaystackHandler;
};

declare global {
  interface Window {
    PaystackPop?: PaystackPopup;
  }
}

type Phase = "idle" | "starting" | "checkout" | "verifying" | "pending" | "paid" | "error";

interface Receipt {
  reference: string;
  amountKobo: number;
  paidAt: string | null;
}

interface InitializePayload {
  reference: string;
  amountKobo: number;
  publicKey: string;
  accessCode: string;
  authorizationUrl: string;
}

function loadPaystackCheckout() {
  return new Promise<boolean>((resolve) => {
    if (window.PaystackPop) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-paystack-inline]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.PaystackPop)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.dataset.paystackInline = "true";
    script.onload = () => resolve(Boolean(window.PaystackPop));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BookingDeposit({
  artisanId,
  artisanName,
  amountKobo,
  paymentsEnabled,
  initialEmail = "",
  customerWorkspace = false,
}: {
  artisanId: string;
  artisanName: string;
  amountKobo: number;
  paymentsEnabled: boolean;
  initialEmail?: string;
  customerWorkspace?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const busy = phase === "starting" || phase === "checkout" || phase === "verifying";
  const fieldId = `deposit-email-${artisanId}`;

  async function confirm(reference: string) {
    setPhase("verifying");
    setMessage("Confirming the payment with Paystack…");
    try {
      const response = await fetch("/api/payments/deposit/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const body = (await response.json().catch(() => null)) as {
        data?: Receipt & { status?: string };
        error?: { message?: string };
      } | null;

      if (response.ok && body?.data?.status === "confirmed") {
        setReceipt({
          reference: body.data.reference,
          amountKobo: body.data.amountKobo,
          paidAt: body.data.paidAt ?? null,
        });
        setPhase("paid");
        setMessage("Deposit received.");
        return;
      }
      if (response.status === 202) {
        setPhase("pending");
        setMessage("Paystack is still confirming this payment. Refresh in a moment.");
        return;
      }
      setPhase("error");
      setMessage(body?.error?.message ?? "We could not confirm this deposit.");
    } catch {
      setPhase("error");
      setMessage("We could not reach the payment service. Please try again.");
    }
  }

  async function start() {
    setPhase("starting");
    setMessage("Opening the Paystack test checkout…");
    try {
      const response = await fetch("/api/payments/deposit/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId, email, customerWorkspace }),
      });
      const body = (await response.json().catch(() => null)) as {
        data?: InitializePayload;
        error?: { message?: string };
      } | null;

      const checkout = body?.data;
      if (!response.ok || !checkout) {
        setPhase("error");
        setMessage(body?.error?.message ?? "We could not start this deposit.");
        return;
      }

      const ready = await loadPaystackCheckout();
      if (!ready || !checkout.publicKey || !window.PaystackPop) {
        window.location.assign(checkout.authorizationUrl);
        return;
      }

      setPhase("checkout");
      setMessage("Complete the payment in the Paystack window.");
      window.PaystackPop.setup({
        key: checkout.publicKey,
        email,
        amount: checkout.amountKobo,
        ref: checkout.reference,
        metadata: { artisan_id: artisanId, artisan_name: artisanName },
        callback: (result) => {
          void confirm(result.reference || checkout.reference);
        },
        onClose: () => {
          setPhase((current) => {
            if (current !== "checkout") return current;
            setMessage("Checkout closed before the payment finished.");
            return "idle";
          });
        },
      }).openIframe();
    } catch {
      setPhase("error");
      setMessage("We could not reach the payment service. Please try again.");
    }
  }

  if (phase === "paid" && receipt) {
    return (
      <div className="pa-receipt" role="status">
        <span className="pa-receipt-icon">
          <Icon name="check" size={18} />
        </span>
        <p className="pa-receipt-title">Deposit received</p>
        <strong>{formatNaira(receipt.amountKobo)}</strong>
        <dl>
          <div>
            <dt>Reference</dt>
            <dd>{receipt.reference}</dd>
          </div>
          <div>
            <dt>Artisan</dt>
            <dd>{artisanName}</dd>
          </div>
        </dl>
        <small>Paystack test transaction — no real money moved.</small>
      </div>
    );
  }

  return (
    <form
      className="pa-booking-form"
      onSubmit={(event) => {
        event.preventDefault();
        void start();
      }}
    >
      <label htmlFor={fieldId}>Email for the receipt</label>
      <input
        id={fieldId}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={busy}
        required
        maxLength={254}
      />
      <button
        className="button button-primary pa-pay-button"
        type="submit"
        disabled={busy || !paymentsEnabled}
      >
        {busy ? "Contacting Paystack…" : `Pay ${formatNaira(amountKobo)} deposit`}
        {!busy && <Icon name="arrow" size={16} />}
      </button>
      {!paymentsEnabled && (
        <p className="pa-booking-note">
          Paystack test keys are not configured on this environment.
        </p>
      )}
      <p className="pa-booking-status" role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
