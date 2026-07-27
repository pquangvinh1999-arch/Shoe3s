-- TEMPLATE ONLY — inspect current schema and generate a real migration with
-- Supabase tooling. Do not run blindly in production.

begin;

-- Optional structured fields; adapt types/names to current orders table.
-- alter table public.orders add column if not exists service_items jsonb;
-- alter table public.orders add column if not exists idempotency_key uuid;
-- alter table public.orders add column if not exists source text;
-- alter table public.orders add column if not exists pricing_version text;
-- create unique index if not exists orders_idempotency_key_uq
--   on public.orders(idempotency_key)
--   where idempotency_key is not null;

-- Do NOT revoke existing anonymous write in this prepare migration.
-- First deploy and verify secure API cutover.

commit;
