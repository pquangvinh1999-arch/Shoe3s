-- P03-T02 RLS Lockdown Migration
-- Project: vmakonkiotjkxlhpjwny (Landing3s, production)
-- Date: 2026-08-03
-- Purpose: Lockdown RLS: anonymous read-only public services catalog;
--          writes chỉ qua service_role (API /api/orders). Admin (authenticated)
--          giữ SELECT/UPDATE orders cho dashboard.
-- Baseline: schema probe + pg_policies + role_table_grants 2026-08-03.

BEGIN;

-- ============================================================
-- 1. services: public read-only (catalog public)
-- ============================================================
REVOKE INSERT, UPDATE, DELETE ON public.services FROM anon, authenticated;
DROP POLICY IF EXISTS "Cho phep public xem danh muc dich vu" ON public.services;
CREATE POLICY "services_public_select_active" ON public.services
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- ============================================================
-- 2. orders: anon read-none / write-none;
--    authenticated = admin (dashboard SELECT/UPDATE + POS INSERT khi
--    xác nhận thanh toán offline-sync — xem js/app.js confirmPayment);
--    service_role (API orders.js) bypass RLS.
-- ============================================================
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon;
REVOKE SELECT ON public.orders FROM anon;
DROP POLICY IF EXISTS "Cho phep khach hang tao don hang" ON public.orders;
DROP POLICY IF EXISTS "Cho phep Admin quan ly toan bo don hang" ON public.orders;

CREATE POLICY "orders_authenticated_select" ON public.orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "orders_authenticated_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "orders_authenticated_update" ON public.orders
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- anon/authenticated KHÔNG DELETE orders: xóa chỉ qua service_role/API.

-- ============================================================
-- 3. order_items: chỉ service_role (API); chặn anon/authenticated
-- ============================================================
REVOKE ALL ON public.order_items FROM anon, authenticated;
DROP POLICY IF EXISTS "Cho phep public tao chi tiet don hang" ON public.order_items;
DROP POLICY IF EXISTS "Cho phep Admin xem chi tiet don hang" ON public.order_items;

COMMIT;

-- ============================================================
-- Verify plan (chạy thủ công sau khi apply):
--   1. SELECT is_active FROM services;                    -> anon 200 + rows
--   2. POST /rest/v1/orders (anon)                        -> 42501
--   3. POST /rest/v1/order_items (anon)                   -> 42501
--   4. POST /api/orders với service_role (CF Worker)      -> 200 (canary)
--   5. DELETE/PATCH orders (anon)                         -> 42501
-- Rollback: dùng dump trước migration hoặc re-create policies cũ ở trên.
-- ============================================================
