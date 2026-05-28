alter table public.notifications
  add column if not exists idempotency_key text;

create unique index if not exists notifications_idempotency_uidx
  on public.notifications (idempotency_key)
  where idempotency_key is not null;