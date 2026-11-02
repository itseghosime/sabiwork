-- Public directory portraits. The demo sheet holds five illustrative faces, so
-- the index is a position in that sheet rather than an uploaded file reference.
ALTER TABLE public.artisan_profiles
  ADD COLUMN IF NOT EXISTS portrait_index integer;
