-- Phase 20B: Add nullable image_url column to public.offices
-- Allows offices to store a direct photo URL.
-- Nullable so all existing rows remain valid with no backfill required.
-- Frontend falls back to static images when NULL.

ALTER TABLE public.offices
  ADD COLUMN IF NOT EXISTS image_url text;