CREATE TABLE IF NOT EXISTS public.artisan_training_progress (
  artisan_id text NOT NULL
    REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  module_id text NOT NULL,
  completed_section_ids text[] NOT NULL DEFAULT ARRAY[]::text[],
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artisan_training_progress_artisan_module_unique
    UNIQUE (artisan_id, module_id)
);

COMMENT ON TABLE public.artisan_training_progress IS
  'Per-artisan progress for the SabiWork learning guides. Completion is educational only and is not an accredited credential.';
