-- Phase 20C-A: Add nullable idempotency_key to offices.
-- Scoped uniqueness: one key per (owner_id, idempotency_key) while not soft-deleted.
-- NULL keys are excluded from the unique index so un-keyed rows never conflict.

ALTER TABLE public.offices
  ADD COLUMN IF NOT EXISTS idempotency_key uuid;

CREATE UNIQUE INDEX IF NOT EXISTS offices_owner_idempotency_active_uidx
  ON public.offices (owner_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL
    AND deleted_at IS NULL;