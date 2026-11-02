-- Deposits taken from the public artisan directory. Every row is created
-- server-side before the browser sees a reference, and only a server-side
-- Paystack verification (or a signed webhook) can confirm it.
CREATE TABLE IF NOT EXISTS public.booking_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  amount_kobo integer NOT NULL CHECK (amount_kobo > 0),
  reference text NOT NULL UNIQUE,
  status public.payment_status NOT NULL DEFAULT 'pending',
  channel text NOT NULL DEFAULT 'paystack_test',
  failure_reason text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_deposits_artisan_created_idx
  ON public.booking_deposits (artisan_id, created_at DESC);
