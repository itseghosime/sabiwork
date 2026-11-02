-- Escrow releases settle through Paystack Transfers. A hold needs a resolved
-- NUBAN recipient before it can be paid out, so the payout account lives on the
-- hold itself rather than on the artisan profile (the artisan may change banks
-- between milestones, and a historical hold must keep the account it paid).
--
-- The transfer is tracked separately from escrow_status on purpose: a payout
-- that fails, reverses, or is abandoned must never leave a milestone marked as
-- released.
ALTER TABLE public.escrow_holds
  ADD COLUMN IF NOT EXISTS artisan_id text
    REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payout_account_number text,
  ADD COLUMN IF NOT EXISTS payout_bank_code text,
  ADD COLUMN IF NOT EXISTS payout_account_name text,
  ADD COLUMN IF NOT EXISTS recipient_code text,
  ADD COLUMN IF NOT EXISTS transfer_code text,
  ADD COLUMN IF NOT EXISTS transfer_reference text,
  ADD COLUMN IF NOT EXISTS transfer_status text,
  ADD COLUMN IF NOT EXISTS transfer_failure_reason text,
  ADD COLUMN IF NOT EXISTS paid_out_at timestamptz;

ALTER TABLE public.escrow_holds
  ADD CONSTRAINT escrow_holds_transfer_status_check
  CHECK (
    transfer_status IS NULL
    OR transfer_status IN ('pending', 'otp', 'success', 'failed', 'reversed', 'abandoned')
  );

ALTER TABLE public.escrow_holds
  ADD CONSTRAINT escrow_holds_account_number_check
  CHECK (payout_account_number IS NULL OR payout_account_number ~ '^[0-9]{10}$');

CREATE UNIQUE INDEX IF NOT EXISTS escrow_holds_transfer_reference_key
  ON public.escrow_holds (transfer_reference)
  WHERE transfer_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS escrow_holds_transfer_status_idx
  ON public.escrow_holds (transfer_status)
  WHERE transfer_status IS NOT NULL;
