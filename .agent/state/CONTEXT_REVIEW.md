# Context Review

Status: approved (2026-08-02).

## Reviewed sources
- `AGENTS.md`, `.agent/MASTER_CONTEXT.md`, `orchestrator/CONTEXT.md`
- `.agent/state/STATE.json`, `CURRENT_TASK.md`, `DECISIONS.md`, `RISKS.md`
- `.agent/PLAN.json`, `.agent/CHECKLIST.md`, `orchestrator/CHECKLIST.md`, `orchestrator/TASKS.json`
- `.agent/evidence/P00-T02/`, `P00-T03/`, `P00-T04/`, `P01-T01/`
- `asset_manifest.md`, `README.md`, `docs/orchestrator/`

## Findings — thiếu/sai trong context

1. **RLS/policy export thiếu (blocking cho audit đầy đủ):** Repo không có Supabase policy/schema export. Bằng chứng runtime bằng anon key: `GET /rest/v1/orders` và `/costs` → 200, `POST /rest/v1/orders` → 201. Phải có policy export (Supabase CLI `supabase db dump --schema public` hoặc dashboard) trước khi thực hiện RLS lockdown (`P03-T02`). Template migration đã có tại `orchestrator/templates/supabase/001_prepare_secure_booking.sql` và `002_lockdown_after_cutover.sql`.
2. **Không có server-side `/api/orders`:** baseline chỉ có `functions/api/telegram.js`; mọi thao tác `orders`/`costs` chạy trực tiếp từ browser qua anon key. Đây là gốc của R-001 Critical.
3. **XSS:** `functions/api/telegram.js` ghép chuỗi HTML không escape; admin `js/app.js` dùng `innerHTML` với dữ liệu DB. Khớp R-002.
4. **Assets thiếu + CDN unpinned:** `logo.png`, `Pic1-6.png` không có trong repo (Pic1-4 có trong `Wed3s-main.zip`, Pic5/6 không); Tailwind CDN + SheetJS CDN unpinned — vi phạm rule "không dùng Tailwind CDN ở production" (MASTER_CONTEXT §4). Khớp `asset_manifest.md`.
5. **Catalog trùng lặp:** `pricingMap` + `activePaymentServices` song song trong `js/app.js` — nguồn của P01-T01.
6. **P00-T04 chưa được đăng ký** trong `.agent/PLAN.json` (canonical) dù evidence đã bắt đầu tại `.agent/evidence/P00-T04/` và `asset_manifest.md`.
7. **Sync lệch plan:** `orchestrator/TASKS.json` (schema v1, gồm P00-T04/P01-T01 "typed catalog") khác `.agent/PLAN.json` (schema v2, canonical). Giữ `.agent/PLAN.json` làm nguồn sự thật; `orchestrator/` là kế hoạch lịch sử, không chỉnh sửa trừ khi cần migrate.

## Kết luận
- Evidence `P00-T03` đầy đủ theo acceptance: `security-audit.md`, `rls-secret-inventory.md`, `supabase-policy-evidence.md`, `supabase-policy-export-request.md`, `findings-priority.md`.
- `context_gate` → **approved** với điều kiện:
  - Implementation vẫn bị cấm đến khi `research_gate` (P01) và `plan_gate` (P02) đạt.
  - Yêu cầu policy export được theo dõi như blocker cho `P03-T02` RLS lockdown.
- `DECISIONS.md` chưa có ADR nào — mọi thay đổi kiến trúc tương lai phải ghi vào đây.
- Next action: `P01-T01` research — đọc `docs/orchestrator/` và code baseline, ghi research log, đóng `research_gate`.
