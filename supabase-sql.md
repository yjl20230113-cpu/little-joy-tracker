-- Migration: add generated title support for memory records.
-- Run this in Supabase SQL editor.

BEGIN;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Optional: keep the schema self-documenting.
COMMENT ON COLUMN public.events.title IS 'AI-generated 4-6 character memory title';

COMMIT;

-- Migration: add single-record AI insight persistence for memory records.
-- Run this in Supabase SQL editor.

BEGIN;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS ai_insight_status TEXT
  CHECK (ai_insight_status IN ('pending', 'ready', 'failed'));

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS ai_insight_payload JSONB;

COMMENT ON COLUMN public.events.ai_insight_status IS 'Single-record AI insight generation state';
COMMENT ON COLUMN public.events.ai_insight_payload IS 'Persisted single-record AI insight JSON payload';

COMMIT;

-- Migration: add async auto-image persistence for memory records.
-- Run this in Supabase SQL editor.

BEGIN;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS auto_image_status TEXT
  CHECK (auto_image_status IN ('pending', 'ready', 'failed'));

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS auto_image_payload JSONB;

COMMENT ON COLUMN public.events.auto_image_status IS 'Async auto-image generation state for no-photo records';
COMMENT ON COLUMN public.events.auto_image_payload IS 'Persisted Unsplash auto-image metadata or failure payload';

COMMIT;

-- Migration: add user profiles for display name and avatar.
-- Run this in Supabase SQL editor.

BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.profiles IS 'User profile metadata for the Little Joy Tracker app';
COMMENT ON COLUMN public.profiles.display_name IS 'Editable display name shown in profile and default self person';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Public avatar URL stored in Supabase Storage';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

COMMIT;

-- One-time backfill for historical records.
-- This fills empty titles with a short Chinese summary derived from content/reason.
-- It only updates rows where title is missing or blank.
BEGIN;

WITH normalized AS (
  SELECT
    id,
    NULLIF(
      regexp_replace(
        regexp_replace(coalesce(content, ''), '[[:space:]]+', '', 'g'),
        '[^一-龥]+',
        '',
        'g'
      ),
      ''
    ) AS content_title,
    NULLIF(
      regexp_replace(
        regexp_replace(coalesce(reason, ''), '[[:space:]]+', '', 'g'),
        '[^一-龥]+',
        '',
        'g'
      ),
      ''
    ) AS reason_title
  FROM public.events
)
UPDATE public.events AS e
SET title = CASE
  WHEN char_length(coalesce(n.content_title, '')) >= 4 THEN left(n.content_title, 6)
  WHEN char_length(coalesce(n.reason_title, '')) >= 4 THEN left(n.reason_title, 6)
  ELSE '今日记录'
END
FROM normalized AS n
WHERE e.id = n.id
  AND (e.title IS NULL OR btrim(e.title) = '');

COMMIT;
