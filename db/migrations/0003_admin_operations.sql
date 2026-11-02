CREATE TYPE public.dispute_status AS ENUM (
  'open',
  'under_review',
  'awaiting_evidence',
  'escalated',
  'resolved'
);
CREATE TYPE public.dispute_priority AS ENUM ('urgent', 'high', 'normal');
CREATE TYPE public.escrow_status AS ENUM ('held', 'release_due', 'released', 'disputed');
CREATE TYPE public.escrow_milestone AS ENUM ('deposit', 'balance');
CREATE TYPE public.audit_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE public.desk_ticket_status AS ENUM ('new', 'open', 'waiting', 'resolved');
CREATE TYPE public.desk_channel AS ENUM ('email', 'chat', 'phone');

CREATE TABLE public.disputes (
  id text PRIMARY KEY CHECK (char_length(id) BETWEEN 3 AND 40),
  title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  job_ref text NOT NULL CHECK (char_length(job_ref) BETWEEN 3 AND 40),
  trade text NOT NULL CHECK (char_length(trade) BETWEEN 2 AND 80),
  area text NOT NULL CHECK (char_length(area) BETWEEN 2 AND 80),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 100),
  artisan_name text NOT NULL CHECK (char_length(artisan_name) BETWEEN 2 AND 100),
  amount_kobo integer NOT NULL CHECK (amount_kobo >= 0),
  status public.dispute_status NOT NULL DEFAULT 'open',
  priority public.dispute_priority NOT NULL DEFAULT 'normal',
  officer text,
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 10 AND 2000),
  customer_statement text NOT NULL CHECK (char_length(customer_statement) BETWEEN 10 AND 2000),
  artisan_statement text NOT NULL CHECK (char_length(artisan_statement) BETWEEN 10 AND 2000),
  determination text,
  determination_note text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  sla_due_at timestamptz NOT NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX disputes_status_opened_idx
  ON public.disputes (status, opened_at DESC);

CREATE TABLE public.dispute_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id text NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 200),
  kind text NOT NULL CHECK (char_length(kind) BETWEEN 2 AND 80),
  submitted_by text NOT NULL CHECK (submitted_by IN ('customer', 'artisan', 'system')),
  verified boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dispute_evidence_dispute_idx
  ON public.dispute_evidence (dispute_id, submitted_at DESC);

CREATE TABLE public.dispute_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id text NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(label) BETWEEN 2 AND 120),
  detail text NOT NULL CHECK (char_length(detail) BETWEEN 3 AND 1000),
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dispute_events_dispute_idx
  ON public.dispute_events (dispute_id, occurred_at);

CREATE TABLE public.escrow_holds (
  id text PRIMARY KEY CHECK (char_length(id) BETWEEN 3 AND 40),
  job_ref text NOT NULL CHECK (char_length(job_ref) BETWEEN 3 AND 40),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  trade text NOT NULL CHECK (char_length(trade) BETWEEN 2 AND 80),
  area text NOT NULL CHECK (char_length(area) BETWEEN 2 AND 80),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 100),
  artisan_name text NOT NULL CHECK (char_length(artisan_name) BETWEEN 2 AND 100),
  payout_bank text NOT NULL CHECK (char_length(payout_bank) BETWEEN 3 AND 120),
  amount_kobo integer NOT NULL CHECK (amount_kobo >= 0),
  milestone public.escrow_milestone NOT NULL,
  status public.escrow_status NOT NULL DEFAULT 'held',
  signed_off boolean NOT NULL DEFAULT false,
  held_since timestamptz NOT NULL DEFAULT now(),
  release_due_at timestamptz NOT NULL,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX escrow_holds_status_due_idx
  ON public.escrow_holds (status, release_due_at);

CREATE TABLE public.commission_tiers (
  id text PRIMARY KEY CHECK (char_length(id) BETWEEN 3 AND 40),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  badge text NOT NULL CHECK (char_length(badge) BETWEEN 1 AND 40),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 400),
  commission_bps integer NOT NULL CHECK (commission_bps BETWEEN 0 AND 5000),
  payout_window_days integer NOT NULL CHECK (payout_window_days BETWEEN 0 AND 60),
  min_completed_jobs integer NOT NULL DEFAULT 0 CHECK (min_completed_jobs >= 0),
  min_rating_tenths integer NOT NULL DEFAULT 0 CHECK (min_rating_tenths BETWEEN 0 AND 50),
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trade_categories (
  id text PRIMARY KEY CHECK (char_length(id) BETWEEN 3 AND 40),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  icon text NOT NULL CHECK (char_length(icon) BETWEEN 2 AND 40),
  active_artisans integer NOT NULL DEFAULT 0 CHECK (active_artisans >= 0),
  median_rate_kobo integer NOT NULL DEFAULT 0 CHECK (median_rate_kobo >= 0),
  default_tier_id text NOT NULL REFERENCES public.commission_tiers(id) ON DELETE RESTRICT,
  active boolean NOT NULL DEFAULT true,
  last_reviewed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE public.audit_log_seq START WITH 90500;

CREATE TABLE public.audit_logs (
  id text PRIMARY KEY DEFAULT ('AUD-' || nextval('public.audit_log_seq')::text),
  actor text NOT NULL CHECK (char_length(actor) BETWEEN 1 AND 120),
  actor_role text NOT NULL CHECK (char_length(actor_role) BETWEEN 1 AND 80),
  action text NOT NULL CHECK (char_length(action) BETWEEN 3 AND 120),
  target text NOT NULL CHECK (char_length(target) BETWEEN 1 AND 200),
  gateway text NOT NULL DEFAULT 'BN-04' CHECK (char_length(gateway) BETWEEN 1 AND 40),
  severity public.audit_severity NOT NULL DEFAULT 'info',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_occurred_idx
  ON public.audit_logs (occurred_at DESC);

CREATE TABLE public.desk_tickets (
  id text PRIMARY KEY CHECK (char_length(id) BETWEEN 3 AND 40),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 200),
  from_label text NOT NULL CHECK (char_length(from_label) BETWEEN 2 AND 120),
  channel public.desk_channel NOT NULL DEFAULT 'email',
  status public.desk_ticket_status NOT NULL DEFAULT 'new',
  priority public.dispute_priority NOT NULL DEFAULT 'normal',
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 10 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.desk_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text NOT NULL REFERENCES public.desk_tickets(id) ON DELETE CASCADE,
  author text NOT NULL CHECK (char_length(author) BETWEEN 1 AND 120),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX desk_ticket_replies_ticket_idx
  ON public.desk_ticket_replies (ticket_id, created_at);
