# P03-T02 — Supabase RLS probe (anon path) — Evidence

Task: `P03-T02` (RLS cutover) · Probed by `database-security-auditor` · Date: 2026-08-03
Status: RLS cutover chưa hoàn tất (chờ policy export); probe anon path đã chạy với anon key production.

## Context (ADR-010 resolved)
- Production project: `vmakonkiotjkxlhpjwny`
- Anon key do owner cung cấp (2026-08-03), JWT decode: `{"iss":"supabase","ref":"vmakonkiotjkxlhpjwny","role":"anon","iat":1785565176,"exp":2101141176}`.
- Catalog chuẩn: repo `js/service-catalog.js` (7 services) — DB (4 services) sẽ được đồng bộ theo repo.

## Anon REST probe (PostgREST `https://vmakonkiotjkxlhpjwny.supabase.co/rest/v1`)

| Operation | Table | Result | RLS signal |
|---|---|---|---|
| GET `?select=id,base_price` | services | HTTP 200, 4 rows (CLEAN_STANDARD 90K, CLEAN_PREMIUM 150K, REPAIR_SOLE 200K, PROTECT_NANO 80K) | Anon SELECT services allowed |
| GET `?select=*&limit=1` | orders | HTTP 200, `[]` | Anon SELECT orders allowed (không row hiển thị) |
| GET `?select=*&limit=1` | order_items | HTTP 200, `[]` | Anon SELECT order_items allowed |
| POST (insert) | orders | HTTP 401, `42501 new row violates row-level security policy for table "orders"` | **Anon INSERT bị chặn → RLS enabled** |
| POST (insert) | services | HTTP 401, `42501 ... violates row-level security policy for table "services"` | **Anon INSERT bị chặn (RLS)** |
| DELETE `?note=eq...` | orders | HTTP 200 `[]` | Anon DELETE returns empty (RLS filter) |
| PATCH | orders | HTTP 204 | Anon UPDATE returns empty |

`42501` (violates RLS policy) trên writes cho cả anon an động, trong khi SELECT services trả data → RLS đã triển khai ở production: **reads permitted (public services catalog), writes blocked for anonymous**.

## Schema probe (POST `{}` error leak)
- `orders` có NOT NULL constraint trên `customer_name` (23502 leak) → schema legacy với cột `customer_name`/`user_id`/`phone_number`/`total_amount`; chưa xác nhận `idempotency_key`/`source` từ REST (cần dump SQL).

## Booking API impact
- `functions/api/orders.js:167` dùng `env.SUPABASE_SERVICE_ROLE_KEY` (bypass RLS) để insert/re-read orders → API không bị ảnh hưởng bởi RLS anon-block. Verified tại code, không phải cấu hình mới.

## Gap còn lại (chờ owner)
- Policy export/SQL đầy đủ (`supabase db dump --schema public`) vẫn chưa có: cần để (a) xác định đúng policy set hiện hành (bảng nào còn anon-write, `orders` có `idempotency_key`/`source` hay chưa), (b) soạn migration "lockdown" chính xác theo schema.
- Anon key đã paste trong chat → nên rotate sau khi hoàn tất probe (theo ADR-010).

## Next steps
1. Owner cung cấp `supabase db dump --schema public` (hoặc dashboard) cho P03-T02 hoàn tất lockdown migration.
2. Sau khi có, soạn RLS hardening SQL: các policy hiện tại = base, bổ sung SELECT services public, INSERT orders qua service_role (anonymous denied), UPDATE/DELETE denied anon.