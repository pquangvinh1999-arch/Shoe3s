# P03-T01 Secure Public Order API — Evidence

Status: complete. Date: 2026-08-02. Branch: main (commit pending).

## Changes

### `functions/api/orders.js` (rewritten)
- Request gate: POST-only, `Content-Type: application/json` (415), body size limit 16 KB (413), JSON parse (400), Zod validation (400 `VALIDATION_ERROR`).
- Turnstile server-side: `verifyTurnstile()` gọi `https://challenges.cloudflare.com/turnstile/v0/siteverify` với secret từ env; fail → `BOT_CHECK_FAILED` (400). Bypass dev qua `ALLOW_TURNSTILE_SKIP=true` (chỉ local, ghi rõ ở trên).
- Idempotency: `computeIdempotencyHash()` = SHA-256 của canonical payload (customer_name, phone, service_ids, pickup_address, note — đã parse/normalize). Trước insert: query `orders?select=id,idempotency_payload_hash&idempotency_key=eq.<key>`:
  - Cùng key + cùng hash → replay order cũ (200, không insert thêm).
  - Cùng key + khác hash → `IDEMPOTENCY_CONFLICT` (409).
- Rate limit: in-memory sliding window 60s, 20 req/IP/window, key = SHA-256 của IP (không lưu raw IP); `CF-Connecting-IP` → fallback `x-forwarded-for` → `unknown`. Quá → `RATE_LIMITED` (429).
- Error envelope: `{ok:false, code, message, request_id}` — không lộ lỗi Supabase/DB internals (log chỉ `request_id` + status).
- Insert qua `SUPABASE_SERVICE_ROLE_KEY` (server-side) với `pricing_version`, `source`, `idempotency_key`, `idempotency_payload_hash`; `total`/`status`/`created_at` do server sinh (buildLegacyOrderData).
- Telegram: gọi `sendTelegramOrderNotification` sau insert thành công; lỗi Telegram không rollback order.
- Response: `{ok, order_id, status, request_id, quote:{total_vnd, items[]}}` đúng contract docs/04.

### `functions/api/telegram.js` (rewritten)
- `escapeTelegramHtml()`: escape `& < > " '` trước khi ghép `parse_mode=HTML` (fix R-002/XSS).
- `sendTelegramOrderNotification(data, env)`: dùng env secrets; lỗi → `{sent:false, reason}` không trả `err.message` ra client.
- Handler trả lỗi generic, không lộ token/stack.

### `tests/p03-t01.secure-order-api.test.ts` (new, 24 tests)
- escape HTML, telegram payload an toàn, missing-config.
- idempotency hash deterministic + SHA-256 vector `abc`.
- turnstile: accept/fail/fail-closed khi thiếu secret.
- rate limit window/block/khác IP/reset sau window.
- client IP detection.
- handler: 405/415/413/400 JSON hỏng/400 validation/400 bot check/200 happy path (quote, insert payload server-derived)/replay/409 conflict/500 không leak/429.

## Verification
- `npm test` → 4 files, 40 tests PASS.
- `python scripts/secret_scan.py` → only known `js/app.js` anon key (public publishable, documented P00-T03); test placeholders use short non-matching values.

## Schema dependency (P03-T02 prep)
- Insert hiện gửi `idempotency_key` + `idempotency_payload_hash` + `service_items`/`service_ids`/`pricing_version`/`source`. Nếu cột chưa tồn tại trong `orders`, insert sẽ fail `INTERNAL_ERROR` (fail-closed an toàn).
- Cần migration `001_prepare_secure_booking.sql` (uncomment các ALTER TABLE + unique index idempotency_key) chạy ở preview trước khi deploy API production. Template đã có; cập nhật mẫu thêm `idempotency_payload_hash` nếu cần.

## Acceptance (plan P02-T01 → P03-T01)
- [x] Turnstile server-side verify
- [x] Idempotency (payload hash + unique key; replay/conflict)
- [x] Rate limit theo IP hash
- [x] Error envelope chuẩn, không lộ internals
- [x] Telegram escape an toàn, không rollback khi Telegram lỗi
- [x] Body size limit + method/content-type gate
- [x] Unit tests bao phủ

## Next
- P03-T02 RLS cutover: cần policy export từ Supabase (R-008). API này là tiền đề để lockdown anon insert.
- P03-T03 POS catalog adapter (activePaymentServices → serviceCatalog).
