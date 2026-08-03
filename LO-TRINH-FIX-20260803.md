# LO-TRINH-FIX-20260803.md — Verified review findings & fix roadmap

Task: `P09-T01` (consensus + verified fix roadmap) · Date: 2026-08-03
Reviewers: GPT-5.6 (`reports/09_independent-review-gpt.md`, 78/100, 3 High) + reviewer 2 (`reports/09_independent-review-second.md`, 63/100, 1 Critical + 5 High). Commit review: `9012984`.

## Status 2026-08-03: F1–F6 all DONE (P10-T01 closed, chờ commit)
- F1/F3/F4/F6: done — tests 72/72 PASS, build/typecheck PASS.
- F2: done + verify production (signup 422, anon orders 42501, services 200).
- F5: done — js/app.js migrate sang production với **publishable key mới** (`sb_publishable_WPMLea8mF-BtOWmMkJ308Q_sem38QoF`, chưa từng lộ; verify REST 200/42501); update `asset_inventory.json`. Legacy anon key cũ (đã lộ) **không revoke được qua Management API** (id `anon` không phải UUID) → **owner revoke trong Dashboard → Settings → API keys**; rủi ro thấp vì RLS đã lockdown anon (chỉ SELECT services public). Legacy service_role key cũng nên rotate trước release (ADR-010).

## Consensus (cả 2 reviewer đồng thuận)
1. RLS lockdown hướng đúng: anon revoked → 42501; service_role bypass giữ booking API hoạt động. **Giữ nguyên**.
2. Catalog 4 services sync sạch UI/POS/API/tests, giá do server tính. **Giữ nguyên**.
3. XSS admin qua `innerHTML` với user data (app.js:262/289/294/393) — thật.
4. Admin/POS client trỏ project cũ `agcvsogtqxoqlhcubghy` (app.js:4-5) ≠ production `vmakonkiotjkxlhpjwny` — thật, dashboard không thấy đơn production.

## Bất đồng — đã kiểm chứng
- **Reviewer 2: [CRITICAL] booking API insert sai cột schema** — **CONFIRMED**:
  `buildLegacyOrderData` (js/order-schema.js:116-131) trả `phone`/`total`/`pickup_address`, nhưng production schema có `phone_number`/`total_amount`/`address` (Management API probe 2026-08-03). INSERT qua service_role → 500. **Phải sửa code trước khi canary.**
- **Reviewer 2: [HIGH] thiếu unique index idempotency_key → TOCTOU double-submit** — **CONFIRMED** (không có index; orders.js:175-202 check-then-insert). Cần unique partial index + catch 23505.
- **Reviewer 1: [HIGH] policy authenticated `USING(true)` không phân quyền admin** — **CONFIRMED + nặng hơn**: `disable_signup=false` (auth config) → bất kỳ ai đăng ký email cũng đọc/sửa toàn bộ orders (PII). Cần tắt signup +/ hoặc policy theo custom claim.
- **Reviewer 1: [HIGH] ADR-010 vs ADR-011 mâu thuẫn (7 vs 4 services)** — CONFIRMED trong DECISIONS.md; cần ghi chú supersede.

## Fix roadmap (ưu tiên)

| # | Sev | Issue | Fix | Effort | Verify |
|---|---|---|---|---|---|
| F1 | Critical | API insert sai cột (`phone`/`total`/`pickup_address` vs `phone_number`/`total_amount`/`address`) | Map đúng tên cột production trong `buildLegacyOrderData` (hoặc insert payload); giữ contract API cũ | S | unit test payload keys; canary POST thật |
| F2 | High | Signup mở + policy authenticated USING(true) → PII leak | Tắt signup (auth config) + thu hẹp policy SELECT/UPDATE theo custom claim `app_metadata.role='admin'` (security definer fn) | M | probe authenticated tự tạo token admin/non-admin |
| F3 | High | XSS admin `innerHTML` (user data: customer_name/services/phone) | Escape HTML khi render (hoặc textContent); ít nhất escape tại 4 sink app.js | M | test XSS payload qua canary → dashboard |
| F4 | High | Idempotency race (TOCTOU) | `CREATE UNIQUE INDEX orders_idempotency_key_idx ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL` + catch 23505 → replay | S | unit test; probe double-POST cùng key |
| F5 | High | Admin/POS client project cũ | Migrate `js/app.js` supabase client → production URL + anon key mới (sau rotate); POS insert qua API | L | smoke admin dashboard production |
| F6 | Medium | ADR-010/011 mâu thuẫn docs | Ghi chú superseded trong ADR-010 | S | docs review |

## Không fix (deferred)
- P00-T04 HAR/Lighthouse (debt — browser automation không có; static smoke đã thay).
- XSS trong dashboard hiện tại tạm giữ (legacy, sẽ thay bằng F5 migrate + F3 escape).
- Node 16 mặc định codespace → dùng Node 22+ (nvm), ghi note P12.

## Thứ tự thực hiện
F1 → F4 (code+test) → F3 (escape) → F2 (security config + policy) → F6 (docs) → F5 (migrate client, tách riêng, cần anon key mới + quyết định admin) → canary → P10-T01.
