-- TEMPLATE ONLY — P02-T04 after secure API canary.
-- Audit existing policies/grants first. Do not run blindly.

begin;

-- alter table public.orders enable row level security;
-- alter table public.costs enable row level security;

-- Remove only policies/grants proven to allow unsafe public writes.
-- revoke insert, update, delete on table public.orders from anon;
-- revoke all on table public.costs from anon;

-- Create explicit admin policies using trusted authorization source.
-- Do not rely on user_metadata or `TO authenticated` alone.
-- UPDATE policies need correct USING and WITH CHECK.
-- Test anon/non-admin/admin/service matrix before commit.

commit;
