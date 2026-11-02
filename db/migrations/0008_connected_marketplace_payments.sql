-- Keep existing historical rows intact. New milestone checkouts use Paystack
-- verification, and job readiness/sign-off are independent of payment status.
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS work_ready_at timestamptz,
  ADD COLUMN IF NOT EXISTS signed_off_at timestamptz;
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS checkout_url text,
  ADD COLUMN IF NOT EXISTS access_code text;
-- Job row locks serialize initialization and settlement for each milestone.
CREATE UNIQUE INDEX IF NOT EXISTS payments_one_active_checkout
  ON public.payments (job_id, milestone)
  WHERE status IN ('pending', 'confirmed') AND channel = 'paystack_verified_test';
