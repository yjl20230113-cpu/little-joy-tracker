-- Migration: add generated title support for memory records.
-- Run this in Supabase SQL editor.

BEGIN;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Optional: keep the schema self-documenting.
COMMENT ON COLUMN public.events.title IS 'AI-generated 4-6 character memory title';

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
