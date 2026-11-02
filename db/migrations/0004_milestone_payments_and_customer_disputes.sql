CREATE TYPE public.payment_milestone AS ENUM ('deposit', 'balance');
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  worker_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  milestone public.payment_milestone NOT NULL,
  amount_kobo integer NOT NULL CHECK (amount_kobo >= 0),
  status public.payment_status NOT NULL DEFAULT 'pending',
  reference text NOT NULL UNIQUE,
  channel text NOT NULL DEFAULT 'paystack_test',
  failure_reason text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payments_customer_created_idx
  ON public.payments (customer_id, created_at DESC);
CREATE INDEX payments_job_idx
  ON public.payments (job_id, created_at DESC);

-- A milestone may only be settled once; failed and pending attempts stay as history.
CREATE UNIQUE INDEX payments_job_milestone_confirmed_unique
  ON public.payments (job_id, milestone)
  WHERE status = 'confirmed';

ALTER TABLE public.disputes
  ADD COLUMN IF NOT EXISTS customer_id text REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS worker_id text REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL;

CREATE INDEX disputes_customer_idx
  ON public.disputes (customer_id, opened_at DESC);
CREATE INDEX disputes_job_idx
  ON public.disputes (job_id);
