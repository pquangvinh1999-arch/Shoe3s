-- P10-T01 F2 — Restrict orders policies to admin role (PII protection)
-- Project: vmakonkiotjkxlhpjwny (production)
-- Date: 2026-08-03
-- Context: disable_signup = true (đã set qua Management API 2026-08-03).
--          authenticated bất kỳ (nếu signup mở) từng đọc/sửa toàn bộ orders
--          (policy USING(true)) → PII leak. Chỉ admin claim được truy cập.
-- Note: chưa có auth user nào (probe 2026-08-03) nên không khóa ai hiện tại.
--       Admin user phải có app_metadata.role = 'admin' (set khi tạo qua dashboard
--       hoặc UPDATE auth.users).

BEGIN;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.raw_app_meta_data ->> 'role' = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS orders_authenticated_select ON public.orders;
DROP POLICY IF EXISTS orders_authenticated_insert ON public.orders;
DROP POLICY IF EXISTS orders_authenticated_update ON public.orders;

CREATE POLICY orders_admin_select ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY orders_admin_insert ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY orders_admin_update ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMIT;

-- Verify:
--   1. Signup: POST /auth/v1/signup → 422 (signup disabled).
--   2. anon SELECT orders → 42501 (đã chặn từ lockdown).
--   3. authenticated token (non-admin) SELECT orders → 0 rows / 42501.
--   4. authenticated token (admin claim) SELECT orders → data.
-- Rollback: drop 3 policies admin + is_admin(), re-create orders_authenticated_*.
