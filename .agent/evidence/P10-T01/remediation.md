# P10-T01 — Remediation theo LO-TRINH-FIX-20260803.md — Evidence

Task: `P10-T01` · Owner: `project-orchestrator` · Status: `completed (F1-F6 done)` · Date: 2026-08-03

## Applied fixes

| # | Sev | Fix | File(s) | Verify |
|---|---|---|---|---|
| F1 | Critical | Booking API insert dùng cột production: `buildSupabaseOrderPayload()` mới (`phone_number`/`total_amount`/`address`); `orders.js` insert qua payload mới, giữ `buildLegacyOrderData` cho response | `js/order-schema.js`, `functions/api/orders.js` | Test mới assert payload keys + `toBeUndefined` cho cột cũ; **72/72 PASS** |
| F4 | High | API catch 23505 → re-find → replay success (race double-submit). **Index đã tồn tại sẵn** (`orders_idempotency_key_uq`, verify pg_indexes) — reviewer 2 nhầm; migration file = idempotent safeguard | `functions/api/orders.js`, `supabase/migrations/20260803_idempotency_unique_index.sql` | Test mới "replays raced duplicate insert" PASS |
| F3 | High | Stored XSS admin: thêm `esc()` (HTML escape) + áp dụng tại sink innerHTML user-data: orders/booking list, best-services, top-customers, customer-list, cost-list, payment grid, invoice preview | `js/app.js` | 72/72 PASS; build PASS |
| F2 | High | Signup disabled (`disable_signup=true` qua Management API, verify signup → 422); policy orders chuyển `authenticated USING(true)` → `is_admin()` (raw_app_meta_data role='admin'); chưa có auth user nào nên không khóa ai | `supabase/migrations/20260803_admin_only_orders_policies.sql` + API | signup 422, anon orders 42501, anon services 200 |
| F6 | Medium | ADR-010 đánh dấu superseded bởi ADR-011 | `.agent/state/DECISIONS.md` | docs review |
| F5 | High | Migrate `js/app.js` admin/POS client → production project | `js/app.js` (URL+key) | **DONE 2026-08-03**: legacy anon key đã lộ → không revoke được qua Management API (id `anon` không phải UUID, chỉ dashboard); dùng **publishable key mới** (`sb_publishable_...`, chưa từng lộ, verify REST 200/42501); update cả `asset_inventory.json` |

## Verification snapshot
- `npm test`: **72/72 PASS** (9 files — +2 test F1/F4).
- `npm run build`: PASS (shell 61.61KB / 3D 131.44KB gzip).
- `npm run typecheck`: PASS.
- Production probes: signup → 422; anon SELECT orders → 42501; anon SELECT services → 200; pg_policies = orders admin select/insert/update + services public select + is_admin() fn.

## Remaining
- **Key rotation DEFERRED (ADR-012, owner quyết định 2026-08-03)**: giữ nguyên anon + service_role cho tới khi hoàn thành dự án; rotate sau. Legacy anon key đã lộ vẫn valid (exp 2101) nhưng RLS lockdown khóa anon (chỉ SELECT services public) → rủi ro thấp. Ghi chú: publishable key `sb_publishable_WPMLea8mF...` đã dùng cho client admin (js/app.js).
- Canary POST thật `/api/orders` (cần deploy CF Functions — Bước 12/13).
- Verify admin dashboard production sau deploy (đơn booking mới hiển thị).
