CREATE TYPE public.quote_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE public.job_status AS ENUM ('accepted', 'in_progress', 'completed', 'cancelled');

ALTER TABLE public.artisan_profiles
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS rate_guidance_kobo integer,
  ADD COLUMN IF NOT EXISTS availability_notes text,
  ADD COLUMN IF NOT EXISTS is_listed boolean NOT NULL DEFAULT true;

ALTER TABLE public.artisan_profiles
  ADD CONSTRAINT artisan_profiles_rate_non_negative
  CHECK (rate_guidance_kobo IS NULL OR rate_guidance_kobo >= 0);

CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.job_requests(id) ON DELETE CASCADE,
  worker_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  total_kobo integer NOT NULL CHECK (total_kobo >= 0),
  note text NOT NULL CHECK (char_length(note) BETWEEN 10 AND 2000),
  status public.quote_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, worker_id)
);

CREATE INDEX quotes_request_created_idx
  ON public.quotes (request_id, created_at DESC);

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE REFERENCES public.job_requests(id) ON DELETE CASCADE,
  accepted_quote_id uuid NOT NULL UNIQUE REFERENCES public.quotes(id) ON DELETE RESTRICT,
  customer_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  worker_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  status public.job_status NOT NULL DEFAULT 'accepted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX jobs_customer_idx
  ON public.jobs (customer_id, created_at DESC);
CREATE INDEX jobs_worker_idx
  ON public.jobs (worker_id, created_at DESC);

CREATE TABLE public.job_progress_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  note text NOT NULL CHECK (char_length(note) BETWEEN 3 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX job_progress_updates_job_idx
  ON public.job_progress_updates (job_id, created_at DESC);

CREATE TABLE public.job_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL UNIQUE REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  worker_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX job_reviews_worker_idx
  ON public.job_reviews (worker_id, created_at DESC);
