CREATE TYPE public.app_role AS ENUM ('customer', 'artisan', 'admin');
CREATE TYPE public.artisan_verification_status AS ENUM (
  'unsubmitted',
  'pending',
  'approved',
  'rejected'
);
CREATE TYPE public.job_request_status AS ENUM (
  'draft',
  'submitted',
  'matching',
  'cancelled'
);

CREATE TABLE public.user_profiles (
  user_id text PRIMARY KEY,
  role public.app_role NOT NULL,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.artisan_profiles (
  user_id text PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  contact_phone text NOT NULL CHECK (char_length(contact_phone) BETWEEN 8 AND 20),
  primary_trade text NOT NULL CHECK (char_length(primary_trade) BETWEEN 2 AND 100),
  experience_years integer NOT NULL CHECK (experience_years BETWEEN 0 AND 60),
  coverage_areas text[] NOT NULL CHECK (cardinality(coverage_areas) > 0),
  workshop_area text NOT NULL CHECK (char_length(workshop_area) BETWEEN 2 AND 100),
  bio text NOT NULL CHECK (char_length(bio) BETWEEN 20 AND 2000),
  verification_status public.artisan_verification_status NOT NULL DEFAULT 'unsubmitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.job_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  category text NOT NULL CHECK (char_length(category) BETWEEN 2 AND 80),
  service_area text NOT NULL CHECK (char_length(service_area) BETWEEN 2 AND 100),
  description text NOT NULL CHECK (char_length(description) BETWEEN 20 AND 2000),
  budget_guidance_kobo integer NOT NULL CHECK (budget_guidance_kobo >= 0),
  status public.job_request_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX job_requests_customer_created_idx
  ON public.job_requests (customer_id, created_at DESC, id DESC);
