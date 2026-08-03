# P03-T02 — RLS Lockdown Migration Applied — Evidence

Task: `P03-T02` (RLS cutover) · Owner: `database-security-auditor` · Date: 2026-08-03
Status: **COMPLETE** — lockdown migration đã áp dụng + verify production `vmakonkiotjkxlhpjwny`.

## Inputs (R-008 resolved)
- Management API (PAT owner) — `api.supabase.com/v1/projects/vmakonkiotjkxlhpjwny/database/query`.
- Schema probe: `orders` có đủ cột booking mới: `idempotency_key` (uuid), `idempotency_payload_hash` (text), `source`, `service_items` (jsonb), `pricing_version` → xác nhận từ trước khi lockdown.
- Baseline policies cũ (5 policies, roles `public`): services SELECT (is_active), orders ALL authenticated + INSERT with_check true, order_items SELECT authenticated + INSERT with_check true. Grants: anon/authenticated/service_role đều được grant đầy đủ (Supabase default) — tiềm ẩn rủi ro nếu policy public với_check true match.

## Migration applied (`supabase/migrations/20260803_rls_lockdown.sql`)
1. `services`: REVOKE INSERT/UPDATE/DELETE anon+authenticated; drop policy cũ; tạo `services_public_select_active` (SELECT to anon, authenticated USING is_active).
2. `orders`: REVOKE toàn bộ anon (SELECT/INSERT/UPDATE/DELETE); drop 2 policy cũ; tạo `orders_authenticated_select` / `_insert` / `_update` (admin dashboard + POS insert khi xác nhận thanh toán, js/app.js:614). DELETE không cấp cho authenticated → xóa chỉ qua service_role.
3. `order_items`: REVOKE ALL anon+authenticated; drop 2 policy cũ. Chỉ service_role (API) dùng; bảng này không được booking API mới dùng trực tiếp (dùng service_items jsonb trên orders).

## Post-apply verification (REST, anon key production)
| Operation | Result | Expected |
|---|---|---|
| GET services (anon) | HTTP 200, 4 rows | ✓ public catalog readable |
| GET orders (anon) | HTTP 401 `42501 permission denied for table orders` | ✓ write+read blocked |
| POST orders (anon) | HTTP 401 `42501 ... orders` | ✓ anon INSERT blocked |
| POST order_items (anon) | HTTP 401 `42501 ... order_items` | ✓ anon INSERT blocked |
| pg_policies | 4 policies mới (orders auth select/insert/update, services public select) | ✓ đúng intent |

Khác biệt so với baseline: anon giờ bị `permission denied` (revoke grant) thay vì `violates RLS policy` — chặt hơn, không còn phụ thuộc policy match.

## Booking API impact
`functions/api/orders.js:167` dùng `SUPABASE_SERVICE_ROLE_KEY` → bypass RLS, không bị ảnh hưởng. Canary tại API (P08-T01) sẽ verify end-to-end sau deploy.

## Rollback
- Dump trước migration không tạo; nếu cần rollback: re-grant quyền anon (GRANT ALL ON orders/order_items/services TO anon, authenticated) + re-create 5 policies cũ (SQL trong migration file comment).

## Next
- P03-T02 → done. Mở khóa P05-T01 exit criteria → Bước 7 (progress report). Anon key production đã dùng probe → nên rotate theo ADR-010 (key cũ paste chat 2026-08-03).
